import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Search, SlidersHorizontal, ExternalLink } from "lucide-react";

interface Match {
  id: number;
  titulo: string;
  orgao: string;
  modalidade: string;
  valor: string;
  prazo: string;
  score: number;
  segmento: string;
  uf: string;
}

const matches: Match[] = [
  { id: 1, titulo: "Pregão Eletrônico - Serviços de TI", orgao: "Ministério da Saúde", modalidade: "Pregão Eletrônico", valor: "R$ 2.400.000", prazo: "15/04/2026", score: 95, segmento: "Tecnologia", uf: "DF" },
  { id: 2, titulo: "Concorrência - Obras Rodoviárias", orgao: "DNIT", modalidade: "Concorrência", valor: "R$ 8.700.000", prazo: "22/04/2026", score: 88, segmento: "Construção Civil", uf: "GO" },
  { id: 3, titulo: "Tomada de Preços - Material Hospitalar", orgao: "Hospital das Clínicas", modalidade: "Tomada de Preços", valor: "R$ 450.000", prazo: "10/04/2026", score: 82, segmento: "Saúde", uf: "SP" },
  { id: 4, titulo: "Pregão Presencial - Equipamentos de Escritório", orgao: "Prefeitura de São Paulo", modalidade: "Pregão Presencial", valor: "R$ 1.200.000", prazo: "28/04/2026", score: 76, segmento: "Suprimentos", uf: "SP" },
  { id: 5, titulo: "RDC - Construção de Escola", orgao: "Secretaria de Educação", modalidade: "RDC", valor: "R$ 15.000.000", prazo: "05/05/2026", score: 71, segmento: "Construção Civil", uf: "RJ" },
  { id: 6, titulo: "Pregão Eletrônico - Licenças de Software", orgao: "Tribunal de Justiça", modalidade: "Pregão Eletrônico", valor: "R$ 890.000", prazo: "12/05/2026", score: 68, segmento: "Tecnologia", uf: "MG" },
  { id: 7, titulo: "Concorrência - Manutenção Predial", orgao: "Banco Central", modalidade: "Concorrência", valor: "R$ 3.200.000", prazo: "20/05/2026", score: 64, segmento: "Manutenção", uf: "DF" },
];

function ScoreBadge({ score }: { score: number }) {
  return (
    <Badge className={
      score >= 90
        ? "bg-success text-success-foreground"
        : score >= 75
        ? "bg-accent text-accent-foreground"
        : score >= 60
        ? "bg-warning text-warning-foreground"
        : ""
    }>
      {score}%
    </Badge>
  );
}

export default function MatchesPage() {
  const [search, setSearch] = useState("");
  const [modalidade, setModalidade] = useState("all");
  const [segmento, setSegmento] = useState("all");

  const filtered = matches.filter((m) => {
    const matchesSearch = m.titulo.toLowerCase().includes(search.toLowerCase()) || m.orgao.toLowerCase().includes(search.toLowerCase());
    const matchesModalidade = modalidade === "all" || m.modalidade === modalidade;
    const matchesSegmento = segmento === "all" || m.segmento === segmento;
    return matchesSearch && matchesModalidade && matchesSegmento;
  });

  const modalidades = [...new Set(matches.map((m) => m.modalidade))];
  const segmentos = [...new Set(matches.map((m) => m.segmento))];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Licitações</h2>
          <p className="text-muted-foreground">Editais encontrados pela IA com base nos seus perfis.</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar editais..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={modalidade} onValueChange={setModalidade}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Modalidades</SelectItem>
                  {modalidades.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={segmento} onValueChange={setSegmento}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Segmentos</SelectItem>
                  {segmentos.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-3">
          {filtered.map((match) => (
            <Card key={match.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Target className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm group-hover:text-accent transition-colors truncate">{match.titulo}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{match.orgao} · {match.uf}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">{match.modalidade}</Badge>
                      <Badge variant="secondary" className="text-xs">{match.segmento}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 ml-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold">{match.valor}</p>
                    <p className="text-xs text-muted-foreground">Prazo: {match.prazo}</p>
                  </div>
                  <ScoreBadge score={match.score} />
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
