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
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link to="/projects">
              <ArrowLeft className="h-4 w-4" /> Tất cả dự án
            </Link>
          </Button>
          {user && (
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link to={`/projects/${id}/edit`}>
                <Edit className="h-4 w-4" /> Chỉnh sửa
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{project.title}</h1>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack?.map((tech) => (
                  <Badge key={tech} variant="secondary" className="px-3 py-1">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>

            <p className="text-xl text-muted-foreground leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              {project.github_url && (
                <Button asChild className="gap-2 rounded-full">
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" /> Xem Source Code
                  </a>
                </Button>
              )}
              {project.live_url && (
                <Button asChild variant="outline" className="gap-2 rounded-full">
                  <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" /> Trải nghiệm thực tế
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative aspect-video overflow-hidden rounded-2xl border bg-background">
              <img 
                src={project.image_url} 
                alt={project.title}
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <CardItem 
            icon={<Target className="h-6 w-6 text-red-500" />} 
            title="Thách thức" 
            content={project.challenge || "Đang cập nhật nội dung..."} 
          />
          <CardItem 
            icon={<Lightbulb className="h-6 w-6 text-yellow-500" />} 
            title="Giải pháp" 
            content={project.solution || "Đang cập nhật nội dung..."} 
          />
          <CardItem 
            icon={<CheckCircle2 className="h-6 w-6 text-green-500" />} 
            title="Kết quả" 
            content={project.result || "Đang cập nhật nội dung..."} 
          />
        </div>

        {project.gallery_urls?.length > 0 && (
          <div className="mt-20 space-y-8">
            <h2 className="text-3xl font-bold text-center">Hình ảnh dự án</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {project.gallery_urls.map((url, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border">
                  <img src={url} alt={`Gallery ${i}`} className="w-full h-auto" />
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
    <div className="p-8 rounded-2xl border bg-card/50 backdrop-blur-sm space-y-4 hover:border-primary/50 transition-colors">
      <div className="p-3 rounded-xl bg-background border w-fit shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {content}
      </p>
    </div>
  )
}
