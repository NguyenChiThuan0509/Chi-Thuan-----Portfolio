import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { User, Mail, Github, Linkedin, FileText, Save, Loader2, ArrowLeft, Upload, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    title: "",
    bio: "",
    avatar_url: "",
    email: "",
    github_url: "",
    linkedin_url: "",
    cv_url: ""
  })
  const navigate = useNavigate()

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          navigate("/login")
          return
        }

        // Try to fetch user's specific profile or the default one
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code === 'PGRST116') {
          // If no profile exists for this user, try to get the default one to seed
          const { data: defaultData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', '00000000-0000-0000-0000-000000000000')
            .single()
          
          if (defaultData) {
            setProfile({ ...defaultData, id: user.id })
          }
        } else if (data) {
          setProfile(data)
        }
      } catch (error) {
        toast.error("Lỗi khi tải thông tin hồ sơ")
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [navigate])

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Vui lòng đăng nhập")

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setProfile({ ...profile, avatar_url: publicUrl })
      toast.success("Tải ảnh lên thành công!")
    } catch (error) {
      toast.error("Lỗi khi tải ảnh: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Vui lòng đăng nhập")

      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          id: user.id,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
      toast.success("Cập nhật hồ sơ thành công!")
    } catch (error) {
      toast.error(error.message || "Lỗi khi lưu thông tin")
    } finally {
      setSaving(false)
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
    <div className="container max-w-4xl pt-4 pb-10">
      <form onSubmit={handleSave}>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Ảnh đại diện</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 p-4 pt-0">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-primary/10">
                <Avatar className="h-full w-full">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>{profile.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                {saving && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="w-full">
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={saving}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => document.getElementById('avatar-upload').click()}
                  disabled={saving}
                >
                  <Upload className="h-4 w-4" /> Chọn ảnh mới
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 p-4 pt-0">
                <div className="grid gap-1.5">
                  <Label htmlFor="name" className="text-xs">Họ và tên</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="h-9"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="title" className="text-xs">Chức danh</Label>
                  <Input
                    id="title"
                    value={profile.title}
                    onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                    className="h-9"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="bio" className="text-xs">Giới thiệu ngắn</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">Liên kết & Mạng xã hội</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="github" className="text-xs">GitHub URL</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="github"
                        value={profile.github_url}
                        onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="linkedin" className="text-xs">LinkedIn URL</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="linkedin"
                        value={profile.linkedin_url}
                        onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="cv" className="text-xs">CV URL</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cv"
                        value={profile.cv_url}
                        onChange={(e) => setProfile({ ...profile, cv_url: e.target.value })}
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => navigate("/")}>
                Hủy
              </Button>
              <Button type="submit" size="sm" disabled={saving} className="gap-2">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
