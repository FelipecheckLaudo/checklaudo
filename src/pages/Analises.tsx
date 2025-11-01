import { useState, useEffect } from "react";
import { Filter, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getVistorias, getClientes, getVisitadores, getDigitadores, type Vistoria } from "@/lib/database";
import { toast } from "sonner";

type TipoFiltro = "vistoriador" | "cliente" | "digitador" | "";

export default function Analises() {
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [vistoriasFiltradas, setVistoriasFiltradas] = useState<Vistoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("");
  const [pessoaSelecionada, setPessoaSelecionada] = useState("");
  
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
      toast.error(error.message || "Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTipoFiltroChange = (value: TipoFiltro) => {
    setTipoFiltro(value);
    setPessoaSelecionada("");
    setVistoriasFiltradas(vistorias);
  };

  const handlePessoaChange = (nome: string) => {
    setPessoaSelecionada(nome);
    
    if (!nome) {
      setVistoriasFiltradas(vistorias);
      return;
    }

    let filtradas: Vistoria[] = [];
    
    if (tipoFiltro === "vistoriador") {
      filtradas = vistorias.filter(v => v.liberador === nome);
    } else if (tipoFiltro === "cliente") {
      filtradas = vistorias.filter(v => v.cliente_nome === nome);
    } else if (tipoFiltro === "digitador") {
      filtradas = vistorias.filter(v => v.digitador === nome);
    }
    
    setVistoriasFiltradas(filtradas);
    toast.success(`${filtradas.length} laudo(s) encontrado(s)`);
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
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Filtro</label>
              <Select value={tipoFiltro} onValueChange={handleTipoFiltroChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de filtro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vistoriador">Vistoriador</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="digitador">Digitador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {tipoFiltro === "vistoriador" && "Selecione o Vistoriador"}
                {tipoFiltro === "cliente" && "Selecione o Cliente"}
                {tipoFiltro === "digitador" && "Selecione o Digitador"}
                {!tipoFiltro && "Selecione um tipo de filtro primeiro"}
              </label>
              <Select 
                value={pessoaSelecionada} 
                onValueChange={handlePessoaChange}
                disabled={!tipoFiltro}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
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
          <CardTitle>
            {pessoaSelecionada 
              ? `Laudos de ${pessoaSelecionada}` 
              : "Todos os Laudos"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {vistoriasFiltradas.length} laudo(s) encontrado(s)
          </p>
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