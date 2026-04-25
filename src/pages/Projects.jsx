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

  return (
    <div className="container pt-8 md:pt-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Dự án cá nhân</h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
            Những sản phẩm tâm huyết mà tôi đã thực hiện, từ ý tưởng đến triển khai thực tế.
          </p>
        </div>
        {user && (
          <Button asChild className="gap-2">
            <Link to="/projects/new">
              <Plus className="h-4 w-4" /> Thêm dự án
            </Link>
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm dự án..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" className="w-full md:w-auto overflow-x-auto" onValueChange={setFilter}>
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            {["React", "Next.js", "TailwindCSS", "Node.js"].map(tech => (
              <TabsTrigger key={tech} value={tech}>{tech}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="flex flex-col h-full overflow-hidden group border-muted shadow-sm hover:shadow-xl transition-all duration-500 rounded-2xl">
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      {project.live_url && (
                        <Button asChild variant="secondary" size="sm" className="rounded-full">
                          <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-6 flex-grow flex flex-col">
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.tech_stack?.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="bg-primary/5 border-primary/20 text-[10px] uppercase tracking-wider">
                            {tech}
                          </Badge>
                        ))}
                        {(project.tech_stack?.length > 3) && (
                          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-[10px]">
                            +{project.tech_stack.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {project.github_url && (
                          <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <Github className="h-5 w-5" />
                          </a>
                        )}
                        {user && (
                          <Link to={`/projects/${project.id}/edit`} className="text-muted-foreground hover:text-primary transition-colors">
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" asChild className="group/btn px-0 hover:bg-transparent">
                        <Link to={`/projects/${project.id}`} className="gap-1 font-bold text-primary">
                          Xem Case Study <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-24">
          <p className="text-xl text-muted-foreground">Không tìm thấy dự án nào khớp với bộ lọc.</p>
        </div>
      )}
    </div>
  )
}
