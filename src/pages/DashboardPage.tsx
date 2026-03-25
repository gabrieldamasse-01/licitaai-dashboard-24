import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FileText, Target, AlertTriangle, TrendingUp, ArrowUpRight } from "lucide-react";

const statsCards = [
  {
    title: "Editais Recomendados",
    value: "24",
    change: "+8 esta semana",
    icon: FileText,
    color: "text-accent" as const,
  },
  {
    title: "Total de Matches",
    value: "156",
    change: "+12% vs mês anterior",
    icon: Target,
    color: "text-success" as const,
  },
  {
    title: "Documentos Vencendo",
    value: "3",
    change: "Próximos 30 dias",
    icon: AlertTriangle,
    color: "text-warning" as const,
  },
  {
    title: "Taxa de Conversão",
    value: "18%",
    change: "+3.2% vs mês anterior",
    icon: TrendingUp,
    color: "text-accent" as const,
  },
];

const recentMatches = [
  { id: 1, title: "Pregão Eletrônico - Serviços de TI", orgao: "Ministério da Saúde", score: 95, valor: "R$ 2.400.000", prazo: "15/04/2026" },
  { id: 2, title: "Concorrência - Obras de Infraestrutura", orgao: "DNIT", score: 88, valor: "R$ 8.700.000", prazo: "22/04/2026" },
  { id: 3, title: "Tomada de Preços - Material Hospitalar", orgao: "Hospital das Clínicas", score: 82, valor: "R$ 450.000", prazo: "10/04/2026" },
  { id: 4, title: "Pregão Presencial - Equipamentos", orgao: "Prefeitura de SP", score: 76, valor: "R$ 1.200.000", prazo: "28/04/2026" },
  { id: 5, title: "RDC - Construção Civil", orgao: "CEF", score: 71, valor: "R$ 15.000.000", prazo: "05/05/2026" },
];

const alertsDocs = [
  { nome: "CND Federal", vencimento: "02/04/2026", status: "expiring" },
  { nome: "Certidão FGTS", vencimento: "10/04/2026", status: "expiring" },
  { nome: "Atestado de Capacidade Técnica", vencimento: "28/04/2026", status: "expiring" },
];

function ScoreBadge({ score }: { score: number }) {
  const variant = score >= 90 ? "default" : score >= 75 ? "secondary" : "outline";
  return (
    <Badge variant={variant} className={
      score >= 90
        ? "bg-success text-success-foreground"
        : score >= 75
        ? "bg-accent text-accent-foreground"
        : ""
    }>
      {score}% match
    </Badge>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral das licitações e oportunidades.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="gradient-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Matches */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-accent" />
                Editais Recomendados pela IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate group-hover:text-accent transition-colors">{match.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{match.orgao} · Prazo: {match.prazo}</p>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <span className="text-sm font-medium">{match.valor}</span>
                      <ScoreBadge score={match.score} />
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Document Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Alertas de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertsDocs.map((doc) => (
                  <div key={doc.nome} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{doc.nome}</p>
                      <p className="text-xs text-muted-foreground">Vence em {doc.vencimento}</p>
                    </div>
                    <Badge variant="outline" className="border-warning text-warning text-xs">
                      Vencendo
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
