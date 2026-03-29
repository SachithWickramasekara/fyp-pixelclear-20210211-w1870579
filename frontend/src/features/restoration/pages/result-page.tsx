import { motion } from "framer-motion"
import { Download, RotateCcw } from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { taskOptions } from "@/features/restoration/constants"
import { ActionButton } from "@/features/restoration/components/action-button"
import { ImagePreview } from "@/features/restoration/components/image-preview"
import { RestorationMetricsPanel } from "@/features/restoration/components/restoration-metrics-panel"
import { MissingImageFallback } from "@/features/restoration/components/missing-image-fallback"
import { useRestorationStore } from "@/features/restoration/store/use-restoration-store"

export function ResultPage() {
  const navigate = useNavigate()

  const uploadedImageUrl = useRestorationStore(
    (state) => state.uploadedImageUrl
  )
  const uploadedFileName = useRestorationStore(
    (state) => state.uploadedFileName
  )
  const restoredImageUrl = useRestorationStore(
    (state) => state.restoredImageUrl
  )
  const selectedTask = useRestorationStore((state) => state.selectedTask)
  const restorationMetrics = useRestorationStore(
    (state) => state.restorationMetrics
  )
  const resetSession = useRestorationStore((state) => state.resetSession)

  if (!uploadedImageUrl || !restoredImageUrl || !selectedTask) {
    return (
      <MissingImageFallback message="No restoration result found. Start from upload." />
    )
  }

  const selectedTaskLabel =
    taskOptions.find((option) => option.id === selectedTask)?.title ?? "Unknown"

  const handleDownload = () => {
    let ext = ".png"
    try {
      const pathname = new URL(restoredImageUrl).pathname
      const m = pathname.match(/\.([a-z0-9]+)$/i)
      if (m) ext = `.${m[1].toLowerCase()}`
    } catch {
      /* keep .png */
    }
    const base =
      uploadedFileName?.replace(/\.[^.]+$/i, "").trim() || "image"
    const filename = `pixelclear-restored-${base}${ext}`

    void fetch(restoredImageUrl)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed")
        return res.blob()
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob)
        window.open(objectUrl, "_blank", "noopener,noreferrer")

        const anchor = document.createElement("a")
        anchor.href = objectUrl
        anchor.download = filename
        anchor.rel = "noopener"
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()

        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 120_000)
      })
      .catch(() => {
        window.open(restoredImageUrl, "_blank", "noopener,noreferrer")
      })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-6xl space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Restoration Complete</CardTitle>
          <CardDescription>
            Task applied:{" "}
            <span className="font-medium">{selectedTaskLabel}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <ImagePreview imageUrl={uploadedImageUrl} title="Original" />
            <ImagePreview imageUrl={restoredImageUrl} title="Restored" />
          </div>

          <RestorationMetricsPanel metrics={restorationMetrics} task={selectedTask} />

          <div className="flex flex-col gap-3 sm:flex-row">
            <ActionButton
              type="button"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="size-4" />
              Download Image
            </ActionButton>
            <ActionButton
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                resetSession()
                navigate("/upload")
              }}
            >
              <RotateCcw className="size-4" />
              Restore Another Image
            </ActionButton>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
