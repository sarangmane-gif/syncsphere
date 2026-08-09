import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Send, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, Pill, Empty } from "@/components/ui-kit/Primitives";
import { useTranslation } from "@/context/LanguageContext";
import { getFeedback, createFeedback } from "@/lib/api";

const CATS = ["Suggestion", "Workplace", "Tooling", "Leadership", "Culture"];

const POLLS = [
  { q: "Should Horizon open with a four-day week pilot?", results: [["Yes", 62], ["No", 21], ["Undecided", 17]] },
  { q: "Preferred all-hands cadence?", results: [["Monthly", 44], ["Quarterly", 48], ["Weekly", 8]] },
];

export default function Feedback() {
  const t = useTranslation();
  const qc = useQueryClient();
  const [form, setForm] = useState({ category: "Suggestion", message: "", rating: 5, anonymous: true });
  const { data = [], isLoading } = useQuery({ queryKey: ["feedback"], queryFn: getFeedback });
  const create = useMutation({
    mutationFn: createFeedback,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feedback"] });
      setForm({ category: "Suggestion", message: "", rating: 5, anonymous: true });
      toast.success("Thank you — your feedback was recorded");
    },
  });

  return (
    <div data-testid="feedback-page">
      <PageHeader
        overline={t.crewVoice || "Team voice"}
        title={t.feedback || "Feedback"}
        description={t.feedbackDescription || "Suggestions, anonymous reports, live polls and satisfaction ratings."}
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="p-7 lg:col-span-6" testid="feedback-form">
          <p className="overline mb-5">{t.shareFeedback || "Share feedback"}</p>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <Pill key={c} active={form.category === c} onClick={() => setForm({ ...form, category: c })} testid={`feedback-cat-${c.toLowerCase()}`}>
                {c}
              </Pill>
            ))}
          </div>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={5}
            placeholder="What should we change, keep or start doing?"
            data-testid="feedback-message-input"
            className="mt-5 w-full resize-none rounded-xl border hairline bg-[hsl(var(--muted)/0.35)] p-4 text-sm outline-none"
          />
          <div className="mt-5 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setForm({ ...form, rating: n })} data-testid={`feedback-rating-${n}`} aria-label={`Rate ${n}`}>
                <Star className={`h-5 w-5 ${n <= form.rating ? "fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" : "text-muted-foreground"}`} />
              </button>
            ))}
            <button
              onClick={() => setForm({ ...form, anonymous: !form.anonymous })}
              data-testid="feedback-anonymous-toggle"
              className={`ml-auto rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest ${form.anonymous ? "border-[hsl(var(--gold)/0.5)] gold-text" : "hairline text-muted-foreground"}`}
            >
              {form.anonymous ? "Anonymous" : "Identified"}
            </button>
          </div>
          <button
            onClick={() => form.message.trim() ? create.mutate({ ...form, author: form.anonymous ? "Anonymous" : "Amara Vance" }) : toast.error("Write your feedback first")}
            data-testid="submit-feedback-btn"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--gold))] py-3 text-xs font-bold uppercase tracking-widest text-black"
          >
            <Send className="h-3.5 w-3.5" /> Submit
          </button>
        </Panel>

        <Panel className="p-7 lg:col-span-6" testid="feedback-polls" delay={0.08}>
          <p className="overline mb-6 flex items-center gap-2"><BarChart3 className="h-3 w-3" /> Live polls</p>
          <div className="space-y-7">
            {POLLS.map((p) => (
              <div key={p.q}>
                <p className="text-sm">{p.q}</p>
                <div className="mt-4 space-y-2">
                  {p.results.map(([label, pct]) => (
                    <button key={label} onClick={() => toast.success(`Vote recorded: ${label}`)} data-testid={`poll-vote-${label.toLowerCase()}`} className="block w-full text-left">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{label}</span>
                        <span className="gold-text">{pct}%</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                        <div className="h-full rounded-full bg-[hsl(var(--gold))]" style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mt-6 p-7" testid="feedback-list">
        <p className="overline mb-6">Recent submissions</p>
        {isLoading && <Empty>Loading…</Empty>}
        {!isLoading && !data.length && <Empty>No feedback yet — be the first.</Empty>}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((f) => (
            <div key={f.id} className="rounded-xl border hairline p-5" data-testid={`feedback-item-${f.id}`}>
              <div className="flex items-center justify-between">
                <Pill tone="gold">{f.category}</Pill>
                <span className="flex gap-0.5">
                  {Array.from({ length: f.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
                  ))}
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{f.message}</p>
              <p className="overline mt-3">{f.author}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
