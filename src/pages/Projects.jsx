import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Github, ExternalLink, Search, Loader2, Plus, ArrowRight, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    fetchProjects()
  }, [])

  async function fetchProjects() {
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setProjects(data)
    setLoading(false)
  }

  const allTechs = Array.from(new Set(projects.flatMap(p => p.tech_stack || [])))
  
  const filteredProjects = projects.filter(project => {
    const matchesFilter = filter === "all" || project.tech_stack?.includes(filter)
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase()) || 
                         project.description.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const filterCategories = ["all", "React", "Next.js", "TailwindCSS", "Node.js", "Supabase"]

  return (
    <div className="container pt-8 md:pt-14 pb-24 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground text-balance">Dự án cá nhân</h1>
          <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
            Những sản phẩm tâm huyết mà tôi đã thực hiện, từ ý tưởng kiến trúc đến triển khai thực tế.
          </p>
        </div>
        {user && (
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Button asChild className="gap-2 rounded-xl shadow-md">
              <Link to="/projects/new">
                <Plus className="h-4 w-4" aria-hidden="true" /> Thêm dự án
              </Link>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Tìm kiếm dự án…"
            aria-label="Tìm kiếm dự án"
            className="pl-10 h-10 rounded-xl bg-card/60 border-border/80 focus-visible:ring-primary/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Custom Animated Pill Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/50">
          {filterCategories.map((tech) => {
            const isActive = filter === tech
            return (
              <button
                key={tech}
                type="button"
                onClick={() => setFilter(tech)}
                className="relative px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {isActive && (
                  <motion.div
                    layoutId="active-project-filter"
                    className="absolute inset-0 rounded-xl bg-background shadow-sm border border-border/60 z-0"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
                <span className={cn("relative z-10", isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                  {tech === "all" ? "Tất cả" : tech}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              >
                <Card className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-card to-card/60 shadow-sm hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      width="600"
                      height="338"
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                      {project.live_url && (
                        <Button asChild size="sm" className="rounded-xl shadow-lg">
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" /> Live Demo
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-6 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors text-balance">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed text-pretty">
                        {project.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech_stack?.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="secondary" className="rounded-lg text-[10px] font-medium bg-muted/60 text-muted-foreground border-0">
                            {tech}
                          </Badge>
                        ))}
                        {(project.tech_stack?.length > 3) && (
                          <Badge variant="secondary" className="rounded-lg text-[10px] font-medium bg-muted/60 text-muted-foreground border-0">
                            +{project.tech_stack.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {project.github_url && (
                            <a 
                              href={project.github_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              aria-label={`GitHub repo của ${project.title}`}
                              className="text-muted-foreground hover:text-primary p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <Github className="h-4 w-4" aria-hidden="true" />
                            </a>
                          )}
                          {user && (
                            <Link 
                              to={`/projects/${project.id}/edit`} 
                              aria-label={`Chỉnh sửa ${project.title}`}
                              className="text-muted-foreground hover:text-primary p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <Edit className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                        <Link 
                          to={`/projects/${project.id}`} 
                          className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 group/link"
                        >
                          Case Study <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-20 border border-dashed rounded-3xl border-border/60 bg-muted/10">
          <p className="text-lg text-muted-foreground">Không tìm thấy dự án nào khớp với bộ lọc.</p>
        </div>
      )}
    </div>
  )
}
