import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ListChecks,
  Clock,
  Search,
  Plus,
  X,
  Trash2,
  ArrowRight,
  Link2,
} from "lucide-react";
import { PageHeader, Panel, Pill, MagneticButton } from "@/components/ui-kit/Primitives";
import {
  CALENDAR_EVENTS,
  CALENDAR_CATEGORIES,
  EVENT_DEPARTMENTS,
  EVENT_REMINDERS,
  EVENT_REPEAT,
  EVENT_MEETING_PROVIDERS,
  EVENT_LOCATIONS,
  EVENT_PARTICIPANTS,
  CALENDAR_CATEGORY_TONE,
} from "@/data/mock";

const VIEW_OPTIONS = ["Month", "Week", "Day"];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatTime = (iso) => {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateLabel = (date) => date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

const getDateKey = (date) => date.toISOString().split("T")[0];

const buildMonthGrid = (activeDate) => {
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  const today = new Date();

  for (let slot = 0; slot < 42; slot += 1) {
    const dayIndex = slot - firstWeekday + 1;
    const date = new Date(year, month, dayIndex);
    const isCurrentMonth = dayIndex >= 1 && dayIndex <= daysInMonth;
    const isToday = isCurrentMonth && date.toDateString() === today.toDateString();
    cells.push({ date, isCurrentMonth, isToday });
  }

  return cells;
};

const buildWeekDays = (activeDate) => {
  const start = new Date(activeDate);
  start.setDate(activeDate.getDate() - activeDate.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

const buildDayHours = () => Array.from({ length: 16 }, (_, index) => 6 + index);

const buildStripDays = (activeDate) => {
  const start = new Date(activeDate);
  start.setDate(activeDate.getDate() - 3);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
};

const EventPill = ({ event, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group w-full rounded-2xl border hairline bg-[hsl(var(--surface)/0.55)] p-3 text-left transition hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.08)]"
  >
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-semibold">{event.title}</span>
      <span className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">{event.category}</span>
    </div>
    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{event.description}</p>
    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
      <span>{formatTime(event.start)} – {formatTime(event.end)}</span>
      <span>·</span>
      <span>{event.location}</span>
    </div>
  </button>
);

const EventChip = ({ event, onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick?.(e);
    }}
    className={`group flex w-full flex-col gap-1 rounded-2xl border border-[hsl(var(--surface)/0.65)] p-3 text-left transition hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.08)] ${event.category ? "" : "bg-[hsl(var(--surface)/0.65)]"}`}
  >
    <div className="flex items-center gap-2">
      <span className={`inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-${event.category?.toLowerCase()?.replace(/ /g, "-")}-accent, #7c3aed)]`} />
      <span className="text-sm font-semibold">{event.title}</span>
      <span className="ml-auto text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{formatTime(event.start)}</span>
    </div>
    <p className="text-[11px] text-muted-foreground line-clamp-2">{event.location}</p>
  </button>
);

const EventModal = ({ event, onClose, onDelete, onSave, categories, departments, providers, reminders, repeats, locations, participantsList }) => {
  const [draft, setDraft] = useState(event || {
    title: "",
    description: "",
    start: new Date().toISOString().slice(0, 16),
    end: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString().slice(0, 16),
    location: locations[0],
    department: departments[0],
    participants: [participantsList[0]],
    reminder: reminders[1],
    repeat: repeats[0],
    category: categories[0],
    meetingProvider: providers[0],
    meetingUrl: "",
  });

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className="w-full max-w-3xl rounded-3xl border hairline bg-[hsl(var(--surface)/0.95)] p-6 shadow-2xl backdrop-blur-xl"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="overline">{event ? "Edit event" : "Create event"}</p>
              <h2 className="mt-2 text-2xl font-semibold">{event ? event.title : "New calendar event"}</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full border hairline p-2 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-[0.32em] text-muted-foreground">Title</label>
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
              />
              <label className="block text-xs uppercase tracking-[0.32em] text-muted-foreground">Description</label>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={4}
                className="w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs uppercase tracking-[0.32em] text-muted-foreground">Start</label>
                  <input
                    type="datetime-local"
                    value={draft.start}
                    onChange={(e) => setDraft({ ...draft, start: e.target.value })}
                    className="mt-2 w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.32em] text-muted-foreground">End</label>
                  <input
                    type="datetime-local"
                    value={draft.end}
                    onChange={(e) => setDraft({ ...draft, end: e.target.value })}
                    className="mt-2 w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-[0.32em] text-muted-foreground">Location</label>
              <select
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                className="w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
              >
                {locations.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
              <label className="block text-xs uppercase tracking-[0.32em] text-muted-foreground">Department</label>
              <select
                value={draft.department}
                onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                className="w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
              >
                {departments.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
              <label className="block text-xs uppercase tracking-[0.32em] text-muted-foreground">Participants</label>
              <select
                value={draft.participants.join(", ")}
                onChange={(e) => setDraft({ ...draft, participants: e.target.value.split(",").map((value) => value.trim()) })}
                className="w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
              >
                {participantsList.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
              <label className="block text-xs uppercase tracking-[0.32em] text-muted-foreground">Reminder</label>
              <select
                value={draft.reminder}
                onChange={(e) => setDraft({ ...draft, reminder: e.target.value })}
                className="w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
              >
                {reminders.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div>
              <label className="block text-xs uppercase tracking-[0.32em] text-muted-foreground">Category</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className="mt-2 w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
              >
                {categories.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.32em] text-muted-foreground">Meeting provider</label>
              <select
                value={draft.meetingProvider}
                onChange={(e) => setDraft({ ...draft, meetingProvider: e.target.value })}
                className="mt-2 w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
              >
                {providers.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.32em] text-muted-foreground">Meeting URL</label>
              <input
                type="url"
                value={draft.meetingUrl}
                onChange={(e) => setDraft({ ...draft, meetingUrl: e.target.value })}
                className="mt-2 w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {event && (
                <button
                  type="button"
                  onClick={() => onDelete(event.id)}
                  className="rounded-full border border-red-500/30 px-4 py-2 text-red-300 transition hover:bg-red-500/10"
                >
                  Delete event
                </button>
              )}
              <span>{draft.category} • {draft.department}</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border hairline px-6 py-3 text-xs uppercase tracking-[0.24em] text-muted-foreground transition hover:bg-[hsl(var(--muted)/0.2)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onSave({ ...draft, id: event?.id ?? `ev-${Date.now()}` })}
                className="rounded-full bg-[hsl(var(--gold))] px-6 py-3 text-xs font-bold uppercase tracking-[0.24em] text-black transition hover:brightness-110"
              >
                Save event
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default function CalendarModule({ slug, title, description }) {
  const [view, setView] = useState("Month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [providerFilter, setProviderFilter] = useState("All");
  const [events, setEvents] = useState(CALENDAR_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesQuery = query
        ? [event.title, event.description, event.location, event.department].some((value) => value.toLowerCase().includes(query.toLowerCase()))
        : true;
      const matchesCategory = categoryFilter === "All" || event.category === categoryFilter;
      const matchesDepartment = departmentFilter === "All" || event.department === departmentFilter;
      const matchesProvider = providerFilter === "All" || event.meetingProvider === providerFilter;
      return matchesQuery && matchesCategory && matchesDepartment && matchesProvider;
    });
  }, [events, query, categoryFilter, departmentFilter, providerFilter]);

  const eventsByDay = useMemo(() => {
    return filteredEvents.reduce((acc, event) => {
      const key = event.start.slice(0, 10);
      acc[key] = acc[key] || [];
      acc[key].push(event);
      return acc;
    }, {});
  }, [filteredEvents]);

  const monthCells = useMemo(() => buildMonthGrid(currentDate), [currentDate]);
  const weekDays = useMemo(() => buildWeekDays(currentDate), [currentDate]);
  const stripDays = useMemo(() => buildStripDays(currentDate), [currentDate]);
  const dayHours = useMemo(() => buildDayHours(), []);
  const today = new Date();
  const currentStart = new Date(currentDate);
  const currentEnd = new Date(currentDate);
  const todayMeetingsCount = filteredEvents.filter((event) => event.category === "Meeting" && new Date(event.start).toDateString() === today.toDateString()).length;
  const nextMeeting = filteredEvents
    .slice()
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .find((event) => new Date(event.start) >= today) || null;

  const displayedEvents = useMemo(() => {
    if (view === "Month") {
      return filteredEvents;
    }
    if (view === "Week") {
      const weekKeys = weekDays.map((date) => getDateKey(date));
      return filteredEvents.filter((event) => weekKeys.includes(event.start.slice(0, 10)));
    }
    if (view === "Day") {
      return filteredEvents.filter((event) => event.start.slice(0, 10) === getDateKey(currentDate));
    }
    return filteredEvents;
  }, [view, filteredEvents, weekDays, currentDate]);

  const changeDate = (deltaDays) => {
    const next = new Date(currentDate);
    if (view === "Month") {
      next.setMonth(currentDate.getMonth() + deltaDays);
    } else {
      next.setDate(currentDate.getDate() + deltaDays);
    }
    setCurrentDate(next);
  };

  const goToday = () => setCurrentDate(new Date());

  const openCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const saveEvent = (event) => {
    setEvents((current) => {
      const exists = current.some((item) => item.id === event.id);
      if (exists) {
        return current.map((item) => (item.id === event.id ? event : item));
      }
      return [...current, event];
    });
    setIsModalOpen(false);
    setSelectedEvent(event);
  };

  const deleteEvent = (eventId) => {
    setEvents((current) => current.filter((item) => item.id !== eventId));
    setIsModalOpen(false);
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(null);
    }
  };

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-2">
      {WEEKDAY_LABELS.map((day) => (
        <div key={day} className="rounded-3xl border hairline bg-[hsl(var(--surface)/0.55)] px-2 py-2 text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {day}
        </div>
      ))}
      {monthCells.map((cell) => {
        const key = getDateKey(cell.date);
        const dayEvents = eventsByDay[key] || [];
        return (
          <button
            type="button"
            key={key}
            disabled={!cell.isCurrentMonth}
            onClick={cell.isCurrentMonth ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentDate(cell.date);
            } : undefined}
            aria-disabled={!cell.isCurrentMonth}
            className={`group min-h-[8rem] overflow-hidden rounded-[1.75rem] border hairline bg-[hsl(var(--surface)/0.35)] p-3 text-left transition duration-300 ${cell.isCurrentMonth ? "" : "opacity-50 cursor-default pointer-events-none"} ${cell.isToday ? "border-[hsl(var(--gold)/0.45)] ring-1 ring-[hsl(var(--gold)/0.14)]" : ""}`}
          >
            <div className="mb-3 flex items-center justify-between text-[11px] font-semibold text-white/90">
              <span>{cell.date.getDate()}</span>
              {cell.isToday && <span className="rounded-full bg-[hsl(var(--gold)/0.12)] px-2 py-1 uppercase tracking-[0.24em] text-[10px] text-[hsl(var(--gold))]">Today</span>}
            </div>
            <div className="flex flex-wrap gap-1">
              {dayEvents.slice(0, 3).map((event) => (
                <span
                  key={event.id}
                  className={`h-2.5 w-2.5 rounded-full ${CATEGORY_DOT_CLASS[CALENDAR_CATEGORY_TONE[event.category]] || "bg-sky-400"}`}
                  title={`${event.title} • ${formatTime(event.start)}`}
                />
              ))}
              {dayEvents.length > 3 && <span className="text-[10px] text-muted-foreground">+{dayEvents.length - 3}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderWeekView = () => (
    <div className="grid gap-3 lg:grid-cols-7">
      {weekDays.map((date) => {
        const key = getDateKey(date);
        const dayEvents = eventsByDay[key] || [];
        return (
          <div key={key} className="rounded-[2rem] border hairline bg-[hsl(var(--surface)/0.35)] p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{date.toLocaleDateString([], { weekday: "short" })}</p>
                <p className="mt-2 text-lg font-semibold">{date.getDate()}</p>
              </div>
              {date.toDateString() === today.toDateString() && (
                <span className="rounded-full bg-[hsl(var(--gold)/0.12)] px-2 py-1 text-[10px] uppercase tracking-[0.24em] text-[hsl(var(--gold))]">Today</span>
              )}
            </div>
            <div className="space-y-2">
              {dayEvents.length ? dayEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openEdit(event);
                  }}
                  className="w-full rounded-3xl border hairline bg-[hsl(var(--surface)/0.65)] p-3 text-left transition hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.08)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">{event.title}</p>
                    <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{formatTime(event.start)}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground truncate">{event.location}</p>
                </button>
              )) : (
                <div className="rounded-3xl border border-dashed hairline p-4 text-[11px] text-muted-foreground">No events</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDayView = () => {
    const dayEvents = eventsByDay[getDateKey(currentDate)] || [];
    const now = new Date();
    const isToday = getDateKey(currentDate) === getDateKey(now);
    return (
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[2rem] border hairline bg-[hsl(var(--surface)/0.35)] p-4">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">{currentDate.toLocaleDateString([], { weekday: "long" })}</p>
              <h2 className="mt-2 text-3xl font-semibold">{currentDate.toLocaleDateString([], { month: "long", day: "numeric" })}</h2>
            </div>
            <span className="rounded-full bg-[hsl(var(--gold)/0.12)] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[hsl(var(--gold))]">{dayEvents.length} events</span>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border hairline bg-[hsl(var(--surface)/0.15)] p-3 text-[11px] text-muted-foreground">
              <p className="font-semibold text-white">Timeline</p>
              <p className="mt-2">{currentDate.toLocaleDateString([], { month: "short", day: "numeric" })}</p>
            </div>
            <div className="rounded-3xl border hairline bg-[hsl(var(--surface)/0.15)] p-3 text-[11px] text-muted-foreground">
              <p className="font-semibold text-white">Current status</p>
              <p className="mt-2">{isToday ? "Live day plan" : "Looking ahead"}</p>
            </div>
          </div>

          <div className="space-y-2">
            {dayHours.map((hour) => {
              const hourLabel = `${hour}:00`;
              const hourEvents = dayEvents.filter((event) => new Date(event.start).getHours() === hour);
              return (
                <div key={hour} className="rounded-3xl border border-[hsl(var(--surface)/0.15)] bg-[hsl(var(--surface)/0.15)] p-3 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>{hourLabel}</span>
                    {isToday && now.getHours() === hour && <span className="text-[11px] text-primary">Now</span>}
                  </div>
                  {hourEvents.length ? (
                    <div className="mt-3 grid gap-2">
                      {hourEvents.map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => openEdit(event)}
                          className="block w-full rounded-3xl border hairline bg-[hsl(var(--surface)/0.65)] p-3 text-left transition hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.08)]"
                        >
                          <p className="text-sm font-semibold truncate">{event.title}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">{formatTime(event.start)} — {formatTime(event.end)}</p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-3xl border border-dashed hairline p-3 text-[11px] text-muted-foreground">No item</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-4">
          <Panel className="p-4" testid="day-summary-panel">
            <p className="overline">Upcoming for the day</p>
            <div className="mt-4 space-y-3">
              {dayEvents.length ? dayEvents.map((event) => (
                <div key={event.id} className="rounded-3xl border hairline bg-[hsl(var(--surface)/0.65)] p-3">
                  <p className="font-semibold">{event.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{formatTime(event.start)} — {formatTime(event.end)}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">No scheduled items for this day.</p>}
            </div>
          </Panel>
          <Panel className="p-4" testid="day-meeting-panel">
            <div className="flex items-center justify-between">
              <p className="overline">Meeting provider</p>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-4 space-y-2">
              {dayEvents.filter((event) => event.meetingProvider && event.meetingProvider !== "No Meeting").map((event) => (
                <div key={event.id} className="rounded-3xl border hairline bg-[hsl(var(--surface)/0.65)] p-3">
                  <p className="font-semibold">{event.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{event.meetingProvider}</p>
                </div>
              ))}
              {!dayEvents.some((event) => event.meetingProvider && event.meetingProvider !== "No Meeting") && (
                <p className="text-sm text-muted-foreground">No meeting links scheduled.</p>
              )}
            </div>
          </Panel>
        </div>
      </div>
    );
  };

  return (
    <div data-testid="module-calendar-page" className="space-y-8">
      <PageHeader
        overline="Calendar Workspace"
        title={title}
        description={description}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={goToday}
              className="rounded-full border hairline bg-[hsl(var(--surface)/0.6)] px-4 py-2 text-xs uppercase tracking-[0.24em] text-muted-foreground transition hover:brightness-110"
            >
              Today
            </button>
            <MagneticButton onClick={openCreate} variant="gold" testid="create-event-btn">
              <Plus className="h-4 w-4" /> Create Event
            </MagneticButton>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <Panel className="p-6 bg-[hsl(var(--surface)/0.55)] backdrop-blur-xl min-h-0" testid="calendar-command-panel">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="overline text-muted-foreground">Workspace overview</p>
              <h2 className="mt-2 text-3xl font-semibold text-white tracking-tight">{currentDate.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeDate(view === "Month" ? -1 : -7)}
                className="rounded-full border hairline p-3 text-muted-foreground transition hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => changeDate(view === "Month" ? 1 : 7)}
                className="rounded-full border hairline p-3 text-muted-foreground transition hover:text-foreground"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition ${view === option ? "bg-[hsl(var(--gold))] text-black" : "border hairline bg-[hsl(var(--surface)/0.5)] text-muted-foreground hover:border-primary"}`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr] items-stretch">
            <div className="rounded-[1.75rem] border hairline bg-[hsl(var(--surface)/0.45)] p-4 h-full">
              <div className="flex items-center gap-3 border-b border-[hsl(var(--surface)/0.15)] pb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events, rooms, owners"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
                >
                  <option>All categories</option>
                  {CALENDAR_CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
                >
                  <option>All departments</option>
                  {EVENT_DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
                <select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  className="w-full rounded-2xl border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-3 text-sm outline-none"
                >
                  <option>All providers</option>
                  {EVENT_MEETING_PROVIDERS.map((provider) => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4 h-full">
              <Panel className="p-4 bg-[hsl(var(--surface)/0.55)]" testid="calendar-summary-panel">
                <p className="overline">Quick summary</p>
                <div className="mt-4 grid gap-3">
                  <div className="flex items-center justify-between rounded-[1.5rem] border hairline bg-[hsl(var(--surface)/0.55)] px-4 py-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Today's meetings</p>
                      <p className="mt-2 text-2xl font-semibold">{todayMeetingsCount}</p>
                    </div>
                    <CalendarDays className="h-6 w-6 text-[hsl(var(--gold))]" />
                  </div>
                  <div className="flex items-center justify-between rounded-[1.5rem] border hairline bg-[hsl(var(--surface)/0.55)] px-4 py-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Filtered events</p>
                      <p className="mt-2 text-2xl font-semibold">{filteredEvents.length}</p>
                    </div>
                    <ListChecks className="h-6 w-6 text-sky-300" />
                  </div>
                  <div className="flex items-center justify-between rounded-[1.5rem] border hairline bg-[hsl(var(--surface)/0.55)] px-4 py-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Next meeting</p>
                      <p className="mt-2 text-2xl font-semibold">{nextMeeting ? formatTime(nextMeeting.start) : "—"}</p>
                    </div>
                    <Clock className="h-6 w-6 text-emerald-300" />
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6 bg-[hsl(var(--surface)/0.55)]" testid="calendar-main-panel">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="overline text-muted-foreground">{view} view</p>
                <h3 className="mt-2 text-2xl font-semibold">{currentDate.toLocaleDateString([], { month: "long", year: "numeric" })}</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full border hairline px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{filteredEvents.length} events</span>
                <button
                  type="button"
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1))}
                  className="rounded-full border hairline px-3 py-2 text-xs uppercase tracking-[0.24em] text-muted-foreground transition hover:bg-[hsl(var(--muted)/0.2)]"
                >
                  Next day
                </button>
              </div>
            </div>

            <div className="mb-6 overflow-x-auto pb-2">
              <div className="flex min-w-max gap-3">
                {stripDays.map((date) => {
                  const isSelected = getDateKey(date) === getDateKey(currentDate);
                  return (
                    <button
                      key={getDateKey(date)}
                      type="button"
                      onClick={() => setCurrentDate(date)}
                      className={`min-w-[6rem] rounded-3xl border px-4 py-3 text-left transition duration-300 ${isSelected ? "border-[hsl(var(--primary)/0.45)] bg-[hsl(var(--primary)/0.14)] shadow-[0_16px_30px_-20px_hsl(var(--primary)/0.35)]" : "border-[hsl(var(--border)/0.6)] bg-[hsl(var(--surface)/0.55)] hover:border-[hsl(var(--primary)/0.25)] hover:bg-[hsl(var(--primary)/0.06)]"}`}>
                      <p className="text-base font-semibold text-white">{date.getDate()}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.22em] text-muted-foreground">{date.toLocaleDateString([], { weekday: "short" })}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {view === "Month" && renderMonthView()}
            {view === "Week" && renderWeekView()}
            {view === "Day" && renderDayView()}
          </Panel>

          <Panel className="p-6 bg-[hsl(var(--surface)/0.55)]" testid="calendar-list-panel">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="overline text-muted-foreground">Event list</p>
                <h3 className="mt-2 text-xl font-semibold">Filtered events</h3>
              </div>
              <span className="rounded-full border hairline px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{view}</span>
            </div>
            <div className="grid gap-3">
              {displayedEvents.length ? displayedEvents.map((event) => (
                <EventChip key={event.id} event={event} onClick={() => openEdit(event)} />
              )) : (
                <div className="rounded-3xl border hairline bg-[hsl(var(--surface)/0.35)] p-6 text-center text-sm text-muted-foreground">No events match the filters.</div>
              )}
            </div>
          </Panel>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <EventModal
            event={editingEvent}
            onClose={() => setIsModalOpen(false)}
            onDelete={deleteEvent}
            onSave={saveEvent}
            categories={CALENDAR_CATEGORIES}
            departments={EVENT_DEPARTMENTS}
            providers={EVENT_MEETING_PROVIDERS}
            reminders={EVENT_REMINDERS}
            repeats={EVENT_REPEAT}
            locations={EVENT_LOCATIONS}
            participantsList={EVENT_PARTICIPANTS}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
