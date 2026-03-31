export default function Main({
  onStart,
  onGoCanvasForm,
  onGoLeaderForm,
  onGoAiColleagueForm,
  sessionCode,
  setSessionCode,
  onValidateSession,
  isSessionValid,
  isValidatingSession,
  sessionError,
}) {
  const isSessionLocked = Boolean(isSessionValid && sessionCode);

  return (
    <div className="min-h-dvh bg-[#f6f7f9] text-slate-950">
      <div className="mx-auto w-full max-w-md px-5 pt-10 pb-8 flex flex-col gap-8">
        <header className="flex flex-col gap-3 text-center">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center rounded-full bg-[color:var(--key-primary)] px-4 py-2 text-white font-extrabold text-sm sm:text-base shadow-sm">
            AI 시대 나의 캐릭터는?
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-snug">
            THE TEMPO
            <br />
            <span className="text-[color:var(--key-primary)]">
              스킬 밸런스 게임
            </span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
            <span className="font-bold text-slate-800">
              일하는 방식이 달라진 2030년,
              <br />
              당신의 템포는?
            </span>
          </p>
          <div className="w-full mt-2 -mx-0.5 sm:mx-0">
            <div className="rounded-3xl overflow-hidden border border-black/10 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.35)] ring-1 ring-white/60">
              <img
                src="/main-hero-characters-11.png"
                alt="2030년 AI 시대, 열한 가지 캐릭터가 함께 협업하며 일하는 모습"
                className="w-full h-auto block"
                width={1376}
                height={768}
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed mt-4">
            AI 기술의 거대한 물결 속에서
            <br />
            나만의 리듬을 찾아보세요.
            <br />
            가장 나다운 일하는 방식을 발견하는
            <br />
            흥미진진한 밸런스 게임이 시작됩니다.
          </p>
        </header>

        <div className="w-full flex flex-col gap-4">
          <div className="w-full rounded-3xl bg-white p-5 shadow-sm border border-black/5">
            <p className="text-sm font-semibold text-slate-500 mb-2">
              차수 코드
            </p>
            <div className="flex gap-2 items-stretch">
              <input
                type="text"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                placeholder="예: SK001"
                inputMode="text"
                className="min-w-0 flex-1 rounded-2xl bg-[#f6f7f9] border border-black/10 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[color:var(--key-primary)] focus:ring-2 focus:ring-[color:var(--key-primary)]/15"
              />
              <button
                type="button"
                onClick={onValidateSession}
                disabled={isValidatingSession || isSessionLocked}
                className={`shrink-0 px-3 sm:px-4 rounded-2xl text-base font-semibold whitespace-nowrap transition-colors ${
                  isValidatingSession
                    ? "bg-slate-200 text-slate-400 cursor-wait"
                    : isSessionLocked
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-[color:var(--key-primary)] text-white hover:opacity-90"
                }`}
              >
                {isValidatingSession ? "확인 중" : "확인"}
              </button>
            </div>
            <div className="min-h-[1.25rem] mt-2 text-sm">
              {sessionError && (
                <p className="text-[color:var(--key-danger)]">{sessionError}</p>
              )}
              {!sessionError && isSessionValid && sessionCode && (
                <p className="text-slate-600">
                  유효한 차수 코드입니다. 이 코드로 결과가 저장됩니다.
                </p>
              )}
              {!sessionError && !isSessionValid && sessionCode && (
                <p className="text-slate-500">
                  코드를 입력한 뒤 확인을 눌러 주세요.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onStart}
            disabled={!isSessionValid}
            className={`w-full py-4 px-5 rounded-3xl font-extrabold text-base transition-[transform,box-shadow,filter] duration-200 flex items-center justify-between ${
              isSessionValid
                ? "main-cta-reveal main-cta-reveal-d0 cursor-pointer bg-gradient-to-r from-[#EA002C] to-[#FF5A00] text-white hover:opacity-95 shadow-[0_12px_26px_-12px_rgba(234,0,44,0.9)] border border-[#d70028]/40 active:scale-[0.99]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200/80"
            }`}
          >
            <span>캐릭터 확인</span>
            <span
              className={isSessionValid ? "text-white/90" : "text-slate-400"}
            >
              →
            </span>
          </button>

          <button
            type="button"
            onClick={onGoCanvasForm}
            disabled={!isSessionValid}
            className={`w-full py-4 px-5 rounded-3xl font-extrabold text-base transition-[transform,box-shadow,filter] duration-200 flex items-center justify-between ${
              isSessionValid
                ? "main-cta-reveal main-cta-reveal-d1 cursor-pointer bg-gradient-to-r from-[#FF5A00] to-[#FF7A00] text-white border border-orange-500/50 hover:opacity-95 shadow-[0_12px_26px_-12px_rgba(255,90,0,0.9)] active:scale-[0.99]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200/80"
            }`}
          >
            <span>캔버스 기입</span>
            <span
              className={isSessionValid ? "text-white/90" : "text-slate-400"}
            >
              ✍️
            </span>
          </button>

          <button
            type="button"
            onClick={onGoLeaderForm}
            disabled={!isSessionValid}
            className={`w-full py-4 px-5 rounded-3xl font-extrabold text-base transition-[transform,box-shadow,filter] duration-200 flex items-center justify-between ${
              isSessionValid
                ? "main-cta-reveal main-cta-reveal-d2 cursor-pointer bg-gradient-to-r from-[#D9251D] to-[#EA002C] text-white border border-rose-600/40 hover:opacity-95 shadow-[0_12px_26px_-12px_rgba(217,37,29,0.9)] active:scale-[0.99]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200/80"
            }`}
          >
            리더에게
            <span
              className={isSessionValid ? "text-white/90" : "text-slate-400"}
            >
              💬
            </span>
          </button>

          <button
            type="button"
            onClick={onGoAiColleagueForm}
            disabled={!isSessionValid}
            className={`w-full py-4 px-5 rounded-3xl font-extrabold text-base transition-[transform,box-shadow,filter] duration-200 flex items-center justify-between ${
              isSessionValid
                ? "main-cta-reveal main-cta-reveal-d3 cursor-pointer bg-gradient-to-r from-[#4F46E5] to-[#6366F1] text-white border border-indigo-500/40 hover:opacity-95 shadow-[0_12px_26px_-12px_rgba(79,70,229,0.75)] active:scale-[0.99]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200/80"
            }`}
          >
            <span>AI 동료에게</span>
            <span
              className={isSessionValid ? "text-white/90" : "text-slate-400"}
            >
              🤖
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
