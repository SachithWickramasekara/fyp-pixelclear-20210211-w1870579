import { create } from "zustand"
import { toast } from "sonner"

import type { RestorationMetrics, RestorationTask } from "@/features/restoration/types"
import {
  restorationService,
  validateImageForUpload,
} from "@/features/restoration/services/restoration-service"

function isBlobUrl(url: string | null): url is string {
  return url !== null && url.startsWith("blob:")
}

type RestorationState = {
  uploadedImageUrl: string | null
  uploadedFile: File | null
  uploadedFileName: string | null
  selectedTask: RestorationTask | null
  restoredImageUrl: string | null
  restorationMetrics: RestorationMetrics | null
  progress: number
  processingMessage: string
  isProcessing: boolean
  error: string | null
  setUploadedFile: (file: File) => Promise<boolean>
  setSelectedTask: (task: RestorationTask) => void
  clearError: () => void
  startProcessing: () => Promise<boolean>
  resetSession: () => void
}

const initialState = {
  uploadedImageUrl: null,
  uploadedFile: null,
  uploadedFileName: null,
  selectedTask: null,
  restoredImageUrl: null,
  restorationMetrics: null,
  progress: 0,
  processingMessage: "",
  isProcessing: false,
  error: null,
}

export const useRestorationStore = create<RestorationState>((set, get) => ({
  ...initialState,
  setUploadedFile: async (file) => {
    try {
      await validateImageForUpload(file)
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Invalid file. Please upload an image under 10MB and supported resolution."
      set({ error: msg })
      return false
    }

    const previousImageUrl = get().uploadedImageUrl
    if (isBlobUrl(previousImageUrl)) {
      URL.revokeObjectURL(previousImageUrl)
    }

    const imageUrl = URL.createObjectURL(file)
    set({
      uploadedImageUrl: imageUrl,
      uploadedFile: file,
      uploadedFileName: file.name,
      restoredImageUrl: null,
      restorationMetrics: null,
      selectedTask: null,
      progress: 0,
      processingMessage: "",
      isProcessing: false,
      error: null,
    })

    return true
  },
  setSelectedTask: (task) => {
    set({ selectedTask: task, error: null })
  },
  clearError: () => {
    set({ error: null })
  },
  startProcessing: async () => {
    const { uploadedFile, selectedTask, isProcessing } = get()

    if (isProcessing) {
      return false
    }

    if (!uploadedFile || !selectedTask) {
      set({
        error: "Upload an image and choose a task before starting restoration.",
      })
      return false
    }

    set({
      isProcessing: true,
      error: null,
      progress: 12,
      processingMessage: "Processing image...",
    })
    try {
      const result = await restorationService.restoreImage({
        imageFile: uploadedFile,
        task: selectedTask,
        onProgress: (update) => {
          set({
            progress: update.progress,
            processingMessage: update.message,
          })
        },
      })

      const rawMetrics = result.metrics
      const restorationMetrics: RestorationMetrics | null =
        rawMetrics && typeof rawMetrics === "object"
          ? {
              psnr_vs_input:
                typeof rawMetrics.psnr_vs_input === "number"
                  ? rawMetrics.psnr_vs_input
                  : undefined,
              ssim_vs_input:
                typeof rawMetrics.ssim_vs_input === "number"
                  ? rawMetrics.ssim_vs_input
                  : undefined,
              laplacian_sharpness_change_percent:
                typeof rawMetrics.laplacian_sharpness_change_percent === "number"
                  ? rawMetrics.laplacian_sharpness_change_percent
                  : undefined,
              mean_abs_pixel_change:
                typeof rawMetrics.mean_abs_pixel_change === "number"
                  ? rawMetrics.mean_abs_pixel_change
                  : undefined,
              improvement_summary:
                typeof rawMetrics.improvement_summary === "string"
                  ? rawMetrics.improvement_summary
                  : undefined,
            }
          : null

      set({
        restoredImageUrl: result.restoredImageUrl,
        restorationMetrics,
        isProcessing: false,
      })

      toast.success("Image restoration completed.", {
        id: "restoration-success",
      })

      return true
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Restoration failed. Please try again."
      set({
        error: msg,
        isProcessing: false,
        progress: 0,
        processingMessage: "",
      })
      return false
    }
  },
  resetSession: () => {
    const { uploadedImageUrl, restoredImageUrl } = get()

    if (isBlobUrl(uploadedImageUrl)) {
      URL.revokeObjectURL(uploadedImageUrl)
    }
    if (isBlobUrl(restoredImageUrl)) {
      URL.revokeObjectURL(restoredImageUrl)
    }

    set(initialState)
  },
}))
