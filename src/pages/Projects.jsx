import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { Link } from "react-router-dom"

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
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
            <Button asChild className="gap-2 rounded-sm shadow-md">
              <Link to="/projects/new">
                <Plus className="h-4 w-4" aria-hidden="true" /> Thêm dự án
              </Link>
            </Button>
          </motion.div>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <Link
                  to={`/projects/${project.id}`}
                  className="group h-full flex flex-col rounded-sm border border-border/70 bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted rounded-t-sm">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="text-center py-20 border border-dashed rounded-sm border-border/60 bg-muted/10">
          <p className="text-lg text-muted-foreground">Chưa có dự án nào.</p>
        </div>
      )}
    </div>
  )
}
