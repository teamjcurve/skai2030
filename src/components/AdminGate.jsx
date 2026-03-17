import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "admin_authed_until";
const DEFAULT_TTL_MS = 8 * 60 * 60 * 1000;

function getNow() {
  return Date.now();
}

function readAuthedUntil() {
  if (typeof window === "undefined") return 0;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function writeAuthedUntil(until) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, String(until));
}

function clearAuth() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

const AdminAuthContext = createContext(null);

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export default function AdminGate({ children }) {
  const expectedPassword = (import.meta.env.VITE_ADMIN_PASSWORD || "").trim();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authedUntil, setAuthedUntil] = useState(() => readAuthedUntil());

  const isAuthed = useMemo(() => authedUntil > getNow(), [authedUntil]);

  useEffect(() => {
    if (!isAuthed) return;
    const tick = window.setInterval(() => {
      setAuthedUntil(readAuthedUntil());
    }, 1000);
    return () => window.clearInterval(tick);
  }, [isAuthed]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!expectedPassword) {
      setError("관리자 비밀번호가 설정되어 있지 않습니다. `.env`의 VITE_ADMIN_PASSWORD를 확인해 주세요.");
      return;
    }

    if (password.trim() !== expectedPassword) {
      setError("비밀번호가 올바르지 않습니다.");
      return;
    }

    const until = getNow() + DEFAULT_TTL_MS;
    writeAuthedUntil(until);
    setAuthedUntil(until);
    setPassword("");
  };

  const handleLogout = () => {
    clearAuth();
    setAuthedUntil(0);
    try {
      window.location.href = "/";
    } catch {
      // ignore
    }
  };

  if (isAuthed) {
    return (
      <AdminAuthContext.Provider value={{ logout: handleLogout }}>
        {children}
      </AdminAuthContext.Provider>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white border border-black/5 shadow-sm p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[11px] font-semibold text-slate-500">
              SK hynix Leadership Lab
            </p>
            <h1 className="text-lg font-extrabold text-slate-950">
              Admin 잠금
            </h1>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500 leading-relaxed">
          이 페이지는 관리자 전용입니다. 비밀번호를 아는 사람만 접근할 수 있습니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              관리자 비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full h-11 rounded-2xl bg-white border border-black/10 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[color:var(--key-primary)] focus:ring-2 focus:ring-[color:var(--key-primary)]/15"
              placeholder="비밀번호 입력"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-[color:var(--key-danger)]/25 bg-[color:var(--key-danger)]/8 px-4 py-3 text-sm text-slate-900">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full h-11 rounded-2xl text-sm font-semibold bg-[color:var(--key-primary)] text-white hover:opacity-90 transition-opacity"
          >
            들어가기
          </button>

          <button
            type="button"
            onClick={() => {
              try {
                window.location.href = "/";
              } catch {
                // ignore
              }
            }}
            className="w-full h-11 rounded-2xl text-sm font-semibold bg-black/5 text-slate-700 hover:bg-black/10 transition-colors"
          >
            홈으로
          </button>
        </form>

        <p className="mt-4 text-[11px] text-slate-500">
          인증은 브라우저 세션 기준으로 약 8시간 유지됩니다.
        </p>
      </div>
    </div>
  );
}

