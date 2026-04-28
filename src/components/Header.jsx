import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, Code2, LogIn, LogOut, User, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./ThemeToggle"
import { supabase } from "@/lib/supabase"
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

export default function Header({ toggleSidebar }) {
  const { t, i18n } = useTranslation()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

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
    navigate("/")
  }

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'vi' ? 'en' : 'vi'
    i18n.changeLanguage(nextLang)
  }

  return (
    <header className="sticky top-0 z-50 w-full h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 justify-between">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="rounded-full shrink-0"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        
        <Link to="/" className="flex items-center space-x-2 group shrink-0">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:rotate-12">
            <Code2 className="h-5 w-5" />
            <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-yellow-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <span className="text-lg font-bold tracking-tighter hidden sm:inline-block uppercase">
            Portfolio
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleLanguage}
          className="h-9 w-9 rounded-full transition-transform active:scale-95 shrink-0"
          title={i18n.language === 'vi' ? "Switch to English" : "Chuyển sang Tiếng Việt"}
        >
          <span className="text-[10px] font-bold uppercase">{i18n.language}</span>
        </Button>
        
        <ThemeToggle />
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary/20 p-0 shrink-0">
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
          <Button asChild variant="default" size="sm" className="rounded-full px-4 h-8 text-xs font-semibold shrink-0">
            <Link to="/login">
              <LogIn className="mr-1.5 h-3.5 w-3.5" /> 
              <span className="hidden sm:inline">{t("nav.login")}</span>
            </Link>
          </Button>
        )}
      </div>
    </header>
  )
}
