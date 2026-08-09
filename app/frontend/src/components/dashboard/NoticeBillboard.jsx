import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Radio } from "lucide-react";
import { NOTICES } from "@/data/mock";

const toneMap = {
  emergency: { color: "#EF4444", label: "Emergency" },
  critical: { color: "hsl(43 72% 58%)", label: "Critical" },
  info: { color: "hsl(205 95% 62%)", label: "Advisory" },
};

export const NoticeBillboard = ({ compact = false }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % NOTICES.length), 6500);
    return () => clearInterval(t);
  }, []);
  const n = NOTICES[i];
  const tone = toneMap[n.level];

  return (
    <div
      className="relative overflow-hidden rounded-2xl border hairline titanium grain"
      data-testid="notice-billboard"
    >
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: n.level === "emergency" ? [0.16, 0.34, 0.16] : 0.1 }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ background: `radial-gradient(circle at 12% 50%, ${tone.color}, transparent 62%)` }}
      />
      <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:gap-8 md:p-9">
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="flex h-11 w-11 items-center justify-center rounded-full"
            style={{ background: `${tone.color}22`, border: `1px solid ${tone.color}66` }}
          >
            <AlertTriangle className="h-5 w-5" style={{ color: tone.color }} strokeWidth={1.8} />
          </motion.span>
          <div className="whitespace-nowrap">
            <p className="overline" style={{ color: tone.color }}>{tone.label}</p>
            <p className="font-mono text-[11px] text-white/50">Expires {n.expires}</p>
          </div>
        </div>

        <motion.div key={n.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 flex-1">
          <h3 className={`font-display font-light text-white ${compact ? "text-lg md:text-xl" : "text-2xl md:text-3xl"}`}>
            {n.title}
          </h3>
          <p className="mt-2 text-sm text-white/60">{n.detail}</p>
        </motion.div>

        <div className="flex items-center gap-2">
          {NOTICES.map((x, idx) => (
            <button
              key={x.id}
              onClick={() => setI(idx)}
              data-testid={`billboard-dot-${idx}`}
              aria-label={`Notice ${idx + 1}`}
              className="h-1.5 rounded-full transition-[width,background-color] duration-500"
              style={{
                width: idx === i ? 30 : 10,
                background: idx === i ? tone.color : "rgba(255,255,255,0.22)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative flex items-center gap-3 overflow-hidden border-t border-white/10 bg-black/50 px-6 py-2.5">
        <Radio className="h-3.5 w-3.5 shrink-0 gold-text" />
        <div className="flex w-max marquee gap-14 whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
          {[0, 1].map((k) => (
            <span key={k} className="flex gap-14">
              {NOTICES.map((x) => (
                <span key={x.id + k}>{x.title}</span>
              ))}
              <span>Platform freeze active · dual sign-off required</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
