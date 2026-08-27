import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Image as ImageIcon,
  Upload,
  Loader2,
  Trash2,
  Maximize2,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Link2,
  AlertTriangle,
  X
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { id: "all", label: "Tất cả" },
  { id: "Thiết kế", label: "Thiết kế" },
  { id: "Công nghệ", label: "Công nghệ" },
  { id: "Góc làm việc", label: "Góc làm việc" },
  { id: "Kỷ niệm", label: "Kỷ niệm" },
  { id: "Khác", label: "Khác" },
]

export default function Collections() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [user, setUser] = useState(null)

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Thiết kế")
  const [customCategory, setCustomCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [uploadMethod, setUploadMethod] = useState("file") // 'file' | 'url'
  const fileInputRef = useRef(null)

  // Lightbox view state
  const [selectedItem, setSelectedItem] = useState(null)

  // Custom Delete Confirmation Modal state
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
    fetchCollections()
  }, [])

  async function fetchCollections() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setItems(data || [])
    } catch (err) {
      console.error("Error fetching collections:", err)
      toast.error("Không thể tải bộ sưu tập: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh")
      return
    }

    // Limit 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 10MB")
      return
    }

    setImageFile(file)
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setCategory("Thiết kế")
    setCustomCategory("")
    setImageUrl("")
    setImageFile(null)
    setPreviewUrl("")
    setUploadMethod("file")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề")
      return
    }

    let finalImageUrl = imageUrl.trim()

    setIsUploading(true)
    try {
      if (uploadMethod === "file" && imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `collection_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
        const filePath = `collections/${fileName}`

        // Try upload to posts or avatars bucket
        const { error: uploadError } = await supabase.storage
          .from("posts")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          // Fallback to avatars bucket if posts fails
          const { error: fallbackError } = await supabase.storage
            .from("avatars")
            .upload(filePath, imageFile)

          if (fallbackError) throw uploadError
          const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(filePath)
          finalImageUrl = publicData.publicUrl
        } else {
          const { data: publicData } = supabase.storage.from("posts").getPublicUrl(filePath)
          finalImageUrl = publicData.publicUrl
        }
      }

      if (!finalImageUrl) {
        toast.error("Vui lòng tải lên hình ảnh hoặc nhập link ảnh")
        setIsUploading(false)
        return
      }

      const selectedCat = category === "Khác" && customCategory.trim() ? customCategory.trim() : category

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        image_url: finalImageUrl,
        category: selectedCat || "Chung",
        user_id: user?.id || null,
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("collections")
        .insert([payload])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setItems((prev) => [data[0], ...prev])
      } else {
        await fetchCollections()
      }

      toast.success("Đã thêm vào bộ sưu tập thành công!")
      setIsUploadOpen(false)
      resetForm()
    } catch (err) {
      console.error("Error creating collection item:", err)
      toast.error("Lỗi khi thêm: " + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  // Open custom confirmation modal
  const openDeleteConfirm = (e, item) => {
    e?.stopPropagation()
    setItemToDelete(item)
  }

  // Confirm delete from custom modal
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      const { error } = await supabase.from("collections").delete().eq("id", itemToDelete.id)
      if (error) throw error

      setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id))
      if (selectedItem?.id === itemToDelete.id) setSelectedItem(null)
      toast.success("Đã xóa khỏi bộ sưu tập")
      setItemToDelete(null)
    } catch (err) {
      console.error("Error deleting collection item:", err)
      toast.error("Lỗi khi xóa: " + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === "all" || item.category === activeCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="container pt-8 md:pt-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <Layers className="h-3.5 w-3.5" />
            Bộ sưu tập
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Bộ sưu tập hình ảnh</h1>
          <p className="mt-2 text-base sm:text-lg text-muted-foreground">
            Lưu giữ và chia sẻ những hình ảnh, thiết kế và khoảnh khắc ấn tượng.
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm()
            setIsUploadOpen(true)
          }}
          className="gap-2 rounded-sm shadow-sm hover:shadow transition-all self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Thêm ảnh mới
        </Button>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tiêu đề, mô tả, thể loại..."
            className="pl-10 rounded-sm bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={activeCategory === cat.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "rounded-sm text-xs font-medium whitespace-nowrap transition-all",
                activeCategory === cat.id ? "shadow-sm" : "hover:bg-muted"
              )}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Gallery Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Đang tải bộ sưu tập...</p>
        </div>
      ) : filteredItems.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
        >
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="group"
              >
                {/* Card with rounded-sm bo góc */}
                <div className="h-full flex flex-col rounded-sm border border-border/70 bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 overflow-hidden">
                  {/* Image Container with rounded-t-sm */}
                  <div
                    className="relative aspect-[4/3] w-full overflow-hidden bg-muted cursor-pointer rounded-t-sm"
                    onClick={() => setSelectedItem(item)}
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient Overlay & Hover Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                      <span className="text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm bg-black/40 px-2 py-1 rounded-sm">
                        <Maximize2 className="h-3 w-3" /> Xem ảnh lớn
                      </span>

                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-7 w-7 rounded-sm opacity-90 hover:opacity-100 shadow"
                        onClick={(e) => openDeleteConfirm(e, item)}
                        title="Xóa khỏi bộ sưu tập"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Category Badge */}
                    {item.category && (
                      <div className="absolute top-2.5 left-2.5">
                        <Badge
                          variant="secondary"
                          className="rounded-sm bg-background/85 backdrop-blur-md text-xs font-normal border border-border/50 text-foreground"
                        >
                          {item.category}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        onClick={() => setSelectedItem(item)}
                        className="font-semibold text-base leading-snug line-clamp-2 hover:text-primary cursor-pointer transition-colors"
                        title={item.title}
                      >
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span>
                          {new Date(item.created_at || Date.now()).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 px-4 rounded-sm border border-dashed border-border/80 bg-card/40">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
            <ImageIcon className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Chưa có ảnh nào trong bộ sưu tập</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            {search || activeCategory !== "all"
              ? "Không tìm thấy ảnh phù hợp với tiêu chí tìm kiếm hoặc lọc."
              : "Hãy bắt đầu thêm những bức ảnh đầu tiên vào bộ sưu tập của bạn."}
          </p>
          <Button
            onClick={() => {
              resetForm()
              setIsUploadOpen(true)
            }}
            className="rounded-sm gap-2"
          >
            <Plus className="h-4 w-4" /> Thêm ảnh ngay
          </Button>
        </div>
      )}

      {/* Upload Modal Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-lg rounded-sm p-6">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Thêm ảnh vào bộ sưu tập
            </DialogTitle>
            <DialogDescription>
              Tải lên hình ảnh và tiêu đề để lưu trữ vào bộ sưu tập của bạn.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Title Input */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-sm font-medium">
                Tiêu đề ảnh <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Nhập tiêu đề cho hình ảnh..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="rounded-sm"
              />
            </div>

            {/* Upload Method Tabs */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hình ảnh</Label>
              <div className="flex rounded-sm p-1 bg-muted">
                <button
                  type="button"
                  onClick={() => setUploadMethod("file")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-sm transition-all flex items-center justify-center gap-1.5",
                    uploadMethod === "file"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Upload className="h-3.5 w-3.5" /> Tải từ máy tính
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod("url")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-sm transition-all flex items-center justify-center gap-1.5",
                    uploadMethod === "url"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Link2 className="h-3.5 w-3.5" /> Dán link URL
                </button>
              </div>

              {uploadMethod === "file" ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  {!previewUrl ? (
                    <label
                      htmlFor="file-upload"
                      className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-sm p-6 flex flex-col items-center justify-center cursor-pointer bg-muted/20 hover:bg-muted/40 text-center group"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                      <p className="text-sm font-medium">Bấm để chọn file ảnh hoặc kéo thả vào đây</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP, GIF (tối đa 10MB)</p>
                    </label>
                  ) : (
                    <div className="relative rounded-sm overflow-hidden border border-border group aspect-video bg-muted flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Xem trước"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label
                          htmlFor="file-upload"
                          className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-sm cursor-pointer hover:bg-primary/90"
                        >
                          Thay đổi ảnh
                        </label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="rounded-sm text-xs h-8"
                          onClick={() => {
                            setImageFile(null)
                            setPreviewUrl("")
                            if (fileInputRef.current) fileInputRef.current.value = ""
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value)
                      setPreviewUrl(e.target.value)
                    }}
                    className="rounded-sm"
                  />
                  {previewUrl && (
                    <div className="relative rounded-sm overflow-hidden border border-border aspect-video bg-muted flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Xem trước URL"
                        onError={() => toast.error("Không thể tải link ảnh này")}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Category selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-sm font-medium">
                  Thể loại
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 rounded-sm border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="Thiết kế">Thiết kế</option>
                  <option value="Công nghệ">Công nghệ</option>
                  <option value="Góc làm việc">Góc làm việc</option>
                  <option value="Kỷ niệm">Kỷ niệm</option>
                  <option value="Khác">Khác (tùy chỉnh)</option>
                </select>
              </div>

              {category === "Khác" && (
                <div className="space-y-1.5">
                  <Label htmlFor="custom-category" className="text-sm font-medium">
                    Tên thể loại mới
                  </Label>
                  <Input
                    id="custom-category"
                    placeholder="VD: Nhiếp ảnh, Đời sống..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="rounded-sm"
                  />
                </div>
              )}
            </div>

            {/* Description (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô tả / Ghi chú <span className="text-xs text-muted-foreground">(tùy chọn)</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Ghi chú ngắn về hình ảnh này..."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-sm resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadOpen(false)}
                disabled={isUploading}
                className="rounded-sm"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isUploading || (!imageFile && !imageUrl)}
                className="rounded-sm gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tải lên...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Thêm vào bộ sưu tập
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lightbox / Full-screen View Modal */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden rounded-sm bg-background/95 backdrop-blur-xl border border-border">
          {selectedItem && (
            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              {/* Large Image Preview */}
              <div className="flex-1 bg-black/90 flex items-center justify-center p-2 relative overflow-hidden min-h-[300px] md:min-h-[500px]">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  className="max-h-[85vh] w-auto max-w-full object-contain"
                />
              </div>

              {/* Sidebar Info */}
              <div className="w-full md:w-80 p-5 flex flex-col justify-between bg-card border-t md:border-t-0 md:border-l border-border">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="rounded-sm">
                      {selectedItem.category || "Chung"}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(selectedItem.created_at || Date.now()).toLocaleDateString("vi-VN")}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold leading-tight">{selectedItem.title}</h2>
                    {selectedItem.description && (
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {selectedItem.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full rounded-sm gap-2 text-xs"
                    asChild
                  >
                    <a href={selectedItem.image_url} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-3.5 w-3.5" /> Mở / Tải ảnh gốc
                    </a>
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-full rounded-sm gap-2 text-xs"
                    onClick={(e) => openDeleteConfirm(e, selectedItem)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Xóa ảnh này
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Custom Delete Confirmation Modal */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && !isDeleting && setItemToDelete(null)}>
        <DialogContent className="sm:max-w-md rounded-sm p-6">
          <DialogHeader className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold">Xác nhận xóa hình ảnh</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground text-sm pt-2">
              Bạn có chắc chắn muốn xóa hình ảnh{" "}
              <span className="font-semibold text-foreground">"{itemToDelete?.title}"</span> khỏi bộ sưu tập?
              <br />
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>

          {itemToDelete?.image_url && (
            <div className="my-2 rounded-sm overflow-hidden border border-border/80 aspect-video w-full max-w-[240px] mx-auto bg-muted">
              <img
                src={itemToDelete.image_url}
                alt={itemToDelete.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <DialogFooter className="flex sm:justify-center gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setItemToDelete(null)}
              disabled={isDeleting}
              className="rounded-sm flex-1 sm:flex-initial min-w-[100px]"
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-sm gap-2 flex-1 sm:flex-initial min-w-[120px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" /> Xác nhận xóa
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
