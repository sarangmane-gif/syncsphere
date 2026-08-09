import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { PageHeader, Panel, Pill } from "@/components/ui-kit/Primitives";
import { NEWS, MILESTONES, IMAGES } from "@/data/mock";

const CATS = ["All", "Milestone", "Product", "Campus", "People"];

export default function News() {
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? NEWS : NEWS.filter((n) => n.category === cat);
  const [lead, ...rest] = list;

  return (
    <div data-testid="news-page">
      <PageHeader
        overline="Newsroom"
        title="Company News"
        description="Milestones, rollouts, campuses and people — the running record of Novaterra Industries."
      />

      <div className="mb-8 flex flex-wrap gap-3" data-testid="news-filters">
        {CATS.map((c) => (
          <Pill key={c} active={cat === c} onClick={() => setCat(c)} testid={`news-filter-${c.toLowerCase()}`}>
            {c}
          </Pill>
        ))}
      </div>

      {lead && (
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative mb-10 overflow-hidden rounded-3xl border hairline"
          data-testid={`news-lead-${lead.id}`}
        >
          <img src={lead.image} alt={lead.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="relative flex min-h-[420px] flex-col justify-end p-8 md:p-14">
            <Pill tone="gold">{lead.category}</Pill>
            <h2 className="mt-6 max-w-3xl font-display text-3xl font-extralight leading-tight text-white md:text-5xl">{lead.title}</h2>
            <p className="mt-5 max-w-2xl text-sm text-white/70">{lead.excerpt}</p>
            <p className="overline mt-6 flex items-center gap-2"><Clock className="h-3 w-3" /> {lead.date} · {lead.readTime} read</p>
          </div>
        </motion.article>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {rest.map((n, i) => (
          <Panel key={n.id} delay={i * 0.07} testid={`news-card-${n.id}`} className="group">
            <div className="relative h-48 overflow-hidden">
              <img src={n.image} alt={n.title} className="h-full w-full object-cover grayscale transition-[filter,transform] duration-700 group-hover:grayscale-0 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <span className="absolute left-4 top-4"><Pill tone="gold">{n.category}</Pill></span>
            </div>
            <div className="p-6">
              <p className="overline">{n.date} · {n.readTime}</p>
              <h3 className="mt-3 font-display text-xl font-light leading-snug">{n.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{n.excerpt}</p>
              <button className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest gold-text" data-testid={`news-read-${n.id}`}>
                Read story <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-12">
        <Panel className="p-8 lg:col-span-7" testid="milestones-panel">
          <p className="overline mb-7">Company milestones</p>
          <div className="relative space-y-7 pl-7">
            <span className="absolute left-2 top-2 bottom-2 w-px bg-[hsl(var(--gold)/0.25)]" />
            {MILESTONES.map((m) => (
              <div key={m.year} className="relative">
                <span className="absolute -left-[22px] top-1.5 h-3 w-3 rounded-full bg-[hsl(var(--gold))]" />
                <p className="font-mono text-sm gold-text">{m.year}</p>
                <p className="mt-1 text-sm text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-8 lg:col-span-5" testid="media-gallery" delay={0.1}>
          <p className="overline mb-6">Media gallery</p>
          <div className="grid grid-cols-2 gap-3">
            {[IMAGES.hq, IMAGES.nebula, IMAGES.team, IMAGES.ceoBg].map((src, i) => (
              <motion.img
                key={i}
                src={src}
                alt="gallery"
                whileHover={{ scale: 1.04 }}
                className="h-32 w-full rounded-xl object-cover grayscale hover:grayscale-0"
                data-testid={`gallery-image-${i}`}
              />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
