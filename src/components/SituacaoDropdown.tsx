import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SituacaoBadge } from "./SituacaoBadge";
import { Loader2 } from "lucide-react";

interface SituacaoDropdownProps {
  situacao: string;
  onSituacaoChange: (novaSituacao: string) => Promise<void>;
}

const situacoes = [
  "PENDENTE",
  "APROVADO",
  "REPROVADO",
  "APROVADO COM APONTAMENTOS",
  "SUSPEITO ADULTERAÇÃO",
  "CONFORME",
  "NÃO CONFORME",
];

export function SituacaoDropdown({ situacao, onSituacaoChange }: SituacaoDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = async (novaSituacao: string) => {
    if (novaSituacao === situacao) return;
    
    try {
      setIsUpdating(true);
      await onSituacaoChange(novaSituacao);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Select value={situacao} onValueChange={handleChange} disabled={isUpdating}>
      <SelectTrigger className="w-auto border-none shadow-none hover:bg-accent p-1 h-auto">
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SelectValue>
            <SituacaoBadge situacao={situacao} />
          </SelectValue>
        )}
      </SelectTrigger>
      <SelectContent className="bg-popover z-50">
        {situacoes.map((sit) => (
          <SelectItem key={sit} value={sit}>
            <SituacaoBadge situacao={sit} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
