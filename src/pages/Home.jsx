import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Loader2, Briefcase, GraduationCap } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "react-i18next"

const timeline = [
  {
    title: "Nhân viên chính thức - bộ phận Technical - team Frontend",
    title_en: "Official Member - Technical Dept - Frontend Team",
    organization: "365 EJSC",
    period: "01/04/2026 - 30/09/2026",
    period_en: "01/04/2026 - 30/09/2026",
    description: "Làm việc với React và tham gia các dự án thực tế.",
    description_en: "Working with React and contributing to real-world projects.",
    icon: Briefcase,
  },
  {
    title: "Thực tập sinh Frontend Developer",
    title_en: "Frontend Developer Intern",
    organization: "365 EJSC",
    period: "01/01/2026 - 31/03/2026",
    period_en: "01/01/2026 - 31/03/2026",
    description: "Làm việc với React và tham gia các dự án thực tế.",
    description_en: "Working with React and contributing to real-world projects.",
    icon: Briefcase,
  },
  {
    title: "Học lập trình web",
    title_en: "Self-taught Web Development",
    organization: "Tự học & Khóa học trực tuyến",
    organization_en: "Self-study & Online Courses",
    period: "2025",
    period_en: "2025",
    description: "Nắm vững kiến thức nền tảng HTML, CSS, JS.",
    description_en: "Mastered fundamental concepts in HTML, CSS, JavaScript.",
    icon: GraduationCap,
  },
  {
    title: "Sinh viên ngành Khoa học máy tính",
    title_en: "Computer Science Student",
    organization: "Trường Đại học Cần Thơ (CTU) - Khóa 46",
    organization_en: "Can Tho University (CTU) - Batch 46",
    period: "2020 - 2025",
    period_en: "2020 - 2025",
    description: "Học các kiến thức cơ bản về khoa học máy tính và thuật toán.",
    description_en: "Studied core concepts of computer science, algorithms, and software engineering.",
    icon: GraduationCap,
  },
]

export default function Home() {
  const { t, i18n } = useTranslation()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
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
    <div className="container pt-8 md:pt-16 pb-20 space-y-20">
      {/* Hero Section */}
      <section className="relative flex flex-col-reverse items-center justify-between gap-12 md:flex-row py-8 md:py-16">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="space-y-6"
          >
            <div>
              <p className="text-sm font-semibold tracking-wider text-primary uppercase">{t("home.hero_title")}</p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-6xl text-foreground text-balance">
                {displayName}
              </h1>
              <p className="mt-3 text-xl font-medium text-muted-foreground">{displayTitle}</p>
            </div>

            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-muted-foreground text-pretty">
              {displayBio}
            </p>

            {/* Action Buttons with Spring Feedback */}
            <div className="flex flex-wrap justify-center gap-4 md:justify-start pt-2">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button asChild size="lg" className="rounded-sm px-6 font-semibold">
                  <Link to="/projects">
                    {t("home.view_projects")} <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button asChild variant="outline" size="lg" className="rounded-sm px-6 border-border/80 hover:bg-muted/50">
                  <Link to="/contact">{t("home.contact_me")}</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Hero Avatar with Optical Depth */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative"
        >
          <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-primary/30 via-transparent to-blue-500/20 blur-xl opacity-70" />
          <div className="relative h-64 w-64 overflow-hidden rounded-full border-2 border-border/80 shadow-2xl md:h-80 md:w-80 ring-4 ring-background">
            <img
              src={profile.avatar_url || "/anh_dai_dien.png"}
              alt={displayName}
              width="320"
              height="320"
              fetchPriority="high"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </motion.div>
      </section>

      {/* Timeline Section: Hành trình của tôi */}
      <section className="space-y-12">
        <h2 className="text-3xl font-bold tracking-tight text-center text-foreground">
          {currentLang === 'vi' ? "Hành trình của tôi" : "My Journey"}
        </h2>

        <div className="max-w-3xl mx-auto space-y-8 relative before:absolute before:inset-0 before:left-5 md:before:left-1/2 before:-translate-x-1/2 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {timeline.map((item, index) => {
            const ItemIcon = item.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group select-none"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-primary text-primary-foreground shrink-0 absolute left-5 md:left-1/2 -translate-x-1/2 z-10">
                  <ItemIcon className="h-5 w-5" />
                </div>

                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card/60 backdrop-blur-xs ml-auto md:ml-0 overflow-hidden">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <h3 className="font-bold text-primary text-sm">
                      {currentLang === 'en' && item.title_en ? item.title_en : item.title}
                    </h3>
                    <time className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {currentLang === 'en' && item.period_en ? item.period_en : item.period}
                    </time>
                  </div>
                  <div className="text-xs font-semibold mb-2 text-foreground">
                    {currentLang === 'en' && item.organization_en ? item.organization_en : item.organization}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {currentLang === 'en' && item.description_en ? item.description_en : item.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
