import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const FORMAS_PAGAMENTO = [
  { value: "DINHEIRO", label: "💵 Dinheiro" },
  { value: "PIX", label: "📱 PIX" },
  { value: "DÉBITO", label: "💳 Débito" },
  { value: "CRÉDITO", label: "💳 Crédito" },
  { value: "BOLETO", label: "📄 Boleto" },
  { value: "FATURADO/PENDENTE", label: "‼️ FATURADO/PENDENTE" },
] as const;

interface PagamentoSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function PagamentoSelect({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Selecione o pagamento"
}: PagamentoSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {FORMAS_PAGAMENTO.map((forma) => (
          <SelectItem key={forma.value} value={forma.value}>
            {forma.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
