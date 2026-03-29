import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

import { Card, CardContent } from "@/components/ui/card"
import { ActionButton } from "@/features/restoration/components/action-button"
import { ImagePreview } from "@/features/restoration/components/image-preview"
import { ImageUpload } from "@/features/restoration/components/image-upload"
import { useRestorationStore } from "@/features/restoration/store/use-restoration-store"

export function UploadPage() {
  const navigate = useNavigate()
  const uploadedImageUrl = useRestorationStore(
    (state) => state.uploadedImageUrl
  )
  const error = useRestorationStore((state) => state.error)
  const setUploadedFile = useRestorationStore((state) => state.setUploadedFile)
  const clearError = useRestorationStore((state) => state.clearError)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-2"
    >
      <ImageUpload
        error={error}
        onFileSelect={(file) => {
          clearError()
          void setUploadedFile(file)
        }}
      />

      <Card>
        <CardContent className="space-y-4 px-6">
          <ImagePreview imageUrl={uploadedImageUrl} title="Image Preview" />
          <p className="text-sm text-muted-foreground">
            Supported: image files up to 10MB
          </p>
          <ActionButton
            type="button"
            className="w-full"
            disabled={!uploadedImageUrl}
            onClick={() => navigate("/task")}
          >
            Continue
          </ActionButton>
        </CardContent>
      </Card>
    </motion.div>
  )
}
