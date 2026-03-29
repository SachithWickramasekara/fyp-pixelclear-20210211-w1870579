import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ActionButton } from "@/features/restoration/components/action-button"
import { MissingImageFallback } from "@/features/restoration/components/missing-image-fallback"
import { ProgressIndicator } from "@/features/restoration/components/progress-indicator"
import { useRestorationStore } from "@/features/restoration/store/use-restoration-store"

export function ProcessingPage() {
  const navigate = useNavigate()
  const hasStartedRef = useRef(false)

  const uploadedImageUrl = useRestorationStore(
    (state) => state.uploadedImageUrl
  )
  const selectedTask = useRestorationStore((state) => state.selectedTask)
  const progress = useRestorationStore((state) => state.progress)
  const processingMessage = useRestorationStore(
    (state) => state.processingMessage
  )
  const error = useRestorationStore((state) => state.error)
  const isProcessing = useRestorationStore((state) => state.isProcessing)
  const clearError = useRestorationStore((state) => state.clearError)
  const startProcessing = useRestorationStore((state) => state.startProcessing)

  useEffect(() => {
    if (!uploadedImageUrl || !selectedTask) {
      return
    }
    if (hasStartedRef.current) {
      return
    }

    hasStartedRef.current = true

    void startProcessing().then((success) => {
      if (success) {
        navigate("/result")
      }
    })
  }, [navigate, selectedTask, startProcessing, uploadedImageUrl])

  if (!uploadedImageUrl || !selectedTask) {
    return (
      <MissingImageFallback message="Upload and select a task before processing." />
    )
  }

  if (error && !isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto w-full max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="size-5 text-destructive" aria-hidden />
              Restoration couldn&apos;t run
            </CardTitle>
            <CardDescription className="text-foreground/90">{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <ActionButton
              type="button"
              variant="default"
              onClick={() => {
                clearError()
                navigate("/upload")
              }}
            >
              Upload a different image
            </ActionButton>
            <ActionButton
              type="button"
              variant="outline"
              onClick={() => {
                clearError()
                navigate("/task")
              }}
            >
              Back to task
            </ActionButton>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto w-full max-w-2xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Restoration In Progress</CardTitle>
          <CardDescription>
            Please wait while PixelClear runs the restoration pipeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressIndicator progress={progress} message={processingMessage} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
