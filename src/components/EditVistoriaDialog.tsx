import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Vistoria } from "@/lib/database";

interface EditVistoriaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vistoria: Vistoria | null;
  onSave: (data: Partial<Vistoria>) => void;
  isSaving?: boolean;
}

export function EditVistoriaDialog({
  open,
  onOpenChange,
  vistoria,
  onSave,
  isSaving = false,
}: EditVistoriaDialogProps) {
  const [formData, setFormData] = useState({
    modelo: "",
    placa: "",
    pagamento: "",
    valor: "",
    situacao: "",
    cliente_nome: "",
    cliente_cpf: "",
    digitador: "",
    liberador: "",
  });

  useEffect(() => {
    if (vistoria) {
      setFormData({
        modelo: vistoria.modelo || "",
        placa: vistoria.placa || "",
        pagamento: vistoria.pagamento || "",
        valor: vistoria.valor || "",
        situacao: vistoria.situacao || "PENDENTE",
        cliente_nome: vistoria.cliente_nome || vistoria.clienteNome || "",
        cliente_cpf: vistoria.cliente_cpf || "",
        digitador: vistoria.digitador || "",
        liberador: vistoria.liberador || "",
      });
    }
  }, [vistoria]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.modelo || !formData.placa || !formData.pagamento || !formData.valor || !formData.cliente_nome || !formData.cliente_cpf) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    onSave(formData);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  const formatPlaca = (value: string) => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Vistoria</DialogTitle>
            <DialogDescription>
              Atualize os dados da vistoria conforme necessário
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-placa">
                  Placa <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-placa"
                  placeholder="ABC1D23"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: formatPlaca(e.target.value) })}
                  maxLength={7}
                  required
                  disabled={isSaving}
                  className="font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-modelo">
                  Modelo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-modelo"
                  placeholder="Ex: Gol 1.0"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cliente">
                  Cliente <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-cliente"
                  placeholder="Nome do cliente"
                  value={formData.cliente_nome}
                  onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-cliente-cpf">
                  CPF do Cliente <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-cliente-cpf"
                  placeholder="000.000.000-00"
                  value={formData.cliente_cpf}
                  onChange={(e) => setFormData({ ...formData, cliente_cpf: formatCPF(e.target.value) })}
                  maxLength={14}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-pagamento">
                  Pagamento <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.pagamento}
                  onValueChange={(value) => setFormData({ ...formData, pagamento: value })}
                  disabled={isSaving}
                  required
                >
                  <SelectTrigger id="edit-pagamento">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="CARTAO">Cartão</SelectItem>
                    <SelectItem value="BOLETO">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-valor">
                  Valor <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-valor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  required
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-situacao">
                Situação <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.situacao}
                onValueChange={(value) => setFormData({ ...formData, situacao: value })}
                disabled={isSaving}
                required
              >
                <SelectTrigger id="edit-situacao">
                  <SelectValue placeholder="Selecione" />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-digitador">Digitador</Label>
                <Input
                  id="edit-digitador"
                  placeholder="Nome do digitador"
                  value={formData.digitador}
                  onChange={(e) => setFormData({ ...formData, digitador: e.target.value })}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-liberador">Liberador</Label>
                <Input
                  id="edit-liberador"
                  placeholder="Nome do liberador"
                  value={formData.liberador}
                  onChange={(e) => setFormData({ ...formData, liberador: e.target.value })}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
