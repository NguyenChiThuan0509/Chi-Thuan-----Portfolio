import { Link, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import * as LucideIcons from "lucide-react"
import { motion } from "framer-motion"

export default function Sidebar({ isOpen, setIsOpen }) {
  const { t } = useTranslation()
  const location = useLocation()

  const primaryNav = [
    { name: t("nav.home"), href: "/", icon: LucideIcons.Home },
    { name: t("nav.about"), href: "/about", icon: LucideIcons.User },
    { name: t("nav.projects"), href: "/projects", icon: LucideIcons.FolderGit2 },
    { name: t("nav.snippets"), href: "/snippets", icon: LucideIcons.Code2 },
    { name: t("nav.contact"), href: "/contact", icon: LucideIcons.Mail },
  ]

  const secondaryNav = [

    { name: t("nav.feed"), href: "/feed", icon: LucideIcons.Rss },
    { name: t("nav.notes"), href: "/notes", icon: LucideIcons.FileText },
    { name: t("nav.attendance"), href: "/attendance", icon: LucideIcons.CalendarCheck },
    { name: t("nav.guestbook"), href: "/guestbook", icon: LucideIcons.MessageSquare },
  ]

  const renderNavItems = (items) => {
    return items.map((item) => {
      const isActive = location.pathname === item.href
      const Icon = item.icon
      
      return (
        <Link
          key={item.href}
          to={item.href}
          title={!isOpen ? item.name : undefined}
          className={cn(
            "flex items-center rounded-md transition-all duration-200 group relative",
            isOpen ? "px-3 py-3 mx-2 my-1" : "justify-center p-3 mx-2 my-2",
            isActive
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className={cn("shrink-0 transition-colors", isOpen ? "h-5 w-5 mr-4" : "h-6 w-6", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
          
          {isOpen && (
            <span className="truncate text-sm">
              {item.name}
            </span>
          )}
          
          {isActive && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute inset-0 bg-primary/10 rounded-md z-[-1]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </Link>
      )
    })
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out flex flex-col overflow-y-auto",
          // Mobile: hidden when closed, full width/drawer when open
          isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-[72px]"
        )}
      >
        <div className="py-4 flex-1">
          <nav className="space-y-1">
            {renderNavItems(primaryNav)}
          </nav>
          
          <div className="my-4 border-t px-4 py-2">
            {isOpen && (
              <h4 className="mb-2 text-[11px] font-bold text-muted-foreground/70 tracking-tight">
                {t("nav.more", "More")}
              </h4>
            )}
          </div>
          
          <nav className="space-y-1">
            {renderNavItems(secondaryNav)}
          </nav>
        </div>
      </aside>
    </>
  )
}
