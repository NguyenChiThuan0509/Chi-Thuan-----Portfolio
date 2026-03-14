import { Github, Linkedin, Mail } from "lucide-react"
import { profileData } from "@/data/profile"

export default function Footer() {
  return (
    <footer className="border-t bg-muted/50 py-8">
      <div className="container text-center">
        <div className="mb-4 flex justify-center space-x-6">
          <a
            href={profileData.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href={profileData.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href={`mailto:${profileData.email}`}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {profileData.name}. Mọi quyền được bảo lưu.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Được xây dựng bằng React, TailwindCSS và Shadcn/UI
        </p>
      </div>
    </footer>
  )
}
