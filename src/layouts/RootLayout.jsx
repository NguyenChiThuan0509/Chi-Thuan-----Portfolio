import { useState, useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Header from "@/components/Header"
import Sidebar from "@/components/Sidebar"
import Footer from "@/components/Footer"
import AIChat from "@/components/AIChat"
import QuickActionFAB from "@/components/QuickActionFAB"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

export default function RootLayout() {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  // Close sidebar on mobile when navigating
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }
    
    // Set initial state
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }, [location.pathname])

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background font-sans antialiased">
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <main 
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300 ease-in-out flex flex-col w-full",
            isSidebarOpen ? "md:ml-64" : "md:ml-[72px]"
          )}
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
      </div>

      <AIChat />
      <QuickActionFAB />
      <Toaster position="bottom-right" />
    </div>
  )
}
