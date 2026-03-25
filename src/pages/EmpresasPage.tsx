import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Building2, Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EmpresasPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ nome_fantasia: "", cnpj: "", setor_atuacao: "", cnae_principal: "" });

  const { data: empresas, isLoading } = useQuery({
    queryKey: ["empresas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("empresas").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from("empresas").update(form).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("empresas").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      setDialogOpen(false);
      toast.success(editingId ? "Empresa atualizada!" : "Empresa cadastrada!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("empresas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      toast.success("Empresa removida.");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openNew = () => {
    setEditingId(null);
    setForm({ nome_fantasia: "", cnpj: "", setor_atuacao: "", cnae_principal: "" });
    setDialogOpen(true);
  };

  const openEdit = (e: NonNullable<typeof empresas>[number]) => {
    setEditingId(e.id);
    setForm({ nome_fantasia: e.nome_fantasia, cnpj: e.cnpj, setor_atuacao: e.setor_atuacao ?? "", cnae_principal: e.cnae_principal ?? "" });
    setDialogOpen(true);
  };

  const filtered = (empresas ?? []).filter((e) =>
    e.nome_fantasia.toLowerCase().includes(search.toLowerCase()) || e.cnpj.includes(search)
  );

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
              <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Nova Empresa</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nome Fantasia</Label>
                  <Input value={form.nome_fantasia} onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>CNPJ</Label>
                  <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Setor de Atuação</Label>
                    <Input value={form.setor_atuacao} onChange={(e) => setForm({ ...form, setor_atuacao: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label>CNAE Principal</Label>
                    <Input value={form.cnae_principal} onChange={(e) => setForm({ ...form, cnae_principal: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button onClick={() => upsert.mutate()} disabled={upsert.isPending}>
                  {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Salvar
                </Button>
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
                <Input placeholder="Buscar por nome ou CNPJ..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome Fantasia</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>CNAE</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((empresa) => (
                    <TableRow key={empresa.id}>
                      <TableCell className="font-medium">{empresa.nome_fantasia}</TableCell>
                      <TableCell className="text-muted-foreground">{empresa.cnpj}</TableCell>
                      <TableCell>{empresa.setor_atuacao ?? "—"}</TableCell>
                      <TableCell>{empresa.cnae_principal ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(empresa)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(empresa.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
