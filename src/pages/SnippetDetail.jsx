import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Calendar, Tag, Terminal, Loader2, Code2, Copy, Check, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function SnippetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [snippet, setSnippet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    fetchSnippet()
  }, [id])

  async function fetchSnippet() {
    const { data, error } = await supabase
      .from('snippets')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) setSnippet(data)
    else {
      toast.error("Không tìm thấy bài viết")
      navigate("/snippets")
    }
    setLoading(false)
  }

  const copyToClipboard = () => {
    if (!snippet?.code_snippet) return
    navigator.clipboard.writeText(snippet.code_snippet)
    setCopied(true)
    toast.success("Đã sao chép mã!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleUpvote = async () => {
    const likedSnippets = JSON.parse(localStorage.getItem('liked_snippets') || '[]')
    if (likedSnippets.includes(id)) {
      toast.info("Bạn đã thả tim cho bài này rồi!")
      return
    }

    const { error } = await supabase
      .from('snippets')
      .update({ upvotes_count: (snippet.upvotes_count || 0) + 1 })
      .eq('id', id)

    if (!error) {
      setSnippet({ ...snippet, upvotes_count: (snippet.upvotes_count || 0) + 1 })
      localStorage.setItem('liked_snippets', JSON.stringify([...likedSnippets, id]))
      toast.success("Đã thả tim!")
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
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
      >
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link to="/snippets">
              <ArrowLeft className="h-4 w-4" /> Góc chia sẻ
            </Link>
          </Button>
          {user && (
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to={`/snippets/${id}/edit`}>
                <Edit className="h-4 w-4" /> Chỉnh sửa
              </Link>
            </Button>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                {snippet.category === 'tip' ? 'Mẹo hay' : snippet.category === 'code' ? 'Code Snippets' : 'Bài viết'}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(snippet.created_at).toLocaleDateString('vi-VN')}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{snippet.title}</h1>
            <div className="flex items-center gap-4 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUpvote}
                className={cn(
                  "rounded-full gap-2 transition-all hover:border-red-200 hover:bg-red-50",
                  JSON.parse(localStorage.getItem('liked_snippets') || '[]').includes(id) && "text-red-500 border-red-200 bg-red-50"
                )}
              >
                <Heart className={cn("h-4 w-4", JSON.parse(localStorage.getItem('liked_snippets') || '[]').includes(id) && "fill-current")} />
                {snippet.upvotes_count || 0} lượt thích
              </Button>
            </div>
            <p className="text-xl text-muted-foreground border-l-4 border-primary/20 pl-6 py-2 italic">
              {snippet.description}
            </p>
          </div>

          {snippet.image_url && (
            <div className="relative aspect-video overflow-hidden rounded-2xl border bg-muted">
              <img 
                src={snippet.image_url} 
                alt={snippet.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-lg leading-relaxed text-foreground/90">
              {snippet.content}
            </div>
          </div>

          {snippet.code_snippet && (
            <div className="space-y-4 pt-8">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Terminal className="h-5 w-5 text-primary" />
                  Mã nguồn minh họa
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={copyToClipboard}
                  className="gap-2"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Đã chép" : "Sao chép"}
                </Button>
              </div>
              <div className="relative rounded-xl overflow-hidden border bg-zinc-950 p-6">
                <div className="absolute top-0 right-0 p-2 text-xs text-zinc-500 font-mono uppercase">
                  {snippet.language}
                </div>
                <pre className="text-zinc-100 font-mono text-sm leading-relaxed overflow-x-auto">
                  <code>{snippet.code_snippet}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
