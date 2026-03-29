import { motion } from "framer-motion"
import {
  ArrowRight,
  Layers3,
  ListOrdered,
  ScanLine,
  WandSparkles,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ActionButton } from "@/features/restoration/components/action-button"

const workflowSteps = [
  "Upload an image from your device.",
  "Select a task: deblurring or denoising.",
  "Compare the original and restored results side by side.",
  "Download the output when you are happy with it.",
]

const heroStats = [
  { label: "Models", value: "2", icon: Layers3 },
  { label: "Primary Tasks", value: "Deblur + Denoise", icon: ScanLine },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="space-y-6"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs tracking-wide text-muted-foreground uppercase">
            <WandSparkles className="size-3.5" />
            Image Restoration
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            PixelClear
            <span className="mt-2 block bg-[linear-gradient(90deg,#d97706,#0ea5e9)] bg-clip-text text-2xl text-transparent sm:text-3xl">
              Lightweight Image Restoration
            </span>
          </h1>

          <p className="max-w-2xl text-base text-pretty text-foreground/80 sm:text-lg dark:text-foreground/90">
            PixelClear is a lightweight image restoration system designed to
            improve degraded images affected by blur and noise. It uses two
            specialized deep learning models to restore clarity while preserving
            key visual details such as edges and textures.
          </p>

          <p className="max-w-2xl text-sm text-pretty text-foreground/75 sm:text-base dark:text-foreground/85">
            Built with efficiency in mind, the framework is suitable for
            resource-limited devices. By combining deep learning with a modular
            design, PixelClear offers a practical and user-friendly way to
            enhance image quality in everyday applications.
          </p>

          <div className="w-full max-w-xl">
            <ActionButton
              type="button"
              size="lg"
              className="h-11 w-full"
              onClick={() => navigate("/upload")}
            >
              Start Restoration
              <ArrowRight className="size-4" />
            </ActionButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-border/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.9),rgba(255,255,255,0.78))] dark:bg-[linear-gradient(160deg,rgba(22,27,34,0.9),rgba(17,22,30,0.88))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListOrdered className="size-4 text-primary" />
                How it works
              </CardTitle>
              <CardDescription className="text-foreground/70 dark:text-foreground/80">
                A short path from upload to restored image.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {workflowSteps.map((step, index) => (
                  <motion.li
                    key={step}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.08 + index * 0.06 }}
                    className="flex gap-3 text-sm leading-relaxed text-foreground/90"
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary tabular-nums">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {heroStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 * index }}
          >
            <Card className="gap-3 border-border/70 py-4">
              <CardContent className="flex items-center gap-3 px-4">
                <span className="rounded-md bg-primary/10 p-2 text-primary">
                  <stat.icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-sm font-semibold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>
    </div>
  )
}
