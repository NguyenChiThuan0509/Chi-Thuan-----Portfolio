import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Save, Trash2, Upload, Link as LinkIcon, Target, Lightbulb, CheckCircle2 } from "lucide-react"

export default function ProjectEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id && id !== "new")
  
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [project, setProject] = useState({
    title: "",
    description: "",
    image_url: "",
    github_url: "",
    live_url: "",
    tech_stack: "", // Will be converted to array
    challenge: "",
    solution: "",
    result: ""
  })

  useEffect(() => {
    if (isEditing) {
      fetchProject()
    }
  }, [id])

  async function fetchProject() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) {
      setProject({
        ...data,
        tech_stack: data.tech_stack?.join(", ") || ""
      })
    } else {
      toast.error("Không tìm thấy dự án")
      navigate("/projects")
    }
    setLoading(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSaving(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `projects/${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      setProject({ ...project, image_url: publicUrl })
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
        ...project,
        user_id: user.id,
        tech_stack: project.tech_stack.split(",").map(t => t.trim()).filter(t => t !== ""),
        updated_at: new Date().toISOString()
      }

      const { error } = isEditing 
        ? await supabase.from('projects').update(payload).eq('id', id)
        : await supabase.from('projects').insert([payload])

      if (error) throw error
      toast.success(isEditing ? "Cập nhật thành công!" : "Đã thêm dự án mới!")
      navigate("/projects")
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa dự án này không?")) return
    setSaving(true)
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
      toast.success("Đã xóa dự án")
      navigate("/projects")
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
        <Button variant="ghost" size="sm" onClick={() => navigate("/projects")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Button>
        {isEditing && (
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving} className="gap-2">
            <Trash2 className="h-4 w-4" /> Xóa dự án
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{isEditing ? "Chỉnh sửa dự án" : "Thêm dự án mới"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Tên dự án</Label>
              <Input
                id="title"
                value={project.title}
                onChange={(e) => setProject({ ...project, title: e.target.value })}
                placeholder="Ví dụ: E-commerce Web App"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả ngắn</Label>
              <Textarea
                id="description"
                value={project.description}
                onChange={(e) => setProject({ ...project, description: e.target.value })}
                placeholder="Mô tả tóm tắt về dự án..."
                rows={3}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="image">Hình ảnh đại diện</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={project.image_url}
                    onChange={(e) => setProject({ ...project, image_url: e.target.value })}
                    placeholder="URL ảnh hoặc upload..."
                  />
                  <input type="file" id="project-upload" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  <Button type="button" variant="outline" size="icon" onClick={() => document.getElementById('project-upload').click()}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tech">Công nghệ (cách nhau bằng dấu phẩy)</Label>
                <Input
                  id="tech"
                  value={project.tech_stack}
                  onChange={(e) => setProject({ ...project, tech_stack: e.target.value })}
                  placeholder="React, TailwindCSS, Supabase..."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  value={project.github_url}
                  onChange={(e) => setProject({ ...project, github_url: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="live">Live Demo URL</Label>
                <Input
                  id="live"
                  value={project.live_url}
                  onChange={(e) => setProject({ ...project, live_url: e.target.value })}
                  placeholder="https://my-app.com"
                />
              </div>
            </div>

            <div className="pt-6 border-t space-y-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" /> Case Study Nội dung
              </h3>
              
              <div className="grid gap-2">
                <Label htmlFor="challenge" className="flex items-center gap-2 text-red-500">
                  <Target className="h-4 w-4" /> Thách thức (Challenge)
                </Label>
                <Textarea
                  id="challenge"
                  value={project.challenge}
                  onChange={(e) => setProject({ ...project, challenge: e.target.value })}
                  placeholder="Vấn đề bạn gặp phải khi thực hiện dự án này là gì?"
                  rows={4}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="solution" className="flex items-center gap-2 text-yellow-500">
                  <Lightbulb className="h-4 w-4" /> Giải pháp (Solution)
                </Label>
                <Textarea
                  id="solution"
                  value={project.solution}
                  onChange={(e) => setProject({ ...project, solution: e.target.value })}
                  placeholder="Bạn đã giải quyết vấn đề đó như thế nào?"
                  rows={4}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="result" className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="h-4 w-4" /> Kết quả (Result)
                </Label>
                <Textarea
                  id="result"
                  value={project.result}
                  onChange={(e) => setProject({ ...project, result: e.target.value })}
                  placeholder="Kết quả cuối cùng và bài học rút ra..."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/projects")}>Hủy</Button>
          <Button type="submit" disabled={saving} className="gap-2 min-w-[120px]">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Lưu dự án
          </Button>
        </div>
      </form>
    </div>
  )
}
