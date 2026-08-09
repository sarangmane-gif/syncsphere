import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { PageHeader, Panel } from "@/components/ui-kit/Primitives";

export default function Modules({ slug, title, description }) {
  return (
    <div data-testid={`module-${slug}-page`}>
      <PageHeader
        overline="Workspace Module"
        title={title}
        description={description}
      />

      <Panel testid={`module-${slug}-panel`}>
        <div className="p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-full border border-[hsl(var(--gold)/0.4)] px-3 py-1 text-[11px] font-bold uppercase tracking-widest gold-text">
              <Sparkles className="h-3 w-3" /> In configuration
            </span>
            <span className="overline">Module: {slug}</span>
          </div>

          <h3 className="mt-6 font-display text-2xl font-light leading-snug md:text-3xl">
            This workspace is being prepared for rollout.
          </h3>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {description} The final framework and datasets for this module are being finalised by the
            SyncSphere operations team. It will unlock automatically once the underlying connected
            systems are wired into the intranet.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-10 grid gap-4 md:grid-cols-3"
          >
            {[
              ["Framework", "Content model, permissions, workflows"],
              ["Connected Systems", "Ingesting from HRIS, ERP and DocOps"],
              ["Rollout Window", "Rolling out across all 27 locations"],
            ].map(([label, copy]) => (
              <div
                key={label}
                className="rounded-2xl border hairline bg-[hsl(var(--surface)/0.55)] p-5"
                data-testid={`module-${slug}-card-${label.toLowerCase().replace(/ /g, "-")}`}
              >
                <div className="flex items-start justify-between">
                  <span className="overline">{label}</span>
                  <ArrowUpRight className="h-4 w-4 gold-text" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{copy}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </Panel>
    </div>
  );
}
