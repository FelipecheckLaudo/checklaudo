import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Upload, Download, FileText, Trash2, Loader2, Pencil, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { getVistorias, deleteVistoria, updateVistoria, type Vistoria } from "@/lib/database";
import { toast } from "sonner";
import { EditVistoriaDialog } from "@/components/EditVistoriaDialog";
import { SituacaoDropdown } from "@/components/SituacaoDropdown";
import { PagamentoDropdown } from "@/components/PagamentoDropdown";
import { exportVistoriasToPDF } from "@/lib/pdfExport";
import { cn } from "@/lib/utils";
export default function Vistorias() {
  const [searchTerm, setSearchTerm] = useState("");
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedVistoria, setSelectedVistoria] = useState<Vistoria | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dataInicial, setDataInicial] = useState<Date>();
  const [dataFinal, setDataFinal] = useState<Date>();
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
  const filteredVistorias = vistorias.filter(v => {
    const matchesSearch = v.placa.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (v.clienteNome || v.cliente_nome || "").toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    const vistoriaDate = new Date(v.criadoEm || v.created_at || "");
    
    if (dataInicial && vistoriaDate < dataInicial) return false;
    if (dataFinal) {
      const endOfDay = new Date(dataFinal);
      endOfDay.setHours(23, 59, 59, 999);
      if (vistoriaDate > endOfDay) return false;
    }
    
    return true;
  });
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
        <h1 className="text-3xl font-bold text-foreground">Vistorias Diárias</h1>
        
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

      <div className="flex flex-col md:flex-row gap-3">
        <Link to="/nova-vistoria" className="flex-1 md:flex-initial">
          <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg text-lg gap-3 py-6">
            <Plus className="h-6 w-6" />
            Nova Vistoria
          </Button>
        </Link>

        <div className="flex flex-wrap gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "gap-2 justify-start text-left font-normal",
                  !dataInicial && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {dataInicial ? format(dataInicial, "dd/MM/yy") : "Data Inicial"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dataInicial}
                onSelect={setDataInicial}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "gap-2 justify-start text-left font-normal",
                  !dataFinal && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                {dataFinal ? format(dataFinal, "dd/MM/yy") : "Data Final"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dataFinal}
                onSelect={setDataFinal}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {(dataInicial || dataFinal) && (
            <Button
              variant="ghost"
              onClick={() => {
                setDataInicial(undefined);
                setDataFinal(undefined);
              }}
              className="gap-2"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

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
                  <TableRow>
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
                      <TableCell className="font-medium">
                        {formatDate(vistoria.criadoEm || vistoria.created_at || "")}
                      </TableCell>
                      <TableCell className="font-mono font-semibold mx-0 px-px">
                        {vistoria.placa}
                      </TableCell>
                      <TableCell>{vistoria.modelo}</TableCell>
                      <TableCell>{vistoria.clienteNome || vistoria.cliente_nome}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "text-xs font-medium px-2 py-1 rounded",
                            vistoria.modalidade === "EXTERNO" 
                              ? "bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/30" 
                              : "bg-primary/10 text-primary"
                          )}>
                            {vistoria.tipo}
                          </span>
                          {vistoria.modalidade === "EXTERNO" && (
                            <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-400 uppercase">
                              Externo/Lojista
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(vistoria.valor)}</TableCell>
                      <TableCell>
                        <PagamentoDropdown pagamento={vistoria.pagamento} onPagamentoChange={novoPagamento => handlePagamentoChange(vistoria.id, novoPagamento)} />
                      </TableCell>
                      <TableCell>
                        <SituacaoDropdown situacao={vistoria.situacao} onSituacaoChange={novaSituacao => handleSituacaoChange(vistoria.id, novaSituacao)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedVistoria(vistoria);
                      setEditDialogOpen(true);
                    }}>
                            <Pencil className="h-4 w-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => {
                      setSelectedVistoria(vistoria);
                      setDeleteDialogOpen(true);
                    }}>
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