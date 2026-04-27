import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import RootLayout from "@/layouts/RootLayout"
import Home from "@/pages/Home"
import About from "@/pages/About"
import Projects from "@/pages/Projects"
import Contact from "@/pages/Contact"
import Login from "@/pages/Login"
import Profile from "@/pages/Profile"
import Snippets from "@/pages/Snippets"
import SnippetDetail from "@/pages/SnippetDetail"
import SnippetEditor from "@/pages/SnippetEditor"
import ProjectDetail from "@/pages/ProjectDetail"
import ProjectEditor from "@/pages/ProjectEditor"
import Now from "@/pages/Now"
import Feed from "@/pages/Feed"
import Notes from "@/pages/Notes"
import Attendance from "@/pages/Attendance"
import Guestbook from "@/pages/Guestbook"


function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="projects/new" element={<ProjectEditor />} />
            <Route path="projects/:id/edit" element={<ProjectEditor />} />
            <Route path="/now" element={<Now />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/guestbook" element={<Guestbook />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/snippets" element={<Snippets />} />
            <Route path="/snippets/:id" element={<SnippetDetail />} />
            <Route path="/snippets/new" element={<SnippetEditor />} />
            <Route path="/snippets/:id/edit" element={<SnippetEditor />} />
            <Route path="/login" element={<Login />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
