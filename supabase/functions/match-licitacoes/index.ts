import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EFFECTI_API = "https://effecti-dashboard.onrender.com/api/licitacoes/page";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const AI_API_KEY = Deno.env.get("AI_API_KEY");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse optional params
    let hoursBack = 96;
    try {
      const body = await req.json();
      if (body.hours_back) hoursBack = Math.min(body.hours_back, 240);
    } catch {
      // No body, use defaults
    }

    console.log(`[match-licitacoes] Starting match process. Looking back ${hoursBack}h`);

    // 1. Fetch all empresas
    const { data: empresas, error: empError } = await supabase
      .from("empresas")
      .select("*");

    if (empError) throw new Error(`Error fetching empresas: ${empError.message}`);
    if (!empresas?.length) {
      return new Response(
        JSON.stringify({ message: "Nenhuma empresa cadastrada para fazer match", matched: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[match-licitacoes] Found ${empresas.length} empresas`);

    // Build keywords from empresas
    const empresaKeywords = empresas.map((e) => ({
      id: e.id,
      nome: e.nome_fantasia,
      setor: e.setor_atuacao || "",
      cnae: e.cnae_principal || "",
      cnpj: e.cnpj,
    }));

    // 2. Fetch licitações from Effecti API (last N hours, max 5 days per chunk)
    const now = new Date();
    const begin = new Date(now.getTime() - hoursBack * 3600000);
    const maxChunk = 5 * 24 * 60 * 60 * 1000;

    const allLicitacoes: any[] = [];
    let current = begin.getTime();

    while (current < now.getTime()) {
      const chunkEnd = Math.min(current + maxChunk, now.getTime());
      let page = 0;
      let totalPages = 1;

      while (page < totalPages && page < 10) {
        try {
          const resp = await fetch(EFFECTI_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              begin: new Date(current).toISOString(),
              end: new Date(chunkEnd).toISOString(),
              page,
            }),
          });

          if (!resp.ok) {
            console.error(`Effecti API error: ${resp.status}`);
            break;
          }

          const data = await resp.json();
          allLicitacoes.push(...(data.licitacoes || []));
          totalPages = data.pagination?.total_paginas || 1;
          page++;
        } catch (err) {
          console.error(`Fetch page ${page} error:`, err);
          break;
        }
      }
      current = chunkEnd;
    }

    console.log(`[match-licitacoes] Fetched ${allLicitacoes.length} licitações from Effecti`);

    // Deduplicate
    const uniqueMap = new Map();
    allLicitacoes.forEach((l) => uniqueMap.set(l.idLicitacao, l));
    const licitacoes = Array.from(uniqueMap.values());

    console.log(`[match-licitacoes] ${licitacoes.length} unique licitações after dedup`);

    // 3. Score each licitação against empresas
    let savedCount = 0;
    const results: any[] = [];

    for (const lic of licitacoes) {
      const objeto = (lic.objetoSemTags || lic.objeto || "").toLowerCase();
      const palavras = (lic.palavraEncontrada || []).map((p: string) => p.toLowerCase());
      const valor = lic.valorTotalEstimado || 0;

      let bestScore = 0;
      let bestEmpresa = empresaKeywords[0];

      // Build expanded keyword set from setor
      const SETOR_KEYWORDS: Record<string, string[]> = {
        "tecnologia da informação": ["software", "sistema", "informática", "computador", "rede", "servidor", "ti", "tecnologia", "digital", "dados", "cloud", "nuvem", "suporte técnico", "desenvolvimento", "programação", "licença", "hardware", "equipamento de informática", "notebook", "desktop", "monitor", "impressora", "storage", "backup", "segurança da informação", "firewall", "switch", "roteador", "cabeamento", "infraestrutura"],
        "saúde": ["medicamento", "hospitalar", "saúde", "médico", "clínica", "laboratório", "farmácia", "insumo"],
        "construção": ["obra", "construção", "reforma", "pavimentação", "engenharia", "edificação", "predial"],
        "alimentação": ["alimentação", "refeição", "alimento", "merenda", "nutrição"],
        "limpeza": ["limpeza", "higienização", "conservação", "zeladoria"],
        "transporte": ["veículo", "transporte", "frota", "locação de veículo", "combustível"],
      };

      for (const emp of empresaKeywords) {
        let score = 0;
        const setorLower = emp.setor.toLowerCase();
        const cnaeLower = emp.cnae.toLowerCase();
        const nomeLower = emp.nome.toLowerCase();

        // Check setor match in objeto (direct)
        if (setorLower && objeto.includes(setorLower)) score += 30;

        // Check expanded setor keywords
        const expandedKeys = Object.entries(SETOR_KEYWORDS).find(([key]) => setorLower.includes(key));
        if (expandedKeys) {
          for (const kw of expandedKeys[1]) {
            if (objeto.includes(kw)) {
              score += 15;
              break; // Only count once per keyword group match
            }
          }
          // Additional points for multiple keyword matches
          let kwMatches = 0;
          for (const kw of expandedKeys[1]) {
            if (objeto.includes(kw)) kwMatches++;
          }
          if (kwMatches > 1) score += Math.min(kwMatches * 5, 20);
        }

        // Check CNAE keywords match
        if (cnaeLower) {
          const cnaeWords = cnaeLower.split(/[\s,;.\-/]+/).filter((w: string) => w.length > 3);
          for (const word of cnaeWords) {
            if (objeto.includes(word)) score += 10;
          }
        }

        // Check nome match
        if (nomeLower && objeto.includes(nomeLower)) score += 15;

        // Check palavras encontradas vs setor/cnae
        for (const p of palavras) {
          if (setorLower.includes(p) || cnaeLower.includes(p)) score += 8;
          // Also check expanded keywords
          if (expandedKeys) {
            for (const kw of expandedKeys[1]) {
              if (p.includes(kw) || kw.includes(p)) { score += 5; break; }
            }
          }
        }

        // Valor bonus
        if (valor > 100000) score += 5;
        if (valor > 500000) score += 5;
        if (valor > 1000000) score += 5;

        // SRP bonus
        if (lic.srp === 1) score += 3;

        score = Math.min(score, 100);

        if (score > bestScore) {
          bestScore = score;
          bestEmpresa = emp;
        }
      }

      // Save if score is > 10 (lower threshold for more results)
      if (bestScore > 10) {
        // If AI key available, refine score with AI for high potential matches
        if (AI_API_KEY && bestScore > 40) {
          try {
            const aiScore = await getAIScore(AI_API_KEY, objeto, bestEmpresa, lic.modalidade);
            if (aiScore !== null) {
              bestScore = Math.round((bestScore + aiScore) / 2);
            }
          } catch (err) {
            console.error("AI scoring error:", err);
          }
        }

        // Parse date
        let dataAbertura: string | null = null;
        if (lic.dataFinalProposta) {
          try {
            const parts = lic.dataFinalProposta.split(" ")[0].split("/");
            if (parts.length === 3) {
              dataAbertura = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          } catch { /* ignore */ }
        }

        // Upsert to Supabase
        const { error: upsertError } = await supabase.from("licitacoes").upsert(
          {
            titulo: (lic.objetoSemTags || lic.objeto || "Sem título").substring(0, 500),
            orgao_publico: lic.orgao || null,
            valor_estimado: valor || null,
            score_match_ia: bestScore,
            link_edital: lic.url || null,
            data_abertura: dataAbertura,
            status_processo: "aberto",
          },
          { onConflict: "titulo", ignoreDuplicates: true }
        );

        if (upsertError) {
          console.error(`Upsert error for ${lic.idLicitacao}:`, upsertError.message);
        } else {
          savedCount++;
          results.push({
            id: lic.idLicitacao,
            titulo: (lic.objetoSemTags || "").substring(0, 80),
            score: bestScore,
            empresa_match: bestEmpresa.nome,
          });
        }
      }
    }

    console.log(`[match-licitacoes] Saved ${savedCount} matched licitações`);

    return new Response(
      JSON.stringify({
        message: `Match concluído. ${savedCount} licitações salvas de ${licitacoes.length} analisadas.`,
        total_analisadas: licitacoes.length,
        total_matched: savedCount,
        empresas_usadas: empresas.length,
        top_matches: results.slice(0, 20),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[match-licitacoes] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getAIScore(
  apiKey: string,
  objeto: string,
  empresa: { nome: string; setor: string; cnae: string },
  modalidade: string
): Promise<number | null> {
  try {
    const prompt = `Analise a compatibilidade entre esta licitação e esta empresa.

LICITAÇÃO:
Objeto: ${objeto.substring(0, 500)}
Modalidade: ${modalidade || "N/A"}

EMPRESA:
Nome: ${empresa.nome}
Setor: ${empresa.setor || "N/A"}
CNAE: ${empresa.cnae || "N/A"}

Responda APENAS com um número de 0 a 100 representando o percentual de compatibilidade. Nada mais.`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Você é um analista de licitações. Responda apenas com um número de 0 a 100." },
          { role: "user", content: prompt },
        ],
        max_tokens: 10,
        temperature: 0.1,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error(`AI API error [${resp.status}]: ${text.substring(0, 200)}`);
      return null;
    }

    const data = await resp.json();
    const answer = data.choices?.[0]?.message?.content?.trim();
    const num = parseInt(answer, 10);
    return isNaN(num) ? null : Math.min(Math.max(num, 0), 100);
  } catch {
    return null;
  }
}
