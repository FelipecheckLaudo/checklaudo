import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getVistorias } from "@/lib/database";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { DollarSign, FileText, TrendingUp, Users, Award, CalendarIcon } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
  const [vistorias, setVistorias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataInicial, setDataInicial] = useState<Date | undefined>(subMonths(new Date(), 6));
  const [dataFinal, setDataFinal] = useState<Date | undefined>(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getVistorias();
      setVistorias(data);
    } catch (error) {
      console.error("Erro ao carregar vistorias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filtrar vistorias por período
  const vistoriasFiltradas = vistorias.filter(v => {
    if (!dataInicial || !dataFinal) return true;
    const dataVistoria = parseISO(v.created_at);
    return isWithinInterval(dataVistoria, { start: dataInicial, end: dataFinal });
  });

  // Cálculos de estatísticas
  const totalVistorias = vistoriasFiltradas.length;
  const valorTotal = vistoriasFiltradas.reduce((sum, v) => sum + Number(v.valor || 0), 0);
  const ticketMedio = totalVistorias > 0 ? valorTotal / totalVistorias : 0;

  // Ranking de vistoriadores por quantidade
  const vistoriadoresRanking = vistoriasFiltradas.reduce((acc: any, v) => {
    const nome = v.liberador || "Sem vistoriador";
    if (!acc[nome]) {
      acc[nome] = { nome, quantidade: 0, valor: 0 };
    }
    acc[nome].quantidade += 1;
    acc[nome].valor += Number(v.valor || 0);
    return acc;
  }, {});

  const topVistoriadores = Object.values(vistoriadoresRanking)
    .sort((a: any, b: any) => b.quantidade - a.quantidade)
    .slice(0, 5);

  // Ranking de clientes por quantidade
  const clientesRanking = vistoriasFiltradas.reduce((acc: any, v) => {
    const nome = v.cliente_nome || "Sem cliente";
    if (!acc[nome]) {
      acc[nome] = { nome, quantidade: 0, valor: 0 };
    }
    acc[nome].quantidade += 1;
    acc[nome].valor += Number(v.valor || 0);
    return acc;
  }, {});

  const topClientes = Object.values(clientesRanking)
    .sort((a: any, b: any) => b.quantidade - a.quantidade)
    .slice(0, 5);

  // Distribuição por tipo
  const distribuicaoPorTipo = vistoriasFiltradas.reduce((acc: any, v) => {
    const tipo = v.tipo || "Sem tipo";
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  const dadosTipo = Object.entries(distribuicaoPorTipo).map(([name, value]) => ({
    name,
    value
  }));

  // Distribuição por situação
  const distribuicaoPorSituacao = vistoriasFiltradas.reduce((acc: any, v) => {
    const situacao = v.situacao || "Sem situação";
    acc[situacao] = (acc[situacao] || 0) + 1;
    return acc;
  }, {});

  const dadosSituacao = Object.entries(distribuicaoPorSituacao).map(([name, value]) => ({
    name,
    value
  }));

  // Evolução temporal (baseado no período selecionado)
  const meses = dataInicial && dataFinal 
    ? eachMonthOfInterval({ start: dataInicial, end: dataFinal })
    : [];

  const evolucaoTemporal = meses.map(mes => {
    const inicioMes = startOfMonth(mes);
    const fimMes = endOfMonth(mes);
    
    const vistoriasMes = vistoriasFiltradas.filter(v => {
      const dataVistoria = parseISO(v.created_at);
      return dataVistoria >= inicioMes && dataVistoria <= fimMes;
    });

    return {
      mes: format(mes, 'MMM/yy', { locale: ptBR }),
      quantidade: vistoriasMes.length,
      valor: vistoriasMes.reduce((sum, v) => sum + Number(v.valor || 0), 0)
    };
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard de Gerenciamento</h1>
        <p className="text-muted-foreground">Visão geral das suas vistorias e desempenho</p>
      </div>

      {/* Filtros de Data */}
      <Card>
        <CardHeader>
          <CardTitle>Período de Análise</CardTitle>
          <CardDescription>Selecione o intervalo de datas para visualizar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
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

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Data Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
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
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Laudos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVistorias}</div>
            <p className="text-xs text-muted-foreground">Laudos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(valorTotal)}</div>
            <p className="text-xs text-muted-foreground">Receita total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(ticketMedio)}</div>
            <p className="text-xs text-muted-foreground">Por laudo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vistoriadores Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(vistoriadoresRanking).length}</div>
            <p className="text-xs text-muted-foreground">No sistema</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Evolução */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal - Quantidade</CardTitle>
            <CardDescription>Período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoTemporal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="quantidade" stroke="#8884d8" name="Laudos" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal - Valor</CardTitle>
            <CardDescription>Período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={evolucaoTemporal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="valor" stroke="#82ca9d" name="Valor (R$)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribuições */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
            <CardDescription>Tipos de vistoria realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosTipo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Situação</CardTitle>
            <CardDescription>Status dos laudos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosSituacao}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Rankings */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top 5 Vistoriadores
            </CardTitle>
            <CardDescription>Por quantidade de laudos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVistoriadores.map((v: any, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{v.nome}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(v.valor)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{v.quantidade}</p>
                    <p className="text-xs text-muted-foreground">laudos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top 5 Clientes
            </CardTitle>
            <CardDescription>Por quantidade de laudos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClientes.map((c: any, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{c.nome}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(c.valor)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{c.quantidade}</p>
                    <p className="text-xs text-muted-foreground">laudos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
