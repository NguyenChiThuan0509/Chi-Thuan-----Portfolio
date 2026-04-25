import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Download, Github, Linkedin, Mail, Loader2 } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { skillsData } from "@/data/skills"
import * as LucideIcons from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "react-i18next"

export default function Home() {
  const { t, i18n } = useTranslation()
  const [projects, setProjects] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .limit(3)
      
      if (projectsData) setProjects(projectsData)

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
      
      if (profileData) setProfile(profileData)
      
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading || !profile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentLang = i18n.language
  const displayName = currentLang === 'en' && profile.name_en ? profile.name_en : profile.name
  const displayTitle = currentLang === 'en' && profile.title_en ? profile.title_en : profile.title
  const displayBio = currentLang === 'en' && profile.bio_en ? profile.bio_en : profile.bio

  return (
    <div className="container pt-8 md:pt-12 space-y-12">
      <section className="flex flex-col-reverse items-center justify-between gap-12 md:flex-row py-4">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-lg font-medium text-primary md:text-xl">{t("home.hero_title")}</h2>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">{displayName}</h1>
            <p className="mt-4 text-xl font-semibold text-muted-foreground">{displayTitle}</p>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              {displayBio}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/projects">
                  {t("home.view_projects")} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/contact">{t("home.contact_me")}</Link>
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
            src={profile.avatar_url || "/anh_dai_dien.png"}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </section>

      <section className="mt-32">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            {currentLang === 'vi' ? "Kỹ năng chuyên môn" : "Professional Skills"}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {currentLang === 'vi' ? "Các công nghệ và công cụ tôi sử dụng hàng ngày" : "Technologies and tools I use every day"}
          </p>
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
          <h2 className="text-3xl font-bold tracking-tight">
            {currentLang === 'vi' ? "Dự án tiêu biểu" : "Featured Projects"}
          </h2>
          <Button asChild variant="ghost">
            <Link to="/projects" className="flex items-center">
              {currentLang === 'vi' ? "Xem tất cả" : "View All"} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <motion.div key={project.id} whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
              <Card className="overflow-hidden shadow-lg h-full flex flex-col">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <CardContent className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold">{project.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 mb-6">
                    {project.tech_stack?.slice(0, 3).map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto flex space-x-4">
                    <Button asChild size="sm" className="flex-1" variant="outline">
                      <Link to={`/projects/${project.id}`}>
                        Case Study
                      </Link>
                    </Button>
                    {project.live_url && (
                      <Button asChild size="sm" className="flex-1">
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                          Live Demo
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mt-32 rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-2xl">
        <h2 className="text-3xl font-bold md:text-5xl">
          {currentLang === 'vi' ? "Bạn có dự án mới cần thực hiện?" : "Have a project in mind?"}
        </h2>
        <p className="mt-6 text-xl opacity-90">
          {currentLang === 'vi' 
            ? "Hãy liên hệ với tôi để cùng nhau tạo ra những sản phẩm tuyệt vời." 
            : "Let's work together to build something amazing."}
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button asChild size="lg" variant="secondary" className="rounded-full">
            <Link to="/contact">{t("home.contact_me")}</Link>
          </Button>
          {profile.cv_url && (
            <Button asChild size="lg" variant="outline" className="rounded-full bg-transparent text-primary-foreground border-primary-foreground hover:bg-white hover:text-primary">
              <a href={profile.cv_url} download>
                <Download className="mr-2 h-4 w-4" /> {currentLang === 'vi' ? "Tải CV" : "Download CV"}
              </a>
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}
