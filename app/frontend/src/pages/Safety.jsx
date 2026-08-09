import { useQuery } from "@tanstack/react-query";
import { Siren, ShieldAlert, PhoneCall, Workflow, Lock } from "lucide-react";
import { PageHeader, Panel, Pill, Empty } from "@/components/ui-kit/Primitives";
import { useTranslation } from "@/context/LanguageContext";
import { EMERGENCY_CONTACTS } from "@/data/mock";
import { getSafetyReports } from "@/lib/api";

const STEPS = [
  ["01", "Report raised", "SOS or POSH submitted from any page, anonymously if chosen."],
  ["02", "Duty officer ack", "Acknowledgement within 2 minutes, 24/7 across all campuses."],
  ["03", "Warden dispatch", "Nearest gold-vest warden or POSH committee member engaged."],
  ["04", "Incident command", "Severity assessed; leadership notified for critical events."],
  ["05", "Written closure", "Outcome documented and shared within 72 hours."],
];

export default function Safety() {
  const t = useTranslation();
  const { data = [], isLoading } = useQuery({ queryKey: ["safety"], queryFn: getSafetyReports });

  return (
    <div data-testid="safety-page">
      <PageHeader
        overline={t.crewProtection || "People protection"}
        title={t.safetyCentre || "Safety Centre"}
        description={t.safetyDescription || "SOS and POSH are always one click away from every page. This is the escalation workflow behind those buttons."}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-8" testid="safety-sos-card">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-red-500/50 bg-red-500/10">
            <Siren className="h-5 w-5 text-red-400" />
          </span>
          <h3 className="mt-5 font-display text-2xl font-light">{t.sosEmergency || "SOS — Emergency"}</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            {t.emergencyDescription || "Medical, fire, security or personal danger. Routes to the Global Security Desk and dispatches the nearest campus warden with your shared location."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Pill tone="red">Instant escalation</Pill>
            <Pill>Location sharing</Pill>
            <Pill>24/7 duty officer</Pill>
          </div>
        </Panel>

        <Panel className="p-8" testid="safety-posh-card" delay={0.08}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/50 bg-amber-500/10">
            <ShieldAlert className="h-5 w-5 text-amber-400" />
          </span>
          <h3 className="mt-5 font-display text-2xl font-light">{t.poshConfidentialReporting || "POSH — Confidential reporting"}</h3>
          <p className="mt-3 text-sm text-muted-foreground">
            {t.poshDescription || "Harassment, discrimination or misconduct. Delivered only to the POSH committee chair, encrypted, with the option to remain fully anonymous."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Pill tone="amber">{t.anonymous || "Anonymous"} option</Pill>
            <Pill>{t.todayRooms || "24h response SLA"}</Pill>
            <Pill>Zero retaliation policy</Pill>
          </div>
        </Panel>
      </div>

      <Panel className="mt-6 p-8" testid="escalation-workflow">
        <p className="overline mb-7 flex items-center gap-2"><Workflow className="h-3 w-3" /> {t.escalationWorkflow || "Escalation workflow"}</p>
        <div className="grid gap-4 md:grid-cols-5">
          {STEPS.map(([n, title, detail]) => (
            <div key={n} className="rounded-xl border hairline p-5">
              <p className="font-mono text-sm gold-text">{n}</p>
              <p className="mt-3 text-sm">{title}</p>
              <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <Panel className="p-8 lg:col-span-5" testid="emergency-contacts-panel">
          <p className="overline mb-6 flex items-center gap-2"><PhoneCall className="h-3 w-3" /> {t.emergencyContacts || "Emergency contacts"}</p>
          <div className="space-y-3">
            {EMERGENCY_CONTACTS.map((c) => (
              <div key={c.id} className="rounded-xl border hairline p-4">
                <p className="text-sm">{c.label}</p>
                <p className="mt-1 font-mono text-sm gold-text">{c.value}</p>
                <p className="overline mt-1">{c.note}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-8 lg:col-span-7" testid="safety-log-panel" delay={0.08}>
          <p className="overline mb-6 flex items-center gap-2"><Lock className="h-3 w-3" /> Report log (redacted)</p>
          {isLoading && <Empty>Loading log…</Empty>}
          {!isLoading && !data.length && <Empty>{t.noReportsFiled || "No reports filed. Use the floating buttons to test the workflow."}</Empty>}
          <div className="space-y-3">
            {data.map((r) => (
              <div key={r.id} className="rounded-xl border hairline p-4" data-testid={`safety-report-${r.id}`}>
                <div className="flex items-center justify-between">
                  <Pill tone={r.kind === "sos" ? "red" : "amber"}>{r.kind}</Pill>
                  <span className="overline">{new Date(r.created_at).toLocaleString("en-GB")}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{r.description}</p>
                <p className="overline mt-2">{r.reporter} · {r.location} · {r.status}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
