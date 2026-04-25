import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, Clock, Info, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

export default function Now() {
  const { t, i18n } = useTranslation()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    fetchNowStatus()
  }, [])

  async function fetchNowStatus() {
    setLoading(true)
    const { data, error } = await supabase
      .from('now_status')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
    
    if (data) {
      setContent(data.content)
      setLastUpdated(data.updated_at)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('now_status')
        .insert([{ content, user_id: user.id }])

      if (error) throw error
      toast.success("Đã cập nhật trạng thái mới!")
      setLastUpdated(new Date().toISOString())
      setIsEditing(false)
    } catch (error) {
      toast.error("Lỗi: " + error.message)
    } finally {
      setSaving(false)
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
    <div className="container max-w-3xl pt-8 md:pt-12 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">/now</h1>
          <p className="text-muted-foreground italic">
            {i18n.language === 'vi' ? "Đây là trang tóm tắt những gì tôi đang tập trung thực hiện ngay lúc này." : "This is a page about what I'm focused on right now."}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {i18n.language === 'vi' ? "Cập nhật lần cuối: " : "Last updated: "}
            {lastUpdated ? new Date(lastUpdated).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }) : "---"}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-3xl blur-xl"></div>
          <Card className="relative border-primary/10 bg-background/50 backdrop-blur-md overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  {i18n.language === 'vi' ? "Trạng thái hiện tại" : "Current Status"}
                </CardTitle>
                {user && !isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Cập nhật
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {isEditing ? (
                <div className="space-y-4">
                  <Textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Bạn đang làm gì thế?..."
                    className="min-h-[200px] text-lg leading-relaxed"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Hủy</Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                      {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                      Lưu lại
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-xl leading-relaxed text-foreground/90">
                    {content || (i18n.language === 'vi' ? "Chưa có cập nhật nào..." : "No updates yet...")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="bg-muted/50 rounded-2xl p-6 border text-sm text-muted-foreground space-y-3">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <Info className="h-4 w-4" />
            {i18n.language === 'vi' ? "Trang này dùng để làm gì?" : "What is this page for?"}
          </p>
          <p>
            {i18n.language === 'vi' 
              ? "Ý tưởng này được truyền cảm hứng bởi Derek Sivers. Nó giúp khách truy cập hiểu rõ lộ trình phát triển và các sở thích hiện tại của tôi mà trang Giới thiệu (vốn mang tính tiểu sử) không thể hiện được."
              : "Inspired by Derek Sivers, this page helps visitors understand my current growth path and interests that a static Bio page might not show."}
          </p>
          <a 
            href="https://nownownow.com/about" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            Tìm hiểu thêm về nownownow movement <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </motion.div>
    </div>
  )
}
