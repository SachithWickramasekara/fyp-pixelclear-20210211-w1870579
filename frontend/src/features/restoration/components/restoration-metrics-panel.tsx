import { Activity } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { RestorationMetrics, RestorationTask } from "@/features/restoration/types"

type RestorationMetricsPanelProps = {
  metrics: RestorationMetrics | null
  task: RestorationTask
}

function MetricTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/25 px-4 py-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function RestorationMetricsPanel({
  metrics,
  task,
}: RestorationMetricsPanelProps) {
  const hasNumeric =
    metrics &&
    (metrics.psnr_vs_input != null ||
      metrics.ssim_vs_input != null ||
      metrics.laplacian_sharpness_change_percent != null ||
      metrics.mean_abs_pixel_change != null)

  const hasSummary = Boolean(metrics?.improvement_summary?.trim())

  if (!metrics || (!hasNumeric && !hasSummary)) {
    return (
      <Card className="border-dashed border-border/80 bg-muted/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="size-5 text-primary" />
            Restoration metrics
          </CardTitle>
          <CardDescription>
            No metrics were returned for this run. The restored image is still shown above.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const third =
    task === "deblurring" &&
    metrics.laplacian_sharpness_change_percent != null ? (
      <MetricTile
        label="Sharpness change"
        value={`${metrics.laplacian_sharpness_change_percent >= 0 ? "+" : ""}${metrics.laplacian_sharpness_change_percent.toFixed(1)}%`}
        hint=""
      />
    ) : metrics.mean_abs_pixel_change != null ? (
      <MetricTile
        label="Mean pixel change"
        value={metrics.mean_abs_pixel_change.toFixed(4)}
      />
    ) : (
      <MetricTile
        label="Task"
        value={task === "deblurring" ? "Deblur" : "Denoise"}
        hint=""
      />
    )

  return (
    <Card className="overflow-hidden border-border/70">
      <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="size-5 text-primary" />
          Restoration metrics
        </CardTitle>
        <CardDescription className="text-pretty">
          PSNR and SSIM compare the restored output to the model input.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {hasNumeric ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {metrics.psnr_vs_input != null ? (
              <MetricTile
                label="PSNR vs input"
                value={`${metrics.psnr_vs_input.toFixed(2)} dB`}
                hint=""
              />
            ) : null}
            {metrics.ssim_vs_input != null ? (
              <MetricTile
                label="SSIM vs input"
                value={metrics.ssim_vs_input.toFixed(4)}
                hint=""
              />
            ) : null}
            {third}
          </div>
        ) : null}

        {hasSummary ? (
          <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Summary
            </p>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              {metrics.improvement_summary}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
