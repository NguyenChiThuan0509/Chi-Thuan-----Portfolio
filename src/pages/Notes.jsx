import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Pin, 
  Tag, 
  Palette, 
  Trash2, 
  MoreVertical,
  ChevronDown,
  X,
  Check
} from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

const NOTE_COLORS = [
  { id: 'default', bg: 'bg-background/50', border: 'border-border', accent: 'bg-muted' },
  { id: 'red', bg: 'bg-red-500/10', border: 'border-red-500/20', accent: 'bg-red-500/20' },
  { id: 'blue', bg: 'bg-blue-500/10', border: 'border-blue-500/20', accent: 'bg-blue-500/20' },
  { id: 'green', bg: 'bg-green-500/10', border: 'border-green-500/20', accent: 'bg-green-500/20' },
  { id: 'yellow', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', accent: 'bg-yellow-500/20' },
  { id: 'purple', bg: 'bg-purple-500/10', border: 'border-purple-500/20', accent: 'bg-purple-500/20' },
]

export default function Notes() {
  const { t, i18n } = useTranslation()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [user, setUser] = useState(null)
  
  // New Note State
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [color, setColor] = useState("default")
  const [isPinned, setIsPinned] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchNotes()
      else setLoading(false)
    })
  }, [])

  async function fetchNotes() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false })

      if (error) throw error
      setNotes(data)
    } catch (error) {
      console.error("Error fetching notes:", error)
      toast.error("Không thể tải ghi chú")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddNote() {
    if (!title.trim() && !content.trim()) {
      setIsAdding(false)
      return
    }

    try {
      const { data, error } = await supabase.from("notes").insert([
        {
          title,
          content,
          color,
          is_pinned: isPinned,
          user_id: user.id
        }
      ]).select()

      if (error) throw error
      
      setNotes([data[0], ...notes])
      setTitle("")
      setContent("")
      setColor("default")
      setIsPinned(false)
      setIsAdding(false)
      toast.success("Đã thêm ghi chú")
    } catch (error) {
      toast.error("Lỗi khi thêm ghi chú")
    }
  }

  async function handleDeleteNote(id) {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", id)
      if (error) throw error
      setNotes(notes.filter(n => n.id !== id))
      toast.success("Đã xóa ghi chú")
    } catch (error) {
      toast.error("Lỗi khi xóa ghi chú")
    }
  }

  async function togglePin(note) {
    try {
      const { error } = await supabase
        .from("notes")
        .update({ is_pinned: !note.is_pinned })
        .eq("id", note.id)
      
      if (error) throw error
      
      setNotes(notes.map(n => n.id === note.id ? { ...n, is_pinned: !n.is_pinned } : n))
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái ghim")
    }
  }

  const filteredNotes = notes.filter(n => 
    n.title?.toLowerCase().includes(search.toLowerCase()) || 
    n.content?.toLowerCase().includes(search.toLowerCase())
  )

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned)
  const otherNotes = filteredNotes.filter(n => !n.is_pinned)

  if (!user && !loading) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập để sử dụng tính năng Ghi chú</h2>
        <Button asChild>
          <a href="/login">Đăng nhập ngay</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-12 px-4 min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            {t("nav.notes")}
          </h1>
          <p className="text-muted-foreground italic">
            {i18n.language === 'vi' ? "Khu vườn ý tưởng và suy nghĩ của riêng tôi." : "My private garden of ideas and thoughts."}
          </p>
        </motion.div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder={i18n.language === 'vi' ? "Tìm kiếm ghi chú..." : "Search notes..."}
            className="pl-10 bg-background/50 border-none ring-1 ring-white/10 focus-visible:ring-amber-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Add Area */}
      <div className="flex justify-center mb-16">
        <motion.div 
          layout
          className={cn(
            "w-full max-w-xl transition-all duration-300 rounded-2xl shadow-2xl ring-1 ring-white/10 bg-background/40 backdrop-blur-xl overflow-hidden",
            isAdding ? "p-4" : "p-2"
          )}
        >
          {isAdding ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <Input 
                  placeholder={i18n.language === 'vi' ? "Tiêu đề" : "Title"}
                  className="border-none bg-transparent text-lg font-bold p-0 focus-visible:ring-0"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-8 w-8", isPinned && "text-amber-500")}
                  onClick={() => setIsPinned(!isPinned)}
                >
                  <Pin className="h-4 w-4" />
                </Button>
              </div>
              <Textarea 
                placeholder={i18n.language === 'vi' ? "Viết ghi chú..." : "Take a note..."}
                className="border-none bg-transparent min-h-[100px] p-0 focus-visible:ring-0 resize-none text-base"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex gap-1">
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColor(c.id)}
                      className={cn(
                        "h-6 w-6 rounded-full border border-white/10 flex items-center justify-center transition-all",
                        c.bg,
                        color === c.id ? "ring-2 ring-primary scale-110" : "hover:scale-105"
                      )}
                    >
                      {color === c.id && <Check className="h-3 w-3" />}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                    {i18n.language === 'vi' ? "Đóng" : "Close"}
                  </Button>
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={handleAddNote}>
                    {i18n.language === 'vi' ? "Lưu" : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="px-4 py-2 text-muted-foreground flex items-center justify-between cursor-text"
              onClick={() => setIsAdding(true)}
            >
              <span>{i18n.language === 'vi' ? "Ghi chú nhanh..." : "Quick note..."}</span>
              <Plus className="h-5 w-5" />
            </div>
          )}
        </motion.div>
      </div>

      {/* Notes Grid */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-40 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {pinnedNotes.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">Đã ghim</h3>
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {pinnedNotes.map(note => <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onTogglePin={togglePin} />)}
                </motion.div>
              </div>
            )}

            <div>
              {pinnedNotes.length > 0 && <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">Khác</h3>}
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {otherNotes.map(note => <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} onTogglePin={togglePin} />)}
              </motion.div>
            </div>

            {filteredNotes.length === 0 && !loading && (
              <div className="text-center py-20 opacity-50 italic">
                <p>Không tìm thấy ghi chú nào.</p>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NoteCard({ note, onDelete, onTogglePin }) {
  const colorData = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0]
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className={cn(
        "h-full border-none ring-1 ring-white/10 shadow-lg backdrop-blur-sm transition-all duration-300",
        colorData.bg,
        "hover:ring-primary/40"
      )}>
        <CardHeader className="p-4 flex-row items-start justify-between space-y-0">
          <h4 className="font-bold text-base line-clamp-2 pr-6">{note.title}</h4>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-7 w-7 rounded-full", note.is_pinned && "text-amber-500 opacity-100")}
              onClick={() => onTogglePin(note)}
            >
              <Pin className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-[10]">
            {note.content}
          </p>
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {note.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="p-2 pt-0 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => onDelete(note.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
