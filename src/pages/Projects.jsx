import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Github, ExternalLink, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { projectsData } from "@/data/projects"

export default function Projects() {
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")

  const allTechs = Array.from(new Set(projectsData.flatMap(p => p.techStack)))
  
  const filteredProjects = projectsData.filter(project => {
    const matchesFilter = filter === "all" || project.techStack.includes(filter)
    const matchesSearch = project.title.toLowerCase().includes(search.toLowerCase()) || 
                         project.description.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="container py-16">
      <div className="text-center mb-16 px-4">
        <h1 className="text-4xl font-bold tracking-tight">Dự án cá nhân</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Danh sách các dự án tôi đã thực hiện trong quá trình học tập và làm việc. 
          Mỗi dự án là một cơ hội để tôi rèn luyện kỹ năng và giải quyết các bài toán thực tế.
        </p>
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
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            {["React", "Next.js", "TailwindCSS"].map(tech => (
              <TabsTrigger key={tech} value={tech}>{tech}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

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
              <Card className="flex flex-col h-full overflow-hidden group border-muted shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button asChild variant="secondary" size="sm" className="rounded-full">
                      <a href={project.demo} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="rounded-full bg-white text-black hover:bg-gray-200">
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" /> Code
                      </a>
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6 flex-grow">
                  <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <Badge key={tech} variant="outline" className="bg-primary/5 border-primary/20">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-24">
          <p className="text-xl text-muted-foreground">Không tìm thấy dự án nào khớp với bộ lọc.</p>
          <Button variant="link" onClick={() => {setFilter("all"); setSearch("")}}>
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  )
}
