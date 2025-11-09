import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Upload, Download, FileText, Trash2, Loader2, Pencil, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { getUserFriendlyError } from "@/lib/errorHandler";
import { formatDate, formatCurrency } from "@/lib/formatters";
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
  const isMobile = useIsMobile();
  useEffect(() => {
    loadVistorias();
  }, []);
  const loadVistorias = async () => {
    try {
      setIsLoading(true);
      const data = await getVistorias();
      setVistorias(data);
    } catch (error: any) {
      const friendlyMessage = getUserFriendlyError(error, "carregar vistorias");
      toast.error(friendlyMessage);
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
      const friendlyMessage = getUserFriendlyError(error, "excluir vistoria");
      toast.error(friendlyMessage);
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
      const friendlyMessage = getUserFriendlyError(error, "atualizar vistoria");
      toast.error(friendlyMessage);
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
      const friendlyMessage = getUserFriendlyError(error, "atualizar situação");
      toast.error(friendlyMessage);
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
      const friendlyMessage = getUserFriendlyError(error, "atualizar forma de pagamento");
      toast.error(friendlyMessage);
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
  return <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 md:gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Vistorias Diárias</h1>
        
        <div className="flex flex-col gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              placeholder="Buscar por placa, modelo ou cliente..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-10 h-11 md:h-10" 
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 flex-1 md:flex-initial" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
              <span>Exportar PDF</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Link to="/nova-vistoria" className="w-full">
          <Button size="lg" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg text-base md:text-lg gap-2 md:gap-3 py-5 md:py-6">
            <Plus className="h-5 w-5 md:h-6 md:w-6" />
            Nova Vistoria
          </Button>
        </Link>

        <div className="flex flex-wrap gap-2 md:gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "gap-2 justify-start text-left font-normal flex-1 md:flex-initial",
                  !dataInicial && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="text-sm">{dataInicial ? format(dataInicial, "dd/MM/yy") : "Data Inicial"}</span>
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
                  "gap-2 justify-start text-left font-normal flex-1 md:flex-initial",
                  !dataFinal && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="text-sm">{dataFinal ? format(dataFinal, "dd/MM/yy") : "Data Final"}</span>
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
              className="gap-2 w-full md:w-auto"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {isLoading ? <Card className="p-8 md:p-12 text-center border-2 border-dashed">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin opacity-50" />
            <div>
              <p className="text-base md:text-lg font-medium">Carregando vistorias...</p>
            </div>
          </div>
        </Card> : filteredVistorias.length === 0 ? <Card className="p-8 md:p-12 text-center border-2 border-dashed">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <FileText className="h-12 w-12 md:h-16 md:w-16 opacity-50" />
            <div>
              <p className="text-base md:text-lg font-medium">
                {searchTerm ? "Nenhuma vistoria encontrada" : "Nenhuma vistoria cadastrada"}
              </p>
              <p className="text-sm mt-1">
                {searchTerm ? "Tente buscar por outros termos" : 'Clique em "Nova Vistoria" para adicionar uma nova vistoria'}
              </p>
            </div>
          </div>
        </Card> : isMobile ? (
          // Mobile: Cards View
          <div className="space-y-3">
            {filteredVistorias.map(vistoria => (
              <Card 
                key={vistoria.id} 
                className={cn(
                  "overflow-hidden",
                  vistoria.modalidade === "EXTERNO" && "border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-mono font-bold">{vistoria.placa}</CardTitle>
                      <p className="text-sm text-muted-foreground">{vistoria.modelo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(vistoria.criadoEm || vistoria.created_at || "")}
                      </p>
                      <p className="text-lg font-bold mt-1">{formatCurrency(vistoria.valor)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Cliente</p>
                      <p className="font-medium truncate">{vistoria.clienteNome || vistoria.cliente_nome}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Tipo</p>
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded inline-block w-fit",
                          vistoria.modalidade === "EXTERNO" 
                            ? "bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/30" 
                            : "bg-primary/10 text-primary"
                        )}>
                          {vistoria.tipo}
                        </span>
                        {vistoria.modalidade === "EXTERNO" && (
                          <span className="text-[9px] font-semibold text-orange-700 dark:text-orange-400 uppercase">
                            Externo/Lojista
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs mb-1">Situação</p>
                      <SituacaoDropdown 
                        situacao={vistoria.situacao} 
                        onSituacaoChange={novaSituacao => handleSituacaoChange(vistoria.id, novaSituacao)} 
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs mb-1">Pagamento</p>
                      <PagamentoDropdown 
                        pagamento={vistoria.pagamento} 
                        onPagamentoChange={novoPagamento => handlePagamentoChange(vistoria.id, novoPagamento)} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => {
                        setSelectedVistoria(vistoria);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 gap-2 text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelectedVistoria(vistoria);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // Desktop: Table View
          <Card>
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
                    {filteredVistorias.map(vistoria => <TableRow 
                        key={vistoria.id}
                        className={cn(
                          vistoria.modalidade === "EXTERNO" && "bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100/50 dark:hover:bg-orange-950/30"
                        )}
                      >
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
          </Card>
        )}

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