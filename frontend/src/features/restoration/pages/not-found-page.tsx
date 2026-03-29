import { useNavigate } from "react-router-dom"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ActionButton } from "@/features/restoration/components/action-button"

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The page you requested does not exist in this demo app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActionButton type="button" onClick={() => navigate("/")}>
            Back to Home
          </ActionButton>
        </CardContent>
      </Card>
    </div>
  )
}
