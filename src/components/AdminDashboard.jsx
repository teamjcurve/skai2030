import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { supabase } from "../supabaseClient";
import { characterData } from "../data/resultData";

const LEADERSHIP_BADGES = ["비전", "이노베이션", "코칭", "실행력"];

const FILTER_TABS = [
  { id: "all", label: "전체 보기" },
  { id: "member", label: "구성원 데이터만 보기" },
  { id: "leader", label: "리더 데이터만 보기" },
];

const BADGE_COLORS = ["#ff6b6b", "#ffd166", "#06d6a0", "#4dabf7"];

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
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-lg font-semibold">Supabase 설정이 필요합니다</h1>
          <p className="text-sm text-slate-400">
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
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <header className="border-b border-slate-800 px-8 py-4 flex items-center justify-between bg-slate-950/90 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center text-xs font-bold text-slate-950">
            AD
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              SK hynix Leadership Lab
            </p>
            <h1 className="text-lg font-semibold text-slate-50">
              Admin Dashboard
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <div className="hidden lg:flex items-center gap-4 pr-4 border-r border-slate-800/80">
            <div className="flex flex-col gap-0.5 text-right">
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                총 응답 수
              </span>
              <span className="text-sm font-semibold text-slate-100">
                {results.length.toLocaleString("ko-KR")}명
              </span>
            </div>
            <div className="flex flex-col gap-0.5 text-right">
              <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                현재 필터
              </span>
              <span className="text-[11px] font-medium text-sky-300">
                {getFilterLabel(filter)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[11px] text-slate-400">
              차수 선택
            </span>
            <select
              className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-sky-400"
              value={selectedSessionId || ""}
              onChange={(e) => {
                const next = e.target.value || null;
                setSelectedSessionId(next);
                const selected = sessions.find((s) => s.id === next);
                setSelectedSessionCode(selected ? selected.session_code : "");
              }}
              disabled={isLoadingSessions || sessions.length === 0}
            >
              {isLoadingSessions && <option>불러오는 중...</option>}
              {!isLoadingSessions && sessions.length === 0 && (
                <option>등록된 차수가 없습니다</option>
              )}
              {!isLoadingSessions &&
                sessions.length > 0 && <option value="">전체 차수</option>}
              {!isLoadingSessions &&
                sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.session_code}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 sm:px-8 sm:py-8 flex justify-center overflow-y-auto">
        <div className="w-full max-w-6xl flex flex-col gap-6">
          {error && (
            <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 px-4 py-3 text-xs text-rose-200">
              {error}
            </div>
          )}

          <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 sm:p-6 shadow-[0_0_0_1px_rgba(15,23,42,0.9)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-100">
                  차수 관리 (Session Management)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  교육 운영 전에 차수 코드를 미리 등록해 두고, 필요 시 잘못된 차수를 삭제할 수 있습니다.
                </p>
              </div>
              <div className="text-[11px] text-slate-400">
                총{" "}
                <span className="font-semibold text-slate-100">
                  {sessions.length.toLocaleString("ko-KR")}
                </span>
                개 차수 등록됨
              </div>
            </div>

            <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)] gap-4">
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3.5 space-y-2">
                  <p className="text-xs font-medium text-slate-200">
                    단일 차수 등록
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={singleCode}
                      onChange={(e) =>
                        setSingleCode(e.target.value.toUpperCase())
                      }
                      placeholder="예: SK001"
                      className="flex-1 rounded-lg bg-slate-950/80 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={handleCreateSingleSession}
                      disabled={isSavingSession || !singleCode.trim()}
                      className={`px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        isSavingSession || !singleCode.trim()
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                          : "bg-sky-500 text-slate-950 hover:bg-sky-400"
                      }`}
                    >
                      등록
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3.5 space-y-2">
                  <p className="text-xs font-medium text-slate-200">
                    대량 차수 일괄 등록
                  </p>
                  <p className="text-[11px] text-slate-500">
                    예시:{" "}
                    <span className="font-mono">
                      SK001, SK002, SK003, ...
                    </span>{" "}
                    또는 줄바꿈으로 여러 개를 붙여넣어도 됩니다.
                  </p>
                  <textarea
                    value={bulkCodes}
                    onChange={(e) => setBulkCodes(e.target.value.toUpperCase())}
                    rows={3}
                    className="w-full rounded-lg bg-slate-950/80 border border-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-500 resize-none"
                    placeholder="SK001, SK002, SK003 ..."
                  />
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-500">
                      붙여넣은 코드는 자동으로 중복 제거 후 저장됩니다.
                    </p>
                    <button
                      type="button"
                      onClick={handleBulkCreateSessions}
                      disabled={isSavingSession || !bulkCodes.trim()}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                        isSavingSession || !bulkCodes.trim()
                          ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                          : "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      }`}
                    >
                      일괄 등록
                    </button>
                  </div>
                </div>

                {sessionFeedback && (
                  <p className="text-[11px] text-sky-300">{sessionFeedback}</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                  <p className="text-xs font-medium text-slate-200">
                    등록된 차수 목록
                  </p>
                  <p className="text-[11px] text-slate-500">
                    최신 생성 순으로 정렬됩니다.
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  <table className="min-w-full text-[11px] text-left">
                    <thead className="bg-slate-900/70 text-slate-400 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 font-medium w-28">차수 코드</th>
                        <th className="px-4 py-2 font-medium w-40">
                          생성 일시
                        </th>
                        <th className="px-4 py-2 font-medium w-24 text-right">
                          액션
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-4 text-center text-slate-500"
                          >
                            아직 등록된 차수가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        sessions.map((session) => (
                          <tr
                            key={session.id}
                            className="border-t border-slate-900/80 hover:bg-slate-900/60"
                          >
                            <td className="px-4 py-2 font-mono text-xs text-slate-100">
                              {session.session_code}
                            </td>
                            <td className="px-4 py-2 text-slate-400">
                              {session.created_at
                                ? new Date(
                                    session.created_at,
                                  ).toLocaleString("ko-KR", {
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteSession(session.id)}
                                className="inline-flex items-center justify-center rounded-md border border-rose-700/60 bg-rose-900/40 px-2 py-1 text-[11px] font-medium text-rose-200 hover:bg-rose-800/60 hover:border-rose-500/80 transition-colors"
                              >
                                삭제
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-slate-100">
                차수별 참여 현황 요약
              </h2>
              <p className="text-xs text-slate-400">
                상단에서 차수를 선택하고, 아래 탭으로 구성원/리더를 나눠서 볼 수 있습니다.
              </p>
              {selectedSessionCode && (
                <p className="inline-flex items-center rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1 text-[11px] font-medium text-sky-300">
                  세션 코드: {selectedSessionCode}
                </p>
              )}
            </div>
            <div className="inline-flex rounded-full border border-slate-800 bg-slate-900/60 p-1 text-xs">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-full transition-colors ${
                    filter === tab.id
                      ? "bg-sky-500 text-slate-950 shadow-sm shadow-sky-500/40"
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="전체 참여자 수"
              value={isLoadingResults ? "-" : totalCount}
              accent="from-sky-400 to-cyan-400"
            />
            <SummaryCard
              label="구성원 참여 수"
              value={isLoadingResults ? "-" : memberCount}
              accent="from-emerald-400 to-lime-400"
            />
            <SummaryCard
              label="리더 참여 수"
              value={isLoadingResults ? "-" : leaderCount}
              accent="from-fuchsia-400 to-sky-400"
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-3 lg:items-stretch">
            <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900/60 p-4 sm:p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.9)]">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    캐릭터 분포 (상위 유형 한눈에)
                  </h3>
                  <p className="text-xs text-slate-400">
                    선택한 세션·필터 기준으로, 어떤 캐릭터 유형이 많이 나오는지 보여줍니다.
                  </p>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={characterChartData}
                    margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="type"
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "#1e293b" }}
                      interval={0}
                      height={56}
                      tickFormatter={(value) =>
                        value.length > 8 ? `${value.slice(0, 8)}…` : value
                      }
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "#1e293b" }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        borderColor: "#1e293b",
                        borderRadius: 12,
                        padding: "8px 10px",
                      }}
                      itemStyle={{ fontSize: 12 }}
                      labelStyle={{ color: "#e2e8f0", marginBottom: 4 }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                      fill="url(#character-gradient)"
                    />
                    <defs>
                      <linearGradient
                        id="character-gradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="50%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">
                막대가 높을수록 해당 캐릭터 유형으로 분석된 인원이 많다는 의미입니다.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900/60 p-4 sm:p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.9)] flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    리더십 뱃지 비율
                  </h3>
                  <p className="text-xs text-slate-400">
                    리더 응답 중 네 가지 뱃지(비전·이노베이션·코칭·실행력)의 분포입니다.
                  </p>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-3">
                <div className="h-40 sm:h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={badgeChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={52}
                        paddingAngle={4}
                      >
                        {badgeChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={BADGE_COLORS[index % BADGE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#020617",
                          borderColor: "#1e293b",
                          borderRadius: 12,
                          padding: "8px 10px",
                        }}
                        itemStyle={{ fontSize: 12 }}
                        labelStyle={{ color: "#e2e8f0", marginBottom: 4 }}
                        formatter={(value) => [`${value}명`, "리더 수"]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={32}
                        iconSize={8}
                        formatter={(value) => (
                          <span className="text-xs text-slate-300">
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 text-xs">
                  {badgeChartData.map((badge, index) => {
                    const totalLeaders = badgeChartData.reduce(
                      (sum, b) => sum + b.value,
                      0,
                    );
                    const ratio =
                      totalLeaders === 0
                        ? 0
                        : Math.round((badge.value / totalLeaders) * 100);

                    return (
                      <div
                        key={badge.name}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor:
                                BADGE_COLORS[index % BADGE_COLORS.length],
                            }}
                          />
                          <span className="text-slate-200">{badge.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <span>{badge.value}명</span>
                          <span className="text-slate-500">·</span>
                          <span>{ratio}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.2fr)]">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.9)] flex flex-col">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    실시간 결과 로그
                  </h3>
                  <p className="text-xs text-slate-400">
                    최신 응답 순으로 캐릭터/뱃지 결과를 보여줍니다. (최대 30개)
                  </p>
                </div>
              </div>
              <div className="flex-1 overflow-hidden rounded-xl border border-slate-900/90 bg-slate-950">
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {logs.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-500">
                      아직 수집된 로그가 없습니다. 참여자가 결과를 완료하면 이
                      영역에 실시간으로 표시됩니다.
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-900/80 text-xs">
                      {logs.map((log) => (
                        <li
                          key={log.id}
                          className="px-4 py-2.5 flex items-start justify-between gap-3 hover:bg-slate-900/80 transition-colors"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]" />
                            <p className="text-slate-100">{log.message}</p>
                          </div>
                          <span className="mt-0.5 shrink-0 text-[10px] text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString(
                              "ko-KR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              },
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.9)] flex flex-col gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  현재 세션 요약
                </h3>
                <p className="text-xs text-slate-400">
                  선택한 세션과 필터 기준으로 간단한 숫자 지표를 정리했습니다.
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <SummaryRow label="대상 범위" value={getFilterLabel(filter)} />
                <SummaryRow
                  label="전체 인원"
                  value={isLoadingResults ? "-" : `${totalCount}명`}
                />
                <SummaryRow
                  label="구성원"
                  value={isLoadingResults ? "-" : `${memberCount}명`}
                />
                <SummaryRow
                  label="리더"
                  value={isLoadingResults ? "-" : `${leaderCount}명`}
                />
              </dl>

              <div className="mt-2 rounded-xl border border-slate-900 bg-slate-950/90 p-3 text-[11px] text-slate-400 leading-relaxed">
                <p className="font-medium text-slate-200 mb-1.5">
                  활용 팁
                </p>
                <p>
                  상단에서 차수를 변경하며 세션 간 캐릭터 분포와 리더십 뱃지
                  비율을 비교해 보세요. 교육 직후 디브리핑 시간에 트렌드를
                  설명할 때 유용합니다.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 px-4 py-3.5 sm:px-5 sm:py-4 shadow-[0_0_0_1px_rgba(15,23,42,0.9)] flex items-center justify-between gap-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-50 tabular-nums">
          {typeof value === "number" ? value.toLocaleString("ko-KR") : value}
        </p>
      </div>
      <div
        className={`h-10 w-10 rounded-xl bg-gradient-to-br ${accent} opacity-90 flex items-center justify-center text-xs font-semibold text-slate-950`}
      >
        Live
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-slate-100 font-medium">{value}</dd>
    </div>
  );
}

function getFilterLabel(filter) {
  switch (filter) {
    case "member":
      return "구성원만 포함";
    case "leader":
      return "리더만 포함";
    default:
      return "구성원 + 리더 전체";
  }
}

