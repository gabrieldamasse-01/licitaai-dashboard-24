import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Target, Search, SlidersHorizontal, ExternalLink, Loader2 } from "lucide-react";

function formatBRL(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return <Badge variant="outline">N/A</Badge>;
  const cls =
    score > 80
      ? "bg-success text-success-foreground"
      : score > 50
      ? "bg-warning text-warning-foreground"
      : "bg-destructive text-destructive-foreground";
  return <Badge className={cls}>{score}%</Badge>;
}

export default function MatchesPage() {
  const [search, setSearch] = useState("");

  const { data: licitacoes, isLoading } = useQuery({
    queryKey: ["licitacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("licitacoes")
        .select("*")
        .order("score_match_ia", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = (licitacoes ?? []).filter((l) =>
    l.titulo.toLowerCase().includes(search.toLowerCase()) ||
    (l.orgao_publico ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Licitações</h2>
          <p className="text-muted-foreground">Editais encontrados pela IA com base nos seus perfis.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar editais..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Badge variant="secondary">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</Badge>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !filtered.length ? (
          <p className="text-center text-muted-foreground py-12">Nenhuma licitação encontrada.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((lic) => (
              <Card key={lic.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                      <Target className="h-5 w-5 text-accent" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm group-hover:text-accent transition-colors truncate">{lic.titulo}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {lic.orgao_publico ?? "Órgão não informado"}
                        {lic.data_abertura && ` · ${new Date(lic.data_abertura).toLocaleDateString("pt-BR")}`}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{lic.status_processo ?? "aberto"}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatBRL(lic.valor_estimado)}</p>
                    </div>
                    <ScoreBadge score={lic.score_match_ia} />
                    {lic.link_edital && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={lic.link_edital} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
