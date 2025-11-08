import { Building2, Bell, FileText, Settings, Upload, X, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface ConfigData {
  empresa: {
    nome: string;
    cnpj: string;
    endereco: string;
    telefone: string;
    email: string;
  };
  notificacoes: {
    emailNovosLaudos: boolean;
    emailVencimentos: boolean;
    whatsappNotificacoes: boolean;
  };
  sistema: {
    formatoData: string;
    itensPerPage: string;
  };
  relatorios: {
    incluirLogo: boolean;
    rodape: string;
  };
}

const defaultConfig: ConfigData = {
  empresa: {
    nome: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    email: "",
  },
  notificacoes: {
    emailNovosLaudos: true,
    emailVencimentos: true,
    whatsappNotificacoes: false,
  },
  sistema: {
    formatoData: "DD/MM/YYYY",
    itensPerPage: "10",
  },
  relatorios: {
    incluirLogo: true,
    rodape: "",
  },
};

export default function Configuracoes() {
  const [config, setConfig] = useState<ConfigData>(defaultConfig);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem("appConfig");
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("system_settings")
        .select("logo_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        logger.error("Error fetching logo", error);
        return;
      }

      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
      }
    } catch (error) {
      logger.error("Error fetching logo", error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (image or video)
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Por favor, selecione uma imagem ou vídeo válido");
      return;
    }

    // Validate file size (max 10MB for videos, 2MB for images)
    const maxSize = file.type.startsWith("video/") ? 10 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(file.type.startsWith("video/") ? "O vídeo deve ter no máximo 10MB" : "A imagem deve ter no máximo 2MB");
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      // Delete old logo if exists
      if (logoUrl) {
        const oldPath = logoUrl.split("/").slice(-2).join("/");
        await supabase.storage.from("logos").remove([oldPath]);
      }

      // Upload new logo
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL with cache busting
      const timestamp = new Date().getTime();
      const { data: { publicUrl } } = supabase.storage
        .from("logos")
        .getPublicUrl(filePath);
      
      const publicUrlWithCache = `${publicUrl}?t=${timestamp}`;

      // Save to database
      const { data: existingSettings } = await supabase
        .from("system_settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingSettings) {
        const { error: updateError } = await supabase
          .from("system_settings")
          .update({ logo_url: publicUrlWithCache })
          .eq("user_id", user.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("system_settings")
          .insert({ user_id: user.id, logo_url: publicUrlWithCache });

        if (insertError) throw insertError;
      }

      setLogoUrl(publicUrlWithCache);
      
      // Force reload in layout by triggering a storage event
      window.dispatchEvent(new CustomEvent('logo-updated'));
      toast.success("Logo atualizada com sucesso!");
    } catch (error) {
      logger.error("Error uploading logo", error);
      toast.error("Erro ao fazer upload da logo");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (logoUrl) {
        const filePath = logoUrl.split("/").slice(-2).join("/");
        await supabase.storage.from("logos").remove([filePath]);
      }

      await supabase
        .from("system_settings")
        .update({ logo_url: null })
        .eq("user_id", user.id);

      setLogoUrl(null);
      toast.success("Logo removida com sucesso!");
    } catch (error) {
      logger.error("Error removing logo", error);
      toast.error("Erro ao remover logo");
    }
  };

  const handleSave = () => {
    localStorage.setItem("appConfig", JSON.stringify(config));
    toast.success("Configurações salvas com sucesso!");
  };

  const updateEmpresa = (field: keyof ConfigData["empresa"], value: string) => {
    setConfig((prev) => ({
      ...prev,
      empresa: { ...prev.empresa, [field]: value },
    }));
  };

  const updateNotificacoes = (field: keyof ConfigData["notificacoes"], value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      notificacoes: { ...prev.notificacoes, [field]: value },
    }));
  };

  const updateSistema = (field: keyof ConfigData["sistema"], value: string) => {
    setConfig((prev) => ({
      ...prev,
      sistema: { ...prev.sistema, [field]: value },
    }));
  };

  const updateRelatorios = (field: keyof ConfigData["relatorios"], value: boolean | string) => {
    setConfig((prev) => ({
      ...prev,
      relatorios: { ...prev.relatorios, [field]: value },
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações</h1>
        <p className="text-muted-foreground">Ajuste as preferências do sistema</p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="sistema" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Sistema</span>
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Relatórios</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Informações gerais que aparecerão nos relatórios e documentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Logo da Empresa</Label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
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
                                alt="Logo da empresa" 
                                className="max-h-48 object-contain"
                              />
                            )}
                          </div>
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploading}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Alterar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRemoveLogo}
                              disabled={uploading}
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
                              disabled={uploading}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploading ? "Enviando..." : "Selecionar Logo"}
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
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Esta logo (imagem ou vídeo) será exibida na tela de login e no cabeçalho da aplicação
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Empresa</Label>
                <Input
                  id="nome"
                  value={config.empresa.nome}
                  onChange={(e) => updateEmpresa("nome", e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={config.empresa.cnpj}
                  onChange={(e) => updateEmpresa("cnpj", e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={config.empresa.endereco}
                  onChange={(e) => updateEmpresa("endereco", e.target.value)}
                  placeholder="Rua, número, bairro, cidade - UF"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={config.empresa.telefone}
                    onChange={(e) => updateEmpresa("telefone", e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={config.empresa.email}
                    onChange={(e) => updateEmpresa("email", e.target.value)}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificações</CardTitle>
              <CardDescription>
                Configure como deseja receber notificações do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNovosLaudos">Novos Laudos por E-mail</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações quando novos laudos forem criados
                  </p>
                </div>
                <Switch
                  id="emailNovosLaudos"
                  checked={config.notificacoes.emailNovosLaudos}
                  onCheckedChange={(checked) =>
                    updateNotificacoes("emailNovosLaudos", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailVencimentos">Alertas de Vencimento</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes de laudos próximos ao vencimento
                  </p>
                </div>
                <Switch
                  id="emailVencimentos"
                  checked={config.notificacoes.emailVencimentos}
                  onCheckedChange={(checked) =>
                    updateNotificacoes("emailVencimentos", checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="whatsappNotificacoes">Notificações WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações importantes via WhatsApp
                  </p>
                </div>
                <Switch
                  id="whatsappNotificacoes"
                  checked={config.notificacoes.whatsappNotificacoes}
                  onCheckedChange={(checked) =>
                    updateNotificacoes("whatsappNotificacoes", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sistema">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Preferências gerais de funcionamento da aplicação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="formatoData">Formato de Data</Label>
                <Select
                  value={config.sistema.formatoData}
                  onValueChange={(value) => updateSistema("formatoData", value)}
                >
                  <SelectTrigger id="formatoData">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="itensPerPage">Itens por Página</Label>
                <Select
                  value={config.sistema.itensPerPage}
                  onValueChange={(value) => updateSistema("itensPerPage", value)}
                >
                  <SelectTrigger id="itensPerPage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 itens</SelectItem>
                    <SelectItem value="25">25 itens</SelectItem>
                    <SelectItem value="50">50 itens</SelectItem>
                    <SelectItem value="100">100 itens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Relatórios</CardTitle>
              <CardDescription>
                Personalize a aparência dos relatórios exportados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="incluirLogo">Incluir Logo nos Relatórios</Label>
                  <p className="text-sm text-muted-foreground">
                    Adicione o logo da empresa no cabeçalho dos PDFs
                  </p>
                </div>
                <Switch
                  id="incluirLogo"
                  checked={config.relatorios.incluirLogo}
                  onCheckedChange={(checked) => updateRelatorios("incluirLogo", checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rodape">Texto do Rodapé</Label>
                <Textarea
                  id="rodape"
                  value={config.relatorios.rodape}
                  onChange={(e) => updateRelatorios("rodape", e.target.value)}
                  placeholder="Ex: Este documento é confidencial e de uso exclusivo..."
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  Texto que aparecerá no rodapé de todos os relatórios
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}
