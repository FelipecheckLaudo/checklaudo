import { Link, useLocation } from "react-router-dom";
import { ClipboardList, BarChart3, Users, Settings, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { Button } from "@/components/ui/button";
const navItems = [{
  path: "/",
  label: "Vistorias",
  icon: ClipboardList
}, {
  path: "/analises",
  label: "Análises",
  icon: BarChart3
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
      <header className="bg-gradient-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              <span className="text-xl font-bold">Checklaudo</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return <Link key={item.path} to={item.path} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200", isActive ? "bg-white/20 shadow-md" : "hover:bg-white/10")}>
                      <Icon className="h-5 w-5" />
                      <span className="hidden md:inline font-medium">{item.label}</span>
                    </Link>;
              })}
              </div>
              <Button
                asChild
                variant="ghost"
                className="hover:bg-white/10 flex flex-col h-auto py-2 px-3 gap-1"
              >
                <a 
                  href="https://web.whatsapp.com/send?phone=5511994001179" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Suporte WhatsApp"
                  onClick={handleWhatsAppClick}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-xs">Suporte</span>
                </a>
              </Button>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 rounded-sm">
        {children}
      </main>
    </div>;
}