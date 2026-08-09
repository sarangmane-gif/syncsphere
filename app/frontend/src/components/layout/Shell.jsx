import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Bell, Sun, Moon, LogOut, Trash2 } from "lucide-react";
import { NAV_GROUPS } from "./nav";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/context/LanguageContext";
import { useNotifications } from "@/context/NotificationsContext";
import { OdysseyBackground } from "@/components/OdysseyBackground";
import { SafetyDock } from "@/components/safety/SafetyDock";
import { COMPANY } from "@/data/mock";

const SidebarContent = ({ onNavigate }) => {
  const t = useTranslation();
  
  // Map nav labels to translation keys
  const getGroupLabel = (label) => {
    const labelMap = {
      "Command": "command",
      "Communications": "communications",
      "Organization": "organization",
      "Workspace": "workspace",
    };
    return t[labelMap[label]] || label;
  };

  const getItemLabel = (label) => {
    const labelMap = {
      "Dashboard": "dashboard",
      "CEO Messages": "ceo",
      "Announcements": "announcements",
      "Notices": "notices",
      "News": "news",
      "Departments": "departments",
      "Employees": "employees",
      "Meeting Platform": "meetings",
      "Settings": "settings",
      "Safety": "safety",
      "Leave": "leave",
      "Feedback": "feedback",
      "Calendar": "calendar",
    };
    return t[labelMap[label]] || label;
  };

  return (
  <nav className="flex flex-col gap-7 px-5 pb-24 pt-2">
    {NAV_GROUPS.map((group, gi) => (
      <motion.div
        key={group.label}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: gi * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="overline mb-2 pl-3">{getGroupLabel(group.label)}</p>
        <div className="flex flex-col gap-0.5">
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              data-testid={item.testid}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.12)] shadow-[0_0_22px_-6px_hsl(var(--primary)/0.7)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    >
                      <span className="absolute left-0 top-1/2 h-[55%] w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-[hsl(var(--primary))] to-[hsl(var(--secondary))]" />
                    </motion.span>
                  )}
                  <item.icon
                    className={`relative h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                      isActive ? "text-[hsl(var(--primary))]" : ""
                    }`}
                    strokeWidth={1.7}
                  />
                  <span className="relative truncate">{getItemLabel(item.label)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </motion.div>
    ))}
  </nav>
  );
};

export const Shell = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { logout, user } = useAuth();
  const { notifications, removeNotification, clearAll } = useNotifications();
  const t = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/login");
  };

  // Generate avatar from user's name (initials)
  const getAvatarInitials = (name) => {
    return name ? name.substring(0, 1).toUpperCase() : "U";
  };

  const avatarBg = user ? `hsl(${Math.abs(user.name.charCodeAt(0) * 10) % 360}, 70%, 50%)` : "hsl(var(--primary))";

  return (
    <div className="relative min-h-screen">
      <OdysseyBackground />

      <header className="fixed inset-x-0 top-0 z-40 glass border-x-0 border-t-0" data-testid="topbar">
        <div className="mx-auto flex h-16 max-w-[2200px] items-center gap-4 px-4 lg:px-8">
          <button
            className="lg:hidden rounded-md p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(true)}
            data-testid="open-sidebar-btn"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <NavLink to="/" className="flex items-center gap-3 group" data-testid="brand-link">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary)/0.1)]">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
            </span>
            <span className="hidden sm:block">
              <span className="block font-display text-base font-semibold tracking-[0.22em]">
                SYNCSPHERE
              </span>
              <span className="overline">Novaterra Industries</span>
            </span>
          </NavLink>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-full border hairline bg-[hsl(var(--muted)/0.4)] px-4 py-2 transition-colors focus-within:border-[hsl(var(--primary)/0.5)]">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                data-testid="global-search-input"
                placeholder={t.searchPlaceholder || "Search people, docs, projects…"}
                className="w-40 bg-transparent text-xs outline-none placeholder:text-muted-foreground xl:w-64"
              />
            </div>
            <button
              onClick={toggle}
              data-testid="theme-toggle-btn"
              className="rounded-full border hairline p-2 text-muted-foreground transition-colors hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary)/0.5)]"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                data-testid="notifications-btn"
                className="relative rounded-full border hairline p-2 text-muted-foreground transition-colors hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary)/0.5)]"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold))] shadow-[0_0_8px_hsl(var(--gold))]" />
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <motion.div
                      className="fixed inset-0 z-30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-80 glass rounded-xl border hairline shadow-xl max-h-96 overflow-y-auto"
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{ zIndex: 40 }}
                    >
                      <div className="sticky top-0 flex items-center justify-between border-b hairline bg-[hsl(var(--surface)/0.8)] p-4 backdrop-blur">
                        <h3 className="text-sm font-semibold text-white">{t.notifications || "Notifications"}</h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAll}
                            className="text-xs text-muted-foreground hover:text-red-400 flex items-center gap-1 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                            Clear
                          </button>
                        )}
                      </div>
                      {notifications.length > 0 ? (
                        <div className="divide-y divide-white/5">
                          {notifications.map((notif) => (
                            <motion.div
                              key={notif.id}
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="flex items-start gap-3 border-b-0 last:border-b-0 p-4 hover:bg-white/5 transition-colors group cursor-pointer"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white line-clamp-1">{notif.title}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{notif.message}</p>
                                <p className="text-xs text-muted-foreground/70 mt-1">{notif.timestamp}</p>
                              </div>
                              <button
                                onClick={() => removeNotification(notif.id)}
                                className="shrink-0 rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 transition-all"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="h-8 w-8 mx-auto opacity-20 mb-2" />
                          <p className="text-xs text-muted-foreground">No notifications</p>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="relative" data-testid="current-user">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 pl-2 hover:opacity-80 transition-opacity"
              >
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center font-semibold text-white ring-1 ring-[hsl(var(--primary)/0.4)]"
                  style={{ backgroundColor: avatarBg }}
                  title={user?.email}
                >
                  {getAvatarInitials(user?.name)}
                </div>
                <div className="hidden xl:block leading-tight">
                  <p className="text-xs font-semibold capitalize">{user?.name || "Team"}</p>
                  <p className="overline text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
                </div>
              </button>
              
              {/* User Menu Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <motion.div
                      className="fixed inset-0 z-40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-48 glass rounded-xl border hairline p-2 shadow-xl"
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{ zIndex: 50 }}
                    >
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" strokeWidth={1.7} />
                        {t.signOut || "Sign Out"}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <aside
        className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-[268px] overflow-y-auto border-r hairline bg-[hsl(var(--surface)/0.55)] backdrop-blur-xl lg:block"
        data-testid="sidebar"
      >
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/70 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 h-full w-[280px] overflow-y-auto glass pt-16 lg:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              data-testid="mobile-sidebar"
            >
              <button
                className="absolute right-4 top-5 rounded-md p-2 text-muted-foreground"
                onClick={() => setOpen(false)}
                data-testid="close-sidebar-btn"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="pt-16 lg:pl-[268px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.22, 0.8, 0.24, 1] }}
            className="mx-auto max-w-[2200px] px-4 pb-28 pt-8 lg:px-10"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <SafetyDock />
    </div>
  );
};
