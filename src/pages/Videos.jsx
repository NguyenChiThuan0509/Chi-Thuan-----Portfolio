import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, Send, Trash2, X, Loader2, Globe, MoreHorizontal, ThumbsUp, Video, Film, PlayCircle } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { vi, enUS } from "date-fns/locale"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

export default function Videos() {
  const { t, i18n } = useTranslation()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState("")
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userLikes, setUserLikes] = useState(new Set())
  const [activeCommentPost, setActiveCommentPost] = useState(null)
  const [commentText, setCommentText] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [showVideoInput, setShowVideoInput] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const videoFileInputRef = useRef(null)

  const dateLocale = i18n.language === 'vi' ? vi : enUS

  useEffect(() => {
    fetchPosts()
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .single()
      if (profileData) setProfile(profileData)
    }
  }

  async function fetchPosts() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (name, avatar_url)
        `)
        .not("video_url", "is", null) // Only fetch posts with videos
        .order("created_at", { ascending: false })

      if (error) throw error
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error(t("feed.fetch_error") || "Không thể tải video")
    } finally {
      setLoading(false)
    }
  }

  const getEmbedUrl = (url) => {
    if (!url) return null;
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = url.match(ytRegex);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    const videoExts = ['.mp4', '.webm', '.ogg', '.mov'];
    if (videoExts.some(ext => url.toLowerCase().includes(ext))) return url;
    return null;
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video quá lớn. Vui lòng chọn file dưới 50MB hoặc sử dụng link.")
      return
    }
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
    setVideoUrl("")
    setShowVideoInput(false)
  }

  const removeVideo = () => {
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(null)
    setVideoPreview(null)
  }

  async function uploadVideo() {
    if (!videoFile) return null
    const fileExt = videoFile.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${user.id}/videos/${fileName}`
    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(filePath, videoFile)
    if (uploadError) throw uploadError
    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(filePath)
    return publicUrl
  }

  async function handleCreatePost() {
    if (!videoUrl.trim() && !videoFile) {
      toast.error("Vui lòng thêm video hoặc đường dẫn video")
      return
    }
    if (!user) {
      toast.error("Bạn cần đăng nhập để đăng video")
      return
    }

    try {
      setIsSubmitting(true)
      let finalVideoUrl = videoUrl.trim() || null
      if (videoFile) {
        finalVideoUrl = await uploadVideo()
      }

      const { error } = await supabase.from("posts").insert([
        {
          content: newPost,
          user_id: user.id,
          video_url: finalVideoUrl
        },
      ])

      if (error) throw error

      setNewPost("")
      setVideoUrl("")
      setVideoFile(null)
      setVideoPreview(null)
      setShowVideoInput(false)
      setIsExpanded(false)
      fetchPosts()
      toast.success("Đã đăng video thành công!")
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("Có lỗi xảy ra khi đăng video")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeletePost(id) {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id)
      if (error) throw error
      setPosts(posts.filter((p) => p.id !== id))
      toast.success("Đã xóa video")
    } catch (error) {
      toast.error("Không thể xóa video")
    }
  }

  return (
    <div className="container max-w-4xl py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 text-primary flex items-center gap-2">
            <PlayCircle className="h-8 w-8" />
            {t("nav.videos")}
          </h1>
          <p className="text-muted-foreground">
            {i18n.language === 'vi' ? "Kho lưu trữ video bài giảng và chia sẻ kiến thức." : "Lecture videos and knowledge sharing repository."}
          </p>
        </div>
        
        {user && (
          <Button onClick={() => setIsExpanded(!isExpanded)} variant={isExpanded ? "outline" : "default"} className="gap-2">
            {isExpanded ? <X className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            {isExpanded ? "Hủy" : "Đăng video mới"}
          </Button>
        )}
      </motion.div>

      {user && isExpanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8"
        >
          <Card className="border-2 border-primary/20 shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Tiêu đề hoặc mô tả</label>
                    <Textarea
                      placeholder="Nhập mô tả cho video bài giảng này..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      className={cn("flex-1 gap-2 h-12 border-2 hover:bg-primary/5 hover:border-primary/50 transition-all", videoFile && "border-primary bg-primary/5")}
                      onClick={() => videoFileInputRef.current?.click()}
                    >
                      <Video className="h-4 w-4" />
                      Tải video lên
                    </Button>
                    <Button 
                      type="button"
                      variant="outline" 
                      className={cn("flex-1 gap-2 h-12 border-2 hover:bg-primary/5 hover:border-primary/50 transition-all", showVideoInput && "border-primary bg-primary/5")}
                      onClick={() => {
                        setShowVideoInput(!showVideoInput)
                        if (videoFile) removeVideo()
                      }}
                    >
                      <Film className="h-4 w-4" />
                      Dùng link (YT/Vimeo)
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col justify-center bg-muted/30 rounded-xl border-2 border-dashed border-muted-foreground/20 p-4 min-h-[200px]">
                  {showVideoInput ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Dán đường dẫn video:</p>
                      <div className="flex items-center gap-2 bg-background p-2 rounded-lg border">
                        <Film className="h-4 w-4 text-primary" />
                        <input 
                          type="text"
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                          className="bg-transparent border-none focus:ring-0 text-sm flex-1 outline-none"
                        />
                      </div>
                      {videoUrl && getEmbedUrl(videoUrl) && (
                        <div className="aspect-video rounded-lg overflow-hidden border mt-2">
                           <iframe
                            src={getEmbedUrl(videoUrl)}
                            className="w-full h-full"
                            title="Preview"
                          />
                        </div>
                      )}
                    </div>
                  ) : videoPreview ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                      <video src={videoPreview} className="w-full h-full object-contain" controls />
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 h-7 w-7 rounded-full"
                        onClick={removeVideo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground space-y-2">
                      <PlayCircle className="h-10 w-10 mx-auto opacity-20" />
                      <p className="text-xs">Chưa có video nào được chọn</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button 
                  onClick={handleCreatePost} 
                  disabled={isSubmitting || (!videoUrl.trim() && !videoFile)}
                  className="px-8 py-2 h-10 text-sm font-semibold shadow-sm hover:shadow-md transition-all rounded-lg"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Đăng video
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <input 
            type="file" 
            accept="video/*" 
            className="hidden" 
            ref={videoFileInputRef}
            onChange={handleVideoSelect}
          />
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-video w-full rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <motion.div 
              key={post.id} 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group"
            >
              <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
                <div className="aspect-video relative bg-black">
                  {getEmbedUrl(post.video_url) && (
                    getEmbedUrl(post.video_url).includes('youtube.com') || getEmbedUrl(post.video_url).includes('player.vimeo.com') ? (
                      <iframe
                        src={getEmbedUrl(post.video_url)}
                        className="w-full h-full"
                        allowFullScreen
                        title={post.content}
                      />
                    ) : (
                      <video 
                        src={post.video_url} 
                        className="w-full h-full object-contain" 
                        controls 
                        playsInline
                      />
                    )
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                        {post.content || "Video không có tiêu đề"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={post.profiles?.avatar_url} />
                          <AvatarFallback>{post.profiles?.name?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-[11px] text-muted-foreground">
                          {post.profiles?.name || "Admin"} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateLocale })}
                        </span>
                      </div>
                    </div>
                    {user?.id === post.user_id && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
          <p className="text-muted-foreground">
            {i18n.language === 'vi' ? "Chưa có video nào được đăng." : "No videos posted yet."}
          </p>
        </div>
      )}
    </div>
  )
}
