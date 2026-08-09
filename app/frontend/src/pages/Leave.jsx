import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, X, Clock, PlaneTakeoff } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, Pill, Empty, Stat } from "@/components/ui-kit/Primitives";
import { getLeaves, createLeave, decideLeave } from "@/lib/api";

const TYPES = ["Annual", "Sick", "Parental", "Sabbatical", "Unpaid"];
const tone = { approved: "gold", rejected: "red", pending: "amber" };

export default function Leave() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ leave_type: "Annual", start_date: "", end_date: "", reason: "" });
  const { data = [], isLoading } = useQuery({ queryKey: ["leaves"], queryFn: getLeaves });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["leaves"] });

  const create = useMutation({
    mutationFn: createLeave,
    onSuccess: () => { invalidate(); toast.success("Leave request submitted to your manager"); setForm({ leave_type: "Annual", start_date: "", end_date: "", reason: "" }); },
  });
  const decide = useMutation({ mutationFn: decideLeave, onSuccess: () => { invalidate(); toast.success("Decision recorded"); } });

  const submit = () => {
    if (!form.start_date || !form.end_date) return toast.error("Select start and end dates");
    const days = Math.max(1, (new Date(form.end_date) - new Date(form.start_date)) / 86400000 + 1);
    create.mutate({ ...form, employee: "Amara Vance", days });
  };

  const counts = ["pending", "approved", "rejected"].map((s) => data.filter((l) => l.status === s).length);

  return (
    <div data-testid="leave-page">
      <PageHeader
        overline="People operations"
        title="Leave Portal"
        description="Request leave, track manager approval and monitor your remaining balance."
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Annual Balance" value="18.5 days" delta="Accruing 2.1/mo" />
        <Stat label="Pending" value={String(counts[0])} delay={0.06} />
        <Stat label="Approved" value={String(counts[1])} delay={0.12} />
        <Stat label="Rejected" value={String(counts[2])} delay={0.18} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <Panel className="p-7 lg:col-span-5" testid="leave-form">
          <p className="overline mb-6 flex items-center gap-2"><PlaneTakeoff className="h-3 w-3" /> New leave request</p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <Pill key={t} active={form.leave_type === t} onClick={() => setForm({ ...form, leave_type: t })} testid={`leave-type-${t.toLowerCase()}`}>
                {t}
              </Pill>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="overline mb-2">Start date</p>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} data-testid="leave-start-input" className="w-full rounded-xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-2.5 text-sm outline-none" />
            </div>
            <div>
              <p className="overline mb-2">End date</p>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} data-testid="leave-end-input" className="w-full rounded-xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-2.5 text-sm outline-none" />
            </div>
          </div>
          <textarea
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={3}
            placeholder="Reason (optional)"
            data-testid="leave-reason-input"
            className="mt-4 w-full resize-none rounded-xl border hairline bg-[hsl(var(--muted)/0.35)] p-4 text-sm outline-none"
          />
          <button onClick={submit} data-testid="submit-leave-btn" className="mt-5 w-full rounded-full bg-[hsl(var(--gold))] py-3 text-xs font-bold uppercase tracking-widest text-black hover:brightness-110">
            Submit request
          </button>
        </Panel>

        <Panel className="p-7 lg:col-span-7" testid="leave-timeline" delay={0.08}>
          <p className="overline mb-6">Request timeline</p>
          {isLoading && <Empty>Loading requests…</Empty>}
          <div className="space-y-4">
            {data.map((l, i) => (
              <motion.div
                key={l.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border hairline p-5"
                data-testid={`leave-request-${l.id}`}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Pill tone={tone[l.status]}>{l.status}</Pill>
                  <Pill>{l.leave_type}</Pill>
                  <span className="overline ml-auto flex items-center gap-1.5"><Clock className="h-3 w-3" /> {l.days} days</span>
                </div>
                <p className="mt-4 text-sm">{l.employee} · {l.start_date} → {l.end_date}</p>
                {l.reason && <p className="mt-1 text-xs text-muted-foreground">{l.reason}</p>}
                {l.manager_note && <p className="mt-2 text-xs gold-text">Manager: {l.manager_note}</p>}
                {l.status === "pending" && (
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => decide.mutate({ id: l.id, status: "approved", manager_note: "Approved — coverage confirmed." })}
                      data-testid={`approve-leave-${l.id}`}
                      className="flex items-center gap-2 rounded-full border border-emerald-500/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-400"
                    >
                      <Check className="h-3.5 w-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => decide.mutate({ id: l.id, status: "rejected", manager_note: "Conflicts with the current schedule." })}
                      data-testid={`reject-leave-${l.id}`}
                      className="flex items-center gap-2 rounded-full border border-red-500/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-red-400"
                    >
                      <X className="h-3.5 w-3.5" /> Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
