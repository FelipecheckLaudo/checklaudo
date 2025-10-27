import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const situacaoStyles: Record<string, string> = {
  "APROVADO": "bg-green-500/90 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
  "REPROVADO": "bg-red-500/90 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
  "APROVADO COM APONTAMENTOS": "bg-yellow-500/90 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700",
  "SUSPEITO ADULTERAÇÃO": "bg-purple-500/90 text-white hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700",
  "PENDENTE": "bg-gray-500/90 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700",
  "CONFORME": "bg-green-500/90 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700",
  "NÃO CONFORME": "bg-red-500/90 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
};

interface SituacaoBadgeProps {
  situacao: string;
  className?: string;
}

export function SituacaoBadge({ situacao, className }: SituacaoBadgeProps) {
  return (
    <Badge 
      className={cn(
        situacaoStyles[situacao] || "bg-gray-500/90 text-white",
        className
      )}
    >
      {situacao}
    </Badge>
  );
}
