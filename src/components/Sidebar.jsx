import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import {
  SquareTerminal,
  Bot,
  BookOpen,
  Settings2,
  ChevronRight,
  FolderGit2,
  Code2,
  Plus,
  Image as ImageIcon,
  Rss,
  FileText,
  CalendarCheck,
  PlayCircle,
  MessageSquare,
  Mail,
  User,
  Home
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Sidebar({ isOpen, setIsOpen }) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  // Track which nav group is currently expanded (accordion: only one menu open at a time)
  const [expandedGroup, setExpandedGroup] = useState("projects")

  // Navigation schema matching the shadcn/ui sidebar structure
  const navGroups = [
    {
      id: "projects",
      title: "Playground",
      label: t("nav.projects", "Projects"),
      icon: SquareTerminal,
      items: [
        { title: t("nav.home", "Home"), href: "/", icon: Home },
        { title: t("nav.projects", "All Projects"), href: "/projects", icon: FolderGit2 },
        { title: t("nav.collections", "Collections"), href: "/collections", icon: ImageIcon },
      ],
    },
    {
      id: "snippets",
      title: "Models",
      label: t("nav.snippets", "Snippets"),
      icon: Bot,
      items: [
        { title: t("nav.snippets", "All Snippets"), href: "/snippets", icon: Code2 },
        { title: "New Snippet", href: "/snippets/new", icon: Plus },
      ],
    },
    {
      id: "pages",
      title: "Documentation",
      label: t("nav.about", "Documentation"),
      icon: BookOpen,
      items: [
        { title: t("nav.about", "About Me"), href: "/about", icon: User },
        { title: t("nav.feed", "Feed & Updates"), href: "/feed", icon: Rss },
        { title: t("nav.videos", "Video Lectures"), href: "/videos", icon: PlayCircle },
      ],
    },
    {
      id: "tools",
      title: "Settings",
      label: t("nav.notes", "Tools & More"),
      icon: Settings2,
      items: [
        { title: t("nav.notes", "Notes"), href: "/notes", icon: FileText },
        { title: t("nav.attendance", "Attendance"), href: "/attendance", icon: CalendarCheck },
        { title: t("nav.guestbook", "Guestbook"), href: "/guestbook", icon: MessageSquare },
        { title: t("nav.contact", "Contact"), href: "/contact", icon: Mail },
      ],
    },
  ]

  // Auto expand group if current path is in that group
  useEffect(() => {
    const activeGroup = navGroups.find((group) =>
      group.items.some((item) => item.href === location.pathname)
    )
    if (activeGroup) {
      setExpandedGroup(activeGroup.id)
    }
  }, [location.pathname])

  const toggleGroup = (groupId) => {
    if (!isOpen) {
      setIsOpen(true)
      setExpandedGroup(groupId)
    } else {
      // If clicking already open group, close it (null); otherwise open this group and close all others
      setExpandedGroup((prev) => (prev === groupId ? null : groupId))
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] border-r bg-sidebar bg-background transition-all duration-300 ease-in-out flex flex-col select-none",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0 md:w-16"
        )}
      >

        {/* --- 2. MAIN CONTENT: Collapsible Items --- */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
          <div>
            <nav className="space-y-1">
              {navGroups.map((group) => {
                const isGroupActive = group.items.some(
                  (item) => item.href === location.pathname
                )
                const isExpanded = expandedGroup === group.id
                const Icon = group.icon

                // Collapsed mode: icon with Tooltip / Dropdown flyout
                if (!isOpen) {
                  return (
                    <DropdownMenu key={group.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <button
                              className={cn(
                                "flex h-9 w-full items-center justify-center rounded-md transition-colors text-muted-foreground hover:bg-accent hover:text-foreground",
                                isGroupActive && "bg-accent text-accent-foreground font-semibold"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                          {group.title}
                        </TooltipContent>
                      </Tooltip>

                      <DropdownMenuContent side="right" align="start" sideOffset={12} className="w-48">
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          {group.title}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {group.items.map((subItem) => {
                          const SubIcon = subItem.icon
                          const isSubActive = location.pathname === subItem.href
                          return (
                            <DropdownMenuItem
                              key={subItem.href}
                              asChild
                              className={cn(
                                "cursor-pointer gap-2",
                                isSubActive && "bg-accent font-medium text-accent-foreground"
                              )}
                            >
                              <Link to={subItem.href}>
                                <SubIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>{subItem.title}</span>
                              </Link>
                            </DropdownMenuItem>
                          )
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                }

                // Expanded mode: collapsible accordion with subitem guides
                return (
                  <div key={group.id} className="space-y-0.5">
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className={cn(
                        "flex items-center w-full px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-accent/60 hover:text-foreground group focus-visible:outline-none",
                        isGroupActive && "text-foreground font-semibold"
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="flex-1 text-left text-sm truncate">{group.title}</span>
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-200 group-hover:text-foreground",
                          isExpanded && "rotate-90 text-foreground"
                        )}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="border-l border-border/60 ml-4 pl-3 space-y-0.5 my-1">
                            {group.items.map((subItem) => {
                              const isSubActive = location.pathname === subItem.href
                              return (
                                <Link
                                  key={subItem.href}
                                  to={subItem.href}
                                  className={cn(
                                    "flex items-center px-2 py-1.5 rounded-md text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-accent/40 group",
                                    isSubActive &&
                                      "text-foreground font-medium bg-accent/80 text-primary-foreground"
                                  )}
                                >
                                  <span className={cn("truncate", isSubActive ? "text-primary font-medium" : "text-muted-foreground group-hover:text-foreground")}>
                                    {subItem.title}
                                  </span>
                                </Link>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </nav>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
