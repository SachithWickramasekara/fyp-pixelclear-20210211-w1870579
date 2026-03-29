import { ImageIcon } from "lucide-react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type ImagePreviewProps = {
  imageUrl?: string | null
  title: string
  className?: string
}

export function ImagePreview({
  imageUrl,
  title,
  className,
}: ImagePreviewProps) {
  return (
    <Card className={cn("overflow-hidden py-0", className)}>
      <div className="border-b border-border/70 px-4 py-3 text-sm font-medium">
        {title}
      </div>
      <div className="relative aspect-[4/3] w-full bg-muted/60">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-5" />
            No image selected
          </div>
        )}
      </div>
    </Card>
  )
}
