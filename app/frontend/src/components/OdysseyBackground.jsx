import { useEffect, useState } from "react";

/**
 * Dark Odyssey ambient background.
 * Static layered dark surfaces + subtle drifting aurora + faint grid.
 * No canvas, no space visuals — purely CSS, respects prefers-reduced-motion.
 */
export const OdysseyBackground = () => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none grain"
      data-testid="odyssey-background"
    >
      <div className="absolute inset-0 bg-background" />
      {!reduced && <div className="aurora" />}
      <div className="absolute inset-0 grid-bg opacity-[0.5]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,hsl(var(--primary)/0.1),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,hsl(var(--secondary)/0.08),transparent_50%)]" />
    </div>
  );
};
