import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MessageSquare, StickyNote, X, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

export default function QuickActionFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  if (!user) return null

  const actions = [
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Đăng tin",
      onClick: () => {
        navigate("/feed")
        setIsOpen(false)
      },
      color: "bg-blue-500",
    },
    {
      icon: <StickyNote className="h-5 w-5" />,
      label: "Ghi chú",
      onClick: () => {
        navigate("/notes")
        setIsOpen(false)
      },
      color: "bg-amber-500",
    },
  ]

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 group"
              >
                <span className="px-2 py-1 rounded bg-background/80 backdrop-blur-sm border text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-full shadow-lg text-white hover:scale-110 transition-transform",
                    action.color
                  )}
                  onClick={action.onClick}
                >
                  {action.icon}
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
          isOpen ? "bg-destructive rotate-45" : "bg-primary"
        )}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
