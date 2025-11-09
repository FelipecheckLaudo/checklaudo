import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Digitador, Visitador } from "@/lib/database";

interface ResponsaveisFormSectionProps {
  digitador: string;
  setDigitador: (value: string) => void;
  liberador: string;
  setLiberador: (value: string) => void;
  digitadores: Digitador[];
  vistoriadores: Visitador[];
  isLoading: boolean;
  isSaving: boolean;
}

export function ResponsaveisFormSection({
  digitador,
  setDigitador,
  liberador,
  setLiberador,
  digitadores,
  vistoriadores,
  isLoading,
  isSaving
}: ResponsaveisFormSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="digitador">Digitador</Label>
        {isLoading ? (
          <div className="flex items-center gap-2 py-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Carregando...</span>
          </div>
        ) : digitadores.length === 0 ? (
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            Nenhum digitador cadastrado
          </div>
        ) : (
          <Select value={digitador} onValueChange={setDigitador} disabled={isSaving}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um digitador" />
            </SelectTrigger>
            <SelectContent>
              {digitadores.map((d) => (
                <SelectItem key={d.id} value={d.nome}>
                  {d.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="liberador">Vistoriador</Label>
        {isLoading ? (
          <div className="flex items-center gap-2 py-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Carregando...</span>
          </div>
        ) : vistoriadores.length === 0 ? (
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            Nenhum vistoriador cadastrado
          </div>
        ) : (
          <Select value={liberador} onValueChange={setLiberador} disabled={isSaving}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um vistoriador" />
            </SelectTrigger>
            <SelectContent>
              {vistoriadores.map((v) => (
                <SelectItem key={v.id} value={v.nome}>
                  {v.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
