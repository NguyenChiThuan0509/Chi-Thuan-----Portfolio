import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Image as ImageIcon, Heart, MessageCircle, Share2, Send, Trash2, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { vi, enUS } from "date-fns/locale"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

export default function Feed() {
  const { t, i18n } = useTranslation()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState("")
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const fileInputRef = useRef(null)

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
        .order("created_at", { ascending: false })

      if (error) throw error
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast.error(t("feed.fetch_error") || "Không thể tải bài viết")
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (selectedImages.length + files.length > 4) {
      toast.error("Bạn chỉ có thể đăng tối đa 4 ảnh")
      return
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))

    setSelectedImages([...selectedImages, ...newImages])
  }

  const removeImage = (index) => {
    const newImages = [...selectedImages]
    URL.revokeObjectURL(newImages[index].preview)
    newImages.splice(index, 1)
    setSelectedImages(newImages)
  }

  async function uploadImages() {
    const urls = []
    for (const item of selectedImages) {
      const fileExt = item.file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, item.file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath)
      
      urls.push(publicUrl)
    }
    return urls
  }

  async function handleCreatePost() {
    if (!newPost.trim() && selectedImages.length === 0) return
    if (!user) {
      toast.error("Bạn cần đăng nhập để đăng bài")
      return
    }

    try {
      setIsSubmitting(true)
      
      let imageUrls = []
      if (selectedImages.length > 0) {
        setUploadingImages(true)
        imageUrls = await uploadImages()
      }

      const { error } = await supabase.from("posts").insert([
        {
          content: newPost,
          user_id: user.id,
          image_urls: imageUrls
        },
      ])

      if (error) throw error

      setNewPost("")
      setSelectedImages([])
      fetchPosts()
      toast.success("Đã đăng bài thành công!")
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("Có lỗi xảy ra khi đăng bài")
    } finally {
      setIsSubmitting(false)
      setUploadingImages(false)
    }
  }

  async function handleDeletePost(id) {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id)
      if (error) throw error
      setPosts(posts.filter((p) => p.id !== id))
      toast.success("Đã xóa bài viết")
    } catch (error) {
      toast.error("Không thể xóa bài viết")
    }
  }

  return (
    <div className="container max-w-2xl py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          {t("nav.feed")}
        </h1>
        <p className="text-muted-foreground italic">
          {i18n.language === 'vi' ? "Nơi tôi chia sẻ những khoảnh khắc và suy nghĩ hàng ngày." : "Where I share daily moments and thoughts."}
        </p>
      </motion.div>

      {user && (
        <Card className="mb-8 border-none bg-background/50 backdrop-blur-md shadow-xl ring-1 ring-white/10 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{profile?.name?.[0] || user.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <Textarea
                  placeholder={i18n.language === 'vi' ? "Hôm nay bạn thế nào?" : "What's on your mind?"}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[80px] border-none bg-transparent focus-visible:ring-0 resize-none p-0 text-lg"
                />
                
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden h-32">
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex gap-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-primary hover:bg-primary/10 transition-colors font-medium"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {i18n.language === 'vi' ? "Ảnh" : "Photo"}
                    </Button>
                  </div>
                  <Button 
                    onClick={handleCreatePost} 
                    disabled={(!newPost.trim() && selectedImages.length === 0) || isSubmitting}
                    className="rounded-full px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-transform bg-primary text-primary-foreground"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting ? (uploadingImages ? "Đang tải ảnh..." : "Đang đăng...") : (i18n.language === 'vi' ? "Đăng" : "Post")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <AnimatePresence mode="popLayout">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 w-full rounded-xl bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <motion.div 
                key={post.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card className="border-none bg-background/50 backdrop-blur-md shadow-lg ring-1 ring-white/10 hover:ring-primary/20 transition-all duration-300 group">
                  <CardHeader className="p-4 flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback>{post.profiles?.name?.[0] || "A"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{post.profiles?.name || "Admin"}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateLocale })}
                        </p>
                      </div>
                    </div>
                    {user?.id === post.user_id && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    {post.content && (
                      <p className="text-base leading-relaxed whitespace-pre-wrap mb-4">
                        {post.content}
                      </p>
                    )}
                    {post.image_urls && post.image_urls.length > 0 && (
                      <div className={cn(
                        "rounded-xl overflow-hidden grid gap-2",
                        post.image_urls.length === 1 ? "grid-cols-1" : "grid-cols-2"
                      )}>
                        {post.image_urls.map((url, idx) => (
                          <img key={idx} src={url} alt="" className="w-full h-48 md:h-64 object-cover hover:scale-105 transition-transform duration-500 cursor-pointer" />
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-2 border-t border-white/5 flex justify-between">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 flex-1 gap-2">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">{post.likes_count || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary flex-1 gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-xs">0</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500 flex-1 gap-2">
                      <Share2 className="h-4 w-4" />
                      <span className="text-xs">{i18n.language === 'vi' ? "Chia sẻ" : "Share"}</span>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
            
            {posts.length === 0 && (
              <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed">
                <p className="text-muted-foreground italic">
                  {i18n.language === 'vi' ? "Chưa có bài viết nào ở đây." : "No posts yet."}
                </p>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
