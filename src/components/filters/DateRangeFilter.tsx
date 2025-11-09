import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  dataInicial?: Date;
  dataFinal?: Date;
  onDataInicialChange: (date: Date | undefined) => void;
  onDataFinalChange: (date: Date | undefined) => void;
  onClear: () => void;
}

/**
 * Reusable date range filter component
 * Used in Dashboard and Vistorias pages
 */
export function DateRangeFilter({
  dataInicial,
  dataFinal,
  onDataInicialChange,
  onDataFinalChange,
  onClear,
}: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "gap-2 justify-start text-left font-normal flex-1 md:flex-initial",
              !dataInicial && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="text-sm">
              {dataInicial ? format(dataInicial, "dd/MM/yy") : "Data Inicial"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dataInicial}
            onSelect={onDataInicialChange}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "gap-2 justify-start text-left font-normal flex-1 md:flex-initial",
              !dataFinal && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span className="text-sm">
              {dataFinal ? format(dataFinal, "dd/MM/yy") : "Data Final"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dataFinal}
            onSelect={onDataFinalChange}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>

      {(dataInicial || dataFinal) && (
        <Button
          variant="ghost"
          onClick={onClear}
          className="gap-2 w-full md:w-auto"
        >
          Limpar Filtros
        </Button>
      )}
    </div>
  );
}
