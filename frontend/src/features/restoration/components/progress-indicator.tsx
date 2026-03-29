import { LoaderCircle } from "lucide-react"

import { Progress } from "@/components/ui/progress"

type ProgressIndicatorProps = {
  progress: number
  message: string
}

export function ProgressIndicator({
  progress,
  message,
}: ProgressIndicatorProps) {
  return (
    <div className="space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        <LoaderCircle className="size-3.5 animate-spin" />
        Restoring Image
      </div>
      <p className="text-base font-medium">{message}</p>
      <div className="space-y-2">
        <Progress value={progress} />
        <p className="text-right text-xs text-muted-foreground">{progress}%</p>
      </div>
    </div>
  )
}
