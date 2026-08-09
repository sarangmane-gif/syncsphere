import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: `${BASE}/api`,
});

export const getAuthHeaders = (token) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

/* ---------- Auth ---------- */
export const signupUser = (payload) => client.post("/auth/signup", payload).then((r) => r.data);
export const loginUser = (payload) => client.post("/auth/login", payload).then((r) => r.data);
export const getCurrentUser = (token) => client.get("/auth/me", { headers: getAuthHeaders(token) }).then((r) => r.data);
export const logoutUser = (token) => client.post("/auth/logout", { token }, { headers: getAuthHeaders(token) }).then((r) => r.data);

/* ---------- Announcements ---------- */
export const getAnnouncements = () => client.get("/announcements").then((r) => r.data);
export const createAnnouncement = (payload) => client.post("/announcements", payload).then((r) => r.data);
export const reactAnnouncement = ({ id, emoji }) =>
  client.post(`/announcements/${id}/react`, { emoji }).then((r) => r.data);
export const commentAnnouncement = ({ id, author, body }) =>
  client.post(`/announcements/${id}/comment`, { author, body }).then((r) => r.data);
export const readAnnouncement = ({ id, user }) =>
  client.post(`/announcements/${id}/read`, { user }).then((r) => r.data);

/* ---------- Leave ---------- */
export const getLeaves = () => client.get("/leaves").then((r) => r.data);
export const createLeave = (payload) => client.post("/leaves", payload).then((r) => r.data);
export const decideLeave = ({ id, status, manager_note }) =>
  client.post(`/leaves/${id}/decide`, { status, manager_note }).then((r) => r.data);

/* ---------- Feedback ---------- */
export const getFeedback = () => client.get("/feedback").then((r) => r.data);
export const createFeedback = (payload) => client.post("/feedback", payload).then((r) => r.data);

/* ---------- Safety ---------- */
export const getSafety = () => client.get("/safety").then((r) => r.data);
export const getSafetyReports = () => client.get("/safety").then((r) => r.data);
export const createSafetyReport = (payload) => client.post("/safety", payload).then((r) => r.data);

/* ---------- Zoom ---------- */
export const getZoomStatus = (token) => client.get("/zoom/status", { headers: getAuthHeaders(token) }).then((r) => r.data);
export const connectZoom = (token) => client.get("/zoom/connect", { headers: getAuthHeaders(token) }).then((r) => r.data);

/* ---------- Meetings ---------- */
export const getMeetings = (token) => client.get("/meetings", { headers: getAuthHeaders(token) }).then((r) => r.data);
export const createMeeting = (token, payload) => client.post("/meetings", payload, { headers: getAuthHeaders(token) }).then((r) => r.data);
export const startMeeting = (token, meetingId) => client.post(`/meetings/${meetingId}/start`, {}, { headers: getAuthHeaders(token) }).then((r) => r.data);

/* ---------- Documents ---------- */
export const getDocuments = (token, params = {}) =>
  client.get("/documents", { headers: getAuthHeaders(token), params }).then((r) => r.data);
export const uploadDocument = (token, formData) =>
  client.post("/documents", formData, {
    headers: {
      ...getAuthHeaders(token),
    },
  }).then((r) => r.data);
export const deleteDocument = (token, documentId) =>
  client.post(`/documents/${documentId}`, {}, { headers: getAuthHeaders(token) }).then((r) => r.data);
