import { Check, ChevronRight } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useRestorationStore } from "@/features/restoration/store/use-restoration-store"
import { cn } from "@/lib/utils"

const steps = [
  { label: "Upload", path: "/upload" },
  { label: "Task", path: "/task" },
  { label: "Process", path: "/processing" },
  { label: "Result", path: "/result" },
]

export function RestorationSteps() {
  const location = useLocation()
  const navigate = useNavigate()
  const isProcessing = useRestorationStore((state) => state.isProcessing)
  const restoredImageUrl = useRestorationStore((state) => state.restoredImageUrl)

  const isResultLocked = location.pathname === "/result" && Boolean(restoredImageUrl)

  if (location.pathname === "/") {
    return null
  }

  const activeIndex = steps.findIndex((step) => step.path === location.pathname)

  return (
    <section className="mt-3 w-fit rounded-2xl border border-border/70 bg-background/70 px-3 py-2 shadow-sm backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
        {steps.map((step, index) => {
          const isActive = index === activeIndex
          const isDone = activeIndex > index

          return (
            <div key={step.path} className="flex items-center gap-1 sm:gap-2">
              <Button
                type="button"
                size="sm"
                variant={isActive ? "default" : "ghost"}
                disabled={isProcessing || (isResultLocked && step.path !== "/upload")}
                onClick={() => {
                  if (isProcessing) return
                  if (isResultLocked && step.path !== "/upload") return
                  navigate(step.path)
                }}
                className={cn(
                  "h-8 rounded-full px-3",
                  !isActive && "text-muted-foreground",
                  isDone && "text-foreground"
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-5 items-center justify-center rounded-full border text-[10px]",
                    isActive
                      ? "border-primary-foreground/40 bg-primary-foreground/15"
                      : isDone
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-muted"
                  )}
                >
                  {isDone ? <Check className="size-3" /> : index + 1}
                </span>
                {step.label}
              </Button>
              {index < steps.length - 1 ? (
                <ChevronRight className="size-3.5 text-muted-foreground" />
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
