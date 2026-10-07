import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Code2,
  LogOut,
  User,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { supabase } from "@/lib/supabase"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion, AnimatePresence } from "framer-motion"

export default function Header() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    if (!userId) return
    const { data } = await supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", userId)
      .single()
    if (data) setProfile(data)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  const toggleLanguage = () => {
    const nextLang = i18n.language === "vi" ? "en" : "vi"
    i18n.changeLanguage(nextLang)
  }

  // Direct top-level links across the Navbar
  const navLinks = [
    { title: t("nav.home", "Trang chủ"), href: "/" },
    { title: t("nav.projects", "Dự án"), href: "/projects" },
    { title: t("nav.collections", "Bộ sưu tập"), href: "/collections" },
    { title: t("nav.attendance", "Điểm danh"), href: "/attendance" },
    { title: t("nav.contact", "Liên hệ"), href: "/contact" },
  ]

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-50 w-full h-14 shadow-xs bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-colors">
      <div className="container h-full flex items-center justify-between">
        {/* Left: Brand + Desktop Navigation */}
        <div className="flex items-center gap-4 lg:gap-8 h-full">
          {/* Mobile menu toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden rounded-md shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center group shrink-0" aria-label="Trang chủ">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Code2 className="h-4 w-4" aria-hidden="true" />
            </div>
          </Link>

          {/* Desktop Navigation - Clean, direct links */}
          <nav className="hidden md:flex items-center h-full gap-1 lg:gap-2">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "relative flex items-center h-full px-3 text-sm font-medium transition-colors cursor-pointer select-none",
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  )}
                >
                  <span className="relative z-10">{item.title}</span>
                  {isActive && (
                    <motion.div
                      layoutId="header-active-tab"
                      className="absolute inset-0 pointer-events-none"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      {/* Gradient đổ màu từ dưới lên (đậm hơn ở đáy) */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-primary/10 to-transparent" />
                      {/* Gạch chân nằm ngay mép dưới cùng của header */}
                      <div className="absolute bottom-0 inset-x-0 h-[2.5px] bg-primary rounded-t-full shadow-sm" />
                    </motion.div>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: Actions (Language, Theme, User Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLanguage}
            className="h-8 w-8 rounded-sm transition-transform active:scale-95 shrink-0"
            aria-label={i18n.language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
            title={i18n.language === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
          >
            <span className="text-[11px] font-bold uppercase">{i18n.language}</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Account / Login Button */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full ring-offset-background transition-all hover:bg-muted p-0 shrink-0"
                  aria-label="Menu tài khoản người dùng"
                >
                  <Avatar className="h-8 w-8 border border-border rounded-full">
                    <AvatarImage
                      src={profile?.avatar_url || "/anh_dai_dien.png"}
                      alt={profile?.name || "User avatar"}
                    />
                    <AvatarFallback className="rounded-full text-xs font-semibold">
                      {profile?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-sm border bg-popover/95 backdrop-blur" align="end" sideOffset={8}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.name || "Nguyễn Chí Thuận"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer rounded-sm">
                  <Link to="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>{t("nav.profile")}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer rounded-sm text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("nav.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" className="rounded-sm px-5 h-9 text-sm font-medium shrink-0 shadow-xs transition-all hover:opacity-95">
              <Link to="/login">
                <span>{t("nav.login")}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-14 bg-black/60 backdrop-blur-xs z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed top-14 left-0 right-0 bg-background border-b z-50 p-4 space-y-1 md:hidden max-h-[calc(100vh-3.5rem)] overflow-y-auto"
            >
              {navLinks.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block px-3 py-2 rounded-lg text-sm transition-colors",
                      isActive
                        ? "text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.title}
                  </Link>
                )
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
