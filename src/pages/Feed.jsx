import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Image as ImageIcon, Heart, MessageCircle, Share2, Send, Trash2, X, Loader2, Globe, MoreHorizontal, ThumbsUp, Video, Film } from "lucide-react"
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
  const [userLikes, setUserLikes] = useState(new Set())
  const [activeCommentPost, setActiveCommentPost] = useState(null)
  const [commentText, setCommentText] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [showVideoInput, setShowVideoInput] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const fileInputRef = useRef(null)
  const videoFileInputRef = useRef(null)

  // Helper function to get YouTube/Vimeo embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = url.match(ytRegex);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    
    // Vimeo
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    
    // Direct video link
    const videoExts = ['.mp4', '.webm', '.ogg', '.mov'];
    if (videoExts.some(ext => url.toLowerCase().includes(ext))) return url;
    
    return null;
  };

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

  useEffect(() => {
    if (user && posts.length > 0) {
      fetchUserLikes()
    }
  }, [user, posts])

  async function fetchUserLikes() {
    const { data } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', user.id)
    
    if (data) {
      setUserLikes(new Set(data.map(l => l.post_id)))
    }
  }

  async function handleLike(postId) {
    if (!user) {
      toast.error("Bạn cần đăng nhập để tương tác")
      return
    }

    const isLiked = userLikes.has(postId)
    
    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
        
        const newLikes = new Set(userLikes)
        newLikes.delete(postId)
        setUserLikes(newLikes)
        
        // Optimistic update
        setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 1) - 1 } : p))
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id })
        
        const newLikes = new Set(userLikes)
        newLikes.add(postId)
        setUserLikes(newLikes)
        
        // Optimistic update
        setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p))
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra")
    }
  }

  async function handleComment(postId) {
    if (!user) {
      toast.error("Bạn cần đăng nhập để bình luận")
      return
    }

    if (!commentText.trim()) return

    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: commentText
        })
      
      if (error) throw error
      
      setCommentText("")
      setActiveCommentPost(null)
      toast.success("Đã gửi bình luận")
      // In a real app, we'd fetch or update the comment list here
    } catch (error) {
      toast.error("Không thể gửi bình luận")
    }
  }

  const handleShare = (post) => {
    const url = `${window.location.origin}/feed?post=${post.id}`
    navigator.clipboard.writeText(url)
    toast.success("Đã sao chép liên kết vào bộ nhớ tạm!")
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

  const handleVideoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
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
    if (!newPost.trim() && selectedImages.length === 0 && !videoUrl.trim() && !videoFile) return
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

      let finalVideoUrl = videoUrl.trim() || null
      if (videoFile) {
        finalVideoUrl = await uploadVideo()
      }

      const { error } = await supabase.from("posts").insert([
        {
          content: newPost,
          user_id: user.id,
          image_urls: imageUrls,
          video_url: finalVideoUrl
        },
      ])

      if (error) throw error

      setNewPost("")
      setSelectedImages([])
      setVideoUrl("")
      setVideoFile(null)
      setVideoPreview(null)
      setShowVideoInput(false)
      fetchPosts()
      toast.success("Đã đăng bài thành công!")
    } catch (error) {
      console.error("Error creating post:", error)
      toast.error("Có lỗi xảy ra khi đăng bài")
    } finally {
      setIsSubmitting(false)
      setUploadingImages(false)
      setIsExpanded(false)
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
    <div className="container max-w-xl py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold tracking-tight mb-1 text-primary">
          {t("nav.feed")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {i18n.language === 'vi' ? "Nơi tôi chia sẻ những khoảnh khắc và suy nghĩ hàng ngày." : "Where I share daily moments and thoughts."}
        </p>
      </motion.div>

      {user && (
        <Card className="mb-4 border border-border bg-card shadow-sm overflow-hidden rounded-lg">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{profile?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              
              <div 
                className="flex-1 bg-muted/50 hover:bg-muted transition-colors rounded-full px-4 py-2 cursor-pointer text-muted-foreground text-[15px]"
                onClick={() => setIsExpanded(true)}
              >
                {profile?.name ? `${profile.name.split(' ').pop()} ơi, bạn đang nghĩ gì thế?` : "Bạn đang nghĩ gì thế?"}
              </div>

              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-9 w-9 text-red-500 hover:bg-red-500/10", videoFile && "bg-red-500/10")}
                  onClick={() => {
                    setIsExpanded(true)
                    setTimeout(() => videoFileInputRef.current?.click(), 100)
                  }}
                >
                  <Video className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-green-500 hover:bg-green-500/10" 
                  onClick={() => {
                    setIsExpanded(true)
                    setTimeout(() => fileInputRef.current?.click(), 100)
                  }}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-9 w-9 text-pink-500 hover:bg-pink-500/10", showVideoInput && "bg-pink-500/10")}
                  onClick={() => {
                    setIsExpanded(true)
                    setShowVideoInput(!showVideoInput)
                    setVideoFile(null)
                    setVideoPreview(null)
                  }}
                >
                  <Film className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Expanded section */}
            {isExpanded && (
              <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                <Textarea
                  id="post-textarea"
                  placeholder={i18n.language === 'vi' ? "Viết nội dung..." : "Write something..."}
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="min-h-[120px] border-none bg-transparent focus-visible:ring-0 resize-none px-1 py-2 text-lg mb-4"
                  autoFocus
                />
                
                {showVideoInput && (
                  <div className="mb-4 animate-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-border/50 focus-within:border-primary/50 transition-colors">
                      <Film className="h-4 w-4 text-pink-500 shrink-0" />
                      <input 
                        type="text"
                        placeholder="Dán link YouTube, Vimeo hoặc link video trực tiếp..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm flex-1 outline-none"
                      />
                      {videoUrl && (
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setVideoUrl("")}>
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    {videoUrl && !getEmbedUrl(videoUrl) && (
                      <p className="text-[10px] text-red-500 mt-1 ml-1">Link không hợp lệ hoặc không hỗ trợ</p>
                    )}
                  </div>
                )}
                
                {videoPreview && (
                  <div className="relative group rounded-xl overflow-hidden bg-black mb-4 aspect-video border border-border/50">
                    <video src={videoPreview} className="w-full h-full object-contain" controls />
                    <button 
                      onClick={removeVideo}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-[10px] backdrop-blur-sm">
                      Video đã chọn: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                )}
                
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {selectedImages.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden h-40">
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => { setIsExpanded(false); setNewPost(""); setSelectedImages([]); setVideoUrl(""); setShowVideoInput(false); }}>
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleCreatePost} 
                    disabled={(!newPost.trim() && selectedImages.length === 0 && !videoUrl.trim() && !videoFile) || isSubmitting || (videoUrl.trim() && !getEmbedUrl(videoUrl))}
                    className="rounded-md px-8 py-2 bg-primary text-primary-foreground font-semibold"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    {isSubmitting ? "Đang đăng..." : "Đăng bài"}
                  </Button>
                </div>
              </div>
            )}
            
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageSelect}
            />

            <input 
              type="file" 
              accept="video/*" 
              className="hidden" 
              ref={videoFileInputRef}
              onChange={handleVideoSelect}
            />
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
            <div className="space-y-4">
            {posts.map((post) => (
              <motion.div 
                key={post.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                layout
              >
                <Card className="border border-border bg-card shadow-sm hover:border-primary/30 transition-all duration-300 rounded-md">
                  <CardHeader className="p-4 flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.profiles?.avatar_url} />
                        <AvatarFallback>{post.profiles?.name?.[0] || "A"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm hover:underline cursor-pointer">{post.profiles?.name || "Admin"}</p>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: dateLocale })}</span>
                          <span>•</span>
                          <Globe className="h-3 w-3" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {user?.id === post.user_id && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-muted"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className={cn("px-0 pb-0 pt-0 overflow-hidden", !post.image_urls?.length && !post.video_url && post.content?.length < 120 && post.content?.length > 0 && "bg-gradient-to-br from-primary to-blue-600 min-h-[240px] flex items-center justify-center px-8 text-center")}>
                    {post.content && (
                      <p className={cn(
                        "whitespace-pre-wrap",
                        !post.image_urls?.length && !post.video_url && post.content?.length < 120 
                          ? "text-xl md:text-2xl font-bold text-white" 
                          : "text-sm md:text-base px-4 py-3 leading-normal"
                      )}>
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
                    {post.video_url && getEmbedUrl(post.video_url) && (
                      <div className="aspect-video w-[92%] mx-auto mt-3 mb-3 bg-black overflow-hidden rounded-xl border border-border/50 shadow-sm">
                        {getEmbedUrl(post.video_url).includes('youtube.com') || getEmbedUrl(post.video_url).includes('player.vimeo.com') ? (
                          <iframe
                            src={getEmbedUrl(post.video_url)}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Video Player"
                          ></iframe>
                        ) : (
                          <video 
                            src={post.video_url} 
                            className="w-full h-full object-contain" 
                            controls 
                            playsInline
                          />
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col items-stretch p-0">
                    <div className="px-4 py-2 flex justify-between items-center text-[12px] text-muted-foreground border-b border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 hover:underline cursor-pointer">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>{post.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:underline cursor-pointer">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>{0}</span>
                        </div>
                      </div>
                      <div className="flex items-center -space-x-1">
                        <div className="bg-primary rounded-full p-0.5 border border-background z-10">
                          <ThumbsUp className="h-2 w-2 text-white" fill="currentColor" />
                        </div>
                        <div className="bg-red-500 rounded-full p-0.5 border border-background">
                          <Heart className="h-2 w-2 text-white" fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="p-1 flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "flex-1 gap-2 h-9 text-sm transition-colors",
                          userLikes.has(post.id) ? "text-primary hover:bg-primary/5" : "text-muted-foreground hover:bg-muted"
                        )}
                        onClick={() => handleLike(post.id)}
                      >
                        <ThumbsUp className={cn("h-4 w-4", userLikes.has(post.id) && "fill-current")} />
                        <span>{i18n.language === 'vi' ? "Thích" : "Like"}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "text-muted-foreground hover:bg-muted flex-1 gap-2 h-9 text-sm",
                          activeCommentPost === post.id && "bg-muted text-foreground"
                        )}
                        onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{i18n.language === 'vi' ? "Bình luận" : "Comment"}</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground hover:bg-muted flex-1 gap-2 h-9 text-sm"
                        onClick={() => handleShare(post)}
                      >
                        <Share2 className="h-4 w-4" />
                        <span>{i18n.language === 'vi' ? "Chia sẻ" : "Share"}</span>
                      </Button>
                    </div>

                    {activeCommentPost === post.id && (
                      <div className="p-3 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={profile?.avatar_url} />
                            <AvatarFallback>{profile?.name?.[0] || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex gap-2">
                            <Textarea
                              placeholder={i18n.language === 'vi' ? "Viết bình luận..." : "Write a comment..."}
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              className="min-h-[36px] max-h-[120px] py-1.5 px-3 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 text-sm resize-none rounded-xl"
                            />
                            <Button 
                              size="icon" 
                              className="h-8 w-8 shrink-0 rounded-full"
                              disabled={!commentText.trim()}
                              onClick={() => handleComment(post.id)}
                            >
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
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
