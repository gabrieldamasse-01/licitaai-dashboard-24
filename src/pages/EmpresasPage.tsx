import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Building2, Plus, Pencil, Trash2, Search } from "lucide-react";

interface Empresa {
  id: number;
  razaoSocial: string;
  cnpj: string;
  segmento: string;
  porte: string;
  status: "active" | "inactive";
}

const initialEmpresas: Empresa[] = [
  { id: 1, razaoSocial: "Tech Solutions Ltda", cnpj: "12.345.678/0001-90", segmento: "Tecnologia", porte: "Médio", status: "active" },
  { id: 2, razaoSocial: "Construtora Alpha S.A.", cnpj: "98.765.432/0001-10", segmento: "Construção Civil", porte: "Grande", status: "active" },
  { id: 3, razaoSocial: "MedSupply Comércio", cnpj: "11.222.333/0001-44", segmento: "Saúde", porte: "Pequeno", status: "inactive" },
  { id: 4, razaoSocial: "LogiTrans Transportes", cnpj: "55.666.777/0001-88", segmento: "Logística", porte: "Médio", status: "active" },
];

export default function EmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>(initialEmpresas);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Empresa | null>(null);
  const [form, setForm] = useState({ razaoSocial: "", cnpj: "", segmento: "", porte: "" });

  const filtered = empresas.filter((e) =>
    e.razaoSocial.toLowerCase().includes(search.toLowerCase()) ||
    e.cnpj.includes(search)
  );

  const openNew = () => {
    setEditing(null);
    setForm({ razaoSocial: "", cnpj: "", segmento: "", porte: "" });
    setDialogOpen(true);
  };

  const openEdit = (e: Empresa) => {
    setEditing(e);
    setForm({ razaoSocial: e.razaoSocial, cnpj: e.cnpj, segmento: e.segmento, porte: e.porte });
    setDialogOpen(true);
  };

  const save = () => {
    if (editing) {
      setEmpresas((prev) => prev.map((e) => (e.id === editing.id ? { ...e, ...form } : e)));
    } else {
      setEmpresas((prev) => [...prev, { id: Date.now(), ...form, status: "active" as const }]);
    }
    setDialogOpen(false);
  };

  const remove = (id: number) => {
    setEmpresas((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Empresas</h2>
            <p className="text-muted-foreground">Gerencie os perfis de licitantes.</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNew}>
                <Plus className="h-4 w-4 mr-2" /> Nova Empresa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Razão Social</Label>
                  <Input value={form.razaoSocial} onChange={(e) => setForm({ ...form, razaoSocial: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>CNPJ</Label>
                  <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Segmento</Label>
                    <Input value={form.segmento} onChange={(e) => setForm({ ...form, segmento: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Porte</Label>
                    <Input value={form.porte} onChange={(e) => setForm({ ...form, porte: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={save}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-accent" />
              <CardTitle className="text-base">Lista de Empresas</CardTitle>
              <div className="flex-1" />
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou CNPJ..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Porte</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((empresa) => (
                  <TableRow key={empresa.id}>
                    <TableCell className="font-medium">{empresa.razaoSocial}</TableCell>
                    <TableCell className="text-muted-foreground">{empresa.cnpj}</TableCell>
                    <TableCell>{empresa.segmento}</TableCell>
                    <TableCell>{empresa.porte}</TableCell>
                    <TableCell>
                      <Badge variant={empresa.status === "active" ? "default" : "secondary"}
                        className={empresa.status === "active" ? "bg-success text-success-foreground" : ""}>
                        {empresa.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(empresa)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(empresa.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
