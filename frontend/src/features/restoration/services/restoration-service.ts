import type { RestorationTask } from "@/features/restoration/types"

export type RestorationProgress = {
  progress: number
  message: string
}

export type RestoreImageParams = {
  imageFile: File
  task: RestorationTask
  onProgress?: (update: RestorationProgress) => void
}

export type RestoreImageResult = {
  restoredImageUrl: string
  task: RestorationTask
  completedAt: string
  metrics?: Record<string, unknown>
}

export interface RestorationService {
  restoreImage: (params: RestoreImageParams) => Promise<RestoreImageResult>
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const MAX_UPLOAD_WIDTH = 3840
export const MAX_UPLOAD_HEIGHT = 2160
export const MAX_UPLOAD_MEGAPIXELS = 8

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString().trim() ||
  "http://localhost:5000"

const endpointByTask: Record<RestorationTask, string> = {
  deblurring: "/api/restore/deblur",
  denoising: "/api/restore/denoise",
}

type BackendSuccessResponse = {
  success: true
  outputUrl: string
  metrics?: Record<string, unknown>
}

function buildApiUrl(baseUrl: string, endpoint: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`
  return `${normalizedBase}${normalizedEndpoint}`
}

export function validateImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.")
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File size must be 10MB or less.")
  }
}

async function getImageDimensions(file: File) {
  const imageUrl = URL.createObjectURL(file)

  try {
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const image = new Image()

        image.onload = () => {
          resolve({ width: image.naturalWidth, height: image.naturalHeight })
        }

        image.onerror = () => {
          reject(new Error("Could not read image dimensions."))
        }

        image.src = imageUrl
      }
    )

    return dimensions
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

export async function validateImageForUpload(file: File) {
  validateImageFile(file)

  const { width, height } = await getImageDimensions(file)
  const megapixels = (width * height) / 1_000_000

  if (width > MAX_UPLOAD_WIDTH || height > MAX_UPLOAD_HEIGHT) {
    throw new Error(
      `Image resolution must be ${MAX_UPLOAD_WIDTH}x${MAX_UPLOAD_HEIGHT} or smaller.`
    )
  }

  if (megapixels > MAX_UPLOAD_MEGAPIXELS) {
    throw new Error(
      `Image must be ${MAX_UPLOAD_MEGAPIXELS}MP or lower to keep processing fast.`
    )
  }
}

function requireBackendSuccess(
  data: unknown
): asserts data is BackendSuccessResponse {
  if (
    typeof data !== "object" ||
    data === null ||
    !("success" in data) ||
    (data as { success?: unknown }).success !== true
  ) {
    throw new Error("Restoration failed")
  }

  if (
    !("outputUrl" in data) ||
    typeof (data as { outputUrl?: unknown }).outputUrl !== "string"
  ) {
    throw new Error("Backend response missing outputUrl")
  }
}

export const restorationService: RestorationService = {
  async restoreImage({ imageFile, task, onProgress }) {
    await validateImageForUpload(imageFile)

    const endpoint = endpointByTask[task]
    const url = buildApiUrl(API_BASE_URL, endpoint)
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 60_000)

    onProgress?.({ progress: 12, message: "Processing image..." })

    const form = new FormData()
    form.append("image", imageFile)

    onProgress?.({
      progress: 48,
      message:
        task === "deblurring"
          ? "Applying deblurring model..."
          : "Applying denoising model...",
    })

    let res: Response
    try {
      res = await fetch(url, {
        method: "POST",
        body: form,
        signal: controller.signal,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.")
      }

      throw new Error("Unable to reach restoration service.")
    } finally {
      window.clearTimeout(timeoutId)
    }

    let data: unknown = null
    try {
      data = await res.json()
    } catch {
      data = null
    }

    if (!res.ok) {
      const msg =
        typeof (data as { message?: unknown } | null)?.message === "string"
          ? ((data as { message: string }).message as string)
          : `Backend request failed (${res.status})`
      throw new Error(msg)
    }

    requireBackendSuccess(data)

    onProgress?.({ progress: 100, message: "Finalizing output..." })

    return {
      restoredImageUrl: data.outputUrl,
      task,
      completedAt: new Date().toISOString(),
      metrics: data.metrics,
    }
  },
}
