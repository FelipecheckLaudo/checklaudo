import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { formatCPF } from "@/lib/formatters";
import type { Cliente } from "@/lib/types";

interface ClienteFormSectionProps {
  tipoCliente: "cadastrado" | "novo" | "particular";
  setTipoCliente: (tipo: "cadastrado" | "novo" | "particular") => void;
  clienteId: string;
  setClienteId: (id: string) => void;
  novoCliente: { nome: string; cpf: string };
  setNovoCliente: (data: { nome: string; cpf: string }) => void;
  clientes: Cliente[];
  isLoading: boolean;
  isSaving: boolean;
}

export function ClienteFormSection({
  tipoCliente,
  setTipoCliente,
  clienteId,
  setClienteId,
  novoCliente,
  setNovoCliente,
  clientes,
  isLoading,
  isSaving
}: ClienteFormSectionProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Tipo de Cliente</Label>
        <RadioGroup
          value={tipoCliente}
          onValueChange={(value: "cadastrado" | "novo" | "particular") => {
            setTipoCliente(value);
            setClienteId("");
            setNovoCliente({ nome: "", cpf: "" });
          }}
          disabled={isSaving}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cadastrado" id="cadastrado" />
            <Label htmlFor="cadastrado" className="font-normal cursor-pointer">Cliente Cadastrado</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="novo" id="novo" />
            <Label htmlFor="novo" className="font-normal cursor-pointer">Novo Cliente (Cadastrar no Sistema)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="particular" id="particular" />
            <Label htmlFor="particular" className="font-normal cursor-pointer">Cliente Particular</Label>
          </div>
        </RadioGroup>
      </div>

      {tipoCliente === "cadastrado" && (
        <div className="space-y-2">
          <Label htmlFor="cliente">Selecionar Cliente <span className="text-destructive">*</span></Label>
          {isLoading ? (
            <div className="flex items-center gap-2 py-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Carregando clientes...</span>
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
              Nenhum cliente cadastrado. Selecione outra opção acima.
            </div>
          ) : (
            <Select value={clienteId} onValueChange={setClienteId} disabled={isSaving}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cliente) => (
                  <SelectItem key={cliente.id} value={cliente.id}>
                    {cliente.nome} - {cliente.cpf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {(tipoCliente === "novo" || tipoCliente === "particular") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="novoClienteNome">
              Nome do Cliente <span className="text-destructive">*</span>
            </Label>
            <Input
              id="novoClienteNome"
              placeholder="Ex: João Silva"
              value={novoCliente.nome}
              onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value.toUpperCase() })}
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="novoClienteCpf">
              CPF do Cliente <span className="text-destructive">*</span>
            </Label>
            <Input
              id="novoClienteCpf"
              placeholder="123.456.789-00"
              value={novoCliente.cpf}
              onChange={(e) => setNovoCliente({ ...novoCliente, cpf: formatCPF(e.target.value) })}
              maxLength={14}
              disabled={isSaving}
            />
          </div>
        </div>
      )}
    </div>
  );
}
