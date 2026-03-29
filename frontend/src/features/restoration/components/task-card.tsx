import { Sparkles } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { TaskOption } from "@/features/restoration/types"
import { cn } from "@/lib/utils"

type TaskCardProps = {
  option: TaskOption
  selected: boolean
  onSelect: (id: TaskOption["id"]) => void
}

export function TaskCard({ option, selected, onSelect }: TaskCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      className="text-left"
      aria-pressed={selected}
    >
      <Card
        className={cn(
          "h-full cursor-pointer gap-3 border transition-all duration-200 hover:-translate-y-1",
          selected
            ? "border-primary bg-primary/5 shadow-md"
            : "border-border/80 bg-card/90 hover:border-primary/40"
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            {option.title}
            <Sparkles
              className={cn(
                "size-4 text-muted-foreground transition-colors",
                selected && "text-primary"
              )}
            />
          </CardTitle>
          <CardDescription>{option.description}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {selected ? "Selected for restoration" : "Click to select this task"}
        </CardContent>
      </Card>
    </button>
  )
}
