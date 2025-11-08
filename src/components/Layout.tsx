import { Link, useLocation, useNavigate } from "react-router-dom";
import { ClipboardList, BarChart3, Users, Settings, MessageCircle, LayoutDashboard, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ThemeToggle from "./ThemeToggle";
import { InstallButton } from "./InstallButton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
const navItems = [{
  path: "/",
  label: "Vistorias",
  icon: ClipboardList
}, {
  path: "/analises",
  label: "Análises",
  icon: BarChart3
}, {
  path: "/dashboard",
  label: "Gerenciamento",
  icon: LayoutDashboard
}, {
  path: "/cadastros",
  label: "Cadastros",
  icon: Users
}, {
  path: "/configuracoes",
  label: "Configurações",
  icon: Settings
}];
export default function Layout({
  children
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  useEffect(() => {
    fetchLogo();
    
    // Listen for logo updates
    const handleLogoUpdate = () => {
      fetchLogo();
    };
    
    window.addEventListener('logo-updated', handleLogoUpdate);
    return () => window.removeEventListener('logo-updated', handleLogoUpdate);
  }, []);
  const fetchLogo = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const {
        data
      } = await supabase.from("system_settings").select("logo_url").eq("user_id", user.id).maybeSingle();
      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
    }
  };
  const handleLogout = async () => {
    const {
      error
    } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Logout realizado com sucesso");
      navigate("/auth");
    }
  };

  // Open WhatsApp without relying on api.whatsapp.com and provide a desktop fallback
  const handleWhatsAppClick = (e: any) => {
    e.preventDefault();
    const phone = "5511994001179";
    const appUrl = `whatsapp://send?phone=${phone}`;
    const webUrl = `https://web.whatsapp.com/send?phone=${phone}`;
    const newWin = window.open(appUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => {
      try {
        if (!newWin || newWin.closed) {
          window.open(webUrl, "_blank", "noopener,noreferrer");
        }
      } catch {
        window.open(webUrl, "_blank", "noopener,noreferrer");
      }
    }, 400);
  };
  return <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-gradient-primary text-primary-foreground shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                logoUrl.includes('.mp4') || logoUrl.includes('.webm') || logoUrl.includes('.mov') ? (
                  <video 
                    src={logoUrl} 
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-10 md:h-14 w-auto object-contain"
                  />
                ) : (
                  <img src={logoUrl} alt="Logo" className="h-10 md:h-14 w-auto object-contain" />
                )
              ) : (
                <ClipboardList className="h-5 w-5 md:h-6 md:w-6" />
              )}
              <span className="text-lg md:text-xl font-bold">CheckLaudo</span>
            </div>
            
            {/* Desktop Navigation */}
            {!isMobile && <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return <Link key={item.path} to={item.path} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200", isActive ? "bg-white/20 shadow-md" : "hover:bg-white/10")}>
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>;
              })}
                </div>
                <InstallButton />
                <Button asChild variant="ghost" className="hover:bg-white/10 flex flex-col h-auto py-2 px-3 gap-1">
                  <a href="https://web.whatsapp.com/send?phone=5511994001179" target="_blank" rel="noopener noreferrer" aria-label="Suporte WhatsApp" onClick={handleWhatsAppClick}>
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-xs">Suporte</span>
                  </a>
                </Button>
                <Button variant="ghost" onClick={handleLogout} className="hover:bg-white/10 flex flex-col h-auto py-2 px-3 gap-1">
                  <LogOut className="h-5 w-5" />
                  <span className="text-xs">Sair</span>
                </Button>
                <ThemeToggle />
              </div>}

            {/* Mobile Navigation */}
            {isMobile && <div className="flex items-center gap-2">
                <InstallButton />
                <ThemeToggle />
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-white/10">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                    <SheetHeader>
                      <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-4 mt-6">
                      {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-lg", isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted")}>
                          <Icon className="h-6 w-6" />
                          <span className="font-medium">{item.label}</span>
                        </Link>;
                  })}
                      
                      <div className="border-t pt-4 mt-2 space-y-3">
                        <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
                          <a href="https://web.whatsapp.com/send?phone=5511994001179" target="_blank" rel="noopener noreferrer" onClick={handleWhatsAppClick}>
                            <MessageCircle className="h-5 w-5" />
                            <span>Suporte</span>
                          </a>
                        </Button>
                        <Button variant="outline" onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }} className="w-full justify-start gap-3 h-12">
                          <LogOut className="h-5 w-5" />
                          <span>Sair</span>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>}
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {children}
      </main>
    </div>;
}