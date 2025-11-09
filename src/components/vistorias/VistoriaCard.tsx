import { memo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { SituacaoDropdown } from "@/components/SituacaoDropdown";
import { PagamentoDropdown } from "@/components/PagamentoDropdown";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Vistoria } from "@/lib/database";

interface VistoriaCardProps {
  vistoria: Vistoria;
  onEdit: (vistoria: Vistoria) => void;
  onDelete: (vistoria: Vistoria) => void;
  onSituacaoChange: (id: string, situacao: string) => Promise<void>;
  onPagamentoChange: (id: string, pagamento: string) => Promise<void>;
}

/**
 * Mobile card view for vistorias
 * Memoized to prevent unnecessary re-renders
 */
export const VistoriaCard = memo(function VistoriaCard({
  vistoria,
  onEdit,
  onDelete,
  onSituacaoChange,
  onPagamentoChange,
}: VistoriaCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden",
        vistoria.modalidade === "EXTERNO" &&
          "border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-mono font-bold">
              {vistoria.placa}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{vistoria.modelo}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {formatDate(vistoria.criadoEm || vistoria.created_at || "")}
            </p>
            <p className="text-lg font-bold mt-1">
              {formatCurrency(Number(vistoria.valor))}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Cliente</p>
            <p className="font-medium truncate">
              {vistoria.clienteNome || vistoria.cliente_nome}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Tipo</p>
            <div className="flex flex-col gap-1">
              <span
                className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded inline-block w-fit",
                  vistoria.modalidade === "EXTERNO"
                    ? "bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/30"
                    : "bg-primary/10 text-primary"
                )}
              >
                {vistoria.tipo}
              </span>
              {vistoria.modalidade === "EXTERNO" && (
                <span className="text-[9px] font-semibold text-orange-700 dark:text-orange-400 uppercase">
                  Externo/Lojista
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <p className="text-muted-foreground text-xs mb-1">Situação</p>
            <SituacaoDropdown
              situacao={vistoria.situacao}
              onSituacaoChange={(novaSituacao) =>
                onSituacaoChange(vistoria.id, novaSituacao)
              }
            />
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground text-xs mb-1">Pagamento</p>
            <PagamentoDropdown
              pagamento={vistoria.pagamento}
              onPagamentoChange={(novoPagamento) =>
                onPagamentoChange(vistoria.id, novoPagamento)
              }
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => onEdit(vistoria)}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 text-destructive hover:text-destructive"
            onClick={() => onDelete(vistoria)}
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
