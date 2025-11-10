import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";

export default function Configuracoes() {
  const [logoUrl, setLogoUrl] = useState<string | null>(
    localStorage.getItem('system_logo') || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Por favor, selecione uma imagem ou vídeo válido");
      return;
    }

    const maxSize = file.type.startsWith("video/") ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(file.type.startsWith("video/") ? "O vídeo deve ter no máximo 10MB" : "A imagem deve ter no máximo 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setLogoUrl(url);
      localStorage.setItem('system_logo', url);
      window.dispatchEvent(new CustomEvent('logo-updated'));
      toast.success("Logo atualizado!");
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoUrl(null);
    localStorage.removeItem('system_logo');
    window.dispatchEvent(new CustomEvent('logo-updated'));
    toast.success("Logo removido!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logo do Sistema</CardTitle>
          <CardDescription>Personalize o logo que aparece no sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
            {logoUrl ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {logoUrl.includes('.mp4') || logoUrl.includes('.webm') || logoUrl.includes('.mov') ? (
                    <video 
                      src={logoUrl} 
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="max-h-48 object-contain"
                    />
                  ) : (
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="max-h-48 object-contain"
                    />
                  )}
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Alterar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeLogo}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Logo
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Imagem (PNG, JPG, WEBP - máx. 2MB) ou Vídeo (MP4, WEBM - máx. 10MB)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
