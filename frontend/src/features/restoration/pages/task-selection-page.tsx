import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { taskOptions } from "@/features/restoration/constants"
import { ActionButton } from "@/features/restoration/components/action-button"
import { ImagePreview } from "@/features/restoration/components/image-preview"
import { MissingImageFallback } from "@/features/restoration/components/missing-image-fallback"
import { TaskCard } from "@/features/restoration/components/task-card"
import { useRestorationStore } from "@/features/restoration/store/use-restoration-store"

export function TaskSelectionPage() {
  const navigate = useNavigate()
  const uploadedImageUrl = useRestorationStore(
    (state) => state.uploadedImageUrl
  )
  const selectedTask = useRestorationStore((state) => state.selectedTask)
  const setSelectedTask = useRestorationStore((state) => state.setSelectedTask)

  if (!uploadedImageUrl) {
    return <MissingImageFallback />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]"
    >
      <ImagePreview imageUrl={uploadedImageUrl} title="Uploaded Image" />

      <Card className="gap-5">
        <CardHeader>
          <CardTitle>Select Restoration Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {taskOptions.map((option) => (
              <TaskCard
                key={option.id}
                option={option}
                selected={selectedTask === option.id}
                onSelect={setSelectedTask}
              />
            ))}
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <ActionButton
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/upload")}
            >
              Back
            </ActionButton>
            <ActionButton
              type="button"
              className="flex-1"
              disabled={!selectedTask}
              onClick={() => navigate("/processing")}
            >
              Restore
            </ActionButton>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
