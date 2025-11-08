import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed on iOS
    const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;
    
    if (isIos && isInStandaloneMode) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Check if iOS
      const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
      
      if (isIos) {
        toast({
          title: "Instalar no iOS",
          description: "Toque no botão Compartilhar e depois em 'Adicionar à Tela de Início'",
          duration: 5000,
        });
      } else {
        toast({
          title: "Instalação não disponível",
          description: "Este dispositivo não suporta instalação ou o app já está instalado.",
          duration: 3000,
        });
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      toast({
        title: "App instalado!",
        description: "O Checklaudo foi adicionado ao seu dispositivo.",
      });
    }

    setDeferredPrompt(null);
  };

  // Don't show button if already installed
  if (isInstalled) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        disabled
      >
        <Check className="h-4 w-4" />
        <span className="hidden md:inline">Instalado</span>
      </Button>
    );
  }

  // Show button if prompt is available OR if it's iOS (for manual instructions)
  const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
  if (!deferredPrompt && !isIos) {
    return null;
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleInstallClick}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      <span className="hidden md:inline">Instalar App</span>
    </Button>
  );
}
