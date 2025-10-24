import { useState, useEffect } from "react";
import { BarChart3, Users, FileText, DollarSign, Loader2, Calendar as CalendarIcon, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getVistorias, type Vistoria } from "@/lib/database";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface FuncionarioStats {
  nome: string;
  quantidade: number;
  valorTotal: number;
}

export default function Analises() {
  const [vistorias, setVistorias] = useState<Vistoria[]>([]);
  const [vistoriasFiltradas, setVistoriasFiltradas] = useState<Vistoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [digitadoresStats, setDigitadoresStats] = useState<FuncionarioStats[]>([]);
  const [liberadoresStats, setLiberadoresStats] = useState<FuncionarioStats[]>([]);
  const [dataInicial, setDataInicial] = useState<Date | undefined>();
  const [dataFinal, setDataFinal] = useState<Date | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await getVistorias();
      setVistorias(data);
      setVistoriasFiltradas(data);
      processarEstatisticas(data);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltro = () => {
    if (!dataInicial || !dataFinal) {
      toast.error("Selecione a data inicial e final");
      return;
    }

    const filtradas = vistorias.filter((v) => {
      const dataVistoria = new Date(v.created_at);
      return dataVistoria >= dataInicial && dataVistoria <= dataFinal;
    });

    setVistoriasFiltradas(filtradas);
    processarEstatisticas(filtradas);
    toast.success(`Relatório gerado: ${filtradas.length} vistorias encontradas`);
  };

  const limparFiltro = () => {
    setDataInicial(undefined);
    setDataFinal(undefined);
    setVistoriasFiltradas(vistorias);
    processarEstatisticas(vistorias);
    toast.success("Filtro removido");
  };

  const processarEstatisticas = (data: Vistoria[]) => {
    // Estatísticas por digitador
    const digitadoresMap = new Map<string, FuncionarioStats>();
    data.forEach((v) => {
      if (v.digitador) {
        const existing = digitadoresMap.get(v.digitador) || {
          nome: v.digitador,
          quantidade: 0,
          valorTotal: 0,
        };
        existing.quantidade += 1;
        existing.valorTotal += parseFloat(v.valor);
        digitadoresMap.set(v.digitador, existing);
      }
    });

    // Estatísticas por liberador (vistoriador)
    const liberadoresMap = new Map<string, FuncionarioStats>();
    data.forEach((v) => {
      if (v.liberador) {
        const existing = liberadoresMap.get(v.liberador) || {
          nome: v.liberador,
          quantidade: 0,
          valorTotal: 0,
        };
        existing.quantidade += 1;
        existing.valorTotal += parseFloat(v.valor);
        liberadoresMap.set(v.liberador, existing);
      }
    });

    setDigitadoresStats(Array.from(digitadoresMap.values()).sort((a, b) => b.quantidade - a.quantidade));
    setLiberadoresStats(Array.from(liberadoresMap.values()).sort((a, b) => b.quantidade - a.quantidade));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalVistorias = vistoriasFiltradas.length;
  const valorTotal = vistoriasFiltradas.reduce((acc, v) => acc + parseFloat(v.valor), 0);
  const totalDigitadores = digitadoresStats.length;
  const totalLiberadores = liberadoresStats.length;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Análises</h1>
          <p className="text-muted-foreground">Visualize relatórios e estatísticas das vistorias</p>
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Análises e Comissões</h1>
        <p className="text-muted-foreground">Acompanhe o desempenho e produtividade da equipe</p>
      </div>

      {/* Filtro de Datas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Relatório por Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
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
                    {dataInicial ? format(dataInicial, "PPP", { locale: ptBR }) : "Selecione a data"}
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
            </div>

            <div className="flex-1">
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
                    {dataFinal ? format(dataFinal, "PPP", { locale: ptBR }) : "Selecione a data"}
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
            </div>

            <div className="flex gap-2">
              <Button onClick={aplicarFiltro} className="gap-2">
                <Filter className="h-4 w-4" />
                Gerar Relatório
              </Button>
              {(dataInicial || dataFinal) && (
                <Button onClick={limparFiltro} variant="outline">
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vistorias</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVistorias}</div>
            <p className="text-xs text-muted-foreground">Todas as vistorias cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(valorTotal)}</div>
            <p className="text-xs text-muted-foreground">Soma de todas as vistorias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Digitadores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDigitadores}</div>
            <p className="text-xs text-muted-foreground">Com vistorias registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vistoriadores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLiberadores}</div>
            <p className="text-xs text-muted-foreground">Com vistorias liberadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vistorias por Vistoriador</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={liberadoresStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [value, "Quantidade"]}
                  contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="quantidade" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vistorias por Digitador</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={digitadoresStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [value, "Quantidade"]}
                  contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
                />
                <Bar dataKey="quantidade" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabelas Detalhadas */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Tabela de Vistoriadores */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes por Vistoriador</CardTitle>
            <p className="text-sm text-muted-foreground">Quantidade e valor total das vistorias liberadas</p>
          </CardHeader>
          <CardContent>
            {liberadoresStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum vistoriador com vistorias</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vistoriador</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liberadoresStats.map((stat) => (
                      <TableRow key={stat.nome}>
                        <TableCell className="font-medium">{stat.nome}</TableCell>
                        <TableCell className="text-right">{stat.quantidade}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(stat.valorTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Digitadores */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes por Digitador</CardTitle>
            <p className="text-sm text-muted-foreground">Quantidade e valor total das vistorias digitadas</p>
          </CardHeader>
          <CardContent>
            {digitadoresStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum digitador com vistorias</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Digitador</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {digitadoresStats.map((stat) => (
                      <TableRow key={stat.nome}>
                        <TableCell className="font-medium">{stat.nome}</TableCell>
                        <TableCell className="text-right">{stat.quantidade}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(stat.valorTotal)}
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
    </div>
  );
}
