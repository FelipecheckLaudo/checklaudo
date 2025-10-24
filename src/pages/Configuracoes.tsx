import { Settings } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Configuracoes() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">Ajuste as preferências do sistema</p>
      </div>

      <Card className="p-12 text-center border-2 border-dashed">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Settings className="h-16 w-16 opacity-50" />
          <div>
            <p className="text-lg font-medium">Módulo de Configurações</p>
            <p className="text-sm mt-1">Em desenvolvimento</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
