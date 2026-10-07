import { Outlet, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout() {
  const location = useLocation()

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background font-sans antialiased">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-sm font-medium"
      >
        Chuyển đến nội dung chính / Skip to main content
      </a>

      <Header />
      
      <main 
        id="main-content"
        tabIndex="-1"
        className="flex-1 overflow-y-auto flex flex-col w-full focus:outline-none"
      >
        <div className="min-h-[calc(100vh-3.5rem)] flex flex-col transition-all duration-300">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
          <Footer />
        </div>
      </main>

      <Toaster position="bottom-right" />
    </div>
  )
}
