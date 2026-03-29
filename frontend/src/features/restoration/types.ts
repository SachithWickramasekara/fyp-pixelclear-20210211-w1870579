export type RestorationTask = "deblurring" | "denoising"

export type RestorationMetrics = {
  psnr_vs_input?: number
  ssim_vs_input?: number
  laplacian_sharpness_change_percent?: number
  mean_abs_pixel_change?: number
  improvement_summary?: string
}

export type TaskOption = {
  id: RestorationTask
  title: string
  description: string
}
