import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Github, Globe, Loader2, Rocket, Lightbulb, Target, CheckCircle2, Edit } from "lucide-react"
import { toast } from "sonner"

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    fetchProject()
  }, [id])

  async function fetchProject() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()
    
    if (data) setProject(data)
    else {
      toast.error("Không tìm thấy dự án")
      navigate("/projects")
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-5xl pt-8 md:pt-12 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild className="gap-2 rounded-xl hover:bg-muted/60">
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Tất cả dự án
            </Link>
          </Button>
          {user && (
            <Button variant="outline" size="sm" asChild className="gap-2 rounded-xl">
              <Link to={`/projects/${id}/edit`}>
                <Edit className="h-4 w-4" aria-hidden="true" /> Chỉnh sửa
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground text-balance">{project.title}</h1>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack?.map((tech) => (
                  <Badge key={tech} variant="secondary" className="px-3 py-1 rounded-lg text-xs font-semibold bg-muted/60 text-muted-foreground border-0">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {project.live_url && (
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/20 px-6 font-semibold">
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" aria-hidden="true" /> Trải nghiệm Demo
                    </a>
                  </Button>
                </motion.div>
              )}
              {project.github_url && (
                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button asChild variant="outline" size="lg" className="gap-2 rounded-xl px-6 border-border/80">
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" aria-hidden="true" /> Source Code
                    </a>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-primary/30 via-transparent to-blue-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-700"></div>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/80 bg-background shadow-2xl">
              <img 
                src={project.image_url} 
                alt={project.title}
                width="800"
                height="450"
                fetchPriority="high"
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          <CardItem 
            icon={<Target className="h-5 w-5 text-red-500" aria-hidden="true" />} 
            title="Thách thức kỹ thuật" 
            content={project.challenge || "Đang cập nhật nội dung…"} 
          />
          <CardItem 
            icon={<Lightbulb className="h-5 w-5 text-amber-500" aria-hidden="true" />} 
            title="Giải pháp kiến trúc" 
            content={project.solution || "Đang cập nhật nội dung…"} 
          />
          <CardItem 
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" aria-hidden="true" />} 
            title="Kết quả đạt được" 
            content={project.result || "Đang cập nhật nội dung…"} 
          />
        </div>

        {project.gallery_urls?.length > 0 && (
          <div className="mt-20 space-y-8">
            <h2 className="text-3xl font-bold text-center text-balance">Hình ảnh dự án</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {project.gallery_urls.map((url, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border/80 shadow-md">
                  <img 
                    src={url} 
                    alt={`Ảnh chi tiết ${i + 1} của dự án ${project.title}`} 
                    width="600"
                    height="338"
                    loading="lazy"
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function CardItem({ icon, title, content }) {
  return (
    <div className="p-7 rounded-2xl border border-border/70 bg-gradient-to-b from-card to-card/50 shadow-sm space-y-4 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      <div className="p-2.5 rounded-xl bg-background border border-border/80 w-fit shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-foreground text-balance">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
        {content}
      </p>
    </div>
  )
}
