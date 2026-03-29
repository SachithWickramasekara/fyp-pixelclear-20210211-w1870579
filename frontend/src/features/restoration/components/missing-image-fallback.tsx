import { ImageOff } from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ActionButton } from "@/features/restoration/components/action-button"

type MissingImageFallbackProps = {
  message?: string
}

export function MissingImageFallback({
  message = "No image selected yet. Upload a file to continue.",
}: MissingImageFallbackProps) {
  const navigate = useNavigate()

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageOff className="size-5" />
          Image Required
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent>
        <ActionButton type="button" onClick={() => navigate("/upload")}>
          Go to Upload
        </ActionButton>
      </CardContent>
    </Card>
  )
}
