export default function AdminSessionsPage({
  sessions,
  isLoadingSessions,
  singleCode,
  setSingleCode,
  bulkCodes,
  setBulkCodes,
  isSavingSession,
  sessionFeedback,
  onCreateSingleSession,
  onCreateBulkSessions,
  onDeleteSession,
}) {
  return (
    <section className="rounded-3xl bg-white border border-black/5 shadow-sm p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-950">차수 관리</h2>
          <p className="text-sm text-slate-500 mt-1">
            교육 운영 전에 차수 코드를 미리 등록해 두고, 필요 시 잘못된 차수를 삭제할 수 있습니다.
          </p>
        </div>
        <div className="text-sm text-slate-500">
          총{" "}
          <span className="font-semibold text-slate-900">
            {sessions.length.toLocaleString("ko-KR")}
          </span>{" "}
          개
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
        <div className="space-y-3">
          <div className="rounded-3xl border border-black/5 bg-[#f6f7f9] px-5 py-4 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500">
              단일 차수 등록
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={singleCode}
                onChange={(e) => setSingleCode(e.target.value.toUpperCase())}
                placeholder="예: SK001"
                className="flex-1 h-11 rounded-2xl bg-white border border-black/10 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[color:var(--key-primary)] focus:ring-2 focus:ring-[color:var(--key-primary)]/15"
              />
              <button
                type="button"
                onClick={onCreateSingleSession}
                disabled={isSavingSession || !singleCode.trim()}
                className={`px-4 h-11 rounded-2xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  isSavingSession || !singleCode.trim()
                    ? "bg-black/10 text-slate-400 cursor-not-allowed"
                    : "bg-[color:var(--key-primary)] text-white hover:opacity-90"
                }`}
              >
                등록
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-black/5 bg-[#f6f7f9] px-5 py-4 space-y-2">
            <p className="text-[11px] font-semibold text-slate-500">
              대량 차수 일괄 등록
            </p>
            <p className="text-[11px] text-slate-500">
              예시:{" "}
              <span className="font-mono">SK001, SK002, SK003, ...</span> 또는
              줄바꿈으로 여러 개를 붙여넣어도 됩니다.
            </p>
            <textarea
              value={bulkCodes}
              onChange={(e) => setBulkCodes(e.target.value.toUpperCase())}
              rows={3}
              className="w-full rounded-2xl bg-white border border-black/10 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[color:var(--key-primary)] focus:ring-2 focus:ring-[color:var(--key-primary)]/15 resize-none"
              placeholder="SK001, SK002, SK003 ..."
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] text-slate-500">
                붙여넣은 코드는 자동으로 중복 제거 후 저장됩니다.
              </p>
              <button
                type="button"
                onClick={onCreateBulkSessions}
                disabled={isSavingSession || !bulkCodes.trim()}
                className={`px-4 h-10 rounded-2xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  isSavingSession || !bulkCodes.trim()
                    ? "bg-black/10 text-slate-400 cursor-not-allowed"
                    : "bg-[color:var(--key-primary)] text-white hover:opacity-90"
                }`}
              >
                일괄 등록
              </button>
            </div>
          </div>

          {sessionFeedback && (
            <p className="text-sm text-slate-700">{sessionFeedback}</p>
          )}
        </div>

        <div className="rounded-3xl border border-black/5 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <p className="text-sm font-bold text-slate-900">등록된 차수 목록</p>
            <p className="text-[11px] text-slate-500">최신 생성 순</p>
          </div>
          <div className="max-h-72 overflow-y-auto custom-scrollbar">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-[#f6f7f9] text-slate-500 sticky top-0">
                <tr>
                  <th className="px-5 py-3 font-semibold w-28">차수 코드</th>
                  <th className="px-5 py-3 font-semibold w-44">생성 일시</th>
                  <th className="px-5 py-3 font-semibold w-24 text-right">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoadingSessions ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      불러오는 중...
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      아직 등록된 차수가 없습니다.
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr
                      key={session.id}
                      className="border-t border-black/5 hover:bg-black/5"
                    >
                      <td className="px-5 py-3 font-mono text-sm text-slate-900">
                        {session.session_code}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {session.created_at
                          ? new Date(session.created_at).toLocaleString(
                              "ko-KR",
                              {
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteSession(session.id)}
                          className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--key-danger)]/20 bg-[color:var(--key-danger)]/8 px-3 py-2 text-xs font-semibold text-[color:var(--key-danger)] hover:bg-[color:var(--key-danger)]/12 transition-colors"
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
  );
}

