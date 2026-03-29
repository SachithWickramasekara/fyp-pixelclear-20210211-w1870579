import { useEffect, useState } from "react"
import { Aperture, Moon, Sparkles, Sun } from "lucide-react"
import { Link } from "react-router-dom"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { useRestorationStore } from "@/features/restoration/store/use-restoration-store"

export function Navbar() {
  const isProcessing = useRestorationStore((state) => state.isProcessing)
  const { theme, setTheme } = useTheme()
  const [isSystemDark, setIsSystemDark] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = (event: MediaQueryListEvent) => {
      setIsSystemDark(event.matches)
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  const isDarkMode = theme === "dark" || (theme === "system" && isSystemDark)

  return (
    <header className="sticky top-3 z-30 mt-3 rounded-2xl border border-border/70 bg-background/80 p-3 shadow-sm backdrop-blur-xl sm:top-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold tracking-wide text-foreground"
          aria-label="Go to PixelClear home"
        >
          <span className="rounded-md bg-primary p-1 text-primary-foreground">
            <Aperture className="size-4" />
          </span>
          PixelClear
        </Link>

        <div className="inline-flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
            aria-label={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            className="h-8"
          >
            {isDarkMode ? (
              <Sun className="size-3.5" />
            ) : (
              <Moon className="size-3.5" />
            )}
          </Button>

          <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="size-3.5" />
            {isProcessing
              ? "Navigation locked during processing"
              : ""}
          </div>
        </div>
      </div>
    </header>
  )
}
