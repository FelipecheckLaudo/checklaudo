import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CadastroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSave: (data: { nome: string; cpf: string; observacoes: string }) => void;
  isSaving?: boolean;
  initialData?: { id?: string; nome: string; cpf: string; observacoes: string };
}

export function CadastroDialog({
  open,
  onOpenChange,
  title,
  description,
  onSave,
  isSaving = false,
  initialData,
}: CadastroDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    observacoes: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome || "",
        cpf: initialData.cpf || "",
        observacoes: initialData.observacoes || "",
      });
    } else {
      setFormData({ nome: "", cpf: "", observacoes: "" });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome || !formData.cpf) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    onSave(formData);
    setFormData({ nome: "", cpf: "", observacoes: "" });
    onOpenChange(false);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return value;
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSaving) {
      setFormData({ nome: "", cpf: "", observacoes: "" });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">
                Nome Completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nome"
                placeholder="Digite o nome completo"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                disabled={isSaving}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf">
                CPF <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                maxLength={14}
                required
                disabled={isSaving}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais (opcional)"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={4}
                disabled={isSaving}
              />
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
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
