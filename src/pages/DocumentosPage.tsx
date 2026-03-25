import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderOpen, Upload, FileCheck, FileWarning, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

function getDocStatus(dataVencimento: string): "valid" | "pending" | "expired" {
  if (!dataVencimento) return "pending";
  const venc = new Date(dataVencimento);
  const now = new Date();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  if (venc < now) return "expired";
  if (venc.getTime() - now.getTime() < thirtyDays) return "pending";
  return "valid";
}

const statusConfig = {
  valid: { label: "Válido", className: "bg-success text-success-foreground" },
  pending: { label: "Pendente", className: "bg-warning text-warning-foreground" },
  expired: { label: "Expirado", className: "bg-destructive text-destructive-foreground" },
};

export default function DocumentosPage() {
  const queryClient = useQueryClient();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nomeDocumento, setNomeDocumento] = useState("");
  const [empresaId, setEmpresaId] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [uploading, setUploading] = useState(false);

  // Fetch empresas for the select
  const { data: empresas } = useQuery({
    queryKey: ["empresas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("empresas").select("id, nome_fantasia").order("nome_fantasia");
      if (error) throw error;
      return data;
    },
  });

  // Fetch documentos with empresa name
  const { data: documentos, isLoading } = useQuery({
    queryKey: ["documentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documentos")
        .select("*, empresas(nome_fantasia)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setSelectedFile(file);
      if (!nomeDocumento) setNomeDocumento(file.name.replace(".pdf", ""));
    } else {
      toast.error("Apenas arquivos PDF são aceitos.");
    }
  }, [nomeDocumento]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type === "application/pdf") {
      setSelectedFile(file);
      if (!nomeDocumento) setNomeDocumento(file.name.replace(".pdf", ""));
    } else {
      toast.error("Apenas arquivos PDF são aceitos.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !nomeDocumento || !empresaId || !dataVencimento) {
      toast.error("Preencha todos os campos e selecione um arquivo.");
      return;
    }

    setUploading(true);
    try {
      // Upload file to storage
      const filePath = `${empresaId}/${Date.now()}_${selectedFile.name}`;
      const { error: storageError } = await supabase.storage
        .from("documentos")
        .upload(filePath, selectedFile, { contentType: "application/pdf" });

      if (storageError) throw storageError;

      // Get public URL
      const { data: urlData } = supabase.storage.from("documentos").getPublicUrl(filePath);

      // Insert record in database
      const { error: dbError } = await supabase.from("documentos").insert({
        nome_documento: nomeDocumento,
        empresa_id: empresaId,
        data_vencimento: dataVencimento,
        url_arquivo: urlData.publicUrl,
        status: getDocStatus(dataVencimento),
      });

      if (dbError) throw dbError;

      toast.success("Documento enviado com sucesso!");
      setSelectedFile(null);
      setNomeDocumento("");
      setEmpresaId("");
      setDataVencimento("");
      queryClient.invalidateQueries({ queryKey: ["documentos"] });
    } catch (err: any) {
      toast.error("Erro ao enviar: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const validCount = documentos?.filter((d) => getDocStatus(d.data_vencimento) === "valid").length ?? 0;
  const pendingCount = documentos?.filter((d) => getDocStatus(d.data_vencimento) === "pending").length ?? 0;
  const expiredCount = documentos?.filter((d) => getDocStatus(d.data_vencimento) === "expired").length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documentos</h2>
          <p className="text-muted-foreground">Upload e gestão de certidões e documentos.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="gradient-card">
            <CardContent className="flex items-center gap-3 pt-6">
              <FileCheck className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{validCount}</p>
                <p className="text-sm text-muted-foreground">Válidos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="flex items-center gap-3 pt-6">
              <FileWarning className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="flex items-center gap-3 pt-6">
              <FileWarning className="h-8 w-8 text-destructive" />
              <div>
                <p className="text-2xl font-bold">{expiredCount}</p>
                <p className="text-sm text-muted-foreground">Expirados</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4 text-accent" />
              Upload de Documento (PDF)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragActive ? "border-accent bg-accent/5" : "border-border"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium">Arraste e solte um PDF aqui</p>
                  <p className="text-xs text-muted-foreground mt-1">ou clique para selecionar</p>
                </>
              )}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                id="file-upload"
                onChange={handleFileInput}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="nome-doc">Nome do Documento</Label>
                <Input
                  id="nome-doc"
                  placeholder="Ex: CND Federal"
                  value={nomeDocumento}
                  onChange={(e) => setNomeDocumento(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Select value={empresaId} onValueChange={setEmpresaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas?.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.nome_fantasia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vencimento">Data de Vencimento</Label>
                <Input
                  id="vencimento"
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                />
              </div>
            </div>

            <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Enviar Documento
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="h-4 w-4 text-accent" />
              Documentos Salvos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : !documentos?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum documento cadastrado ainda.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentos.map((doc) => {
                    const status = getDocStatus(doc.data_vencimento);
                    const config = statusConfig[status];
                    const empresaNome = (doc as any).empresas?.nome_fantasia ?? "—";
                    return (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.nome_documento}</TableCell>
                        <TableCell>{empresaNome}</TableCell>
                        <TableCell>
                          {new Date(doc.data_vencimento).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={status === "pending" ? "outline" : "default"}
                            className={config.className}
                          >
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {doc.url_arquivo && (
                            <Button variant="ghost" size="sm" asChild>
                              <a href={doc.url_arquivo} target="_blank" rel="noopener noreferrer">
                                Ver PDF
                              </a>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
