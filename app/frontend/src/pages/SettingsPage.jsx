import { useState } from "react";
import { Moon, Sun, Bell, Globe, Accessibility, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, Pill } from "@/components/ui-kit/Primitives";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage, useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { COMPANY } from "@/data/mock";

const Toggle = ({ label, hint, value, onChange, testid }) => (
  <div className="flex items-center justify-between gap-4 border-b hairline py-4 last:border-0">
    <div>
      <p className="text-sm">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
    <button
      onClick={() => onChange(!value)}
      data-testid={testid}
      aria-label={label}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 ${
        value ? "border-[hsl(var(--gold)/0.6)] bg-[hsl(var(--gold)/0.25)]" : "hairline bg-[hsl(var(--muted))]"
      }`}
    >
      <span
        className="absolute top-0.5 h-4.5 w-4.5 rounded-full bg-[hsl(var(--gold))] transition-[left] duration-300"
        style={{ left: value ? 22 : 3, width: 18, height: 18 }}
      />
    </button>
  </div>
);

export default function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();
  const { user } = useAuth();
  const [notif, setNotif] = useState({ announcements: true, meetings: true, leave: false, digest: true });
  const [access, setAccess] = useState({ motion: false, contrast: false, large: false });

  const languageOptions = ["English (UK)", "English (US)", "日本語", "Deutsch", "Français", "हिन्दी"];

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    toast.success(`Interface language set to ${lang}`);
  };

  return (
    <div data-testid="settings-page">
      <PageHeader
        overline={t.crewPreferences || "Team preferences"}
        title={t.settings || "Settings"}
        description={t.settingsDescription || "Theme, language, notifications, accessibility, profile and security controls."}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="p-7 lg:col-span-6" testid="settings-appearance">
          <p className="overline mb-5 flex items-center gap-2">{theme === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />} {t.appearance || "Appearance"}</p>
          <div className="flex gap-3">
            {["dark", "light"].map((mode) => (
              <button
                key={mode}
                onClick={() => mode !== theme && toggle()}
                data-testid={`theme-${mode}-btn`}
                className={`flex-1 rounded-xl border p-5 text-left glow-hover ${
                  theme === mode ? "border-[hsl(var(--gold)/0.5)] bg-[hsl(var(--gold)/0.08)]" : "hairline"
                }`}
              >
                <p className="font-display text-lg font-light capitalize">{mode} mode</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {mode === "dark" ? t.darkMode || "Deep obsidian, ambient background" : t.lightMode || "Brushed titanium, daylight palette"}
                </p>
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="p-7 lg:col-span-6" testid="settings-language" delay={0.06}>
          <p className="overline mb-5 flex items-center gap-2"><Globe className="h-3 w-3" /> {t.language || "Language & region"}</p>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map((l) => (
              <Pill key={l} active={language === l} onClick={() => handleLanguageChange(l)} testid={`lang-${l}`}>
                {l}
              </Pill>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{t.timezone || "Time zone follows your campus: Europe/London (BST)."}</p>
        </Panel>

        <Panel className="p-7 lg:col-span-6" testid="settings-notifications" delay={0.1}>
          <p className="overline mb-3 flex items-center gap-2"><Bell className="h-3 w-3" /> {t.notifications || "Notifications"}</p>
          <Toggle label={t.companyAnnouncements || "Company announcements"} hint={t.companyAnnouncementsHint || "Critical broadcasts always deliver."} value={notif.announcements} onChange={(v) => setNotif({ ...notif, announcements: v })} testid="notif-announcements-toggle" />
          <Toggle label={t.meetingReminders || "Meeting reminders"} hint={t.meetingRemindersHint || "10 minutes before start."} value={notif.meetings} onChange={(v) => setNotif({ ...notif, meetings: v })} testid="notif-meetings-toggle" />
          <Toggle label={t.leaveDecisions || "Leave decisions"} value={notif.leave} onChange={(v) => setNotif({ ...notif, leave: v })} testid="notif-leave-toggle" />
          <Toggle label={t.weeklyDigest || "Weekly digest"} value={notif.digest} onChange={(v) => setNotif({ ...notif, digest: v })} testid="notif-digest-toggle" />
        </Panel>

        <Panel className="p-7 lg:col-span-6" testid="settings-accessibility" delay={0.14}>
          <p className="overline mb-3 flex items-center gap-2"><Accessibility className="h-3 w-3" /> {t.accessibility || "Accessibility"}</p>
          <Toggle label={t.reduceMotion || "Reduce motion"} hint={t.reduceMotionHint || "Disables parallax and ambient motion."} value={access.motion} onChange={(v) => setAccess({ ...access, motion: v })} testid="access-motion-toggle" />
          <Toggle label={t.highContrast || "High contrast"} value={access.contrast} onChange={(v) => setAccess({ ...access, contrast: v })} testid="access-contrast-toggle" />
          <Toggle label={t.largerText || "Larger text"} value={access.large} onChange={(v) => setAccess({ ...access, large: v })} testid="access-large-toggle" />
        </Panel>

        <Panel className="p-7 lg:col-span-6" testid="settings-profile" delay={0.18}>
          <p className="overline mb-5 flex items-center gap-2"><User className="h-3 w-3" /> {t.profile || "Profile"}</p>
          <div className="flex items-center gap-4">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center font-bold text-white text-xl ring-1 ring-[hsl(var(--gold)/0.5)]"
              style={{
                backgroundColor: user ? `hsl(${Math.abs(user.name.charCodeAt(0) * 10) % 360}, 70%, 50%)` : "hsl(var(--primary))",
              }}
            >
              {user?.name?.substring(0, 1).toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-display text-lg font-light capitalize">{user?.name || "User"}</p>
              <p className="overline">{user?.email || "user@example.com"}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {[
              [t.displayName || "Display name", user?.name || "User"],
              [t.workEmail || "Work email", user?.email || "user@example.com"],
              [t.desk || "Desk", t.deskLocation || "Novaterra · Remote"],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="overline mb-1">{k}</p>
                <input defaultValue={v} data-testid={`profile-${k.toLowerCase().replace(/\s+/g, "-")}-input`} className="w-full rounded-xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-2.5 text-sm outline-none" />
              </div>
            ))}
          </div>
          <button onClick={() => toast.success(t.profileUpdated || "Profile updated")} data-testid="save-profile-btn" className="mt-6 w-full rounded-full bg-[hsl(var(--gold))] py-3 text-xs font-bold uppercase tracking-widest text-black">
            {t.saveProfile || "Save profile"}
          </button>
        </Panel>

        <Panel className="p-7 lg:col-span-6" testid="settings-security" delay={0.22}>
          <p className="overline mb-5 flex items-center gap-2"><Shield className="h-3 w-3" /> {t.security || "Security"}</p>
          <div className="space-y-3">
            {[
              [t.digitalCampusCredential || "Digital campus credential", t.digitalCampusCredentialStatus || "Provisioned · expires 2027"],
              [t.twoFactorAuthentication || "Two-factor authentication", t.twoFactorAuthenticationStatus || "Hardware key · active"],
              [t.activeSessions || "Active sessions", t.activeSessionsStatus || "3 devices"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-xl border hairline p-4">
                <div>
                  <p className="text-sm">{k}</p>
                  <p className="overline mt-0.5">{v}</p>
                </div>
                <Pill tone="gold">Manage</Pill>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
