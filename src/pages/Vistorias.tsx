import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Upload, Download, FileText, Trash2, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getVistorias, deleteVistoria, updateVistoria, type Vistoria } from "@/lib/database";
import { toast } from "sonner";
import { EditVistoriaDialog } from "@/components/EditVistoriaDialog";
import { SituacaoDropdown } from "@/components/SituacaoDropdown";
import { PagamentoDropdown } from "@/components/PagamentoDropdown";
import { exportVistoriasToPDF } from "@/lib/pdfExport";
export default function Vistorias() {
  const [searchTerm, setSearchTerm] = useState("");
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVistoria, setSelectedVistoria] = useState<Vistoria | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    loadVistorias();
  }, []);
  const loadVistorias = async () => {
    try {
      setIsLoading(true);
      const data = await getVistorias();
      setVistorias(data);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar vistorias");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!selectedVistoria?.id) return;
    try {
      await deleteVistoria(selectedVistoria.id);
      await loadVistorias();
      setDeleteDialogOpen(false);
      setSelectedVistoria(null);
      toast.success("Vistoria excluída com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir vistoria");
    }
  };
  const handleEdit = async (data: Partial<Vistoria>) => {
    if (!selectedVistoria?.id) return;
    try {
      setIsSaving(true);
      await updateVistoria(selectedVistoria.id, data);
      await loadVistorias();
      setEditDialogOpen(false);
      setSelectedVistoria(null);
      toast.success("Vistoria atualizada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar vistoria");
    } finally {
      setIsSaving(false);
    }
  };
  const handleSituacaoChange = async (vistoriaId: string, novaSituacao: string) => {
    try {
      await updateVistoria(vistoriaId, {
        situacao: novaSituacao
      });
      await loadVistorias();
      toast.success("Situação atualizada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar situação");
    }
  };
  const handlePagamentoChange = async (vistoriaId: string, novoPagamento: string) => {
    try {
      await updateVistoria(vistoriaId, {
        pagamento: novoPagamento
      });
      await loadVistorias();
      toast.success("Forma de pagamento atualizada com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar forma de pagamento");
    }
  };
  const handleExportPDF = () => {
    if (filteredVistorias.length === 0) {
      toast.error("Não há vistorias para exportar");
      return;
    }
    try {
      exportVistoriasToPDF(filteredVistorias);
      toast.success("PDF gerado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    }
  };
  const filteredVistorias = vistorias.filter(v => v.placa.toLowerCase().includes(searchTerm.toLowerCase()) || v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) || (v.clienteNome || v.cliente_nome || "").toLowerCase().includes(searchTerm.toLowerCase()));
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit"
    });
  };
  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(num);
  };
  return <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4">
        <h1 className="font-bold text-foreground text-2xl text-left">Vistorias Diárias</h1>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input placeholder="Buscar por placa, modelo ou cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          
          <div className="flex gap-3">
            
            <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar PDF</span>
            </Button>
          </div>
        </div>
      </div>

      <Link to="/nova-vistoria">
        <Button size="lg" className="w-full md:w-auto bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg gap-3 text-stone-100 text-xl px-0 py-0 mx-0 bg-violet-900 hover:bg-violet-800 my-[8px] text-center rounded-full font-bold">
          <Plus className="h-6 w-6" />
          Nova Vistoria
        </Button>
      </Link>

      {isLoading ? <Card className="p-12 text-center border-2 border-dashed">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-16 w-16 animate-spin opacity-50" />
            <div>
              <p className="text-lg font-medium">Carregando vistorias...</p>
            </div>
          </div>
        </Card> : filteredVistorias.length === 0 ? <Card className="p-12 text-center border-2 border-dashed">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <FileText className="h-16 w-16 opacity-50" />
            <div>
              <p className="text-lg font-medium">
                {searchTerm ? "Nenhuma vistoria encontrada" : "Nenhuma vistoria cadastrada"}
              </p>
              <p className="text-sm mt-1">
                {searchTerm ? "Tente buscar por outros termos" : 'Clique em "Nova Vistoria" para adicionar uma nova vistoria'}
              </p>
            </div>
          </div>
        </Card> : <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-violet-800">
                    <TableHead>Data</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVistorias.map(vistoria => <TableRow key={vistoria.id}>
                      <TableCell className="font-medium bg-stone-100">
                        {formatDate(vistoria.criadoEm || vistoria.created_at || "")}
                      </TableCell>
                      <TableCell className="font-mono font-semibold mx-0 px-px bg-stone-100">
                        {vistoria.placa}
                      </TableCell>
                      <TableCell className="bg-stone-100">{vistoria.modelo}</TableCell>
                      <TableCell className="bg-stone-100">{vistoria.clienteNome || vistoria.cliente_nome}</TableCell>
                      <TableCell className="bg-stone-100">
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                          {vistoria.tipo}
                        </span>
                      </TableCell>
                      <TableCell className="bg-stone-100">{formatCurrency(vistoria.valor)}</TableCell>
                      <TableCell className="bg-stone-100">
                        <PagamentoDropdown pagamento={vistoria.pagamento} onPagamentoChange={novoPagamento => handlePagamentoChange(vistoria.id, novoPagamento)} />
                      </TableCell>
                      <TableCell className="bg-stone-100">
                        <SituacaoDropdown situacao={vistoria.situacao} onSituacaoChange={novaSituacao => handleSituacaoChange(vistoria.id, novaSituacao)} />
                      </TableCell>
                      <TableCell className="text-right bg-stone-100">
                        <div className="flex gap-2 justify-end bg-purple-50">
                          <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedVistoria(vistoria);
                      setEditDialogOpen(true);
                    }}>
                            <Pencil className="h-4 w-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedVistoria(vistoria);
                      setDeleteDialogOpen(true);
                    }} className="text-red-100 text-center text-base">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>}

      <EditVistoriaDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} vistoria={selectedVistoria} onSave={handleEdit} isSaving={isSaving} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta vistoria? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
}