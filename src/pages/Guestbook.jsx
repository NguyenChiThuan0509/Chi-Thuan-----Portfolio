import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Loader2, 
  Send, 
  MessageSquare, 
  User, 
  Clock,
  Sparkles,
  Trash2
} from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { formatDistanceToNow } from "date-fns"
import { vi, enUS } from "date-fns/locale"

export default function Guestbook() {
  const { t, i18n } = useTranslation()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  
  // Form states
  const [name, setName] = useState("")
  const [content, setContent] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  
  const messagesEndRef = useRef(null)
  const locale = i18n.language === 'vi' ? vi : enUS

  useEffect(() => {
    fetchMessages()
    
    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
    })

    // Subscribe to realtime changes
    const channel = supabase
      .channel('guestbook_changes')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'guestbook' }, 
        (payload) => {
          setMessages(prev => [payload.new, ...prev])
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'guestbook' },
        (payload) => {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast.error(i18n.language === 'vi' ? "Không thể tải lời nhắn" : "Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', userId)
      .single()
    
    if (data) {
      setProfile(data)
      setName(data.name || "")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() || (!user && !name.trim())) return
    
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('guestbook')
        .insert([{
          content: content.trim(),
          name: user ? (profile?.name || user.email) : name.trim(),
          avatar_url: profile?.avatar_url || null,
          user_id: user?.id || null
        }])
      
      if (error) throw error
      
      setContent("")
      setIsExpanded(false)
      if (!user) setName("")
      toast.success(i18n.language === 'vi' ? "Cảm ơn bạn đã để lại lời nhắn!" : "Thanks for your message!")
    } catch (error) {
      toast.error("Lỗi: " + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('guestbook')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      toast.success(i18n.language === 'vi' ? "Đã xóa lời nhắn" : "Message deleted")
    } catch (error) {
      toast.error("Lỗi: " + error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl pt-8 md:pt-12 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight neon-text flex items-center justify-center gap-3">
            <MessageSquare className="h-10 w-10 text-primary" />
            {i18n.language === 'vi' ? "Lưu bút" : "Guestbook"}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {i18n.language === 'vi' 
              ? "Hãy để lại lời nhắn, cảm nhận hoặc chỉ là lời chào tại đây. Tôi rất trân trọng sự hiện diện của bạn!" 
              : "Leave a message, feedback, or just say hi. I appreciate your presence here!"}
          </p>
        </div>

        <Card className="mb-8 border border-border bg-card shadow-sm overflow-hidden rounded-lg">
          <CardContent className="p-3">
            {!isExpanded ? (
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={profile?.avatar_url || "/anh_dai_dien.png"} />
                  <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div 
                  className="flex-1 bg-muted/50 hover:bg-muted transition-colors rounded-full px-4 py-2 cursor-pointer text-muted-foreground text-sm"
                  onClick={() => setIsExpanded(true)}
                >
                  {user ? (profile?.name ? `${profile.name.split(' ').pop()} ơi, hãy để lại lời nhắn...` : "Hãy để lại lời nhắn...") : "Hãy để lại lời nhắn..."}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-primary hover:bg-primary/10"
                  onClick={() => setIsExpanded(true)}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={profile?.avatar_url || "/anh_dai_dien.png"} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-semibold">
                    {user ? (profile?.name || user.email) : (i18n.language === 'vi' ? "Khách ẩn danh" : "Guest")}
                  </span>
                </div>

                {!user && (
                  <div className="space-y-1.5">
                    <Input 
                      placeholder={i18n.language === 'vi' ? "Tên của bạn" : "Your Name"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-transparent border-none focus-visible:ring-0 px-1 text-base font-medium"
                      autoFocus
                    />
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <Textarea 
                    placeholder={i18n.language === 'vi' ? "Viết gì đó thú vị..." : "Write something interesting..."}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    className="min-h-[120px] bg-transparent border-none focus-visible:ring-0 px-1 py-2 text-lg resize-none"
                    autoFocus={!!user}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                  <Button variant="ghost" size="sm" type="button" onClick={() => { setIsExpanded(false); setContent(""); if(!user) setName(""); }}>
                    {i18n.language === 'vi' ? "Hủy" : "Cancel"}
                  </Button>
                  <Button 
                    type="submit" 
                    size="sm"
                    className="rounded-md px-8 py-2 bg-primary text-primary-foreground font-semibold"
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    {i18n.language === 'vi' ? "Gửi lời nhắn" : "Send Message"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              {i18n.language === 'vi' ? "Tất cả lời nhắn" : "All Messages"}
              <span className="ml-3 text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {messages.length}
              </span>
            </h2>
          </div>

          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                >
                  <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 border border-primary/10">
                          <AvatarImage src={msg.avatar_url || "/anh_dai_dien.png"} />
                          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-primary">{msg.name}</h4>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale })}
                              </span>
                              {user?.id === msg.user_id && (
                                <button 
                                  onClick={() => handleDelete(msg.id)}
                                  className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                  title="Delete message"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {messages.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed rounded-3xl border-primary/10">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">
                  {i18n.language === 'vi' ? "Chưa có lời nhắn nào. Hãy là người đầu tiên!" : "No messages yet. Be the first one!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
