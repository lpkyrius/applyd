"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 dark:border-slate-700" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 dark:border-slate-700 overflow-hidden hover:scale-105 transition-all text-slate-400 hover:text-slate-900 dark:text-slate-100 dark:hover:text-slate-100 hover:shadow-sm shrink-0"
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  )
}
