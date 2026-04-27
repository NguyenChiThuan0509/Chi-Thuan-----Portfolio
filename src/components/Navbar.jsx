import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Menu, X, Code2, LogIn, LogOut, User, Sparkles, Languages, ChevronDown, MoreHorizontal } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [hoveredPath, setHoveredPath] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  const primaryNav = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.projects"), href: "/projects" },
    { name: t("nav.snippets"), href: "/snippets" },
    { name: t("nav.contact"), href: "/contact" },
  ]

  const secondaryNav = [
    { name: t("nav.now"), href: "/now", icon: LucideIcons.Clock },
    { name: t("nav.feed"), href: "/feed", icon: LucideIcons.Rss },
    { name: t("nav.notes"), href: "/notes", icon: LucideIcons.FileText },
    { name: t("nav.attendance"), href: "/attendance", icon: LucideIcons.CalendarCheck },
    { name: t("nav.guestbook"), href: "/guestbook", icon: LucideIcons.MessageSquare },
  ]

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile()
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile() {
    if (!user?.id) return
    const { data } = await supabase
      .from('profiles')
      .select('name, avatar_url')
      .eq('id', user.id)
      .single()
    if (data) setProfile(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
    navigate("/")
  }

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'vi' ? 'en' : 'vi'
    i18n.changeLanguage(nextLang)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:rotate-12">
            <Code2 className="h-5 w-5" />
            <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-yellow-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <span className="text-lg font-bold tracking-tighter sm:inline-block uppercase">
            Portfolio
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-1">
          <nav className="flex items-center space-x-1 mr-4" onMouseLeave={() => setHoveredPath(null)}>
            {primaryNav.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onMouseEnter={() => setHoveredPath(item.href)}
                  className={cn(
                    "relative px-4 py-1.5 text-sm font-medium transition-colors duration-300",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <span className="relative z-10">{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary/5 rounded-full z-0"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  {hoveredPath === item.href && !isActive && (
                    <motion.div
                      layoutId="nav-hover"
                      className="absolute inset-0 bg-muted/50 rounded-full z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </Link>
              )
            })}

            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onMouseEnter={() => setHoveredPath("more")}
                  className={cn(
                    "relative flex items-center gap-1 px-4 py-1.5 text-sm font-medium transition-colors duration-300 outline-none",
                    secondaryNav.some(item => location.pathname === item.href) 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <span className="relative z-10">{i18n.language === 'vi' ? 'Thêm' : 'More'}</span>
                  <ChevronDown className="h-4 w-4 relative z-10" />
                  {secondaryNav.some(item => location.pathname === item.href) && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary/5 rounded-full z-0"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  {hoveredPath === "more" && !secondaryNav.some(item => location.pathname === item.href) && (
                    <motion.div
                      layoutId="nav-hover"
                      className="absolute inset-0 bg-muted/50 rounded-full z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 glass-card border-primary/10">
                {secondaryNav.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link 
                        to={item.href} 
                        className={cn(
                          "flex items-center gap-2 cursor-pointer w-full",
                          location.pathname === item.href ? "text-primary bg-primary/5" : ""
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          
          <div className="flex items-center space-x-2 pl-4 border-l">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleLanguage}
              className="h-9 w-9 rounded-full transition-transform active:scale-95"
              title={i18n.language === 'vi' ? "Switch to English" : "Chuyển sang Tiếng Việt"}
            >
              <span className="text-[10px] font-bold uppercase">{i18n.language}</span>
            </Button>
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary/20 p-0">
                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                      <AvatarImage src={profile?.avatar_url || "/anh_dai_dien.png"} alt={profile?.name || "User"} />
                      <AvatarFallback>{profile?.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.name || "Admin"}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t("nav.profile")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("nav.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm" className="rounded-full px-4 h-8 text-xs font-semibold">
                <Link to="/login">
                  <LogIn className="mr-1.5 h-3.5 w-3.5" /> {t("nav.login")}
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleLanguage}
            className="h-9 w-9"
          >
            <span className="text-[10px] font-bold uppercase">{i18n.language}</span>
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t bg-background md:hidden overflow-hidden"
          >
            <div className="container py-4 space-y-1">
              {[...primaryNav, ...secondaryNav].map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                    location.pathname === item.href
                      ? "bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-primary"
                  )}
                >
                  {item.icon && <item.icon className="mr-3 h-4 w-4" />}
                  {item.name}
                </Link>
              ))}
              {!user && (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-3 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg"
                >
                  <LogIn className="mr-2 h-4 w-4" /> {t("nav.login")}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
