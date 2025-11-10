import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getVistorias, deleteVistoria, updateVistoria } from "@/lib/database";
import type { Vistoria } from "@/lib/types";
import { toast } from "sonner";
import { EditVistoriaDialog } from "@/components/EditVistoriaDialog";
import { exportVistoriasToPDF } from "@/lib/pdfExport";
import { useIsMobile } from "@/hooks/use-mobile";
import { getUserFriendlyError } from "@/lib/errorHandler";
import { DateRangeFilter } from "@/components/filters/DateRangeFilter";
import { VistoriaCard } from "@/components/vistorias/VistoriaCard";
import { VistoriaTableRow } from "@/components/vistorias/VistoriaTableRow";

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
      toast.error(getUserFriendlyError(error));
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
      toast.success("Vistoria excluída!");
    } catch (error: any) {
      toast.error(getUserFriendlyError(error));
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
      toast.success("Vistoria atualizada!");
    } catch (error: any) {
      toast.error(getUserFriendlyError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSituacaoChange = useCallback(async (vistoriaId: string, novaSituacao: string) => {
    try {
      await updateVistoria(vistoriaId, { situacao: novaSituacao });
      await loadVistorias();
      toast.success("Situação atualizada!");
    } catch (error: any) {
      toast.error(getUserFriendlyError(error));
    }
  }, []);

  const handlePagamentoChange = useCallback(async (vistoriaId: string, novoPagamento: string) => {
    try {
      await updateVistoria(vistoriaId, { pagamento: novoPagamento });
      await loadVistorias();
      toast.success("Pagamento atualizado!");
    } catch (error: any) {
      toast.error(getUserFriendlyError(error));
    }
  }, []);

  const filteredVistorias = useMemo(() => {
    return vistorias.filter(v => {
      const matchesSearch =
        v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  }, [vistorias, searchTerm, dataInicial, dataFinal]);

  const handleExportPDF = useCallback(() => {
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
  }, [filteredVistorias]);

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col gap-3 md:gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Vistorias Diárias</h1>

        <div className="flex flex-col gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Buscar por placa, modelo ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <Button
            size="lg"
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg text-base md:text-lg gap-2 md:gap-3 py-5 md:py-6"
          >
            <Plus className="h-5 w-5 md:h-6 md:w-6" />
            Nova Vistoria
          </Button>
        </Link>

        <DateRangeFilter
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          onDataInicialChange={setDataInicial}
          onDataFinalChange={setDataFinal}
          onClear={() => {
            setDataInicial(undefined);
            setDataFinal(undefined);
          }}
        />
      </div>

      {isLoading ? (
        <Card className="p-8 md:p-12 text-center border-2 border-dashed">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin opacity-50" />
            <div>
              <p className="text-base md:text-lg font-medium">Carregando vistorias...</p>
            </div>
          </div>
        </Card>
      ) : filteredVistorias.length === 0 ? (
        <Card className="p-8 md:p-12 text-center border-2 border-dashed">
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
        </Card>
      ) : isMobile ? (
        // Mobile: Cards View
        <div className="space-y-3">
          {filteredVistorias.map((vistoria) => (
            <VistoriaCard
              key={vistoria.id}
              vistoria={vistoria}
              onEdit={(v) => {
                setSelectedVistoria(v);
                setEditDialogOpen(true);
              }}
              onDelete={(v) => {
                setSelectedVistoria(v);
                setDeleteDialogOpen(true);
              }}
              onSituacaoChange={handleSituacaoChange}
              onPagamentoChange={handlePagamentoChange}
            />
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
                  {filteredVistorias.map((vistoria) => (
                    <VistoriaTableRow
                      key={vistoria.id}
                      vistoria={vistoria}
                      onEdit={(v) => {
                        setSelectedVistoria(v);
                        setEditDialogOpen(true);
                      }}
                      onDelete={(v) => {
                        setSelectedVistoria(v);
                        setDeleteDialogOpen(true);
                      }}
                      onSituacaoChange={handleSituacaoChange}
                      onPagamentoChange={handlePagamentoChange}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <EditVistoriaDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        vistoria={selectedVistoria}
        onSave={handleEdit}
        isSaving={isSaving}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta vistoria? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
