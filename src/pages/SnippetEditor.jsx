import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Save, Trash2, Upload, Code2, Image as ImageIcon, Type } from "lucide-react"

export default function SnippetEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id && id !== "new")
  
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [snippet, setSnippet] = useState({
    title: "",
    description: "",
    content: "",
    code_snippet: "",
    category: "tip",
    image_url: "",
    language: "javascript"
  })

  useEffect(() => {
    if (isEditing) {
      fetchSnippet()
    }
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSaving(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `snippets/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Using existing bucket for simplicity
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setSnippet({ ...snippet, image_url: publicUrl })
      toast.success("Tải ảnh lên thành công!")
    } catch (error) {
      toast.error("Lỗi khi tải ảnh: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Vui lòng đăng nhập")

      const payload = {
        ...snippet,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }

      const { error } = isEditing 
        ? await supabase.from('snippets').update(payload).eq('id', id)
        : await supabase.from('snippets').insert([payload])

      if (error) throw error
      toast.success(isEditing ? "Cập nhật thành công!" : "Đã thêm bài mới!")
      navigate("/snippets")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bài này không?")) return
    setSaving(true)
    try {
      const { error } = await supabase.from('snippets').delete().eq('id', id)
      if (error) throw error
      toast.success("Đã xóa bài viết")
      navigate("/snippets")
    } catch (error) {
      toast.error(error.message)
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
    <div className="container max-w-4xl pt-8 md:pt-12 pb-20">
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/snippets")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Button>
        <div className="flex gap-2">
          {isEditing && (
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving} className="gap-2">
              <Trash2 className="h-4 w-4" /> Xóa
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{isEditing ? "Chỉnh sửa bài viết" : "Thêm kiến thức mới"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Tiêu đề bài viết</Label>
              <Input
                id="title"
                value={snippet.title}
                onChange={(e) => setSnippet({ ...snippet, title: e.target.value })}
                placeholder="Ví dụ: Cách tối ưu React Performance..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Phân loại</Label>
                <Select 
                  value={snippet.category} 
                  onValueChange={(val) => setSnippet({ ...snippet, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tip">Mẹo hay</SelectItem>
                    <SelectItem value="code">Code Snippets</SelectItem>
                    <SelectItem value="article">Bài viết</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Hình ảnh minh họa</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={snippet.image_url}
                    onChange={(e) => setSnippet({ ...snippet, image_url: e.target.value })}
                    placeholder="URL ảnh hoặc upload..."
                  />
                  <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('file-upload').click()}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả ngắn</Label>
              <Textarea
                id="description"
                value={snippet.description}
                onChange={(e) => setSnippet({ ...snippet, description: e.target.value })}
                placeholder="Mô tả tóm tắt về nội dung này..."
                rows={2}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="code" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" /> Đoạn code (nếu có)
              </Label>
              <Textarea
                id="code"
                value={snippet.code_snippet}
                onChange={(e) => setSnippet({ ...snippet, code_snippet: e.target.value })}
                placeholder="Dán đoạn code vào đây..."
                className="font-mono text-sm"
                rows={6}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="content" className="flex items-center gap-2">
                <Type className="h-4 w-4" /> Nội dung chi tiết
              </Label>
              <Textarea
                id="content"
                value={snippet.content}
                onChange={(e) => setSnippet({ ...snippet, content: e.target.value })}
                placeholder="Viết nội dung bài viết ở đây..."
                rows={10}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/snippets")}>Hủy</Button>
          <Button type="submit" disabled={saving} className="gap-2 min-w-[120px]">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Lưu bài viết
          </Button>
        </div>
      </form>
    </div>
  )
}
