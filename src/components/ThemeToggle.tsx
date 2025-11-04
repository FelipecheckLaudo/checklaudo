import { Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("blue");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="hover:bg-white/10"
    >
      {theme === "light" && <Sun className="h-5 w-5 transition-all" />}
      {theme === "dark" && <Moon className="h-5 w-5 transition-all" />}
      {theme === "blue" && <Palette className="h-5 w-5 transition-all" />}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
