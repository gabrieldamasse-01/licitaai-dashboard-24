import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText, Target, AlertTriangle, TrendingUp, ArrowUpRight, Loader2 } from "lucide-react";

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
  return <Badge className={cls}>{score}% match</Badge>;
}

export default function DashboardPage() {
  const { data: licitacoes, isLoading: loadingLic } = useQuery({
    queryKey: ["licitacoes-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("licitacoes")
        .select("*")
        .order("score_match_ia", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: empresas, isLoading: loadingEmp } = useQuery({
    queryKey: ["empresas-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("empresas")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const totalMatches = licitacoes?.length ?? 0;
  const avgScore = licitacoes?.length
    ? Math.round(licitacoes.reduce((s, l) => s + (l.score_match_ia ?? 0), 0) / licitacoes.length)
    : 0;

  const statsCards = [
    { title: "Editais Recomendados", value: String(totalMatches), change: "Top 5 por score", icon: FileText, color: "text-accent" },
    { title: "Empresas Cadastradas", value: String(empresas ?? 0), change: "Perfis ativos", icon: Target, color: "text-success" },
    { title: "Score Médio IA", value: `${avgScore}%`, change: "Dos editais listados", icon: TrendingUp, color: "text-accent" },
    { title: "Documentos Vencendo", value: "—", change: "Em breve", icon: AlertTriangle, color: "text-warning" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral das licitações e oportunidades.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="gradient-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadingLic || loadingEmp ? "…" : stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-accent" />
                Editais Recomendados pela IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLic ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !licitacoes?.length ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma licitação encontrada.</p>
              ) : (
                <div className="space-y-3">
                  {licitacoes.map((lic) => (
                    <div key={lic.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate group-hover:text-accent transition-colors">{lic.titulo}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {lic.orgao_publico ?? "Órgão não informado"}
                          {lic.data_abertura && ` · ${new Date(lic.data_abertura).toLocaleDateString("pt-BR")}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4 shrink-0">
                        <span className="text-sm font-medium">{formatBRL(lic.valor_estimado)}</span>
                        <ScoreBadge score={lic.score_match_ia} />
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Alertas de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">Conecte os documentos para ver alertas.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
