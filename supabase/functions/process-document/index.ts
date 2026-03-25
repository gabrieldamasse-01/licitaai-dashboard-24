import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.100.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um assistente especializado em analisar documentos oficiais brasileiros (certidões, certificados, alvarás, etc.).

Sua tarefa é extrair DUAS informações do texto do documento:
1. **nome_documento**: O tipo/nome do documento (ex: "CND Federal", "Certidão Negativa de Débitos", "Alvará de Funcionamento").
2. **data_vencimento**: A data de vencimento ou validade do documento.

## Regras para encontrar a data de vencimento:

Procure ATIVAMENTE pelos seguintes termos e variações:
- "Data de Vencimento"
- "Válido até"
- "Validade"  
- "Válida até"
- "Data de Validade"
- "Vencimento"
- "Expira em"
- "Prazo de validade"
- "válido(a) por X meses/dias/anos" (calcule a data a partir da data de emissão)
- "tem validade de X dias" (calcule a data a partir da data de emissão)

## REGRA CRÍTICA DE FORMATO:

Você DEVE converter QUALQUER data encontrada para o formato ISO **YYYY-MM-DD**.

Exemplos de conversão:
- "30 de Junho de 2027" → "2027-06-30"
- "15/03/2026" → "2026-03-15"
- "1º de Janeiro de 2028" → "2028-01-01"
- "válido por 180 dias" a partir de "emitido em 01/01/2026" → "2026-06-30"

Se NÃO encontrar nenhuma data de vencimento, retorne null para data_vencimento.

Responda EXCLUSIVAMENTE usando a função/tool fornecida.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();

    if (!record?.id) {
      return new Response(JSON.stringify({ error: "No record provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch document record to get the file URL
    const { data: doc, error: docError } = await supabase
      .from("documentos")
      .select("*")
      .eq("id", record.id)
      .single();

    if (docError || !doc) {
      console.error("Document not found:", docError);
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download the PDF from storage
    const urlPath = doc.url_arquivo;
    if (!urlPath) {
      return new Response(JSON.stringify({ error: "No file URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract bucket path from public URL
    const bucketPathMatch = urlPath.match(/\/storage\/v1\/object\/public\/documentos\/(.+)/);
    const filePath = bucketPathMatch?.[1];

    if (!filePath) {
      console.error("Could not extract file path from URL:", urlPath);
      return new Response(JSON.stringify({ error: "Invalid file URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: fileData, error: fileError } = await supabase.storage
      .from("documentos")
      .download(filePath);

    if (fileError || !fileData) {
      console.error("Failed to download file:", fileError);
      return new Response(JSON.stringify({ error: "Failed to download file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert PDF to base64 for the AI
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Call Lovable AI with tool calling for structured output
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analise este documento PDF e extraia o nome do documento e a data de vencimento. Lembre-se: a data DEVE estar no formato YYYY-MM-DD.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:application/pdf;base64,${base64}`,
                },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_document_info",
              description:
                "Extrai informações estruturadas de um documento oficial brasileiro.",
              parameters: {
                type: "object",
                properties: {
                  nome_documento: {
                    type: "string",
                    description:
                      "O tipo/nome do documento (ex: CND Federal, Certidão Negativa de Débitos).",
                  },
                  data_vencimento: {
                    type: ["string", "null"],
                    description:
                      "Data de vencimento no formato ISO YYYY-MM-DD. Retorne null se não encontrar.",
                  },
                },
                required: ["nome_documento", "data_vencimento"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "extract_document_info" },
        },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI processing failed", status: aiResponse.status }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    console.log("AI response:", JSON.stringify(aiData));

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in AI response");
      return new Response(JSON.stringify({ error: "AI did not return structured data" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extracted = JSON.parse(toolCall.function.arguments);
    console.log("Extracted data:", JSON.stringify(extracted));

    // Build update object
    const updateData: Record<string, string> = {};

    if (extracted.nome_documento) {
      updateData.nome_documento = extracted.nome_documento;
    }

    if (extracted.data_vencimento) {
      // Validate ISO date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(extracted.data_vencimento)) {
        updateData.data_vencimento = extracted.data_vencimento;
        // Also update status based on the extracted date
        const venc = new Date(extracted.data_vencimento);
        const now = new Date();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (venc < now) {
          updateData.status = "expirado";
        } else if (venc.getTime() - now.getTime() < thirtyDays) {
          updateData.status = "pendente";
        } else {
          updateData.status = "valido";
        }
      } else {
        console.warn("AI returned invalid date format:", extracted.data_vencimento);
      }
    }

    // Update document record
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("documentos")
        .update(updateData)
        .eq("id", record.id);

      if (updateError) {
        console.error("Failed to update document:", updateError);
        return new Response(JSON.stringify({ error: "Failed to update document" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        extracted,
        updated_fields: Object.keys(updateData),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("process-document error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
