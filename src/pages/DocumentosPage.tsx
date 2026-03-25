import { useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, Upload, FileCheck, FileWarning, X } from "lucide-react";

interface Documento {
  id: number;
  nome: string;
  tipo: string;
  vencimento: string;
  status: "valid" | "expired" | "expiring";
}

const initialDocs: Documento[] = [
  { id: 1, nome: "CND Federal", tipo: "Certidão", vencimento: "15/08/2026", status: "valid" },
  { id: 2, nome: "Certidão FGTS", tipo: "Certidão", vencimento: "02/04/2026", status: "expiring" },
  { id: 3, nome: "Contrato Social", tipo: "Documento", vencimento: "—", status: "valid" },
  { id: 4, nome: "Atestado de Capacidade Técnica", tipo: "Atestado", vencimento: "15/01/2026", status: "expired" },
  { id: 5, nome: "Certidão Negativa Estadual", tipo: "Certidão", vencimento: "20/09/2026", status: "valid" },
  { id: 6, nome: "Balanço Patrimonial 2025", tipo: "Financeiro", vencimento: "31/12/2026", status: "valid" },
];

const statusConfig = {
  valid: { label: "Válido", className: "bg-success text-success-foreground" },
  expiring: { label: "Vencendo", className: "border-warning text-warning" },
  expired: { label: "Expirado", className: "bg-destructive text-destructive-foreground" },
};

export default function DocumentosPage() {
  const [docs] = useState<Documento[]>(initialDocs);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadedFiles((prev) => [...prev, ...files.map((f) => f.name)]);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...files.map((f) => f.name)]);
    }
  };

  const removeUploaded = (name: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f !== name));
  };

  const validCount = docs.filter((d) => d.status === "valid").length;
  const expiringCount = docs.filter((d) => d.status === "expiring").length;
  const expiredCount = docs.filter((d) => d.status === "expired").length;

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
                <p className="text-2xl font-bold">{expiringCount}</p>
                <p className="text-sm text-muted-foreground">Vencendo</p>
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
              Upload de Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-accent bg-accent/5" : "border-border"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium">Arraste e solte arquivos aqui</p>
              <p className="text-xs text-muted-foreground mt-1">ou clique para selecionar</p>
              <input
                type="file"
                multiple
                className="hidden"
                id="file-upload"
                onChange={handleFileInput}
              />
              <Button variant="outline" className="mt-4" onClick={() => document.getElementById("file-upload")?.click()}>
                Selecionar Arquivos
              </Button>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedFiles.map((file) => (
                  <div key={file} className="flex items-center justify-between p-2 rounded border bg-muted/50">
                    <span className="text-sm">{file}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeUploaded(file)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderOpen className="h-4 w-4 text-accent" />
              Certidões e Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {docs.map((doc) => {
                const config = statusConfig[doc.status];
                return (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.nome}</p>
                        <p className="text-xs text-muted-foreground">{doc.tipo} · Vence: {doc.vencimento}</p>
                      </div>
                    </div>
                    <Badge
                      variant={doc.status === "expiring" ? "outline" : "default"}
                      className={config.className}
                    >
                      {config.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
