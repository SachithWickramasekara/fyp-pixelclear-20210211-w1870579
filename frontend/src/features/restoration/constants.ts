import type { TaskOption } from "@/features/restoration/types"

export const taskOptions: TaskOption[] = [
  {
    id: "deblurring",
    title: "Deblurring",
    description:
      "Recover sharp edges and restore details softened by camera shake.",
  },
  {
    id: "denoising",
    title: "Denoising",
    description:
      "Reduce grain and compression artifacts while preserving texture.",
  },
]
