import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pin, Quote } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-kit/Primitives";
import { useTranslation } from "@/context/LanguageContext";
import { CEO_MESSAGES, COMPANY, IMAGES } from "@/data/mock";

export default function CEOMessages() {
  const [active, setActive] = useState(CEO_MESSAGES[0]);
  const t = useTranslation();

  return (
    <div data-testid="ceo-page">
      <PageHeader
        overline={t.command || "Office of the Chief Executive"}
        title={t.ceo || "CEO Messages"}
        description={t.ceoDescription || "Full-length addresses, quarterly candour sessions and the leadership timeline of Novaterra Industries."}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-3xl border hairline"
        data-testid="ceo-cinema"
      >
        <img src={IMAGES.ceoBg} alt="cinematic backdrop" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        <div className="relative flex min-h-[440px] flex-col justify-end p-8 md:p-16">
          {active.pinned && (
            <span className="mb-6 flex w-fit items-center gap-2 rounded-full border border-[hsl(var(--gold)/0.5)] px-4 py-1.5 overline gold-text">
              <Pin className="h-3 w-3" /> Pinned address
            </span>
          )}
          <div className="flex items-center gap-5">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              data-testid="ceo-play-btn"
              className="relative flex h-16 w-16 items-center justify-center rounded-full border border-[hsl(var(--gold)/0.6)] bg-black/50"
            >
              <Play className="relative h-5 w-5 gold-text" />
            </motion.button>
            <div>
              <p className="overline">Runtime {active.duration} · {active.date}</p>
              <p className="mt-1 font-mono text-xs text-white/50">4K · Volumetric capture · Helix Studio</p>
            </div>
          </div>
          <h2 className="mt-8 max-w-4xl font-display text-3xl font-extralight leading-tight text-white md:text-5xl">
            {active.title}
          </h2>
          <div className="mt-8 flex items-center gap-4">
            <img src={COMPANY.ceo.avatar} alt={COMPANY.ceo.name} className="h-12 w-12 rounded-full object-cover ring-1 ring-[hsl(var(--gold)/0.5)]" />
            <div>
              <p className="text-sm text-white">{COMPANY.ceo.name}</p>
              <p className="overline">{COMPANY.ceo.title}</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-10 grid gap-6 lg:grid-cols-12">
        <Panel className="p-8 lg:col-span-8" testid="ceo-transcript">
          <Quote className="h-6 w-6 gold-text" />
          <div className="mt-6 space-y-5">
            {active.body.split("\n\n").map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="text-sm leading-[1.9] text-muted-foreground md:text-base"
              >
                {p}
              </motion.p>
            ))}
          </div>
        </Panel>

        <Panel className="p-7 lg:col-span-4" testid="ceo-timeline" delay={0.1}>
          <p className="overline mb-6">Leadership timeline</p>
          <div className="relative space-y-6 pl-6">
            <span className="absolute left-1.5 top-2 bottom-2 w-px bg-[hsl(var(--gold)/0.25)]" />
            {CEO_MESSAGES.map((m) => (
              <button
                key={m.id}
                onClick={() => setActive(m)}
                data-testid={`ceo-message-${m.id}`}
                className="relative block w-full text-left"
              >
                <span
                  className={`absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border ${
                    active.id === m.id ? "border-[hsl(var(--gold))] bg-[hsl(var(--gold))]" : "border-[hsl(var(--border))] bg-background"
                  }`}
                />
                <p className="overline">{m.date} · {m.duration}</p>
                <p className={`mt-1 text-sm leading-snug ${active.id === m.id ? "gold-text" : ""}`}>{m.title}</p>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.excerpt}</p>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
