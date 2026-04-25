import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Download, Github, Linkedin, Mail } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { profileData } from "@/data/profile"
import { skillsData } from "@/data/skills"
import * as LucideIcons from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('featured', true)
        .limit(3)
      
      if (!error) {
        setProjects(data)
      }
      setLoading(false)
    }
    fetchProjects()
  }, [])

  return (
    <div className="container py-12 md:py-24 space-y-32">

      <section className="flex flex-col-reverse items-center justify-between gap-12 md:flex-row py-8">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-lg font-medium text-primary md:text-xl">Xin chào, tôi là</h2>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">{profileData.name}</h1>
            <p className="mt-4 text-xl font-semibold text-muted-foreground">{profileData.title}</p>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              {profileData.bio}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/projects">
                  Xem dự án <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/contact">Liên hệ ngay</Link>
              </Button>
            </div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-64 w-64 overflow-hidden rounded-full border-4 border-primary/20 md:h-80 md:w-80"
        >
          <img
            src={profileData.avatar}
            alt={profileData.name}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </section>


      <section className="mt-32">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Kỹ năng chuyên môn</h2>
          <p className="mt-4 text-muted-foreground">Các công nghệ và công cụ tôi sử dụng hàng ngày</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {skillsData.map((skill, index) => {
            const IconComponent = LucideIcons[skill.icon] || LucideIcons.Code
            return (
              <motion.div
                key={skill.name}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="flex h-full flex-col items-center justify-center p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                  <IconComponent className="mb-4 h-10 w-10 text-primary" />
                  <span className="font-medium">{skill.name}</span>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </section>


      <section className="mt-32">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dự án tiêu biểu</h2>
          <Button asChild variant="ghost">
            <Link to="/projects" className="flex items-center">
              Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            projects.map((project) => (
              <motion.div key={project.id} whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                <Card className="overflow-hidden shadow-lg">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold">{project.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {project.tech_stack?.map((tech) => (
                        <Badge key={tech} variant="secondary">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-6 flex space-x-4">
                      <Button asChild size="sm" className="flex-1">
                        <a href={project.demo} target="_blank" rel="noopener noreferrer">
                          Demo
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <a href={project.github} target="_blank" rel="noopener noreferrer">
                          GitHub
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </section>


      <section className="mt-32 rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-2xl">
        <h2 className="text-3xl font-bold md:text-5xl">Bạn có dự án mới cần thực hiện?</h2>
        <p className="mt-6 text-xl opacity-90">
          Hãy liên hệ với tôi để cùng nhau tạo ra những sản phẩm tuyệt vời.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button asChild size="lg" variant="secondary" className="rounded-full">
            <Link to="/contact">Liên hệ ngay</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full bg-transparent text-primary-foreground border-primary-foreground hover:bg-white hover:text-primary">
            <a href={profileData.cvUrl} download>
              <Download className="mr-2 h-4 w-4" /> Tải CV
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
