export default function Main({
  userType,
  setUserType,
  onStart,
  sessionCode,
  setSessionCode,
  onValidateSession,
  isSessionValid,
  isValidatingSession,
  sessionError,
}) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-5 py-10 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="max-w-md w-full flex flex-col items-center text-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl">🤖</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug">
            2030 AI 시대
            <br />
            <span className="text-indigo-400">생존 밸런스 게임</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed mt-2">
            AI가 모든 것을 바꾸는 2030년,
            <br />
            당신은 어떤 선택을 하게 될까요?
          </p>
        </div>

        <div className="w-full bg-slate-800/60 backdrop-blur rounded-2xl p-5 border border-slate-700/50">
          <p className="text-sm text-slate-400 mb-1 font-medium">📋 안내</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            상황을 읽고 직감적으로 A 또는 B를 선택하세요.
            <br />
            정답은 없습니다. 솔직한 선택이 정확한 결과를 만듭니다.
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <div className="w-full bg-slate-900/60 backdrop-blur rounded-2xl p-4 border border-indigo-700/40 text-left">
            <p className="text-xs text-indigo-300 font-semibold mb-2">
              차수(Session) 코드 입력
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  placeholder="예: SK001"
                  className="flex-1 rounded-xl bg-slate-950/60 border border-slate-700 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={onValidateSession}
                  disabled={isValidatingSession}
                  className={`px-3 sm:px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    isValidatingSession
                      ? "bg-slate-700 text-slate-400 cursor-wait"
                      : "bg-indigo-500 text-white hover:bg-indigo-400"
                  }`}
                >
                  {isValidatingSession ? "확인 중..." : "코드 확인"}
                </button>
              </div>
              <div className="min-h-[1.25rem] text-xs">
                {sessionError && (
                  <p className="text-rose-300">{sessionError}</p>
                )}
                {!sessionError && isSessionValid && sessionCode && (
                  <p className="text-emerald-300">
                    ✅ 유효한 차수 코드입니다. 이 코드로 결과가 저장됩니다.
                  </p>
                )}
                {!sessionError && !isSessionValid && sessionCode && (
                  <p className="text-slate-400">
                    차수 코드를 입력한 뒤{" "}
                    <span className="font-semibold text-indigo-300">
                      &apos;코드 확인&apos;
                    </span>
                    을 눌러 주세요.
                  </p>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-400 font-medium">나의 역할을 선택하세요</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setUserType("member")}
              className={`py-4 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer border-2 ${
                userType === "member"
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              👤 구성원
              <span className="block text-xs mt-1 opacity-70">15문항</span>
            </button>
            <button
              onClick={() => setUserType("leader")}
              className={`py-4 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer border-2 ${
                userType === "leader"
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              👑 리더
              <span className="block text-xs mt-1 opacity-70">20문항</span>
            </button>
          </div>

          <button
            onClick={onStart}
            disabled={!userType || !isSessionValid}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-200 cursor-pointer mt-2 ${
              userType && isSessionValid
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/30"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
