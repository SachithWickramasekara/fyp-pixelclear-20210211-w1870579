import { createBrowserRouter } from "react-router-dom"

import { AppLayout } from "@/components/layout/app-layout"
import { LandingPage } from "@/features/landing/pages/landing-page"
import { NotFoundPage } from "@/features/restoration/pages/not-found-page"
import { ProcessingPage } from "@/features/restoration/pages/processing-page"
import { ResultPage } from "@/features/restoration/pages/result-page"
import { TaskSelectionPage } from "@/features/restoration/pages/task-selection-page"
import { UploadPage } from "@/features/restoration/pages/upload-page"

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "upload",
        element: <UploadPage />,
      },
      {
        path: "task",
        element: <TaskSelectionPage />,
      },
      {
        path: "processing",
        element: <ProcessingPage />,
      },
      {
        path: "result",
        element: <ResultPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
])
