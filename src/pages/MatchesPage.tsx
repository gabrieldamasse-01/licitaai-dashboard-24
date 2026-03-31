import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Target, Search, SlidersHorizontal, ExternalLink, Loader2,
  Calendar, Globe, MapPin, FileText, Clock
} from "lucide-react";

function formatBRL(value: number | null | undefined) {
  if (value == null || value === 0) return "—";
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

interface EffectiLicitacao {
  idLicitacao: number;
  orgao: string;
  objeto: string;
  objetoSemTags: string;
  valorTotalEstimado: number;
  dataPublicacao: string;
  dataFinalProposta: string;
  dataInicialProposta: string;
  uf: string;
  portal: string;
  modalidade: string;
  url: string;
  processo: string;
  srpDescricao: string;
  unidadeGestora: string;
  anexos: { nome: string; url: string }[];
  itensEdital: { produtoLicitadoSemTags: string; valorUnitarioEstimado: number; quantidade: number; unidade: string }[];
  palavraEncontrada: string[];
}

function getDefaultDates() {
  const end = new Date();
  const begin = new Date(end.getTime() - 4 * 24 * 60 * 60 * 1000); // 4 days ago
  return {
    begin: begin.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export default function MatchesPage() {
  const [search, setSearch] = useState("");
  const defaults = getDefaultDates();
  const [dateBegin, setDateBegin] = useState(defaults.begin);
  const [dateEnd, setDateEnd] = useState(defaults.end);
  const [searchTriggered, setSearchTriggered] = useState(false);

  // Supabase local licitações
  const { data: licitacoes, isLoading: loadingLocal } = useQuery({
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

  // Effecti API licitações
  const { data: effectiData, isLoading: loadingEffecti, isFetching: fetchingEffecti, refetch } = useQuery({
    queryKey: ["effecti-licitacoes", dateBegin, dateEnd],
    queryFn: async () => {
      const beginISO = new Date(dateBegin + "T00:00:00").toISOString();
      const endISO = new Date(dateEnd + "T23:59:59").toISOString();

      // Split into 5-day chunks
      const beginMs = new Date(beginISO).getTime();
      const endMs = new Date(endISO).getTime();
      const maxChunk = 5 * 24 * 60 * 60 * 1000;
      const chunks: { begin: string; end: string }[] = [];

      let current = beginMs;
      while (current < endMs) {
        const chunkEnd = Math.min(current + maxChunk, endMs);
        chunks.push({
          begin: new Date(current).toISOString(),
          end: new Date(chunkEnd).toISOString(),
        });
        current = chunkEnd;
      }

      const allLicitacoes: EffectiLicitacao[] = [];

      for (const chunk of chunks) {
        let page = 0;
        let totalPages = 1;

        while (page < totalPages) {
          const { data, error } = await supabase.functions.invoke("buscar-licitacoes", {
            body: { begin: chunk.begin, end: chunk.end, page },
          });

          if (error) throw error;

          const lics = data.licitacoes || [];
          allLicitacoes.push(...lics);
          totalPages = data.pagination?.total_paginas || 1;
          page++;

          // Safety limit
          if (page > 20) break;
        }
      }

      // Deduplicate
      const unique = new Map<number, EffectiLicitacao>();
      allLicitacoes.forEach((l) => unique.set(l.idLicitacao, l));
      return Array.from(unique.values());
    },
    enabled: searchTriggered,
  });

  const handleSearch = () => {
    setSearchTriggered(true);
    refetch();
  };

  const filteredLocal = (licitacoes ?? []).filter((l) =>
    l.titulo.toLowerCase().includes(search.toLowerCase()) ||
    (l.orgao_publico ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredEffecti = (effectiData ?? []).filter((l) =>
    l.objetoSemTags.toLowerCase().includes(search.toLowerCase()) ||
    l.orgao.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Licitações</h2>
          <p className="text-muted-foreground">Busque editais reais via API Effecti ou veja os salvos localmente.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Filtrar por texto..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="effecti" className="space-y-4">
          <TabsList>
            <TabsTrigger value="effecti">
              <Globe className="h-4 w-4 mr-2" />
              Busca Effecti
              {effectiData && <Badge variant="secondary" className="ml-2">{filteredEffecti.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="local">
              <Target className="h-4 w-4 mr-2" />
              Salvos Localmente
              <Badge variant="secondary" className="ml-2">{filteredLocal.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Effecti Tab */}
          <TabsContent value="effecti" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Período de Busca
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Data Início</label>
                    <Input type="date" value={dateBegin} onChange={(e) => setDateBegin(e.target.value)} className="w-44" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Data Fim</label>
                    <Input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="w-44" />
                  </div>
                  <Button onClick={handleSearch} disabled={loadingEffecti || fetchingEffecti}>
                    {(loadingEffecti || fetchingEffecti) ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />Buscando...</>
                    ) : (
                      <><Search className="h-4 w-4 mr-2" />Buscar Licitações</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {!searchTriggered ? (
              <p className="text-center text-muted-foreground py-12">
                Selecione um período e clique em "Buscar Licitações" para consultar a API Effecti.
              </p>
            ) : (loadingEffecti || fetchingEffecti) ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Buscando licitações na API Effecti...</p>
              </div>
            ) : !filteredEffecti.length ? (
              <p className="text-center text-muted-foreground py-12">Nenhuma licitação encontrada no período.</p>
            ) : (
              <div className="space-y-3">
                {filteredEffecti.map((lic) => (
                  <EffectiCard key={lic.idLicitacao} lic={lic} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Local Tab */}
          <TabsContent value="local" className="space-y-3">
            {loadingLocal ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !filteredLocal.length ? (
              <p className="text-center text-muted-foreground py-12">Nenhuma licitação salva localmente.</p>
            ) : (
              filteredLocal.map((lic) => (
                <Card key={lic.id} className="hover:shadow-md transition-shadow group">
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
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function EffectiCard({ lic }: { lic: EffectiLicitacao }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className="text-xs shrink-0">
                <MapPin className="h-3 w-3 mr-1" />{lic.uf}
              </Badge>
              <Badge variant="secondary" className="text-xs shrink-0">{lic.modalidade}</Badge>
              {lic.srpDescricao === "Sim" && (
                <Badge className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200">SRP</Badge>
              )}
            </div>
            <p className="font-medium text-sm leading-snug line-clamp-2">{lic.objetoSemTags}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Globe className="h-3 w-3" /> {lic.orgao} · {lic.portal}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-emerald-600">{formatBRL(lic.valorTotalEstimado)}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>Até {lic.dataFinalProposta}</span>
            </div>
          </div>
        </div>

        {lic.palavraEncontrada?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lic.palavraEncontrada.map((p, i) => (
              <Badge key={i} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                {p}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
            <FileText className="h-3.5 w-3.5 mr-1" />
            {expanded ? "Ocultar Detalhes" : `Detalhes (${lic.anexos?.length || 0} anexos)`}
          </Button>
          {lic.url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={lic.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Ver Edital
              </a>
            </Button>
          )}
        </div>

        {expanded && (
          <div className="border-t pt-3 space-y-3">
            {lic.itensEdital?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Itens do Edital</p>
                <div className="space-y-1">
                  {lic.itensEdital.slice(0, 5).map((item, i) => (
                    <div key={i} className="text-xs bg-muted/50 rounded p-2 flex justify-between gap-2">
                      <span className="line-clamp-1 flex-1">{item.produtoLicitadoSemTags}</span>
                      <span className="shrink-0 font-medium">{item.quantidade} {item.unidade} · {formatBRL(item.valorUnitarioEstimado)}</span>
                    </div>
                  ))}
                  {lic.itensEdital.length > 5 && (
                    <p className="text-xs text-muted-foreground">+{lic.itensEdital.length - 5} itens</p>
                  )}
                </div>
              </div>
            )}
            {lic.anexos?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Anexos</p>
                <div className="flex flex-wrap gap-2">
                  {lic.anexos.map((a, i) => (
                    <a
                      key={i}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      {a.nome}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Processo: {lic.processo} · Publicação: {lic.dataPublicacao} · UG: {lic.unidadeGestora}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
