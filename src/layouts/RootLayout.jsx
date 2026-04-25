import { Outlet, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import AIChat from "@/components/AIChat"
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <AIChat />
      <Toaster position="bottom-right" />
    </div>
  )
}
