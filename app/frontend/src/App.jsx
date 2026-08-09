import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { Shell } from "@/components/layout/Shell";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Announcements from "@/pages/Announcements";
import CEOMessages from "@/pages/CEOMessages";
import Notices from "@/pages/Notices";
import News from "@/pages/News";
import Employees from "@/pages/Employees";
import Departments from "@/pages/Departments";
import MeetingPlatform from "@/pages/MeetingPlatform";
import SettingsPage from "@/pages/SettingsPage";
import Safety from "@/pages/Safety";
import Leave from "@/pages/Leave";
import Feedback from "@/pages/Feedback";
import Documents from "@/pages/Documents";
import Modules from "@/pages/Modules";
import CalendarModule from "@/pages/CalendarModule";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
});

const moduleRoutes = [
  ["groups", "Project Groups", "Private project workspaces with chat, tasks, docs and meeting rooms."],
  ["projects", "Projects", "Portfolio of active projects across every department."],
  ["calendar", "Team Calendar", "Meetings, deadlines, milestones and minutes of meeting."],
  ["events", "Events", "Company events with RSVP, venue and countdown."],
  ["offices", "Office Locations", "Interactive global map of all 27 locations."],
  ["spotlight", "Spotlights", "Birthdays, anniversaries and top performers."],
  ["market", "Market Intelligence", "Market size, competitors, share and SWOT."],
  ["knowledge", "Knowledge Base", "Semantic search across 12,400 internal documents."],
  ["documents", "Documents", "Repository with folders, tags, versions and previews."],
  ["policies", "Policies & SOP", "Policy library with reading progress and bookmarks."],
  ["handbook", "Employee Handbook", "Interactive chapters and onboarding guidance."],
  ["hr", "HR & Forms", "Leave, travel, expense, reimbursement and recruitment forms."],
  ["holidays", "Holiday Calendar", "Country and department filtered holiday schedule."],
  ["admin", "Admin Console", "Access control, content governance and audit trails."],
];

// Protected Routes Component - requires authentication
function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/ceo" element={<CEOMessages />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/news" element={<News />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/departments" element={<Departments />} />
        <Route path="/meetings" element={<MeetingPlatform />} />
        <Route path="/calendar" element={<CalendarModule slug="calendar" title="Team Calendar" description="Meetings, deadlines, milestones and minutes of meeting." />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/documents" element={<Documents />} />
        {moduleRoutes
          .filter(([slug]) => slug !== "documents")
          .map(([slug, title, desc]) => (
            <Route key={slug} path={`/${slug}`} element={<Modules slug={slug} title={title} description={desc} />} />
          ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  );
}

function LoginVideoOverlay() {
  const navigate = useNavigate();
  const { loginVideoVisible, clearLoginVideo } = useAuth();
  const videoRef = useRef(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (!loginVideoVisible) {
      setVideoError(false);
      return;
    }

    const video = videoRef.current;
    const finishTransition = () => {
      clearLoginVideo();
      navigate("/");
    };

    let fallbackTimer = null;
    let playbackStarted = false;

    const startPlayback = () => {
      if (!video || playbackStarted) return;
      playbackStarted = true;
      video.currentTime = 0;
      video.play().catch(() => {
        setVideoError(true);
        fallbackTimer = window.setTimeout(() => {
          finishTransition();
        }, 3000);
      });
    };

    const resolveVideoDelayMs = () => {
      const duration = Number.isFinite(video?.duration) ? video.duration : 0;
      return duration > 0 ? Math.max(duration * 1000 + 1000, 8000) : 12000;
    };

    const handleEnded = () => {
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
      }
      finishTransition();
    };

    const handleError = () => {
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
      }
      setVideoError(true);
      fallbackTimer = window.setTimeout(() => {
        finishTransition();
      }, 3000);
    };

    if (video) {
      video.addEventListener("ended", handleEnded);
      video.addEventListener("error", handleError);
      video.addEventListener("loadedmetadata", startPlayback);
      video.addEventListener("canplaythrough", startPlayback);

      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.preload = "auto";
      video.src = "/assets/login-intro.mp4";

      fallbackTimer = window.setTimeout(() => {
        finishTransition();
      }, resolveVideoDelayMs());

      if (video.readyState >= 2) {
        startPlayback();
      }
    }

    return () => {
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
      }
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.removeEventListener("ended", handleEnded);
        video.removeEventListener("error", handleError);
        video.removeEventListener("loadedmetadata", startPlayback);
        video.removeEventListener("canplaythrough", startPlayback);
      }
    };
  }, [clearLoginVideo, loginVideoVisible, navigate]);

  if (!loginVideoVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        playsInline
        autoPlay
        preload="auto"
        onError={() => setVideoError(true)}
      />
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
          Loading SyncSphere…
        </div>
      )}
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, loading, loginVideoVisible } = useAuth();

  if (loading) {
    return null;
  }

  if (loginVideoVisible) {
    return <LoginVideoOverlay />;
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}
function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <NotificationsProvider>
                <AppRoutes />
                <Toaster position="top-right" theme="dark" richColors />
              </NotificationsProvider>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
