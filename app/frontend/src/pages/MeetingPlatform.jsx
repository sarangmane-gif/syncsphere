import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, MonitorUp, Hand, MessageSquare,
  Users, Circle, PenTool, NotebookPen, PhoneOff, Sparkles, Send, Eraser,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Panel, Pill } from "@/components/ui-kit/Primitives";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { createMeeting, connectZoom, getMeetings, getZoomStatus, startMeeting } from "@/lib/api";
import { PARTICIPANTS, MEETING_CHAT, IMAGES } from "@/data/mock";

const Whiteboard = () => {
  const ref = useRef(null);
  const drawing = useRef(false);

  const pos = (e) => {
    const r = ref.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  const start = (e) => {
    drawing.current = true;
    const ctx = ref.current.getContext("2d");
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const ctx = ref.current.getContext("2d");
    const p = pos(e);
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const end = () => (drawing.current = false);
  const clear = () => {
    const c = ref.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="overline flex items-center gap-2"><PenTool className="h-3 w-3" /> Whiteboard</p>
        <button onClick={clear} data-testid="whiteboard-clear-btn" className="flex items-center gap-2 text-xs text-muted-foreground hover:gold-text">
          <Eraser className="h-3.5 w-3.5" /> Clear
        </button>
      </div>
      <canvas
        ref={ref}
        width={520}
        height={260}
        data-testid="whiteboard-canvas"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
        className="w-full cursor-crosshair rounded-xl border hairline bg-black/40"
      />
    </div>
  );
};

const Tile = ({ p, big }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`relative overflow-hidden rounded-2xl border ${p.speaking ? "border-[hsl(var(--gold)/0.6)]" : "hairline"} bg-black/60 ${big ? "aspect-[16/9]" : "aspect-video"}`}
    data-testid={`participant-tile-${p.id}`}
  >
      {p.stream ? (
        <video
          ref={(el) => {
            if (el && p.stream) {
              el.srcObject = p.stream;
            }
          }}
          autoPlay
          playsInline
          muted={!!p.muted}
          className="h-full w-full object-cover"
        />
      ) : p.video ? (
        <img src={IMAGES.team} alt={p.name} className="h-full w-full object-cover opacity-80" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[hsl(var(--gold)/0.4)] font-display text-xl gold-text">
            {p.name.split(" ").map((n) => n[0]).join("")}
          </span>
        </div>
      )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
    {p.speaking && (
      <motion.div
        className="absolute inset-0 rounded-2xl"
        animate={{ boxShadow: ["inset 0 0 0 1px rgba(212,175,55,0.3)", "inset 0 0 24px 2px rgba(212,175,55,0.45)", "inset 0 0 0 1px rgba(212,175,55,0.3)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    )}
    <div className="absolute bottom-3 left-3 flex items-center gap-2">
      <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] text-white">{p.name}</span>
      {p.muted ? <MicOff className="h-3.5 w-3.5 text-red-400" /> : <Mic className="h-3.5 w-3.5 text-emerald-400" />}
      {p.hand && <Hand className="h-3.5 w-3.5 text-amber-400" />}
    </div>
    <span className="absolute right-3 top-3 overline">{p.role}</span>
  </motion.div>
);

const ControlButton = ({ icon: Icon, label, active, danger, onClick, testid }) => (
  <button
    onClick={onClick}
    data-testid={testid}
    aria-label={label}
    className={`flex h-12 w-12 items-center justify-center rounded-full border glow-hover ${
      danger
        ? "border-red-500/50 bg-red-500/15 text-red-400"
        : active
        ? "border-[hsl(var(--gold)/0.55)] bg-[hsl(var(--gold)/0.12)] gold-text"
        : "hairline text-muted-foreground"
    }`}
  >
    <Icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
  </button>
);

export default function MeetingPlatform() {
  const t = useTranslation();
  const [inLobby, setInLobby] = useState(true);
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [displayStream, setDisplayStream] = useState(null);
  const [devices, setDevices] = useState({ cams: [], mics: [], speakers: [] });
  const [selected, setSelected] = useState({ cam: null, mic: null, speaker: null });
  const [mediaError, setMediaError] = useState(null);
  const { user } = useAuth();
  const authToken = localStorage.getItem("syncsphere-token");
  const [share, setShare] = useState(false);
  const [hand, setHand] = useState(false);
  const [recording, setRecording] = useState(false);
  const [blur, setBlur] = useState(false);
  const [tab, setTab] = useState("chat");
  const [chat, setChat] = useState(MEETING_CHAT);
  const [msg, setMsg] = useState("");
  const [notes, setNotes] = useState("Agenda\n1. Platform freeze readiness\n2. Compute allocation\n3. Horizon rollout sequence");
  const [seconds, setSeconds] = useState(0);
  const [zoomConnected, setZoomConnected] = useState(false);
  const [zoomLoading, setZoomLoading] = useState(true);
  const [meetings, setMeetings] = useState([]);
  const [meetingTopic, setMeetingTopic] = useState("SyncSphere Standup");
  const [meetingDuration, setMeetingDuration] = useState(60);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const previewRef = useRef(null);
  const meetingVideoRef = useRef(null);
  const localParticipantId = "local-user";

  const loadMeetings = async () => {
    if (!authToken) return;
    setMeetingLoading(true);
    try {
      const data = await getMeetings(authToken);
      setMeetings(data.meetings || []);
    } catch (err) {
      setMeetings([]);
    } finally {
      setMeetingLoading(false);
    }
  };

  const refreshZoomState = async () => {
    if (!authToken) return;
    setZoomLoading(true);
    try {
      const result = await getZoomStatus(authToken);
      setZoomConnected(Boolean(result?.connected));
    } catch (err) {
      setZoomConnected(false);
    } finally {
      setZoomLoading(false);
    }
  };

  useEffect(() => {
    if (!authToken) return;
    refreshZoomState();
    loadMeetings();
  }, [authToken]);

  useEffect(() => {
    if (!authToken) return;
    const params = new URLSearchParams(window.location.search);
    const zoom = params.get("zoom");
    const message = params.get("message");
    if (zoom === "connected") {
      toast.success(t.zoomConnected || "Zoom connected");
      setZoomConnected(true);
      loadMeetings();
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (zoom === "error") {
      toast.error(`${t.zoomConnectionFailed || "Zoom connection failed"}: ${message || t.unknownError || "Unknown error"}`);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [authToken, t]);

  const handleZoomConnect = async () => {
    if (!authToken) {
      toast.error(t.loginRequired || "Please sign in to connect Zoom.");
      return;
    }
    try {
      const result = await connectZoom(authToken);
      if (result?.url) {
        window.location.href = result.url;
      } else {
        toast.error(t.zoomConnectFailed || "Unable to connect Zoom.");
      }
    } catch (err) {
      toast.error(t.zoomConnectFailed || "Unable to connect Zoom.");
    }
  };

  const handleCreateMeeting = async () => {
    if (!zoomConnected) {
      toast.error(t.zoomNotConnected || "Please connect Zoom before creating a meeting.");
      return;
    }
    if (!meetingTopic.trim()) {
      toast.error(t.topicRequired || "Meeting topic is required.");
      return;
    }
    try {
      await createMeeting(authToken, {
        topic: meetingTopic,
        duration: meetingDuration,
        start_time: new Date().toISOString(),
      });
      toast.success(t.zoomMeetingCreated || "Zoom meeting created.");
      await loadMeetings();
    } catch (err) {
      toast.error(t.zoomMeetingCreateFailed || "Unable to create Zoom meeting.");
    }
  };

  const handleJoinMeeting = (meeting) => {
    if (!meeting?.join_url) {
      toast.error(t.zoomJoinFailed || "Unable to join meeting.");
      return;
    }
    window.open(meeting.join_url, "_blank");
  };

  const handleStartMeeting = (meeting) => {
    if (!meeting?.start_url) {
      toast.error(t.zoomStartFailed || "Unable to start meeting.");
      return;
    }
    window.open(meeting.start_url, "_blank");
  };

  useEffect(() => {
    if (inLobby) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [inLobby]);

  useEffect(() => {
    // keep preview video element in sync with local stream
    if (previewRef.current) {
      previewRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (meetingVideoRef.current) {
      // if presenting a display stream show it, otherwise show camera
      meetingVideoRef.current.srcObject = displayStream || localStream;
      // apply audio output if supported
      if (selected.speaker && meetingVideoRef.current.setSinkId) {
        meetingVideoRef.current.setSinkId(selected.speaker).catch(() => {});
      }
    }
  }, [displayStream, localStream, selected.speaker]);

  useEffect(() => {
    // enumerate devices
    const updateDevices = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        const cams = list.filter((d) => d.kind === "videoinput");
        const mics = list.filter((d) => d.kind === "audioinput");
        const speakers = list.filter((d) => d.kind === "audiooutput");
        setDevices({ cams, mics, speakers });
        setSelected((s) => ({
          cam: s.cam || (cams[0] && cams[0].deviceId) || null,
          mic: s.mic || (mics[0] && mics[0].deviceId) || null,
          speaker: s.speaker || (speakers[0] && speakers[0].deviceId) || null,
        }));
      } catch (e) {
        // ignore
      }
    };
    updateDevices();
    // refresh on devicechange
    navigator.mediaDevices && navigator.mediaDevices.addEventListener && navigator.mediaDevices.addEventListener("devicechange", updateDevices);
    return () => navigator.mediaDevices && navigator.mediaDevices.removeEventListener && navigator.mediaDevices.removeEventListener("devicechange", updateDevices);
  }, []);

  useEffect(() => {
    // when selected device changes, restart local stream
    const restart = async () => {
      if (!selected.cam && !selected.mic) return;
      try {
        const constraints = {
          video: selected.cam ? { deviceId: { exact: selected.cam } } : false,
          audio: selected.mic ? { deviceId: { exact: selected.mic } } : false,
        };
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        stopLocalMedia();
        setLocalStream(s);
        setMediaError(null);
      } catch (err) {
        setMediaError(err?.message || String(err));
      }
    };
    // only auto-start if user allowed previously
    if (localStream || (selected.cam || selected.mic)) {
      restart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.cam, selected.mic]);

  const stopLocalMedia = () => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
    }
  };

  const startLocalMedia = async ({ video = true, audio = false } = {}) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMediaError(t.browserDoesNotSupportMedia || "Your browser does not support camera access.");
      return null;
    }

    try {
      const constraints = {
        video: video ? (selected.cam ? { deviceId: { exact: selected.cam } } : true) : false,
        audio: audio ? (selected.mic ? { deviceId: { exact: selected.mic } } : true) : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stopLocalMedia();
      setLocalStream(stream);
      setMediaError(null);
      return stream;
    } catch (err) {
      setMediaError(err?.message || String(err));
      return null;
    }
  };

  useEffect(() => {
    // cleanup on unmount
    return () => {
      stopLocalMedia();
      if (displayStream) {
        displayStream.getTracks().forEach((t) => t.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timer = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  if (inLobby) {
    return (
      <div data-testid="meeting-lobby">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <PageHeader
            overline={t.meetingPlatform || "Meeting platform"}
            title={t.missionControlLobby || "Collaboration Hub"}
            description={t.meetingLobbyDescription || "Check your devices, then enter the room. Rooms are ephemeral and encrypted end to end."}
          />
          <span className="rounded-full border border-[hsl(var(--gold)/0.5)] bg-[rgba(212,175,55,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[hsl(var(--gold))] shadow-[0_0_24px_rgba(212,175,55,0.25)]">
            {t.inProgress || "In progress"}
          </span>
        </div>
        <div className="grid gap-6 lg:grid-cols-12">
          <Panel className="p-7 lg:col-span-7" testid="lobby-preview">
            <div className="relative aspect-video overflow-hidden rounded-2xl border hairline bg-black">
              {cam && localStream ? (
                <video
                  ref={previewRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover ${blur ? "blur-md" : ""}`}
                />
              ) : cam && !localStream ? (
                <div className="flex h-full items-center justify-center flex-col gap-3">
                  <p className="overline">{t.cameraAccessRequired || "Camera access is required for video."}</p>
                  <div>
                    <button
                      onClick={async () => {
                        setMediaError(null);
                        const s = await startLocalMedia({ video: true, audio: true });
                        if (s) {
                          setSelected((prev) => ({ ...prev, cam: prev.cam || (devices.cams && devices.cams[0]?.deviceId) }));
                          setCam(true);
                        }
                      }}
                      className="rounded-full border hairline px-4 py-2 gold-text"
                    >
                      {t.retry || "Retry"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center overline">{t.cameraOff || "Camera off"}</div>
              )}
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
                <ControlButton icon={mic ? Mic : MicOff} label={t.toggleMic || "Toggle mic"} active={mic} onClick={() => {
                  // toggle mic track
                  if (localStream) {
                    localStream.getAudioTracks().forEach((tr) => (tr.enabled = !mic));
                  }
                  setMic(!mic);
                  toast.success(mic ? t.micOffMessage || "Microphone muted" : t.micOnMessage || "Microphone unmuted");
                }} testid="lobby-mic-btn" />
                <ControlButton icon={cam ? VideoIcon : VideoOff} label={t.toggleCamera || "Toggle camera"} active={cam} onClick={async () => {
                  if (localStream) {
                    localStream.getVideoTracks().forEach((tr) => (tr.enabled = !cam));
                    setCam(!cam);
                    toast.success(cam ? t.cameraOffMessage || "Camera turned off" : t.cameraOnMessage || "Camera turned on");
                    return;
                  }
                  const stream = await startLocalMedia({ video: true, audio: mic });
                  if (stream) {
                    setCam(true);
                    toast.success(t.cameraOnMessage || "Camera turned on");
                  } else {
                    setCam(false);
                  }
                }} testid="lobby-cam-btn" />
                <ControlButton icon={Sparkles} label={t.backgroundBlur || "Background blur"} active={blur} onClick={() => setBlur(!blur)} testid="lobby-blur-btn" />
              </div>
            </div>
            <button
              onClick={() => { setInLobby(false); toast.success(t.joinedMeeting || "Joined Q3 Company All-Hands"); }}
              data-testid="join-meeting-btn"
              className="mt-6 w-full rounded-full bg-[hsl(var(--gold))] py-4 text-xs font-bold uppercase tracking-[0.25em] text-black hover:brightness-110"
            >
              {t.enterMeetingRoom || "Enter meeting room"}
            </button>
          </Panel>

          <Panel className="p-7 lg:col-span-5" testid="lobby-meetings" delay={0.08}>
            <div className="mb-3">
              <div className="flex items-center justify-between">
                <p className="overline">{t.deviceSettings || "Device settings"}</p>
                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${zoomConnected ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                  {zoomLoading ? t.checkingZoom || "Checking…" : zoomConnected ? t.zoomConnected || "Zoom connected" : t.zoomNotConnected || "Not connected"}
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs">Camera</label>
                <select value={selected.cam || ""} onChange={(e) => setSelected((s) => ({ ...s, cam: e.target.value }))} className="rounded-md bg-[hsl(var(--muted)/0.25)] p-2 text-sm">
                  <option value="">Default</option>
                  {devices.cams.map((c) => <option key={c.deviceId} value={c.deviceId}>{c.label || `Camera ${c.deviceId}`}</option>)}
                </select>
                <label className="text-xs">Microphone</label>
                <select value={selected.mic || ""} onChange={(e) => setSelected((s) => ({ ...s, mic: e.target.value }))} className="rounded-md bg-[hsl(var(--muted)/0.25)] p-2 text-sm">
                  <option value="">Default</option>
                  {devices.mics.map((c) => <option key={c.deviceId} value={c.deviceId}>{c.label || `Mic ${c.deviceId}`}</option>)}
                </select>
                <label className="text-xs">Speaker</label>
                <select value={selected.speaker || ""} onChange={(e) => setSelected((s) => ({ ...s, speaker: e.target.value }))} className="rounded-md bg-[hsl(var(--muted)/0.25)] p-2 text-sm">
                  <option value="">Default</option>
                  {devices.speakers.map((c) => <option key={c.deviceId} value={c.deviceId}>{c.label || `Speaker ${c.deviceId}`}</option>)}
                </select>
                {mediaError && <p className="text-xs text-red-400 mt-1">{mediaError}</p>}
              </div>
            </div>
            <div className="mb-6 rounded-3xl border border-[hsl(var(--gold)/0.1)] bg-[hsl(var(--muted)/0.08)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="overline">{t.zoomIntegration || "Zoom integration"}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{t.zoomIntegrationDescription || "Connect your Zoom account to create and join real meetings from SyncSphere."}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-[hsl(var(--gold))]">
                    {t.zoomIntegrationWIPHeading || "Zoom Integration WIP"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t.zoomIntegrationWIP || "Zoom connectivity is still a work in progress; some actions may only be partially available."}
                  </p>
                </div>
                <button onClick={handleZoomConnect} className="rounded-full bg-[hsl(var(--gold))] py-3 text-xs font-bold uppercase tracking-[0.25em] text-black hover:brightness-110">
                  {zoomConnected ? t.zoomReconnect || "Reconnect Zoom" : t.connectZoom || "Connect Zoom"}
                </button>
                <button onClick={refreshZoomState} className="rounded-full border hairline py-3 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground hover:border-white/20">
                  {t.refreshStatus || "Refresh status"}
                </button>
              </div>
            </div>
            <div className="mb-5">
              <p className="overline">{t.createZoomMeeting || "Create a Zoom meeting"}</p>
              <div className="mt-3 space-y-3">
                <input
                  value={meetingTopic}
                  onChange={(e) => setMeetingTopic(e.target.value)}
                  placeholder={t.meetingTopicPlaceholder || "Meeting topic"}
                  className="w-full rounded-xl border hairline bg-[hsl(var(--muted)/0.25)] px-4 py-3 text-sm outline-none"
                />
                <select value={meetingDuration} onChange={(e) => setMeetingDuration(Number(e.target.value))} className="w-full rounded-xl border hairline bg-[hsl(var(--muted)/0.25)] p-3 text-sm outline-none">
                  {[30, 45, 60, 90, 120].map((minutes) => (
                    <option key={minutes} value={minutes}>{`${minutes} ${t.minutes || "minutes"}`}</option>
                  ))}
                </select>
                <button onClick={handleCreateMeeting} className="w-full rounded-full bg-[hsl(var(--gold))] py-3 text-xs font-bold uppercase tracking-[0.25em] text-black hover:brightness-110">
                  {t.createMeeting || "Create meeting"}
                </button>
              </div>
            </div>
            <p className="overline mb-5">{t.upcomingMeetings || "Upcoming meetings"}</p>
            <div className="space-y-3">
              {meetingLoading ? (
                <div className="rounded-xl border hairline p-4 text-sm text-muted-foreground">{t.loadingMeetings || "Loading meetings…"}</div>
              ) : meetings.length > 0 ? (
                meetings.map((meeting) => (
                  <div key={meeting.id} className="rounded-xl border hairline p-4 glow-hover">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{meeting.topic}</p>
                        <p className="overline mt-1">{new Date(meeting.start_time).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleJoinMeeting(meeting)} className="rounded-full border border-[hsl(var(--gold)/0.25)] px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-gold-text">
                          {t.join || "Join"}
                        </button>
                        {meeting.is_host && (
                          <button onClick={() => handleStartMeeting(meeting)} className="rounded-full bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:bg-white/10">
                            {t.start || "Start"}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="overline mt-3">{t.hostedBy || "Hosted by"} {meeting.host_name}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border hairline p-4 text-sm text-muted-foreground">
                  {zoomConnected ? t.noUpcomingMeetings || "No upcoming Zoom meetings" : t.connectZoomToSeeMeetings || "Connect Zoom to see upcoming meetings"}
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="meeting-room">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <p className="overline">{t.liveSession || "Live · Q3 Company All-Hands"}</p>
          <h1 className="mt-2 font-display text-3xl font-extralight">{t.missionControl || "Collaboration Hub"}</h1>
        </div>
        <span className="rounded-full border border-[hsl(var(--gold)/0.5)] bg-[rgba(212,175,55,0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[hsl(var(--gold))] shadow-[0_0_24px_rgba(212,175,55,0.25)]">
          {t.inProgress || "In progress"}
        </span>
        <div className="ml-auto flex items-center gap-3">
          {recording && (
            <motion.span animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="flex items-center gap-2 rounded-full border border-red-500/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-red-400">
              <Circle className="h-2.5 w-2.5 fill-red-500 text-red-500" /> Recording
            </motion.span>
          )}
          <span className="rounded-full border hairline px-4 py-1.5 font-mono text-xs gold-text" data-testid="meeting-timer">{timer}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          {/* Primary meeting surface: show screen share when active, otherwise camera */}
          <Panel className="p-3" testid="primary-surface">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-[hsl(var(--gold)/0.12)] bg-black">
              {displayStream ? (
                <video ref={meetingVideoRef} autoPlay playsInline className="h-full w-full object-cover" />
              ) : localStream ? (
                <video ref={meetingVideoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center overline">{t.cameraOff || "Camera off"}</div>
              )}
              {displayStream && (
                <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 overline gold-text">Sharing</span>
              )}
            </div>
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {/* local participant first */}
            <Tile key={localParticipantId} p={{ id: localParticipantId, name: t.you || "You", role: "You", muted: !mic, hand, speaking: false, stream: localStream, video: !!localStream }} />
            {PARTICIPANTS.map((p) => (
              <Tile key={p.id} p={p} />
            ))}
          </div>

          <Panel className="p-6" testid="meeting-controls">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <ControlButton icon={mic ? Mic : MicOff} label={t.mic || "Mic"} active={mic} onClick={() => {
                if (localStream) localStream.getAudioTracks().forEach((tr) => (tr.enabled = !mic));
                setMic(!mic);
              }} testid="mic-btn" />
              <ControlButton icon={cam ? VideoIcon : VideoOff} label={t.video || "Camera"} active={cam} onClick={async () => {
                if (localStream) {
                  localStream.getVideoTracks().forEach((tr) => (tr.enabled = !cam));
                  setCam(!cam);
                  return;
                }

                const stream = await startLocalMedia({ video: true, audio: mic });
                if (stream) {
                  setCam(true);
                } else {
                  setCam(false);
                }
              }} testid="cam-btn" />
              <ControlButton icon={MonitorUp} label={t.shareScreen || "Share screen"} active={share} onClick={async () => {
                if (share) {
                  // stop sharing
                  if (displayStream) {
                    displayStream.getTracks().forEach((t) => t.stop());
                    setDisplayStream(null);
                  }
                  setShare(false);
                  toast.success(t.screenShareStopped || "Screen share stopped");
                } else {
                  try {
                    const s = await navigator.mediaDevices.getDisplayMedia({ video: true });
                    setDisplayStream(s);
                    setShare(true);
                    // stop when user ends sharing from browser UI
                    const [vt] = s.getVideoTracks();
                    if (vt) vt.onended = () => {
                      setDisplayStream(null);
                      setShare(false);
                    };
                    toast.success(t.screenShareStarted || "Screen share started");
                  } catch (err) {
                    toast.error(t.screenShareFailed || "Screen share failed or cancelled");
                  }
                }
              }} testid="share-btn" />
              <ControlButton icon={Hand} label={t.raiseHand || "Raise hand"} active={hand} onClick={() => { setHand(!hand); toast.success(hand ? t.handLowered || "Hand lowered" : t.handRaised || "Hand raised"); }} testid="hand-btn" />
              <ControlButton icon={Circle} label={t.record || "Record"} active={recording} onClick={() => setRecording(!recording)} testid="record-btn" />
              <ControlButton icon={Sparkles} label={t.backgroundBlur || "Background blur"} active={blur} onClick={() => setBlur(!blur)} testid="blur-btn" />
              <ControlButton icon={PhoneOff} label={t.leave || "Leave"} danger onClick={() => {
                // stop all media
                stopLocalMedia();
                if (displayStream) displayStream.getTracks().forEach((t) => t.stop());
                setDisplayStream(null);
                setShare(false);
                setInLobby(true);
                setSeconds(0);
                toast.info(t.leftMeeting || "You left the meeting");
              }} testid="leave-btn" />
            </div>
          </Panel>
        </div>

        <Panel className="lg:col-span-4" testid="meeting-side-panel">
          <div className="flex border-b hairline">
            {[
              ["chat", MessageSquare],
              ["people", Users],
              ["board", PenTool],
              ["notes", NotebookPen],
            ].map(([key, Icon]) => {
              const label = t[key] || key;
              return (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  data-testid={`meeting-tab-${key}`}
                  className={`flex flex-1 items-center justify-center gap-2 py-4 text-[11px] font-bold uppercase tracking-widest ${
                    tab === key ? "gold-text border-b border-[hsl(var(--gold))]" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              );
            })}
          </div>

          <div className="p-5">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {tab === "chat" && (
                  <div className="space-y-3" data-testid="meeting-chat">
                    <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                      {chat.map((c) => (
                        <div key={c.id} className="rounded-xl border hairline p-3">
                          <p className="flex items-center justify-between text-xs font-semibold">
                            {c.author} <span className="font-mono text-[10px] text-muted-foreground">{c.time}</span>
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        data-testid="meeting-chat-input"
                        placeholder={t.messageTheRoom || "Message the room…"}
                        className="flex-1 rounded-full border hairline bg-[hsl(var(--muted)/0.35)] px-4 py-2 text-sm outline-none"
                      />
                      <button
                        onClick={() => {
                          if (!msg.trim()) return;
                          setChat([...chat, { id: `c-${Date.now()}`, author: "Amara Vance", body: msg, time: timer }]);
                          setMsg("");
                        }}
                        data-testid="meeting-chat-send"
                        aria-label="Send message"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--gold))] text-black"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {tab === "people" && (
                  <div className="space-y-3" data-testid="meeting-participants">
                    {PARTICIPANTS.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 rounded-xl border hairline p-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[hsl(var(--gold)/0.35)] text-[11px] gold-text">
                          {p.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{p.name}</p>
                          <p className="overline">{p.role}</p>
                        </div>
                        {p.hand && <Hand className="h-4 w-4 text-amber-400" />}
                        {p.muted ? <MicOff className="h-4 w-4 text-red-400" /> : <Mic className="h-4 w-4 text-emerald-400" />}
                      </div>
                    ))}
                  </div>
                )}

                {tab === "board" && <Whiteboard />}

                {tab === "notes" && (
                  <div data-testid="meeting-notes">
                    <p className="overline mb-3">{t.meetingNotes || "Meeting notes"}</p>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={12}
                      data-testid="meeting-notes-input"
                      className="w-full resize-none rounded-xl border hairline bg-[hsl(var(--muted)/0.35)] p-4 font-mono text-xs outline-none"
                    />
                    <button
                      onClick={() => toast.success(t.minutesSaved || "Minutes saved to Team Calendar")}
                      data-testid="save-notes-btn"
                      className="mt-3 w-full rounded-full border border-[hsl(var(--gold)/0.4)] py-2.5 text-[11px] font-bold uppercase tracking-widest gold-text"
                    >
                      {t.publishMinutes || "Publish minutes"}
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Panel>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Pill tone="gold">End-to-end encrypted</Pill>
        <Pill>Auto-transcription on</Pill>
        <Pill>Latency 18 ms</Pill>
      </div>
    </div>
  );
}
