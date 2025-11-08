import { useState, useEffect } from "react";
import { Filter, Loader2, Download, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getVistorias, getClientes, getVisitadores, getDigitadores, type Vistoria } from "@/lib/database";
import { exportVistoriasToPDF } from "@/lib/pdfExport";
import { toast } from "sonner";
import { format, isWithinInterval, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { getUserFriendlyError } from "@/lib/errorHandler";

type TipoFiltro = "vistoriador" | "cliente" | "digitador" | "";

export default function Analises() {
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [vistoriasFiltradas, setVistoriasFiltradas] = useState<Vistoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("");
  const [pessoaSelecionada, setPessoaSelecionada] = useState("");
  
  const [dataInicial, setDataInicial] = useState<Date>(subMonths(new Date(), 6));
  const [dataFinal, setDataFinal] = useState<Date>(new Date());
  
  const [clientes, setClientes] = useState<Array<{ id: string; nome: string }>>([]);
  const [vistoriadores, setVistoriadores] = useState<Array<{ id: string; nome: string }>>([]);
  const [digitadores, setDigitadores] = useState<Array<{ id: string; nome: string }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [vistoriasData, clientesData, vistoriadoresData, digitadoresData] = await Promise.all([
        getVistorias(),
        getClientes(),
        getVisitadores(),
        getDigitadores(),
      ]);
      
      setVistorias(vistoriasData);
      setVistoriasFiltradas(vistoriasData);
      setClientes(clientesData.map(c => ({ id: c.id, nome: c.nome })));
      setVistoriadores(vistoriadoresData.map(v => ({ id: v.id, nome: v.nome })));
      setDigitadores(digitadoresData.map(d => ({ id: d.id, nome: d.nome })));
    } catch (error: any) {
      const friendlyMessage = getUserFriendlyError(error, "carregar dados");
      toast.error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTipoFiltroChange = (value: TipoFiltro) => {
    setTipoFiltro(value);
    setPessoaSelecionada("");
    setVistoriasFiltradas(vistorias);
  };

  const aplicarFiltros = () => {
    let filtradas = vistorias;

    // Filtro por data
    filtradas = filtradas.filter((v) => {
      const dataVistoria = new Date(v.created_at);
      return isWithinInterval(dataVistoria, {
        start: dataInicial,
        end: dataFinal,
      });
    });

    // Filtro por pessoa
    if (pessoaSelecionada) {
      if (tipoFiltro === "vistoriador") {
        filtradas = filtradas.filter(v => v.liberador === pessoaSelecionada);
      } else if (tipoFiltro === "cliente") {
        filtradas = filtradas.filter(v => v.cliente_nome === pessoaSelecionada);
      } else if (tipoFiltro === "digitador") {
        filtradas = filtradas.filter(v => v.digitador === pessoaSelecionada);
      }
    }

    setVistoriasFiltradas(filtradas);
  };

  useEffect(() => {
    if (vistorias.length > 0) {
      aplicarFiltros();
    }
  }, [dataInicial, dataFinal, pessoaSelecionada, tipoFiltro, vistorias]);

  const handlePessoaChange = (nome: string) => {
    setPessoaSelecionada(nome);
    toast.success("Filtro aplicado");
  };

  const handleExportPDF = () => {
    if (vistoriasFiltradas.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }
    exportVistoriasToPDF(vistoriasFiltradas);
    toast.success("Relatório PDF gerado com sucesso!");
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(typeof value === "string" ? parseFloat(value) : value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getOpcoesSelect = () => {
    if (tipoFiltro === "vistoriador") return vistoriadores;
    if (tipoFiltro === "cliente") return clientes;
    if (tipoFiltro === "digitador") return digitadores;
    return [];
  };

  const valorTotal = vistoriasFiltradas.reduce((acc, v) => acc + parseFloat(v.valor), 0);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Análises</h1>
          <p className="text-muted-foreground">Visualize laudos por colaborador</p>
        </div>
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <Loader2 className="h-16 w-16 animate-spin opacity-50" />
            <p className="text-lg font-medium">Carregando dados...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Análises</h1>
        <p className="text-muted-foreground">Visualize laudos por colaborador</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrar Laudos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Filtro de Data Inicial */}
            <div>
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataInicial && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicial ? format(dataInicial, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataInicial}
                    onSelect={(date) => date && setDataInicial(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro de Data Final */}
            <div>
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dataFinal && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFinal ? format(dataFinal, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataFinal}
                    onSelect={(date) => date && setDataFinal(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro Tipo */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Filtro</label>
              <Select value={tipoFiltro} onValueChange={handleTipoFiltroChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vistoriador">Vistoriador</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="digitador">Digitador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Pessoa */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {tipoFiltro === "vistoriador" && "Vistoriador"}
                {tipoFiltro === "cliente" && "Cliente"}
                {tipoFiltro === "digitador" && "Digitador"}
                {!tipoFiltro && "Pessoa"}
              </label>
              <Select 
                value={pessoaSelecionada} 
                onValueChange={handlePessoaChange}
                disabled={!tipoFiltro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  {getOpcoesSelect().map((opcao) => (
                    <SelectItem key={opcao.id} value={opcao.nome}>
                      {opcao.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      {pessoaSelecionada && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total de Laudos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{vistoriasFiltradas.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(valorTotal)}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabela de Laudos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {pessoaSelecionada 
                  ? `Laudos de ${pessoaSelecionada}` 
                  : "Todos os Laudos"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {vistoriasFiltradas.length} laudo(s) encontrado(s)
              </p>
            </div>
            <Button 
              onClick={handleExportPDF}
              disabled={vistoriasFiltradas.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vistoriasFiltradas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Nenhum laudo encontrado</p>
              <p className="text-sm">Selecione um filtro para visualizar os laudos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Digitador</TableHead>
                    <TableHead>Vistoriador</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vistoriasFiltradas.map((vistoria) => (
                    <TableRow key={vistoria.id}>
                      <TableCell>{formatDate(vistoria.created_at)}</TableCell>
                      <TableCell className="font-medium">{vistoria.placa}</TableCell>
                      <TableCell>{vistoria.modelo}</TableCell>
                      <TableCell>{vistoria.cliente_nome}</TableCell>
                      <TableCell>{vistoria.tipo}</TableCell>
                      <TableCell>{vistoria.digitador || "-"}</TableCell>
                      <TableCell>{vistoria.liberador || "-"}</TableCell>
                      <TableCell>{vistoria.pagamento}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(vistoria.valor)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}