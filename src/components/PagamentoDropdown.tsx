import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { FORMAS_PAGAMENTO } from "./PagamentoSelect";

interface PagamentoDropdownProps {
  pagamento: string;
  onPagamentoChange: (novoPagamento: string) => void;
}

export function PagamentoDropdown({
  pagamento,
  onPagamentoChange,
}: PagamentoDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const pagamentoAtual = FORMAS_PAGAMENTO.find(f => f.value === pagamento);
  const labelAtual = pagamentoAtual?.label || pagamento;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 font-normal"
        >
          <span>{labelAtual}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {FORMAS_PAGAMENTO.map((forma) => (
          <DropdownMenuItem
            key={forma.value}
            onClick={() => {
              onPagamentoChange(forma.value);
              setIsOpen(false);
            }}
            className="cursor-pointer"
          >
            {forma.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
