import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Siren, X, MapPin, PhoneCall, Send } from "lucide-react";
import { toast } from "sonner";
import { createSafetyReport } from "@/lib/api";
import { EMERGENCY_CONTACTS } from "@/data/mock";

const FloatingButton = ({ tone, icon: Icon, label, onClick, testid }) => (
  <button
    onClick={onClick}
    data-testid={testid}
    className="group relative flex h-14 w-14 items-center justify-center rounded-full glass glow-hover"
    style={{ borderColor: `${tone}66` }}
    aria-label={label}
  >
    <Icon className="relative h-5 w-5" style={{ color: tone }} strokeWidth={1.8} />
    <span
      className="pointer-events-none absolute right-16 whitespace-nowrap rounded-full glass px-3 py-1 text-[11px] font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      style={{ color: tone }}
    >
      {label}
    </span>
  </button>
);

export const SafetyDock = () => {
  const [mode, setMode] = useState(null);
  const [description, setDescription] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const [location, setLocation] = useState("Not shared");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!description.trim()) {
      toast.error("Please describe the situation before escalating.");
      return;
    }
    setSubmitting(true);
    try {
      await createSafetyReport({
        kind: mode,
        description,
        anonymous,
        location,
        reporter: anonymous ? "Anonymous" : "Amara Vance",
      });
      toast.success(
        mode === "sos"
          ? "SOS escalated. Global Security Desk notified — stay on this screen."
          : "POSH report filed confidentially with the committee chair."
      );
      setDescription("");
      setMode(null);
    } catch {
      toast.error("Escalation failed. Call the Global Security Desk on +354 511 0999.");
    } finally {
      setSubmitting(false);
    }
  };

  const tone = mode === "sos" ? "#EF4444" : "#F59E0B";

  return (
    <>
      <div className="fixed bottom-8 right-6 z-50 flex flex-col gap-4" data-testid="safety-dock">
        <FloatingButton tone="#EF4444" icon={Siren} label="SOS — Emergency" onClick={() => setMode("sos")} testid="sos-fab" />
        <FloatingButton tone="#F59E0B" icon={ShieldAlert} label="POSH — Report" onClick={() => setMode("posh")} testid="posh-fab" />
      </div>

      <AnimatePresence>
        {mode && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-4 backdrop-blur-md sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-testid="safety-modal"
          >
            <motion.div
              initial={{ y: 40, scale: 0.96, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 30, scale: 0.97, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="w-full max-w-2xl overflow-hidden rounded-2xl glass"
            >
              <div className="flex items-start justify-between gap-4 border-b hairline p-6">
                <div>
                  <p className="overline" style={{ color: tone }}>
                    {mode === "sos" ? "Emergency escalation" : "POSH confidential report"}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-light">
                    {mode === "sos" ? "Immediate assistance" : "Report harassment or misconduct"}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {mode === "sos"
                      ? "Routed instantly to the Global Security Desk and the nearest campus warden."
                      : "Encrypted and delivered only to the POSH committee chair. Response within 24 hours."}
                  </p>
                </div>
                <button onClick={() => setMode(null)} data-testid="safety-close-btn" aria-label="Close" className="rounded-md p-2 text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-5">
                <div className="md:col-span-3">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    data-testid="safety-description-input"
                    placeholder={mode === "sos" ? "What is happening and where are you?" : "Describe the incident. Include dates if known."}
                    className="w-full resize-none rounded-xl border hairline bg-[hsl(var(--muted)/0.35)] p-4 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--gold)/0.5)]"
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setAnonymous((a) => !a)}
                      data-testid="safety-anonymous-toggle"
                      className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${anonymous ? "border-[hsl(var(--gold)/0.5)] gold-text" : "hairline text-muted-foreground"}`}
                    >
                      {anonymous ? "Anonymous" : "Identified"}
                    </button>
                    <button
                      onClick={() => setLocation("Horizon Campus · Level 6 · Zone B")}
                      data-testid="safety-share-location-btn"
                      className="flex items-center gap-2 rounded-full border hairline px-4 py-1.5 text-xs text-muted-foreground hover:gold-text"
                    >
                      <MapPin className="h-3.5 w-3.5" /> {location === "Not shared" ? "Share location" : location}
                    </button>
                    <button
                      onClick={submit}
                      disabled={submitting}
                      data-testid="safety-submit-btn"
                      className="ml-auto flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold text-black disabled:opacity-60"
                      style={{ background: tone }}
                    >
                      <Send className="h-3.5 w-3.5" />
                      {submitting ? "Escalating…" : mode === "sos" ? "Escalate now" : "Submit report"}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <p className="overline">Emergency contacts</p>
                  {EMERGENCY_CONTACTS.map((c) => (
                    <div key={c.id} className="rounded-xl border hairline p-3" data-testid={`emergency-contact-${c.id}`}>
                      <p className="flex items-center gap-2 text-xs font-semibold">
                        <PhoneCall className="h-3 w-3 gold-text" /> {c.label}
                      </p>
                      <p className="mt-1 font-mono text-xs gold-text">{c.value}</p>
                      <p className="text-[11px] text-muted-foreground">{c.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t hairline px-6 py-4 text-[11px] text-muted-foreground">
                Escalation workflow: report → duty officer acknowledgement (≤2 min) → campus warden dispatch → incident
                commander → written closure within 72 hours.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
