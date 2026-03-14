import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, Github, Linkedin, Send, Phone, MapPin } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { profileData } from "@/data/profile"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)


    setTimeout(() => {
      setIsSubmitting(false)
      toast.success("Gửi tin nhắn thành công!", {
        description: "Cảm ơn bạn đã liên hệ. Tôi sẽ sớm phản hồi.",
      })
      setFormData({ name: "", email: "", message: "" })
    }, 1500)
  }

  const contactInfo = [
    { icon: Mail, label: "Email", value: profileData.email, href: `mailto:${profileData.email}` },
    { icon: Phone, label: "Điện thoại", value: "0859 540 412", href: "tel:0859540412" },
    { icon: MapPin, label: "Địa chỉ", value: "Cà Mau, Việt Nam", href: "#" },
    { icon: Github, label: "GitHub", value: "github.com/NguyenChiThuan0509", href: profileData.github },
    { icon: Linkedin, label: "LinkedIn", value: "linkedin.com/in/ncthuan0509", href: profileData.linkedin },
  ]

  return (
    <div className="container py-16">
      <div className="text-center mb-16 px-4">
        <h1 className="text-4xl font-bold tracking-tight">Liên hệ với tôi</h1>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Bạn có ý tưởng dự án hoặc chỉ muốn chào hỏi? Hãy gửi tin nhắn cho tôi qua biểu mẫu bên dưới
          hoặc kết nối với tôi qua các mạng xã hội.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Gửi tin nhắn</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Họ và tên</label>
                  <Input
                    id="name"
                    required
                    placeholder="Nhập họ và tên"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Nội dung tin nhắn</label>
                  <textarea
                    id="message"
                    required
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Nhập nội dung bạn muốn gửi..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Đang gửi..." : (
                    <>
                      Gửi tin nhắn <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>


        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6">Thông tin kết nối</h2>
            <div className="grid gap-4">
              {contactInfo.map((info, index) => (
                <motion.a
                  key={index}
                  href={info.href}
                  target={info.href.startsWith("http") ? "_blank" : undefined}
                  rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  whileHover={{ x: 10 }}
                  className="flex items-center p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors"
                >
                  <div className="rounded-full bg-primary/10 p-3 text-primary mr-4">
                    <info.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{info.label}</p>
                    <p className="font-medium">{info.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-4">Sẵn sàng hợp tác</h3>
              <p className="opacity-90">
                Tôi đang tìm kiếm các cơ hội làm việc Remote hoặc tại văn phòng.
                Đừng ngần ngại liên hệ nếu bạn thấy tôi phù hợp với dự án của mình!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
