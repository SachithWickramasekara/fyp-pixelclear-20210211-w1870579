import { AnimatePresence, motion } from "framer-motion"
import { Outlet, useLocation } from "react-router-dom"

import { RestorationSteps } from "@/components/layout/restoration-steps"
import { Navbar } from "./navbar"

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_5%_10%,rgba(255,176,111,0.18),transparent_35%),radial-gradient(circle_at_95%_15%,rgba(64,147,196,0.16),transparent_30%),linear-gradient(150deg,#faf7f2,#f4f1eb_45%,#ece8df)] text-foreground dark:bg-[radial-gradient(circle_at_8%_12%,rgba(244,162,97,0.15),transparent_34%),radial-gradient(circle_at_92%_8%,rgba(86,149,202,0.16),transparent_30%),linear-gradient(155deg,#121418,#171b21_52%,#111316)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:28px_28px] dark:bg-[linear-gradient(rgba(248,250,252,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(248,250,252,0.06)_1px,transparent_1px)]" />
      <div className="relative mx-auto flex min-h-svh w-full max-w-7xl flex-col px-4 pb-10 sm:px-6 lg:px-8">
        <Navbar />
        <RestorationSteps />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex-1 py-6 sm:py-10"
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}
