import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { clienteSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { formatCPF } from "@/lib/formatters";
import { STORAGE_BUCKETS } from "@/lib/constants";

interface CadastroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSave: (data: { nome: string; cpf: string; observacoes: string; foto_url?: string }) => void;
  isSaving?: boolean;
  initialData?: { id?: string; nome: string; cpf: string; observacoes: string; foto_url?: string };
}

export function CadastroDialog({
  open,
  onOpenChange,
  title,
  description,
  onSave,
  isSaving = false,
  initialData,
}: CadastroDialogProps) {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    observacoes: "",
    foto_url: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome || "",
        cpf: initialData.cpf || "",
        observacoes: initialData.observacoes || "",
        foto_url: initialData.foto_url || "",
      });
      setPreviewUrl(initialData.foto_url || "");
    } else {
      setFormData({ nome: "", cpf: "", observacoes: "", foto_url: "" });
      setPreviewUrl("");
    }
    setSelectedFile(null);
  }, [initialData, open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor, selecione apenas imagens");
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 2MB");
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData({ ...formData, foto_url: "" });
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return formData.foto_url || null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para fazer upload");
        return null;
      }

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      // Store files in user-specific folder for proper RLS
      const filePath = `${user.id}/cadastros/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.VISTORIA_FOTOS)
        .upload(filePath, selectedFile);

      if (uploadError) {
        logger.error("Error uploading image", uploadError);
        toast.error("Erro ao fazer upload da imagem");
        throw uploadError;
      }

      // Use signed URL instead of public URL for security
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from(STORAGE_BUCKETS.VISTORIA_FOTOS)
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

      if (urlError) {
        logger.error("Error creating signed URL", urlError);
        toast.error("Erro ao processar imagem");
        throw urlError;
      }

      return signedUrlData.signedUrl;
    } catch (error) {
      logger.error("Upload failed", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate with zod schema
    const validation = clienteSchema.safeParse(formData);
    if (!validation.success) {
      validation.error.errors.forEach((error) => {
        toast.error(`${error.path.join('.')}: ${error.message}`);
      });
      return;
    }

    try {
      const fotoUrl = await uploadImage();
      onSave({ ...formData, foto_url: fotoUrl || undefined });
      setFormData({ nome: "", cpf: "", observacoes: "", foto_url: "" });
      setSelectedFile(null);
      setPreviewUrl("");
      onOpenChange(false);
    } catch (error) {
      logger.error("Error saving cadastro", error);
      toast.error("Erro ao salvar");
    }
  };


  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSaving) {
      setFormData({ nome: "", cpf: "", observacoes: "", foto_url: "" });
      setSelectedFile(null);
      setPreviewUrl("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">
                NOME COMPLETO/EMPRESA <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nome"
                placeholder="Digite o nome completo"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                disabled={isSaving}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf">
                CPF <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                maxLength={14}
                required
                disabled={isSaving}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais (opcional)"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows={4}
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="foto">Foto</Label>
              {previewUrl ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-border">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={handleRemoveImage}
                    disabled={isSaving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isSaving}
                    className="hidden"
                  />
                  <Label
                    htmlFor="foto"
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md cursor-pointer hover:bg-secondary/80 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Selecionar Imagem
                  </Label>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
