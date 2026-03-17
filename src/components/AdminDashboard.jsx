import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import { characterData } from "../data/resultData";
import AdminSessionsPage from "./AdminSessionsPage.jsx";
import AdminOverviewPage from "./AdminOverviewPage.jsx";
import { useAdminAuth } from "./AdminGate.jsx";

const LEADERSHIP_BADGES = ["비전", "퍼실리테이터", "퍼포먼스", "가디언"];

const FILTER_TABS = [
  { id: "all", label: "전체 보기" },
  { id: "member", label: "구성원 데이터만 보기" },
  { id: "leader", label: "리더 데이터만 보기" },
];

const ADMIN_BASE = "/admin";
const ROUTES = {
  overview: `${ADMIN_BASE}/overview`,
  sessions: `${ADMIN_BASE}/sessions`,
};

function normalizeAdminPath(pathname) {
  if (!pathname) return ROUTES.overview;
  if (pathname === ADMIN_BASE || pathname === `${ADMIN_BASE}/`) {
    return ROUTES.overview;
  }
  if (pathname.startsWith(ROUTES.overview)) return ROUTES.overview;
  if (pathname.startsWith(ROUTES.sessions)) return ROUTES.sessions;
  return ROUTES.overview;
}

function navigateAdmin(to) {
  const next = normalizeAdminPath(to);
  if (typeof window === "undefined") return next;
  if (window.location.pathname === next) return next;
  window.history.pushState({}, "", next);
  return next;
}

function getFilteredParticipants(participants, filter) {
  if (filter === "member") {
    return participants.filter((p) => !p.isLeader);
  }
  if (filter === "leader") {
    return participants.filter((p) => p.isLeader);
  }
  return participants;
}

function buildCharacterChartData(participants) {
  const counts = new Map();

  participants.forEach((p) => {
    const key = p.characterType || "Unknown";
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries()).map(([type, count]) => ({
    type,
    count,
  }));
}

function buildBadgeChartData(participants) {
  const leaders = participants.filter((p) => p.isLeader && p.badge);
  const base = LEADERSHIP_BADGES.map((badge) => ({ name: badge, value: 0 }));

  leaders.forEach((p) => {
    const target = base.find((b) => b.name === p.badge);
    if (target) target.value += 1;
  });

  return base;
}

function mapResultToParticipant(result, index = 0) {
  const character = characterData[result.result_code];
  const characterName = character?.name || result.result_code;

  return {
    id: result.id || index,
    isLeader: result.user_type === "leader",
    characterType: characterName,
    badge: result.leader_badge,
    finishedAt: new Date(result.created_at).getTime(),
  };
}

export default function AdminDashboard() {
  if (!supabase) {
    return (
      <div className="min-h-screen bg-[#f6f7f9] text-slate-950 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-lg font-semibold">Supabase 설정이 필요합니다</h1>
          <p className="text-sm text-slate-500">
            `.env` 파일에{" "}
            <span className="font-mono text-[11px]">
              VITE_SUPABASE_URL
            </span>{" "}
            과{" "}
            <span className="font-mono text-[11px]">
              VITE_SUPABASE_ANON_KEY
            </span>
            를 설정한 뒤, 개발 서버를 다시 시작해 주세요.
          </p>
        </div>
      </div>
    );
  }

  const auth = useAdminAuth();

  const [filter, setFilter] = useState("all");
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedSessionCode, setSelectedSessionCode] = useState("");
  const [results, setResults] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [error, setError] = useState("");
  const [singleCode, setSingleCode] = useState("");
  const [bulkCodes, setBulkCodes] = useState("");
  const [isSavingSession, setIsSavingSession] = useState(false);
  const [sessionFeedback, setSessionFeedback] = useState("");
  const [route, setRoute] = useState(() =>
    normalizeAdminPath(typeof window === "undefined" ? ROUTES.overview : window.location.pathname),
  );

  useEffect(() => {
    const ensure = () => {
      const normalized = normalizeAdminPath(window.location.pathname);
      if (window.location.pathname !== normalized) {
        window.history.replaceState({}, "", normalized);
      }
      setRoute(normalized);
    };

    ensure();
    window.addEventListener("popstate", ensure);
    return () => window.removeEventListener("popstate", ensure);
  }, []);

  const refreshSessions = async () => {
    try {
      const { data, error: err } = await supabase
        .from("sessions")
        .select("id, session_code, created_at")
        .order("created_at", { ascending: false });

      if (err) {
        // eslint-disable-next-line no-console
        console.error("[Supabase] 세션 목록 재조회 실패:", err);
        return;
      }

      setSessions(data || []);

      if (!selectedSessionId && data && data.length > 0) {
        setSelectedSessionId(data[0].id);
        setSelectedSessionCode(data[0].session_code);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[Supabase] 세션 목록 재조회 예외:", err);
    }
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data, error: err } = await supabase
          .from("sessions")
          .select("id, session_code, created_at")
          .order("created_at", { ascending: false });

        if (err) throw err;
        setSessions(data || []);

        if (data && data.length > 0) {
          setSelectedSessionId(data[0].id);
          setSelectedSessionCode(data[0].session_code);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[Supabase] 세션 목록 조회 실패:", err);
        setError("세션 목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, []);

  // 세션 테이블 실시간 반영 (다른 관리자가 추가/삭제해도 반영)
  useEffect(() => {
    const channel = supabase
      .channel("sessions-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        (payload) => {
          setSessions((prev) => {
            if (payload.eventType === "INSERT") {
              const exists = prev.some((s) => s.id === payload.new.id);
              if (exists) return prev;
              return [payload.new, ...prev].sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at),
              );
            }
            if (payload.eventType === "DELETE") {
              return prev.filter((s) => s.id !== payload.old.id);
            }
            if (payload.eventType === "UPDATE") {
              return prev
                .map((s) => (s.id === payload.new.id ? payload.new : s))
                .sort(
                  (a, b) => new Date(b.created_at) - new Date(a.created_at),
                );
            }
            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!selectedSessionId) {
      setResults([]);
      return;
    }

    let isCancelled = false;
    const fetchResults = async () => {
      setIsLoadingResults(true);
      setError("");
      try {
        const { data, error: err } = await supabase
          .from("results")
          .select("id, session_id, user_type, result_code, leader_badge, created_at")
          .eq("session_id", selectedSessionId)
          .order("created_at", { ascending: true });

        if (err) throw err;
        if (!isCancelled) {
          setResults(data || []);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[Supabase] 결과 조회 실패:", err);
        if (!isCancelled) {
          setError("결과 데이터를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingResults(false);
        }
      }
    };

    fetchResults();

    const channel = supabase
      .channel(`results-session-${selectedSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "results",
          filter: `session_id=eq.${selectedSessionId}`,
        },
        (payload) => {
          setResults((prev) => [...prev, payload.new]);
        },
      )
      .subscribe();

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, [selectedSessionId]);

  const participants = useMemo(
    () => results.map((r, index) => mapResultToParticipant(r, index)),
    [results],
  );

  const filteredParticipants = useMemo(
    () => getFilteredParticipants(participants, filter),
    [participants, filter],
  );

  const logs = useMemo(() => {
    const sorted = [...results].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );

    return sorted.slice(0, 30).map((r) => {
      const character = characterData[r.result_code];
      const characterName = character?.name || r.result_code;
      const isLeader = r.user_type === "leader";
      const badge = r.leader_badge;

      const message = badge && isLeader
        ? `참여자님이 '${characterName}'(리더십 뱃지: ${badge})로 분석되었습니다`
        : `참여자님이 '${characterName}'로 분석되었습니다`;

      return {
        id: r.id,
        message,
        timestamp: new Date(r.created_at).getTime(),
      };
    });
  }, [results]);

  const totalCount = filteredParticipants.length;
  const memberCount = filteredParticipants.filter((p) => !p.isLeader).length;
  const leaderCount = filteredParticipants.filter((p) => p.isLeader).length;

  const characterChartData = useMemo(
    () => buildCharacterChartData(filteredParticipants),
    [filteredParticipants],
  );

  const badgeChartData = useMemo(
    () => buildBadgeChartData(filteredParticipants),
    [filteredParticipants],
  );

  const handleCreateSingleSession = async () => {
    const code = singleCode.trim();
    setSessionFeedback("");
    if (!code) return;

    setIsSavingSession(true);
    try {
      const { error: err } = await supabase
        .from("sessions")
        .insert({ session_code: code }, { upsert: true, onConflict: "session_code" });
      if (err) {
        // eslint-disable-next-line no-console
        console.error("[Supabase] 세션 단일 등록 실패:", err);
        setSessionFeedback(
          `차수 등록 중 오류가 발생했습니다: ${err.message || "알 수 없는 오류"}`,
        );
      } else {
        setSingleCode("");
        setSessionFeedback(`'${code}' 차수가 등록되었습니다.`);
        await refreshSessions();
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[Supabase] 세션 단일 등록 예외:", err);
      setSessionFeedback("차수 등록 중 예기치 못한 오류가 발생했습니다.");
    } finally {
      setIsSavingSession(false);
    }
  };

  const handleBulkCreateSessions = async () => {
    const raw = bulkCodes.trim();
    setSessionFeedback("");
    if (!raw) return;

    const codes = raw
      .split(/[,\n]/)
      .map((c) => c.trim())
      .filter(Boolean);

    if (codes.length === 0) return;

    const uniqueCodes = Array.from(new Set(codes));
    const rows = uniqueCodes.map((code) => ({ session_code: code }));

    setIsSavingSession(true);
    try {
      const { error: err } = await supabase
        .from("sessions")
        .insert(rows, { upsert: true, onConflict: "session_code" });
      if (err) {
        // eslint-disable-next-line no-console
        console.error("[Supabase] 세션 일괄 등록 실패:", err);
        setSessionFeedback(
          `일괄 등록 중 오류가 발생했습니다: ${err.message || "알 수 없는 오류"}`,
        );
      } else {
        setBulkCodes("");
        setSessionFeedback(
          `${uniqueCodes.length.toLocaleString(
            "ko-KR",
          )}개의 차수가 일괄 등록되었습니다.`,
        );
        await refreshSessions();
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[Supabase] 세션 일괄 등록 예외:", err);
      setSessionFeedback("일괄 등록 중 예기치 못한 오류가 발생했습니다.");
    } finally {
      setIsSavingSession(false);
    }
  };

  const handleDeleteSession = async (id) => {
    setSessionFeedback("");
    try {
      const { error: err } = await supabase
        .from("sessions")
        .delete()
        .eq("id", id);
      if (err) {
        // eslint-disable-next-line no-console
        console.error("[Supabase] 세션 삭제 실패:", err);
        setSessionFeedback("차수 삭제 중 오류가 발생했습니다.");
      } else if (selectedSessionId === id) {
        setSelectedSessionId(null);
        setSelectedSessionCode("");
      }
      await refreshSessions();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[Supabase] 세션 삭제 예외:", err);
      setSessionFeedback("차수 삭제 중 예기치 못한 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-950 flex flex-col">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[11px] font-semibold text-slate-500">
                SK hynix Leadership Lab
              </p>
              <h1 className="text-lg font-extrabold text-slate-950">
                Admin
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 sm:flex-1 sm:justify-end">
            <nav className="inline-flex rounded-2xl bg-[#f6f7f9] border border-black/10 p-1 text-xs">
              <button
                type="button"
                onClick={() => setRoute(navigateAdmin(ROUTES.overview))}
                className={`px-3 py-2 rounded-2xl transition-colors ${
                  route === ROUTES.overview
                    ? "bg-[color:var(--key-primary)] text-white"
                    : "text-slate-600 hover:bg-black/5"
                }`}
              >
                참여 현황
              </button>
              <button
                type="button"
                onClick={() => setRoute(navigateAdmin(ROUTES.sessions))}
                className={`px-3 py-2 rounded-2xl transition-colors ${
                  route === ROUTES.sessions
                    ? "bg-[color:var(--key-primary)] text-white"
                    : "text-slate-600 hover:bg-black/5"
                }`}
              >
                차수 관리
              </button>
            </nav>

            {route === ROUTES.overview && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">차수</span>
                  <select
                    className="h-11 rounded-2xl bg-[#f6f7f9] border border-black/10 px-4 text-sm text-slate-900 focus:outline-none focus:border-[color:var(--key-primary)] focus:ring-2 focus:ring-[color:var(--key-primary)]/15"
                    value={selectedSessionId || ""}
                    onChange={(e) => {
                      const next = e.target.value || null;
                      setSelectedSessionId(next);
                      const selected = sessions.find((s) => s.id === next);
                      setSelectedSessionCode(selected ? selected.session_code : "");
                    }}
                    disabled={isLoadingSessions || sessions.length === 0}
                  >
                    {isLoadingSessions && <option>불러오는 중</option>}
                    {!isLoadingSessions && sessions.length === 0 && (
                      <option>등록된 차수가 없습니다</option>
                    )}
                    {!isLoadingSessions && sessions.length > 0 && (
                      <option value="">전체 차수</option>
                    )}
                    {!isLoadingSessions &&
                      sessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {session.session_code}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">필터</span>
                  <div className="inline-flex rounded-2xl bg-[#f6f7f9] border border-black/10 p-1 text-xs">
                    {FILTER_TABS.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilter(tab.id)}
                        className={`px-3 py-2 rounded-2xl transition-colors ${
                          filter === tab.id
                            ? "bg-[color:var(--key-primary)] text-white"
                            : "text-slate-600 hover:bg-black/5"
                        }`}
                      >
                        {tab.label.replace(" 데이터만 보기", "")}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {auth?.logout && (
              <button
                type="button"
                onClick={auth.logout}
                className="h-11 rounded-2xl px-4 text-sm font-semibold border border-[color:var(--key-danger)]/25 bg-[color:var(--key-danger)]/8 text-[color:var(--key-danger)] hover:bg-[color:var(--key-danger)]/12 transition-colors sm:ml-2"
              >
                로그아웃
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 sm:px-8 py-6 flex justify-center">
        <div className="w-full max-w-6xl flex flex-col gap-6">
          {error && (
            <div className="rounded-3xl border border-[color:var(--key-danger)]/25 bg-[color:var(--key-danger)]/8 px-5 py-4 text-sm text-slate-900">
              {error}
            </div>
          )}

          {route === ROUTES.sessions ? (
            <AdminSessionsPage
              sessions={sessions}
              isLoadingSessions={isLoadingSessions}
              singleCode={singleCode}
              setSingleCode={setSingleCode}
              bulkCodes={bulkCodes}
              setBulkCodes={setBulkCodes}
              isSavingSession={isSavingSession}
              sessionFeedback={sessionFeedback}
              onCreateSingleSession={handleCreateSingleSession}
              onCreateBulkSessions={handleBulkCreateSessions}
              onDeleteSession={handleDeleteSession}
            />
          ) : (
            <AdminOverviewPage
              selectedSessionCode={selectedSessionCode}
              filter={filter}
              isLoadingResults={isLoadingResults}
              totalCount={totalCount}
              memberCount={memberCount}
              leaderCount={leaderCount}
              characterChartData={characterChartData}
              badgeChartData={badgeChartData}
              logs={logs}
            />
          )}
        </div>
      </main>
    </div>
  );
}
