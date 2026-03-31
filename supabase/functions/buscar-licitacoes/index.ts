import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { begin, end, page = 0 } = await req.json();

    if (!begin || !end) {
      return new Response(
        JSON.stringify({ error: "Campos 'begin' e 'end' são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate dates
    const beginDate = new Date(begin);
    const endDate = new Date(end);
    if (isNaN(beginDate.getTime()) || isNaN(endDate.getTime())) {
      return new Response(
        JSON.stringify({ error: "Datas inválidas" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Max 5 days per chunk (API limit)
    const diffDays = (endDate.getTime() - beginDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 6) {
      return new Response(
        JSON.stringify({ error: "Período máximo de 5 dias por requisição" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching licitacoes: begin=${begin}, end=${end}, page=${page}`);

    const response = await fetch(EFFECTI_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ begin, end, page }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Effecti API error [${response.status}]: ${text.substring(0, 500)}`);
      return new Response(
        JSON.stringify({ error: `Erro na API Effecti: ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
