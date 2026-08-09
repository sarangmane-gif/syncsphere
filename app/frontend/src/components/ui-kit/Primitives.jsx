import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/* ---------- Page header ---------- */
export function PageHeader({ overline, title, description, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4" data-testid="page-header">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {overline && <p className="overline mb-2">{overline}</p>}
        <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>}
      </motion.div>
      {action}
    </div>
  );
}

/* ---------- Panel (glass card) ---------- */
export function Panel({ children, className, testid, delay = 0, glow = true, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn("panel", glow && "panel-glow", className)}
      data-testid={testid}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ---------- 3D tilt card reacting to cursor ---------- */
export function TiltCard({ children, className, testid, intensity = 8, delay = 0 }) {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [intensity, -intensity]), { stiffness: 150, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-intensity, intensity]), { stiffness: 150, damping: 18 });
  const gx = useTransform(mx, (v) => `${v * 100}%`);
  const gy = useTransform(my, (v) => `${v * 100}%`);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => { mx.set(0.5); my.set(0.5); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d", transformPerspective: 900 }}
      className={cn("panel panel-glow group relative overflow-hidden", className)}
      data-testid={testid}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: useTransform([gx, gy], ([x, y]) => `radial-gradient(340px circle at ${x} ${y}, hsl(var(--primary) / 0.16), transparent 65%)`) }}
      />
      <div style={{ transform: "translateZ(40px)" }} className="relative">{children}</div>
    </motion.div>
  );
}

/* ---------- Stat ---------- */
export function Stat({ label, value, delta, delay = 0, icon: Icon }) {
  return (
    <TiltCard className="p-6" delay={delay} testid={`stat-${label?.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="flex items-start justify-between">
        <p className="overline">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{value}</p>
      {delta && <p className="mt-2 text-xs text-muted-foreground">{delta}</p>}
    </TiltCard>
  );
}

/* ---------- Pill ---------- */
const TONES = {
  gold: "border-[hsl(var(--gold)/0.4)] text-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.1)]",
  amber: "border-amber-500/40 text-amber-400 bg-amber-500/10",
  red: "border-red-500/40 text-red-400 bg-red-500/10",
  green: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10",
  blue: "border-primary/40 text-primary bg-primary/10",
};
export function Pill({ children, active, tone, onClick, testid, className }) {
  const clickable = !!onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      data-testid={testid}
      className={cn(
        "inline-flex items-center rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200",
        clickable && "cursor-pointer hover:brightness-125",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-[0_0_18px_hsl(var(--primary)/0.5)]"
          : tone
          ? TONES[tone]
          : "hairline border text-muted-foreground",
        !clickable && "cursor-default",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ---------- Empty ---------- */
export function Empty({ children }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed hairline py-12 text-sm text-muted-foreground" data-testid="empty-state">
      {children}
    </div>
  );
}

/* ---------- Magnetic button ---------- */
export function MagneticButton({ children, className, onClick, testid, variant = "primary", type = "button", ...props }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const reset = () => { x.set(0); y.set(0); };
  const styles = {
    primary: "bg-primary text-primary-foreground shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.7)]",
    gold: "bg-[hsl(var(--gold))] text-black shadow-[0_8px_30px_-8px_hsl(var(--gold)/0.7)]",
    ghost: "hairline border bg-transparent text-foreground hover:bg-accent",
  };
  return (
    <motion.button
      type={type}
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onClick={onClick}
      data-testid={testid}
      style={{ x, y }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-xs font-bold uppercase tracking-widest transition-[filter] duration-200 hover:brightness-110",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
