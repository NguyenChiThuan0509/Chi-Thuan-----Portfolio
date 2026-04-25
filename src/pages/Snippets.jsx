import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Terminal, Lightbulb, BookOpen, Plus, Loader2, Code2, Calendar, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Link } from "react-router-dom"

const CATEGORIES = [
  { id: 'all', label: 'Tất cả', icon: Search },
  { id: 'tip', label: 'Mẹo hay', icon: Lightbulb },
  { id: 'code', label: 'Code Snippets', icon: Terminal },
  { id: 'article', label: 'Bài viết', icon: BookOpen },
]

export default function Snippets() {
  const [snippets, setSnippets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    fetchSnippets()
  }, [])

  async function fetchSnippets() {
    setLoading(true)
    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setSnippets(data)
    setLoading(false)
  }

  const handleUpvote = async (e, snippetId, currentCount) => {
    e.preventDefault()
    e.stopPropagation()

    const likedSnippets = JSON.parse(localStorage.getItem('liked_snippets') || '[]')
    if (likedSnippets.includes(snippetId)) {
      toast.info("Bạn đã thả tim cho bài này rồi!")
      return
    }

    const { error } = await supabase
      .from('snippets')
      .update({ upvotes_count: (currentCount || 0) + 1 })
      .eq('id', snippetId)

    if (!error) {
      setSnippets(prev => prev.map(s => s.id === snippetId ? { ...s, upvotes_count: (s.upvotes_count || 0) + 1 } : s))
      localStorage.setItem('liked_snippets', JSON.stringify([...likedSnippets, snippetId]))
      toast.success("Đã thả tim!")
    }
  }

  const filteredSnippets = snippets.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                         s.description?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'all' || s.category === category
    return matchesSearch && matchesCategory
  })

  return (
    <div className="container pt-8 md:pt-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Góc chia sẻ</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Nơi lưu trữ những kiến thức, mẹo hay và đoạn code sưu tầm được.
          </p>
        </div>
        {user && (
          <Button asChild className="gap-2">
            <Link to="/snippets/new">
              <Plus className="h-4 w-4" /> Thêm bài mới
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm kiến thức..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon
            return (
              <Button
                key={cat.id}
                variant={category === cat.id ? "default" : "outline"}
                size="sm"
                className="gap-2 whitespace-nowrap"
                onClick={() => setCategory(cat.id)}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </Button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredSnippets.map((snippet) => (
              <motion.div
                key={snippet.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow overflow-hidden border-primary/5 group">
                  {snippet.image_url && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={snippet.image_url} 
                        alt={snippet.title}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-background/80 backdrop-blur-md text-foreground border-primary/20">
                          {CATEGORIES.find(c => c.id === snippet.category)?.label}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <CardHeader className="flex-1">
                    {!snippet.image_url && (
                      <div className="mb-2">
                        <Badge variant="secondary">
                          {CATEGORIES.find(c => c.id === snippet.category)?.label}
                        </Badge>
                      </div>
                    )}
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {snippet.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {snippet.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 flex flex-col gap-4">
                    {snippet.code_snippet && (
                      <div className="bg-muted p-3 rounded-md overflow-hidden relative group/code">
                        <pre className="text-xs font-mono line-clamp-4">
                          <code>{snippet.code_snippet}</code>
                        </pre>
                        <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                          <Code2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(snippet.created_at).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn(
                            "h-8 px-2 gap-1 hover:text-red-500 hover:bg-red-50 transition-colors",
                            JSON.parse(localStorage.getItem('liked_snippets') || '[]').includes(snippet.id) && "text-red-500"
                          )}
                          onClick={(e) => handleUpvote(e, snippet.id, snippet.upvotes_count)}
                        >
                          <Heart className={cn("h-4 w-4", JSON.parse(localStorage.getItem('liked_snippets') || '[]').includes(snippet.id) && "fill-current")} />
                          <span className="text-xs">{snippet.upvotes_count || 0}</span>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="group/btn h-8 px-2">
                          <Link to={`/snippets/${snippet.id}`} className="gap-1">
                            Chi tiết <Plus className="h-3 w-3 transition-transform group-hover/btn:rotate-90" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredSnippets.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">Chưa có bài viết nào trong mục này.</p>
        </div>
      )}
    </div>
  )
}
