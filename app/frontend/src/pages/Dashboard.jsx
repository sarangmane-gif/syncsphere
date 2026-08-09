import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight, Clock, CloudSun, Video, Zap, Megaphone, PlaneTakeoff,
  FileText, Users, Palmtree, Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/context/LanguageContext";
import { PageHeader, Panel, Stat } from "@/components/ui-kit/Primitives";
import { NoticeBillboard } from "@/components/dashboard/NoticeBillboard";
import {
  COMPANY, IMAGES, STATS, GROWTH, CEO_MESSAGES, NEWS, MEETINGS_TODAY,
  HOLIDAYS, SPOTLIGHTS, WORLD_CLOCKS, WEATHER, OFFICES,
} from "@/data/mock";
import { getAnnouncements } from "@/lib/api";

const QUICK_ACTIONS = [
  { label: "Request Leave", icon: PlaneTakeoff, to: "/leave", testid: "quick-leave" },
  { label: "Join Meeting", icon: Video, to: "/meetings", testid: "quick-meeting" },
  { label: "Post Notice", icon: Megaphone, to: "/announcements", testid: "quick-announce" },
  { label: "Find People", icon: Users, to: "/employees", testid: "quick-crew" },
  { label: "Open Documents", icon: FileText, to: "/documents", testid: "quick-docs" },
  { label: "Holidays", icon: Palmtree, to: "/holidays", testid: "quick-holidays" },
];

const Clocks = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="grid grid-cols-2 gap-4" data-testid="world-clocks">
      {WORLD_CLOCKS.map((c) => (
        <div key={c.city} className="rounded-xl border hairline p-3">
          <p className="overline">{c.city}</p>
          <p className="mt-1 font-mono text-lg gold-text">
            {now.toLocaleTimeString("en-GB", { timeZone: c.tz, hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      ))}
    </div>
  );
};

function CreditModal({ variant, onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const isTeam = variant === "team";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md overflow-hidden rounded-2xl border hairline glass shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b hairline px-5 py-4">
          <div>
            <p className="overline">{isTeam ? "SyncSphere" : "Project"}</p>
            <h3 className="mt-1 font-display text-xl font-light">{isTeam ? "SYNCSPHERE TEAM" : "PROJECT CREATOR"}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border hairline p-2 text-muted-foreground transition hover:border-[hsl(var(--primary)/0.35)] hover:text-foreground">
            ×
          </button>
        </div>

        <div className="p-5 text-sm text-muted-foreground">
          {isTeam ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[hsl(var(--gold))]">Team Members</p>
              <div className="mt-4 space-y-2">
                {[
                  { name: "Arpita", role: "Business Development Associate" },
                  { name: "Kartik", role: "Brand and Marketing Strategist" },
                  { name: "Anusha", role: "Client Relationship Manager" },
                  { name: "Rishit", role: "Technology & Implementation Associate" },
                  { name: "Nirzar", role: "Operations Associate" },
                ].map((person) => (
                  <div key={person.name} className="flex items-center justify-between rounded-xl border hairline bg-[hsl(var(--surface)/0.45)] px-3 py-2.5 text-sm text-foreground/85">
                    <span>{person.name}</span>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{person.role}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[hsl(var(--gold))]">Creator & Lead Developer</p>
              <div className="mt-4 rounded-xl border hairline bg-[hsl(var(--surface)/0.45)] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[hsl(var(--gold)/0.45)] bg-[hsl(var(--gold)/0.12)] font-display text-lg text-[hsl(var(--gold))]">
                    S
                  </div>
                  <div>
                    <p className="font-display text-lg text-foreground">Sarang</p>
                    <p className="mt-1 text-sm text-muted-foreground">Website Creator</p>
                  </div>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Concept · Architecture · Development</p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Dashboard() {
  const t = useTranslation();
  const ceo = CEO_MESSAGES[0];
  const [activeCredit, setActiveCredit] = useState(null);
  const { data: announcements = [] } = useQuery({ queryKey: ["announcements"], queryFn: getAnnouncements });

  return (
    <div className="space-y-10" data-testid="dashboard-page">
      <NoticeBillboard />

      <div className="flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveCredit("team")}
          className="inline-flex items-center gap-2 rounded-full border hairline bg-[hsl(var(--surface)/0.65)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/80 transition hover:border-[hsl(var(--primary)/0.35)] hover:bg-[hsl(var(--primary)/0.08)]"
        >
          <Users className="h-3.5 w-3.5" strokeWidth={1.6} />
          Team Members
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => setActiveCredit("creator")}
          className="inline-flex items-center gap-2 rounded-full border hairline bg-[hsl(var(--surface)/0.65)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/80 transition hover:border-[hsl(var(--primary)/0.35)] hover:bg-[hsl(var(--primary)/0.08)]"
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.6} />
          Creator
        </motion.button>
      </div>

      <AnimatePresence>
        {activeCredit && <CreditModal variant={activeCredit} onClose={() => setActiveCredit(null)} />}
      </AnimatePresence>

      <motion.section
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-3xl border hairline"
        data-testid="ceo-billboard"
      >
        <img src={IMAGES.ceoBg} alt="Headquarters" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/35" />
        <div className="relative grid gap-10 p-8 md:p-14 lg:grid-cols-[1.5fr_1fr] lg:p-20">
          <div>
            <p className="overline text-[hsl(var(--gold))]">{t.dashboardMessage || "Message from the Chief Executive"}</p>
            <h2 className="mt-6 max-w-3xl font-display text-3xl font-extralight leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              {ceo.title}
            </h2>
            <div className="gold-rule mt-8 w-52" />
            <p className="mt-8 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">{ceo.excerpt}</p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <img src={COMPANY.ceo.avatar} alt={COMPANY.ceo.name} className="h-14 w-14 rounded-full object-cover ring-1 ring-[hsl(var(--gold)/0.5)]" />
              <div>
                <p className="font-display text-base text-white">{COMPANY.ceo.name}</p>
                <p className="overline">{COMPANY.ceo.title} · {ceo.date}</p>
              </div>
              <Link
                to="/ceo"
                data-testid="dashboard-ceo-cta"
                className="ml-auto flex items-center gap-2 rounded-full bg-[hsl(var(--gold))] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black hover:brightness-110"
              >
                Watch full address <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="mt-6 space-y-3">
              <p className="overline">Purpose</p>
              <p className="text-sm leading-relaxed text-white/65">{COMPANY.mission}</p>
              <p className="overline pt-2">Vision</p>
              <p className="text-sm leading-relaxed text-white/65">{COMPANY.vision}</p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s, i) => (
          <Stat key={s.label} {...s} delay={i * 0.07} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="p-7 lg:col-span-8" testid="growth-chart-panel">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="overline">Company growth</p>
              <h3 className="mt-2 font-display text-2xl font-light">Revenue &amp; people trajectory</h3>
            </div>
            <p className="font-mono text-xs gold-text">$B / thousands</p>
          </div>
          <div className="h-72 w-full rounded-xl border border-dashed hairline p-6 text-sm text-muted-foreground">
            <p className="mb-2 font-display text-lg text-foreground">Growth snapshot</p>
            <p className="leading-relaxed">
              The charting layer has been simplified to keep the dashboard lightweight and fully runnable in this environment.
            </p>
            <div className="mt-6 space-y-3">
              {GROWTH.slice(0, 4).map((item) => (
                <div key={item.year} className="flex items-center justify-between rounded-lg border hairline px-3 py-2">
                  <span className="text-sm">{item.year}</span>
                  <span className="font-mono text-xs gold-text">Revenue ${item.revenue}B · People {item.crew}k</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <div className="space-y-6 lg:col-span-4">
          <Panel className="p-6" testid="clocks-panel">
            <p className="overline mb-4 flex items-center gap-2"><Clock className="h-3 w-3" /> Live campus clocks</p>
            <Clocks />
          </Panel>
          <Panel className="p-6" testid="weather-panel" delay={0.1}>
            <p className="overline mb-4 flex items-center gap-2"><CloudSun className="h-3 w-3" /> Campus weather</p>
            <div className="space-y-3">
              {WEATHER.map((w) => (
                <div key={w.city} className="flex items-center justify-between border-b hairline pb-2 last:border-0">
                  <span className="text-sm">{w.city}</span>
                  <span className="text-sm text-muted-foreground">{w.cond}</span>
                  <span className="font-display text-lg gold-text">{w.temp}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel className="p-7" testid="quick-actions-panel">
        <p className="overline mb-5 flex items-center gap-2"><Zap className="h-3 w-3" /> Quick actions</p>
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              data-testid={a.testid}
              className={`group flex flex-col items-start gap-4 rounded-xl border hairline p-5 transition ${
                a.to === "/documents"
                  ? "border-[hsl(var(--gold)/0.75)] bg-[hsl(var(--gold)/0.12)] shadow-[0_0_24px_-12px_hsl(var(--gold)/0.8)]"
                  : "bg-[hsl(var(--surface)/0.65)] hover:border-[hsl(var(--primary)/0.35)] hover:bg-[hsl(var(--primary)/0.08)]"
              }`}
            >
              <a.icon className="h-5 w-5 gold-text" strokeWidth={1.6} />
              <span className="text-xs font-semibold">{a.label}</span>
            </Link>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="p-7 lg:col-span-7" testid="dashboard-news-panel">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-display text-2xl font-light">Recent company news</h3>
            <Link to="/news" className="text-xs gold-text hover:underline" data-testid="dashboard-news-link">All news</Link>
          </div>
          <div className="space-y-4">
            {NEWS.slice(0, 3).map((n) => (
              <div key={n.id} className="group flex gap-5 rounded-xl border hairline p-4 glow-hover" data-testid={`dashboard-news-${n.id}`}>
                <img src={n.image} alt={n.title} className="h-24 w-32 shrink-0 rounded-lg object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0" />
                <div className="min-w-0">
                  <p className="overline">{n.category} · {n.date}</p>
                  <p className="mt-2 font-display text-lg font-light leading-snug">{n.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-6 lg:col-span-5">
          <Panel className="p-6" testid="dashboard-meetings-panel">
            <p className="overline mb-4">{t.todaysMeetings || "Today's meetings"}</p>
            <div className="space-y-3">
              {MEETINGS_TODAY.map((m) => (
                <Link key={m.id} to="/meetings" className="flex items-center gap-4 rounded-xl border hairline p-3 glow-hover" data-testid={`dashboard-meeting-${m.id}`}>
                  <span className="font-mono text-sm gold-text">{m.time}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{m.title}</span>
                      <span className="overline">{m.room} · {m.attendees} people</span>
                  </span>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </Panel>

          <Panel className="p-6" testid="dashboard-announcements-panel" delay={0.08}>
            <div className="mb-4 flex items-center justify-between">
              <p className="overline">Today's announcements</p>
              <Link to="/announcements" className="text-xs gold-text" data-testid="dashboard-announcements-link">View all</Link>
            </div>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="rounded-xl border hairline p-3" data-testid={`dashboard-announcement-${a.id}`}>
                  <p className="text-sm font-medium leading-snug">{a.title}</p>
                  <p className="overline mt-1">{a.author} · {a.priority}</p>
                </div>
              ))}
              {!announcements.length && <p className="text-xs text-muted-foreground">Loading announcements…</p>}
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="p-7 lg:col-span-5" testid="dashboard-holidays-panel">
          <p className="overline mb-5">Upcoming holidays</p>
          <div className="space-y-3">
            {HOLIDAYS.slice(0, 4).map((h) => (
              <div key={h.id} className="flex items-center justify-between border-b hairline pb-3 last:border-0">
                <div>
                  <p className="text-sm">{h.name}</p>
                  <p className="overline">{h.country}</p>
                </div>
                <p className="font-mono text-xs gold-text">{h.date}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-7 lg:col-span-7" testid="dashboard-spotlight-panel" delay={0.08}>
          <p className="overline mb-5 flex items-center gap-2"><Sparkles className="h-3 w-3" /> Featured people</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {SPOTLIGHTS.map((s) => (
              <div key={s.id} className="rounded-xl border hairline p-4 glow-hover" data-testid={`dashboard-spotlight-${s.id}`}>
                <p className="overline gold-text">{s.kind}</p>
                <p className="mt-2 font-display text-lg font-light">{s.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.note}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
