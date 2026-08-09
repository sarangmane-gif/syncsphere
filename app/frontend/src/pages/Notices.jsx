import { motion } from "framer-motion";
import { AlertTriangle, Clock } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/ui-kit/Primitives";
import { useTranslation } from "@/context/LanguageContext";
import { NoticeBillboard } from "@/components/dashboard/NoticeBillboard";
import { NOTICES } from "@/data/mock";

const tone = { emergency: "red", critical: "amber", info: "blue" };

export default function Notices() {
  const t = useTranslation();

  return (
    <div data-testid="notices-page">
      <PageHeader
        overline={t.noticesNetwork || "Digital billboard network"}
        title={t.importantNotices || "Important Notices"}
        description={t.noticesDescription || "Broadcast across every campus display, mobile device and workstation. Emergency notices pulse until acknowledged."}
      />
      <NoticeBillboard />

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {NOTICES.map((n, i) => (
          <Panel key={n.id} delay={i * 0.08} className="p-7" testid={`notice-card-${n.id}`}>
            {n.level === "emergency" && (
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: [0.06, 0.2, 0.06] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ background: "radial-gradient(circle at 20% 0%, #EF4444, transparent 60%)" }}
              />
            )}
            <div className="relative">
              <div className="flex items-center justify-between">
                <Pill tone={tone[n.level]}>{n.level}</Pill>
                <span className="flex items-center gap-1.5 overline"><Clock className="h-3 w-3" /> {n.expires}</span>
              </div>
              <AlertTriangle className="mt-6 h-6 w-6 gold-text" strokeWidth={1.6} />
              <h3 className="mt-4 font-display text-xl font-light leading-snug">{n.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{n.detail}</p>
              <button
                data-testid={`acknowledge-notice-${n.id}`}
                className="mt-7 w-full rounded-full border border-[hsl(var(--gold)/0.4)] py-2.5 text-[11px] font-bold uppercase tracking-widest gold-text hover:bg-[hsl(var(--gold)/0.1)]"
              >
                {t.acknowledge || "Acknowledge"}
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
