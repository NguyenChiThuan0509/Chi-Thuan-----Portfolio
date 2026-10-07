import { Github, Mail } from "lucide-react"
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
            aria-label="GitHub Profile"
            className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md p-1"
          >
            <Github className="h-5 w-5" aria-hidden="true" />
          </a>
          <a
            href={`mailto:${profileData.email}`}
            aria-label="Email Contact"
            className="text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md p-1"
          >
            <Mail className="h-5 w-5" aria-hidden="true" />
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {profileData.name}. Mọi quyền được bảo lưu.
        </p>
      </div>
    </footer>
  )
}
