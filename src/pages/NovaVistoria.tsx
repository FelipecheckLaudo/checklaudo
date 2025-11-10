import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClientes, saveVistoria, saveCliente, getDigitadores, getVisitadores } from "@/lib/database";
import type { Cliente, Digitador, Visitador } from "@/lib/types";
import { PagamentoSelect } from "@/components/PagamentoSelect";
import { ClienteFormSection } from "@/components/forms/ClienteFormSection";
import { ResponsaveisFormSection } from "@/components/forms/ResponsaveisFormSection";
import { toast } from "sonner";
import { clienteSchema } from "@/lib/validations";
import { getUserFriendlyError } from "@/lib/errorHandler";
import { formatPlaca } from "@/lib/formatters";
import { SITUACOES } from "@/lib/constants";
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
    tipo: "ECV/TRANSFERENCIA",
    modalidade: "INTERNO",
    clienteId: "",
    digitador: "",
    liberador: ""
  });
  const [tipoCliente, setTipoCliente] = useState<"cadastrado" | "novo" | "particular">("cadastrado");
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    cpf: ""
  });
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [clientesData, digitadoresData, vistoriadoresData] = await Promise.all([getClientes(), getDigitadores(), getVisitadores()]);
        setClientes(clientesData);
        setDigitadores(digitadoresData);
        setVistoriadores(vistoriadoresData);
      } catch (error: any) {
        const friendlyMessage = getUserFriendlyError(error, "carregar dados");
        toast.error(friendlyMessage);
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

      // Valida dados do cliente baseado no tipo selecionado
      if (tipoCliente === "cadastrado") {
        if (!formData.clienteId) {
          toast.error("Selecione um cliente cadastrado");
          return;
        }
        const cliente = clientes.find(c => c.id === formData.clienteId);
        if (!cliente) {
          toast.error("Cliente não encontrado");
          return;
        }
        clienteId = cliente.id;
        clienteNome = cliente.nome;
        clienteCpf = cliente.cpf;
      } else if (tipoCliente === "novo") {
        if (!novoCliente.nome || !novoCliente.cpf) {
          toast.error("Preencha os dados do novo cliente");
          return;
        }
        // Cria novo cliente no sistema
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
      } else if (tipoCliente === "particular") {
        if (!novoCliente.nome || !novoCliente.cpf) {
          toast.error("Preencha os dados do cliente particular");
          return;
        }

        // Validate CPF using schema
        const validation = clienteSchema.safeParse({
          nome: novoCliente.nome,
          cpf: novoCliente.cpf,
          observacoes: ""
        });
        if (!validation.success) {
          validation.error.errors.forEach(err => toast.error(err.message));
          return;
        }

        // Cliente particular não é cadastrado no sistema
        clienteId = null as any;
        clienteNome = novoCliente.nome;
        clienteCpf = novoCliente.cpf;
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
        tipo: formData.tipo,
        modalidade: formData.modalidade,
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
      const friendlyMessage = getUserFriendlyError(error, "cadastrar vistoria");
      toast.error(friendlyMessage);
    } finally {
      setIsSaving(false);
    }
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
          <CardContent className="space-y-4 bg-sky-800">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="tipo" className="flex-1">
                    Tipo de Laudo <span className="text-destructive">*</span>
                  </Label>
                  <Button type="button" variant={formData.modalidade === "EXTERNO" ? "default" : "outline"} size="sm" onClick={() => setFormData({
                  ...formData,
                  modalidade: formData.modalidade === "INTERNO" ? "EXTERNO" : "INTERNO"
                })} disabled={isSaving} className="h-8 text-xs">
                    Modalidade: {formData.modalidade === "INTERNO" ? "Interno/Base" : "Externo/Lojista"}
                  </Button>
                </div>
                <Select value={formData.tipo} onValueChange={value => setFormData({
                ...formData,
                tipo: value
              })} disabled={isSaving}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ECV/TRANSFERENCIA">ECV/Transferência</SelectItem>
                    <SelectItem value="REVISTORIA/INFRAÇÃO DE TRÂNSITO">Revistoria/Infração de Trânsito</SelectItem>
                    <SelectItem value="CAUTELAR">Cautelar</SelectItem>
                    <SelectItem value="VISTORIA PRÉVIA">Vistoria Prévia</SelectItem>
                    <SelectItem value="SEGURADORA">Seguradora</SelectItem>
                    <SelectItem value="PESQUISA">Pesquisa</SelectItem>
                  </SelectContent>
                </Select>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pagamento">Forma de Pagamento</Label>
                <PagamentoSelect value={formData.pagamento} onValueChange={value => setFormData({
                ...formData,
                pagamento: value
              })} disabled={isSaving} />
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <ClienteFormSection
              tipoCliente={tipoCliente}
              setTipoCliente={setTipoCliente}
              clienteId={formData.clienteId}
              setClienteId={(id) => setFormData({ ...formData, clienteId: id })}
              novoCliente={novoCliente}
              setNovoCliente={setNovoCliente}
              clientes={clientes}
              isLoading={isLoading}
              isSaving={isSaving}
            />
          </CardContent>
        </Card>

        

        <Card>
          <CardHeader>
            <CardTitle>Responsáveis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsaveisFormSection
              digitador={formData.digitador}
              setDigitador={(value) => setFormData({ ...formData, digitador: value })}
              liberador={formData.liberador}
              setLiberador={(value) => setFormData({ ...formData, liberador: value })}
              digitadores={digitadores}
              vistoriadores={vistoriadores}
              isLoading={isLoading}
              isSaving={isSaving}
            />
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