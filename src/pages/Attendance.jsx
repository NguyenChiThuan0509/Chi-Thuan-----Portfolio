import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Loader2, 
  LogIn, 
  LogOut, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  History,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { format } from "date-fns"
import { vi, enUS } from "date-fns/locale"

export default function Attendance() {
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [todayRecord, setTodayRecord] = useState(null)
  const [history, setHistory] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  const locale = i18n.language === 'vi' ? vi : enUS

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchAttendanceData(session.user.id)
      } else {
        setLoading(false)
      }
    })

    return () => clearInterval(timer)
  }, [])

  async function fetchAttendanceData(userId) {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      
      // Fetch today's record
      const { data: todayData, error: todayError } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      if (todayError) throw todayError
      setTodayRecord(todayData)

      // Fetch history (last 7 days)
      const { data: historyData, error: historyError } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(10)

      if (historyError) throw historyError
      setHistory(historyData)
    } catch (error) {
      console.error("Error fetching attendance:", error)
      toast.error(i18n.language === 'vi' ? "Không thể tải dữ liệu điểm danh" : "Failed to load attendance data")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!user) return
    setActionLoading(true)
    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('attendance')
        .insert([{ 
          user_id: user.id, 
          check_in: now.toISOString(),
          date: today
        }])
        .select()
        .single()

      if (error) throw error
      
      setTodayRecord(data)
      setHistory([data, ...history.filter(h => h.date !== today)])
      toast.success(i18n.language === 'vi' ? "Điểm danh vào thành công!" : "Checked in successfully!")
    } catch (error) {
      toast.error("Lỗi: " + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    if (!user || !todayRecord) return
    setActionLoading(true)
    try {
      const now = new Date()
      
      const { data, error } = await supabase
        .from('attendance')
        .update({ check_out: now.toISOString() })
        .eq('id', todayRecord.id)
        .select()
        .single()

      if (error) throw error
      
      setTodayRecord(data)
      setHistory(history.map(h => h.id === data.id ? data : h))
      toast.success(i18n.language === 'vi' ? "Điểm danh ra thành công!" : "Checked out successfully!")
    } catch (error) {
      toast.error("Lỗi: " + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container max-w-md pt-20 pb-20">
        <Card className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="mb-2">
            {i18n.language === 'vi' ? "Yêu cầu đăng nhập" : "Login Required"}
          </CardTitle>
          <CardDescription className="mb-6">
            {i18n.language === 'vi' 
              ? "Vui lòng đăng nhập để sử dụng chức năng điểm danh hằng ngày." 
              : "Please login to use the daily attendance feature."}
          </CardDescription>
          <Button asChild className="w-full">
            <a href="/login">{i18n.language === 'vi' ? "Đăng nhập ngay" : "Login Now"}</a>
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl pt-8 md:pt-12 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight">
              {i18n.language === 'vi' ? "Điểm danh" : "Attendance"}
            </h1>
            <p className="text-muted-foreground">
              {format(currentTime, "EEEE, dd MMMM yyyy", { locale })}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-full border border-primary/10">
            <Clock className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-2xl font-mono font-bold tracking-wider">
              {format(currentTime, "HH:mm:ss")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 relative overflow-hidden border-primary/10 bg-background/50 backdrop-blur-md">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Calendar className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl">
                {i18n.language === 'vi' ? "Hôm nay" : "Today"}
              </CardTitle>
              <CardDescription>
                {todayRecord 
                  ? (i18n.language === 'vi' ? "Bạn đã bắt đầu ngày làm việc." : "You have started your workday.")
                  : (i18n.language === 'vi' ? "Sẵn sàng để bắt đầu ngày mới chưa?" : "Ready to start your day?")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                    <LogIn className="h-3 w-3" />
                    {i18n.language === 'vi' ? "Giờ vào" : "Check In"}
                  </span>
                  <p className="text-2xl font-bold">
                    {todayRecord?.check_in 
                      ? format(new Date(todayRecord.check_in), "HH:mm") 
                      : "--:--"}
                  </p>
                </div>
                <div className="space-y-2 p-4 rounded-xl bg-primary/5 border border-primary/10">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                    <LogOut className="h-3 w-3" />
                    {i18n.language === 'vi' ? "Giờ ra" : "Check Out"}
                  </span>
                  <p className="text-2xl font-bold">
                    {todayRecord?.check_out 
                      ? format(new Date(todayRecord.check_out), "HH:mm") 
                      : "--:--"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {!todayRecord ? (
                  <Button 
                    size="lg" 
                    className="flex-1 gap-2 h-14 text-lg shadow-lg shadow-primary/20"
                    onClick={handleCheckIn}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                    {i18n.language === 'vi' ? "Điểm danh VÀO" : "Check IN"}
                  </Button>
                ) : !todayRecord.check_out ? (
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="flex-1 gap-2 h-14 text-lg border-primary/20 hover:bg-primary/5"
                    onClick={handleCheckOut}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
                    {i18n.language === 'vi' ? "Điểm danh RA" : "Check OUT"}
                  </Button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 h-14 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-md font-bold">
                    <CheckCircle2 className="h-6 w-6" />
                    {i18n.language === 'vi' ? "Đã hoàn thành ngày làm việc" : "Workday Completed"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-background/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                {i18n.language === 'vi' ? "Gần đây" : "Recent"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
                {history.length > 0 ? (
                  history.map((record) => (
                    <div key={record.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">
                          {format(new Date(record.date), "dd/MM/yyyy")}
                        </span>
                        {record.check_in && record.check_out && (
                          <span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20">
                            Done
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <LogIn className="h-3 w-3" />
                          {record.check_in ? format(new Date(record.check_in), "HH:mm") : "--:--"}
                        </span>
                        <span className="flex items-center gap-1">
                          <LogOut className="h-3 w-3" />
                          {record.check_out ? format(new Date(record.check_out), "HH:mm") : "--:--"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    {i18n.language === 'vi' ? "Chưa có lịch sử" : "No history yet"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 text-sm text-muted-foreground">
          <p className="flex items-center gap-2 font-semibold text-foreground mb-2">
            <Clock className="h-4 w-4 text-primary" />
            {i18n.language === 'vi' ? "Lưu ý" : "Note"}
          </p>
          <ul className="list-disc list-inside space-y-1">
            {i18n.language === 'vi' ? (
              <>
                <li>Bạn chỉ có thể điểm danh vào một lần mỗi ngày.</li>
                <li>Đừng quên điểm danh ra trước khi kết thúc công việc.</li>
                <li>Dữ liệu được lưu trữ bảo mật trên hệ thống.</li>
              </>
            ) : (
              <>
                <li>You can only check in once per day.</li>
                <li>Don't forget to check out before ending your work.</li>
                <li>Data is securely stored on our system.</li>
              </>
            )}
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
