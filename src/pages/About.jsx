import { motion } from "framer-motion"
import { Download, Calendar, Briefcase, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { profileData } from "@/data/profile"
import { skillsData } from "@/data/skills"
import * as LucideIcons from "lucide-react"

const timeline = [
  {
    title: "Thực tập sinh Frontend Developer",
    organization: "365 EJSC",
    period: "2026 - Hiện tại",
    description: "Làm việc với React, TailwindCSS và tham gia các dự án thực tế.",
    icon: Briefcase,
  },
  {
    title: "Học lập trình web",
    organization: "Tự học & Khóa học trực tuyến",
    period: "2025",
    description: "Nắm vững kiến thức nền tảng HTML, CSS, JS.",
    icon: GraduationCap,
  },
  {
    title: "Sinh viên ngành Khoa học máy tính",
    organization: "Trường Đại học Cần Thơ (CTU) - Khóa 46",
    period: "2020 - 2025",
    description: "Học các kiến thức cơ bản về khoa học máy tính và thuật toán.",
    icon: GraduationCap,
  },
]

export default function About() {
  return (
    <div className="container pt-8 md:pt-12">
      <div className="grid gap-8 lg:grid-cols-2">

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold tracking-tight">Giới thiệu về tôi</h1>
          <div className="mt-8 space-y-6 text-lg text-muted-foreground">
            <p>
              Chào bạn! Tôi là {profileData.name}, một người yêu thích lập trình và thiết kế giao diện người dùng.
              Mục tiêu của tôi là trở thành một Senior Frontend Engineer có khả năng xây dựng các ứng dụng phức tạp và mang lại giá trị lớn cho người dùng.
            </p>
            <p>
              Tôi bắt đầu hành trình lập trình của mình từ những năm đại học và nhanh chóng nhận ra niềm đam mê với việc tạo ra những giao diện trực quan sinh động.
              Kể từ đó, tôi đã không ngừng học hỏi và thử nghiệm các công nghệ mới nhất trong hệ sinh thái JavaScript.
            </p>
            <p>
              Với sự tập trung vào hiệu năng, khả năng truy cập (accessibility) và trải nghiệm người dùng,
              tôi luôn cố gắng viết mã nguồn sạch và dễ bảo trì.
            </p>
          </div>
          <Button asChild className="mt-10 rounded-full" size="lg">
            <a href={profileData.cvUrl} download>
              <Download className="mr-2 h-4 w-4" /> Tải CV của tôi
            </a>
          </Button>
        </motion.div>

        <div>
          <h2 className="text-2xl font-bold">Lĩnh vực chuyên môn</h2>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {skillsData.map((skill) => {
              const IconComponent = LucideIcons[skill.icon] || LucideIcons.Code
              return (
                <Card key={skill.name} className="border-none bg-muted/50">
                  <CardContent className="flex items-center p-4 space-x-3">
                    <div className="rounded-md bg-primary/10 p-2 text-primary">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{skill.name}</span>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>


      <section className="mt-32">
        <h2 className="text-3xl font-bold text-center">Hành trình của tôi</h2>
        <div className="mt-16 max-w-3xl mx-auto space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {timeline.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group select-none"
            >

              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2">
                <item.icon className="h-5 w-5" />
              </div>

              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm ml-auto md:ml-0 overflow-hidden">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <h3 className="font-bold text-primary">{item.title}</h3>
                  <time className="text-xs font-medium text-muted-foreground whitespace-nowrap">{item.period}</time>
                </div>
                <div className="text-sm font-semibold mb-2">{item.organization}</div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
