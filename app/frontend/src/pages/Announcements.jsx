import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Pin, Paperclip, MessageSquare, Eye, Rocket, Star, Heart, Plus, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, Pill, Empty } from "@/components/ui-kit/Primitives";
import { useTranslation } from "@/context/LanguageContext";
import {
  getAnnouncements, reactAnnouncement, commentAnnouncement, readAnnouncement, createAnnouncement,
} from "@/lib/api";

const PRIORITY_TONE = { critical: "red", high: "amber", normal: "blue" };
const REACTIONS = [
  { key: "rocket", icon: Rocket },
  { key: "star", icon: Star },
  { key: "heart", icon: Heart },
];

export default function Announcements() {
  const t = useTranslation();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState(null);
  const [draftComment, setDraftComment] = useState("");
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", priority: "normal", department: "Company Wide" });

  const { data = [], isLoading } = useQuery({ queryKey: ["announcements"], queryFn: getAnnouncements });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["announcements"] });

  const react = useMutation({ mutationFn: reactAnnouncement, onSuccess: invalidate });
  const comment = useMutation({
    mutationFn: commentAnnouncement,
    onSuccess: () => { invalidate(); setDraftComment(""); toast.success(t.commentPosted || "Comment posted"); },
  });
  const markRead = useMutation({ mutationFn: readAnnouncement, onSuccess: invalidate });
  const create = useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      invalidate();
      setComposing(false);
      setForm({ title: "", body: "", priority: "normal", department: "Company Wide" });
      toast.success(t.announcementBroadcastSuccess || "Announcement broadcast company-wide");
    },
  });

  const list = useMemo(() => {
    const sorted = [...data].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    return filter === "all" ? sorted : sorted.filter((a) => a.priority === filter);
  }, [data, filter]);

  return (
    <div data-testid="announcements-page">
      <PageHeader
        overline={t.announcementsOverline || "Company-wide updates"}
        title={t.announcementsTitle || "Announcements"}
        description={t.announcementsDescription || "Every broadcast reaching the full team, with priority levels, attachments, reactions, comments and read receipts."}
        action={
          <button
            onClick={() => setComposing((c) => !c)}
            data-testid="new-announcement-btn"
            className="flex items-center gap-2 rounded-full bg-[hsl(var(--gold))] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> {t.newAnnouncement || "New announcement"}
          </button>
        }
      />

      <AnimatePresence>
        {composing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="rounded-2xl glass p-6" data-testid="announcement-composer">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Headline"
                data-testid="announcement-title-input"
                className="w-full border-b hairline bg-transparent pb-3 font-display text-2xl font-light outline-none"
              />
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={4}
                placeholder="Body of the announcement…"
                data-testid="announcement-body-input"
                className="mt-4 w-full resize-none rounded-xl border hairline bg-[hsl(var(--muted)/0.35)] p-4 text-sm outline-none"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {["normal", "high", "critical"].map((p) => (
                  <Pill key={p} active={form.priority === p} onClick={() => setForm({ ...form, priority: p })} testid={`priority-${p}`}>
                    {p}
                  </Pill>
                ))}
                <button
                  onClick={() => form.title && form.body ? create.mutate(form) : toast.error(t.titleAndBodyRequired || "Title and body required")}
                  data-testid="submit-announcement-btn"
                  className="ml-auto flex items-center gap-2 rounded-full border border-[hsl(var(--gold)/0.5)] px-5 py-2 text-xs font-bold uppercase tracking-widest gold-text"
                >
                  <Send className="h-3.5 w-3.5" /> {t.broadcast || "Broadcast"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 flex flex-wrap gap-3" data-testid="announcement-filters">
        {["all", "critical", "high", "normal"].map((f) => (
          <Pill key={f} active={filter === f} onClick={() => setFilter(f)} testid={`filter-${f}`}>
            {f}
          </Pill>
        ))}
      </div>

      {isLoading && <Empty>Receiving announcements…</Empty>}
      {!isLoading && !list.length && <Empty>{t.noAnnouncementsMatch || "No announcements match this filter."}</Empty>}

      <div className="space-y-6">
        {list.map((a, i) => (
          <Panel
            key={a.id}
            delay={i * 0.05}
            testid={`announcement-${a.id}`}
            className={a.priority === "critical" ? "border-red-500/30" : ""}
          >
            {a.pinned && (
              <div className="flex items-center gap-2 border-b hairline bg-[hsl(var(--gold)/0.08)] px-6 py-2">
                <Pin className="h-3 w-3 gold-text" />
                <span className="overline gold-text">Pinned</span>
              </div>
            )}
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <Pill tone={PRIORITY_TONE[a.priority]}>{a.priority}</Pill>
                <Pill>{a.department}</Pill>
                <span className="overline ml-auto">{new Date(a.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>

              <h3 className="mt-5 font-display text-2xl font-light leading-snug md:text-3xl">{a.title}</h3>
              <p className="mt-4 max-w-4xl text-sm leading-relaxed text-muted-foreground">{a.body}</p>
              <p className="mt-4 text-xs font-semibold">{a.author}</p>

              {a.attachments?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-3">
                  {a.attachments.map((f) => (
                    <span key={f} className="flex items-center gap-2 rounded-full border hairline px-4 py-1.5 text-xs text-muted-foreground" data-testid={`attachment-${f}`}>
                      <Paperclip className="h-3 w-3 gold-text" /> {f}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-7 flex flex-wrap items-center gap-4 border-t hairline pt-5">
                {REACTIONS.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => react.mutate({ id: a.id, emoji: r.key })}
                    data-testid={`react-${r.key}-${a.id}`}
                    className="flex items-center gap-2 rounded-full border hairline px-3.5 py-1.5 text-xs text-muted-foreground hover:gold-text hover:border-[hsl(var(--gold)/0.5)]"
                  >
                    <r.icon className="h-3.5 w-3.5" /> {a.reactions?.[r.key] ?? 0}
                  </button>
                ))}
                <button
                  onClick={() => setOpenId(openId === a.id ? null : a.id)}
                  data-testid={`comments-toggle-${a.id}`}
                  className="flex items-center gap-2 rounded-full border hairline px-3.5 py-1.5 text-xs text-muted-foreground hover:gold-text"
                >
                  <MessageSquare className="h-3.5 w-3.5" /> {a.comments?.length ?? 0} {t.comments || "comments"}
                </button>
                <span className="flex items-center gap-2 text-xs text-muted-foreground" data-testid={`read-receipts-${a.id}`}>
                  <Eye className="h-3.5 w-3.5" /> {a.read_by?.length ?? 0} {t.read || "read"}
                </span>
                <button
                  onClick={() => markRead.mutate({ id: a.id, user: `me-${Date.now()}` })}
                  data-testid={`mark-read-${a.id}`}
                  className="ml-auto rounded-full border border-[hsl(var(--gold)/0.4)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest gold-text"
                >
                  Acknowledge
                </button>
              </div>

              <AnimatePresence>
                {openId === a.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 space-y-3 border-t hairline pt-5" data-testid={`comments-${a.id}`}>
                      {(a.comments ?? []).map((c) => (
                        <div key={c.id} className="rounded-xl border hairline p-3">
                          <p className="text-xs font-semibold">{c.author}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
                        </div>
                      ))}
                      <div className="flex gap-3">
                        <input
                          value={draftComment}
                          onChange={(e) => setDraftComment(e.target.value)}
                          placeholder={t.addCommentPlaceholder || "Add a comment…"}
                          data-testid={`comment-input-${a.id}`}
                          className="flex-1 rounded-full border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-2 text-sm outline-none"
                        />
                        <button
                          onClick={() =>
                            draftComment.trim()
                              ? comment.mutate({ id: a.id, author: "Amara Vance", body: draftComment })
                              : toast.error(t.writeSomethingFirst || "Write something first")
                          }
                          data-testid={`comment-submit-${a.id}`}
                          className="rounded-full bg-[hsl(var(--gold))] px-5 text-xs font-bold uppercase tracking-widest text-black"
                        >
                          {t.post || "Post"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
