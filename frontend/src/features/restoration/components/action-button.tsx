import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ActionButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean
}

export function ActionButton({
  children,
  className,
  loading = false,
  disabled,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      className={cn("min-w-32", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
      {children}
    </Button>
  )
}
