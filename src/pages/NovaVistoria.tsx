import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClientes, saveVistoria, saveCliente, getDigitadores, getVisitadores, type Cliente, type Digitador, type Visitador } from "@/lib/database";
import { PagamentoSelect } from "@/components/PagamentoSelect";
import { toast } from "sonner";
export default function NovaVistoria() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [digitadores, setDigitadores] = useState<Digitador[]>([]);
  const [vistoriadores, setVistoriadores] = useState<Visitador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    modelo: "",
    placa: "",
    pagamento: "DÉBITO",
    valor: "",
    situacao: "PENDENTE",
    clienteId: "",
    digitador: "",
    liberador: ""
  });
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    cpf: ""
  });
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [clientesData, digitadoresData, vistoriadoresData] = await Promise.all([
          getClientes(),
          getDigitadores(),
          getVisitadores()
        ]);
        setClientes(clientesData);
        setDigitadores(digitadoresData);
        setVistoriadores(vistoriadoresData);
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      let clienteId = formData.clienteId;
      let clienteNome = "";
      let clienteCpf = "";

      // Se não selecionou cliente existente, verifica se preencheu dados do novo cliente
      if (!clienteId) {
        if (!novoCliente.nome || !novoCliente.cpf) {
          toast.error("Selecione um cliente ou preencha os dados do novo cliente");
          return;
        }

        // Cria novo cliente
        const clienteCriado = await saveCliente({
          nome: novoCliente.nome,
          cpf: novoCliente.cpf,
          observacoes: ""
        });
        clienteId = clienteCriado.id;
        clienteNome = clienteCriado.nome;
        clienteCpf = clienteCriado.cpf;

        // Atualiza lista de clientes
        const novaLista = await getClientes();
        setClientes(novaLista);
        toast.success("Cliente cadastrado com sucesso!");
      } else {
        const cliente = clientes.find(c => c.id === clienteId);
        if (!cliente) {
          toast.error("Cliente não encontrado");
          return;
        }
        clienteNome = cliente.nome;
        clienteCpf = cliente.cpf;
      }
      // Garante que o valor seja válido (não vazio)
      if (!formData.valor || formData.valor === "R$ 0,00") {
        toast.error("Informe um valor válido para a vistoria");
        return;
      }

      await saveVistoria({
        modelo: formData.modelo,
        placa: formData.placa.toUpperCase(),
        pagamento: formData.pagamento,
        valor: formData.valor,
        situacao: formData.situacao,
        clienteId: clienteId,
        cliente_id: clienteId,
        clienteNome: clienteNome,
        cliente_nome: clienteNome,
        cliente_cpf: clienteCpf,
        digitador: formData.digitador,
        liberador: formData.liberador,
        fotos: []
      });
      toast.success("Vistoria cadastrada com sucesso!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar vistoria");
    } finally {
      setIsSaving(false);
    }
  };
  const formatPlaca = (value: string) => {
    const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (cleaned.length <= 3) return cleaned;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
  };
  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  };
  return <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/")} disabled={isSaving}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Nova Vistoria</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Veículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modelo">
                  Modelo do Veículo <span className="text-destructive">*</span>
                </Label>
                <Input id="modelo" placeholder="Ex: Honda Civic 2020" value={formData.modelo} onChange={e => setFormData({
                ...formData,
                modelo: e.target.value.toUpperCase()
              })} required disabled={isSaving} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="placa">
                  Placa <span className="text-destructive">*</span>
                </Label>
                <Input id="placa" placeholder="ABC-1234" value={formData.placa} onChange={e => setFormData({
                ...formData,
                placa: formatPlaca(e.target.value)
              })} maxLength={8} required disabled={isSaving} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pagamento">Forma de Pagamento</Label>
                <PagamentoSelect
                  value={formData.pagamento}
                  onValueChange={value => setFormData({ ...formData, pagamento: value })}
                  disabled={isSaving}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="valor">
                  Valor <span className="text-destructive">*</span>
                </Label>
                <Input id="valor" type="text" placeholder="R$ 0,00" value={formData.valor} onChange={e => {
                const valor = e.target.value.replace(/\D/g, "");
                const numero = valor ? Number(valor) / 100 : 0;
                const formatado = numero.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL"
                });
                setFormData({
                  ...formData,
                  valor: formatado
                });
              }} required disabled={isSaving} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="situacao">Situação</Label>
                <Select value={formData.situacao} onValueChange={value => setFormData({
                ...formData,
                situacao: value
              })} disabled={isSaving}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                    <SelectItem value="APROVADO">Aprovado</SelectItem>
                    <SelectItem value="REPROVADO">Reprovado</SelectItem>
                    <SelectItem value="APROVADO COM APONTAMENTOS">Aprovado com Apontamentos</SelectItem>
                    <SelectItem value="SUSPEITO ADULTERAÇÃO">Suspeito Adulteração</SelectItem>
                    <SelectItem value="CONFORME">Conforme</SelectItem>
                    <SelectItem value="NÃO CONFORME">Não Conforme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Selecionar Cliente Existente</Label>
              {isLoading ? <div className="flex items-center gap-2 py-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Carregando clientes...</span>
                </div> : clientes.length === 0 ? <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                  Nenhum cliente cadastrado. Preencha os dados abaixo para cadastrar um novo cliente.
                </div> : <Select value={formData.clienteId} onValueChange={value => {
              setFormData({
                ...formData,
                clienteId: value
              });
              if (value) {
                setNovoCliente({
                  nome: "",
                  cpf: ""
                });
              }
            }} disabled={isSaving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map(cliente => <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome} - {cliente.cpf}
                      </SelectItem>)}
                  </SelectContent>
                </Select>}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ou cadastrar novo cliente</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="novoClienteNome">Nome do Cliente</Label>
                <Input id="novoClienteNome" placeholder="Ex: João Silva" value={novoCliente.nome} onChange={e => {
                const value = e.target.value.toUpperCase();
                setNovoCliente({
                  ...novoCliente,
                  nome: value
                });
                if (value && formData.clienteId) {
                  setFormData({
                    ...formData,
                    clienteId: ""
                  });
                }
              }} disabled={!!formData.clienteId || isSaving} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="novoClienteCpf">CPF do Cliente</Label>
                <Input id="novoClienteCpf" placeholder="123.456.789-00" value={novoCliente.cpf} onChange={e => {
                const value = formatCPF(e.target.value);
                setNovoCliente({
                  ...novoCliente,
                  cpf: value
                });
                if (value && formData.clienteId) {
                  setFormData({
                    ...formData,
                    clienteId: ""
                  });
                }
              }} maxLength={14} disabled={!!formData.clienteId || isSaving} />
              </div>
            </div>
          </CardContent>
        </Card>

        

        <Card>
          <CardHeader>
            <CardTitle>Responsáveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="digitador">Digitador</Label>
                {isLoading ? (
                  <div className="flex items-center gap-2 py-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : digitadores.length === 0 ? (
                  <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                    Nenhum digitador cadastrado
                  </div>
                ) : (
                  <Select value={formData.digitador} onValueChange={value => setFormData({ ...formData, digitador: value })} disabled={isSaving}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um digitador" />
                    </SelectTrigger>
                    <SelectContent>
                      {digitadores.map(digitador => (
                        <SelectItem key={digitador.id} value={digitador.nome}>
                          {digitador.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="liberador">Vistoriador</Label>
                {isLoading ? (
                  <div className="flex items-center gap-2 py-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Carregando...</span>
                  </div>
                ) : vistoriadores.length === 0 ? (
                  <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                    Nenhum vistoriador cadastrado
                  </div>
                ) : (
                  <Select value={formData.liberador} onValueChange={value => setFormData({ ...formData, liberador: value })} disabled={isSaving}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um vistoriador" />
                    </SelectTrigger>
                    <SelectContent>
                      {vistoriadores.map(vistoriador => (
                        <SelectItem key={vistoriador.id} value={vistoriador.nome}>
                          {vistoriador.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/")} className="flex-1" disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity gap-2" disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Vistoria
          </Button>
        </div>
      </form>
    </div>;
}