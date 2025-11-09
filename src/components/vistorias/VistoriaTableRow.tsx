import { memo } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { SituacaoDropdown } from "@/components/SituacaoDropdown";
import { PagamentoDropdown } from "@/components/PagamentoDropdown";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Vistoria } from "@/lib/database";

interface VistoriaTableRowProps {
  vistoria: Vistoria;
  onEdit: (vistoria: Vistoria) => void;
  onDelete: (vistoria: Vistoria) => void;
  onSituacaoChange: (id: string, situacao: string) => Promise<void>;
  onPagamentoChange: (id: string, pagamento: string) => Promise<void>;
}

/**
 * Desktop table row for vistorias
 * Memoized to prevent unnecessary re-renders
 */
export const VistoriaTableRow = memo(function VistoriaTableRow({
  vistoria,
  onEdit,
  onDelete,
  onSituacaoChange,
  onPagamentoChange,
}: VistoriaTableRowProps) {
  return (
    <TableRow
      className={cn(
        vistoria.modalidade === "EXTERNO" &&
          "bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100/50 dark:hover:bg-orange-950/30"
      )}
    >
      <TableCell className="font-medium">
        {formatDate(vistoria.criadoEm || vistoria.created_at || "")}
      </TableCell>
      <TableCell className="font-mono font-semibold mx-0 px-px">
        {vistoria.placa}
      </TableCell>
      <TableCell>{vistoria.modelo}</TableCell>
      <TableCell>{vistoria.clienteNome || vistoria.cliente_nome}</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded",
              vistoria.modalidade === "EXTERNO"
                ? "bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/30"
                : "bg-primary/10 text-primary"
            )}
          >
            {vistoria.tipo}
          </span>
          {vistoria.modalidade === "EXTERNO" && (
            <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-400 uppercase">
              Externo/Lojista
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>{formatCurrency(Number(vistoria.valor))}</TableCell>
      <TableCell>
        <PagamentoDropdown
          pagamento={vistoria.pagamento}
          onPagamentoChange={(novoPagamento) =>
            onPagamentoChange(vistoria.id, novoPagamento)
          }
        />
      </TableCell>
      <TableCell>
        <SituacaoDropdown
          situacao={vistoria.situacao}
          onSituacaoChange={(novaSituacao) =>
            onSituacaoChange(vistoria.id, novaSituacao)
          }
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(vistoria)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(vistoria)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
