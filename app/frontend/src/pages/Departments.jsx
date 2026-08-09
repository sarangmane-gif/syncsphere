import { useState } from "react";
import { motion } from "framer-motion";
import { Users, FolderKanban, Library, Megaphone, ChevronRight } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/ui-kit/Primitives";
import { useTranslation } from "@/context/LanguageContext";
import { DEPARTMENTS, IMAGES } from "@/data/mock";

export default function Departments() {
  const t = useTranslation();
  const [active, setActive] = useState(DEPARTMENTS[0]);

  return (
    <div data-testid="departments-page">
      <PageHeader
        overline={t.organizationalStructure || "Organisational structure"}
        title={t.departmentDirectory || "Department Directory"}
        description={t.departmentsDescription || "Every department with its head, headcount, active projects, resources and its own notice board."}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-4" data-testid="department-list">
          {DEPARTMENTS.map((d, i) => (
            <motion.button
              key={d.id}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActive(d)}
              data-testid={`department-item-${d.id}`}
              className={`flex w-full items-center gap-4 rounded-xl border p-5 text-left glow-hover ${
                active.id === d.id ? "border-[hsl(var(--gold)/0.45)] bg-[hsl(var(--gold)/0.07)]" : "hairline"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className={`font-display text-lg font-light ${active.id === d.id ? "gold-text" : ""}`}>{d.name}</p>
                <p className="overline mt-1">{d.head} · {d.headcount.toLocaleString()} people</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.button>
          ))}
        </div>

        <motion.div key={active.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 lg:col-span-8">
          <Panel className="overflow-hidden" testid="department-detail">
            <div className="relative h-44">
              <img src={IMAGES.hq} alt={active.name} className="h-full w-full object-cover grayscale" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute bottom-6 left-8">
                <p className="overline gold-text">{t.department || "Department"}</p>
                <h2 className="mt-2 font-display text-3xl font-extralight text-white">{active.name}</h2>
              </div>
            </div>
            <div className="p-8">
              <p className="text-sm leading-relaxed text-muted-foreground">{active.description}</p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border hairline p-4">
                  <p className="overline flex items-center gap-2"><Users className="h-3 w-3" /> {t.departmentHead || "Department head"}</p>
                  <p className="mt-2 text-sm">{active.head}</p>
                </div>
                <div className="rounded-xl border hairline p-4">
                  <p className="overline">{t.headcount || "Headcount"}</p>
                  <p className="mt-2 font-display text-xl gold-text">{active.headcount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </Panel>

          <div className="grid gap-6 md:grid-cols-2">
            <Panel className="p-7" testid="department-projects">
              <p className="overline mb-5 flex items-center gap-2"><FolderKanban className="h-3 w-3" /> {t.currentProjects || "Current projects"}</p>
              <div className="space-y-3">
                {active.projects.map((p) => (
                  <div key={p} className="flex items-center justify-between rounded-xl border hairline p-3 text-sm">
                    <span>{p}</span>
                    <Pill tone="gold">Active</Pill>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="p-7" testid="department-resources" delay={0.06}>
              <p className="overline mb-5 flex items-center gap-2"><Library className="h-3 w-3" /> {t.resources || "Resources"}</p>
              <div className="space-y-3">
                {active.resources.map((r) => (
                  <div key={r} className="rounded-xl border hairline p-3 text-sm text-muted-foreground">{r}</div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel className="p-7" testid="department-notice-board" delay={0.1}>
            <p className="overline mb-5 flex items-center gap-2"><Megaphone className="h-3 w-3" /> {t.departmentNoticeBoard || "Department notice board"}</p>
            <div className="space-y-3">
              {active.notices.map((n) => (
                <div key={n} className="rounded-xl border border-[hsl(var(--gold)/0.25)] bg-[hsl(var(--gold)/0.06)] p-4 text-sm">
                  {n}
                </div>
              ))}
            </div>
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}
