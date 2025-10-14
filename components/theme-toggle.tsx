"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-10 w-10 rounded-full transition-all duration-300 hover:bg-accent/10 hover:scale-105 active:scale-95 group"
    >
      <Sun className="h-4 w-4 text-muted-foreground rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 group-hover:text-foreground" />
      <Moon className="absolute h-4 w-4 text-muted-foreground rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 group-hover:text-foreground" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
