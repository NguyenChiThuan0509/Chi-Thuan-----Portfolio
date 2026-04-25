import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles, MinusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Chào bạn! Tôi là trợ lý AI của Thuận. Bạn muốn tìm hiểu về dự án hay kỹ năng nào của Thuận không?' }
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [knowledge, setKnowledge] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    fetchKnowledge()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  async function fetchKnowledge() {
    const { data: profile } = await supabase.from('profiles').select('*').single()
    const { data: projects } = await supabase.from('projects').select('title, description, tech_stack')
    const { data: snippets } = await supabase.from('snippets').select('title, category')
    
    setKnowledge({ profile, projects, snippets })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setInput("")
    setIsTyping(true)

    // Simple Client-side Logic (Simulation for now)
    // In a real app, this would call a Supabase Edge Function or an AI API
    setTimeout(() => {
      let response = "Xin lỗi, tôi chưa rõ ý bạn. Bạn có thể hỏi về các dự án hoặc kỹ năng của Thuận được không?"
      
      const lowerMsg = userMsg.toLowerCase()
      
      if (lowerMsg.includes("dự án") || lowerMsg.includes("project")) {
        const projectNames = knowledge?.projects?.map(p => p.title).join(", ")
        response = `Thuận đã thực hiện nhiều dự án thú vị như: ${projectNames || "các ứng dụng Web hiện đại"}. Bạn muốn biết chi tiết về dự án nào?`
      } else if (lowerMsg.includes("kỹ năng") || lowerMsg.includes("skill") || lowerMsg.includes("công nghệ")) {
        response = `Thuận thành thạo các công nghệ như: ${knowledge?.profile?.title || "React, Next.js, Node.js, và Supabase"}. Ngoài ra Thuận còn rất am hiểu về UX/UI.`
      } else if (lowerMsg.includes("liên hệ") || lowerMsg.includes("email") || lowerMsg.includes("contact")) {
        response = "Bạn có thể liên hệ với Thuận qua trang Liên hệ hoặc gửi email trực tiếp nhé. Thuận thường phản hồi rất nhanh!"
      } else if (lowerMsg.includes("chào") || lowerMsg.includes("hi") || lowerMsg.includes("hello")) {
        response = `Chào bạn! Rất vui được hỗ trợ bạn tìm hiểu về Thuận. ${knowledge?.profile?.name || ""} luôn sẵn sàng cho các cơ hội hợp tác mới.`
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4"
          >
            <Card className="w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl border-primary/20 overflow-hidden bg-background/80 backdrop-blur-2xl">
              <CardHeader className="bg-primary p-4 text-primary-foreground flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">Trợ lý ảo của Thuận</CardTitle>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Online</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              
              <CardContent 
                ref={scrollRef}
                className="flex-grow overflow-y-auto p-4 space-y-4 scroll-smooth"
              >
                {messages.map((msg, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i}
                    className={cn(
                      "flex gap-3",
                      msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                      msg.role === 'user' ? "bg-muted" : "bg-primary/10 text-primary"
                    )}>
                      {msg.role === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      "p-3 rounded-2xl text-sm leading-relaxed max-w-[80%] shadow-sm",
                      msg.role === 'user' 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-muted rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-none">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4 border-t bg-muted/30">
                <form onSubmit={handleSend} className="flex w-full gap-2">
                  <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi tôi về Thuận..."
                    className="flex-grow border-primary/10 focus-visible:ring-primary bg-background"
                  />
                  <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl transition-all duration-500",
            isOpen ? "bg-destructive hover:bg-destructive" : "bg-primary"
          )}
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-background"></span>
            </span>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
