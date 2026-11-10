/**
 * SYS · MindX Finals — API service layer.
 *
 * Every network call the app makes lives here. To connect a real backend:
 *   1. Set VITE_API_BASE_URL (e.g. https://api.sys-youth.org) in the environment.
 *   2. Implement the endpoints listed in ENDPOINTS on the server with the same shapes.
 * While VITE_API_BASE_URL is empty, a browser-only demo store (localStorage) is used so the
 * UI can be previewed end-to-end. Demo data never leaves the visitor's browser.
 */

export const API_BASE_URL: string = (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "";
export const IS_DEMO_MODE = API_BASE_URL === "";

export const ENDPOINTS = {
  /** POST multipart/form-data: participantCode, fullName, phone, nationalId, projectLink?, file? → Submission */
  submit: "/api/finalists/submissions",
  /** POST JSON { username, password } → { token, user: { name, email } } */
  login: "/api/auth/login",
  /** POST (Bearer) → 204 */
  logout: "/api/auth/logout",
  /** GET (Bearer) → Submission[] */
  listSubmissions: "/api/admin/submissions",
  /** PATCH (Bearer) JSON { score, notes } → Submission */
  evaluate: (id: string) => `/api/admin/submissions/${encodeURIComponent(id)}/evaluation`,
  /** GET (Bearer) → file stream (Content-Disposition: attachment) */
  downloadFile: (id: string) => `/api/admin/submissions/${encodeURIComponent(id)}/file`,
} as const;

export type EvaluationStatus = "pending" | "evaluated";

export interface Submission {
  id: string;
  participantCode: string;
  fullName: string;
  phone: string;
  nationalId: string;
  projectLink: string;
  fileName: string | null;
  fileSize: number | null;
  /** Demo mode only: small files are kept as data URLs so judges can preview them. */
  fileDataUrl?: string | null;
  fileUrl?: string | null;
  score: number | null;
  notes: string;
  status: EvaluationStatus;
  submittedAt: string;
  evaluatedAt: string | null;
}

export interface SubmissionInput {
  participantCode: string;
  fullName: string;
  phone: string;
  nationalId: string;
  projectLink: string;
  file: File | null;
}

export interface AdminSession {
  token: string;
  user: { name: string; email: string };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 0,
  ) {
    super(message);
  }
}

/* ------------------------------------------------------------------ */
/* Session                                                             */
/* ------------------------------------------------------------------ */

const SESSION_KEY = "sys_admin_session";

export function getSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

function setSession(session: AdminSession | null) {
  if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(SESSION_KEY);
}

/* ------------------------------------------------------------------ */
/* HTTP helper                                                         */
/* ------------------------------------------------------------------ */

async function http<T>(path: string, init: RequestInit = {}, auth = false): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (auth) {
    const s = getSession();
    if (!s) throw new ApiError("انتهت الجلسة، سجّل دخول تاني", 401);
    headers.set("Authorization", `Bearer ${s.token}`);
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    let message = `حصل خطأ (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      /* non-JSON error body */
    }
    if (res.status === 401) setSession(null);
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ------------------------------------------------------------------ */
/* Demo store (used only while VITE_API_BASE_URL is empty)             */
/* ------------------------------------------------------------------ */

const DEMO_STORE_KEY = "sys_mindx_demo_submissions";
const DEMO_FILE_LIMIT = 2 * 1024 * 1024; // keep previews small so localStorage doesn't overflow
const DEMO_CREDENTIALS = {
  email: "technology.sys.2026@gmail.com",
  password: "technology@sys#2026",
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function readDemo(): Submission[] {
  try {
    return JSON.parse(localStorage.getItem(DEMO_STORE_KEY) ?? "[]") as Submission[];
  } catch {
    return [];
  }
}

function writeDemo(list: Submission[]) {
  try {
    localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(list));
  } catch {
    // Quota exceeded: drop stored file previews and retry.
    localStorage.setItem(
      DEMO_STORE_KEY,
      JSON.stringify(list.map((s) => ({ ...s, fileDataUrl: null }))),
    );
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export async function submitFinalist(input: SubmissionInput): Promise<Submission> {
  if (!IS_DEMO_MODE) {
    const fd = new FormData();
    fd.append("participantCode", input.participantCode);
    fd.append("fullName", input.fullName);
    fd.append("phone", input.phone);
    fd.append("nationalId", input.nationalId);
    fd.append("projectLink", input.projectLink);
    if (input.file) fd.append("file", input.file);
    return http<Submission>(ENDPOINTS.submit, { method: "POST", body: fd });
  }

  await delay(900);
  const list = readDemo();
  if (list.some((s) => s.nationalId === input.nationalId)) {
    throw new ApiError("الرقم القومي ده اتسجل قبل كده. لو محتاج تعدّل، كلّم الدعم الفني.", 409);
  }
  const fileDataUrl =
    input.file && input.file.size <= DEMO_FILE_LIMIT ? await fileToDataUrl(input.file) : null;
  const submission: Submission = {
    id: crypto.randomUUID(),
    participantCode: input.participantCode,
    fullName: input.fullName,
    phone: input.phone,
    nationalId: input.nationalId,
    projectLink: input.projectLink,
    fileName: input.file?.name ?? null,
    fileSize: input.file?.size ?? null,
    fileDataUrl,
    score: null,
    notes: "",
    status: "pending",
    submittedAt: new Date().toISOString(),
    evaluatedAt: null,
  };
  writeDemo([submission, ...list]);
  return submission;
}

export async function login(username: string, password: string): Promise<AdminSession> {
  if (!IS_DEMO_MODE) {
    const session = await http<AdminSession>(ENDPOINTS.login, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setSession(session);
    return session;
  }

  await delay(700);
  if (username.trim().toLowerCase() !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
    throw new ApiError("بيانات الدخول غير صحيحة", 401);
  }
  const session: AdminSession = {
    token: `demo-${crypto.randomUUID()}`,
    user: { name: "لجنة الفرز والتحكيم", email: DEMO_CREDENTIALS.email },
  };
  setSession(session);
  return session;
}

export async function logout(): Promise<void> {
  if (!IS_DEMO_MODE) {
    try {
      await http<void>(ENDPOINTS.logout, { method: "POST" }, true);
    } catch {
      /* ignore */
    }
  }
  setSession(null);
}

export async function listSubmissions(): Promise<Submission[]> {
  if (!IS_DEMO_MODE) return http<Submission[]>(ENDPOINTS.listSubmissions, {}, true);
  if (!getSession()) throw new ApiError("انتهت الجلسة، سجّل دخول تاني", 401);
  await delay(300);
  return readDemo();
}

export async function saveEvaluation(id: string, score: number, notes: string): Promise<Submission> {
  if (!IS_DEMO_MODE) {
    return http<Submission>(ENDPOINTS.evaluate(id), {
      method: "PATCH",
      body: JSON.stringify({ score, notes }),
    }, true);
  }
  await delay(400);
  const list = readDemo();
  const idx = list.findIndex((s) => s.id === id);
  const current = list[idx];
  if (!current) throw new ApiError("المشاركة مش موجودة", 404);
  const updated: Submission = {
    ...current,
    score,
    notes,
    status: "evaluated",
    evaluatedAt: new Date().toISOString(),
  };
  list[idx] = updated;
  writeDemo(list);
  return updated;
}

/** Returns a URL the judge can open/download for the submitted work file, or null. */
export function getFileUrl(s: Submission): string | null {
  if (!IS_DEMO_MODE) return s.fileUrl ?? (s.fileName ? `${API_BASE_URL}${ENDPOINTS.downloadFile(s.id)}` : null);
  return s.fileDataUrl ?? null;
}
