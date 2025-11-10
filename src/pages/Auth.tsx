import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { InstallButton } from "@/components/InstallButton";
import ThemeToggle from "@/components/ThemeToggle";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    // Fetch logo for any user (public access)
    fetchLogo();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchLogo = async () => {
    try {
      const { data } = await supabase
        .from("system_settings")
        .select("logo_url")
        .limit(1)
        .maybeSingle();

      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
      }
    } catch {
      // Ignore logo errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(error.message || "Email ou senha incorretos");
          return;
        }
        toast.success("Login realizado!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` }
        });
        if (error) {
          toast.error(error.message || "Erro ao criar conta");
          return;
        }
        toast.success("Conta criada!");
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Header with Install and Theme buttons */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3 flex justify-end items-center gap-2">
          <InstallButton />
          <ThemeToggle />
        </div>
      </div>

      <Card className="w-full max-w-md mt-16">
        <CardHeader className="text-center space-y-4">
          {logoUrl && (
            <div className="flex justify-center">
              {logoUrl.includes('.mp4') || logoUrl.includes('.webm') || logoUrl.includes('.mov') ? (
                <video 
                  src={logoUrl} 
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-20 w-auto object-contain"
                />
              ) : (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-20 w-auto object-contain"
                />
              )}
            </div>
          )}
          <CardTitle>{isLogin ? "Login" : "Criar Conta"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Entre com suas credenciais para acessar o sistema"
              : "Crie uma conta para começar a usar o sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : isLogin ? (
                "Entrar"
              ) : (
                "Criar Conta"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
              disabled={loading}
            >
              {isLogin
                ? "Não tem uma conta? Criar conta"
                : "Já tem uma conta? Fazer login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
