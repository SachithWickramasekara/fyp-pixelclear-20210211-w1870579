import { ImagePlus, UploadCloud } from "lucide-react"
import { useRef, useState } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ActionButton } from "@/features/restoration/components/action-button"
import { cn } from "@/lib/utils"

type ImageUploadProps = {
  onFileSelect: (file: File) => void
  error?: string | null
}

export function ImageUpload({ onFileSelect, error }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files.item(0)
    if (!file) {
      return
    }

    onFileSelect(file)
  }

  return (
    <Card className="border-dashed border-border/80 bg-card/90">
      <CardHeader>
        <CardTitle className="text-lg">Upload Your Image</CardTitle>
        <CardDescription>
          Drag and drop a file or use the picker. Only image files are allowed
          (max 10MB, up to 3840x2160).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed px-5 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border/80 bg-muted/35 hover:border-primary/45"
          )}
        >
          <UploadCloud className="mb-3 size-9 text-muted-foreground" />
          <p className="text-sm font-medium">Drop image here</p>
          <p className="mt-1 text-sm text-muted-foreground">
            or use the file picker
          </p>

          <ActionButton
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="size-4" />
            Choose Image
          </ActionButton>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.item(0)
              if (file) {
                onFileSelect(file)
              }

              event.currentTarget.value = ""
            }}
          />
        </div>

        {error ? (
          <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
