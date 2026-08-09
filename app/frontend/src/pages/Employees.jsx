import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Mail, Phone, MapPin, X, Briefcase } from "lucide-react";
import { PageHeader, Panel, Pill, Empty } from "@/components/ui-kit/Primitives";
import { useTranslation } from "@/context/LanguageContext";
import { EMPLOYEES, IMAGES } from "@/data/mock";

const DEPTS = ["All", ...Array.from(new Set(EMPLOYEES.map((e) => e.dept)))];
const STATUSES = ["All", "In office", "Remote", "In meeting", "On leave"];

const statusTone = {
  "In office": "text-emerald-400 border-emerald-500/40",
  Remote: "text-sky-400 border-sky-500/40",
  "In meeting": "text-amber-400 border-amber-500/40",
  "On leave": "text-zinc-400 border-zinc-500/40",
};

const getInitials = (name) =>
  name
    .replace(/\./g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export default function Employees() {
  const t = useTranslation();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState(t.all || "All");
  const [status, setStatus] = useState(t.all || "All");
  const [selected, setSelected] = useState(null);

  const list = useMemo(
    () =>
      EMPLOYEES.filter((e) => {
        const term = q.toLowerCase();
        const match =
          !term ||
          e.name.toLowerCase().includes(term) ||
          e.role.toLowerCase().includes(term) ||
          e.location.toLowerCase().includes(term) ||
          e.skills.some((s) => s.toLowerCase().includes(term));
        return match && (dept === "All" || e.dept === dept) && (status === "All" || e.status === status);
      }),
    [q, dept, status]
  );

  return (
    <div data-testid="employees-page">
      <PageHeader
        overline={`${EMPLOYEES.length} of 14,208 people indexed`}
        title={t.employeeDirectory || "Employee Directory"}
        description={t.employeesDescription || "Search the entire team by name, role, skill, location or availability."}
      />

      <Panel className="mb-8 p-6" testid="employee-filters">
        <div className="flex items-center gap-3 rounded-full border hairline bg-[hsl(var(--muted)/0.35)] px-5 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            data-testid="employee-search-input"
            placeholder={t.searchByNameRole || "Search by name, role, skill or city…"}
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {DEPTS.map((d) => (
            <Pill key={d} active={dept === d} onClick={() => setDept(d)} testid={`dept-filter-${d.toLowerCase().replace(/\s+/g, "-")}`}>
              {d}
            </Pill>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <Pill key={s} active={status === s} onClick={() => setStatus(s)} testid={`status-filter-${s.toLowerCase().replace(/\s+/g, "-")}`}>
              {s}
            </Pill>
          ))}
        </div>
      </Panel>

      {!list.length && <Empty>No people match those filters.</Empty>}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {list.map((e, i) => (
          <Panel key={e.id} delay={i * 0.04} className="p-6" testid={`employee-card-${e.id}`}>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border ring-1 ring-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.12)] text-sm font-semibold uppercase text-[hsl(var(--gold))]">
                {getInitials(e.name)}
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-light leading-tight">{e.name}</p>
                <p className="overline mt-1">{e.role}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${statusTone[e.status]}`}>
                {e.status}
              </span>
              <Pill>{e.dept}</Pill>
            </div>
            <div className="mt-5 space-y-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2"><MapPin className="h-3 w-3 gold-text" /> {e.location}</p>
                <p className="flex items-center gap-2"><Briefcase className="h-3 w-3 gold-text" /> {e.years} years</p>
            </div>
            <button
              onClick={() => setSelected(e)}
              data-testid={`view-profile-${e.id}`}
              className="mt-6 w-full rounded-full border border-[hsl(var(--gold)/0.4)] py-2.5 text-[11px] font-bold uppercase tracking-widest gold-text hover:bg-[hsl(var(--gold)/0.1)]"
            >
              View profile
            </button>
          </Panel>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            data-testid="employee-profile-modal"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 30, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl glass"
            >
              <div className="relative h-40">
                <img src={IMAGES.hq} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                <button onClick={() => setSelected(null)} data-testid="close-profile-btn" aria-label="Close" className="absolute right-4 top-4 rounded-md bg-black/50 p-2 text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="-mt-10 px-8 pb-8">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 ring-2 ring-[hsl(var(--gold)/0.6)] bg-[hsl(var(--gold)/0.12)] text-2xl font-semibold uppercase text-[hsl(var(--gold))]">
                  {getInitials(selected.name)}
                </div>
                <h3 className="mt-4 font-display text-2xl font-light">{selected.name}</h3>
                <p className="overline mt-1">{selected.role} · {selected.dept}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2"><Mail className="h-3 w-3 gold-text" /> {selected.email}</p>
                  <p className="flex items-center gap-2"><Phone className="h-3 w-3 gold-text" /> {selected.phone}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-3 w-3 gold-text" /> {selected.location}</p>
                  <p className="flex items-center gap-2"><Briefcase className="h-3 w-3 gold-text" /> {selected.years} years</p>
                </div>
                <p className="overline mt-7 mb-3">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {selected.skills.map((s) => (
                    <Pill key={s} tone="gold">{s}</Pill>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
