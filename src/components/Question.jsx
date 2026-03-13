export default function Question({
  questions,
  currentIndex,
  onSelect,
  onPrevious,
}) {
  const current = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="w-full px-5 pt-5">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>
              Q{currentIndex + 1} / {questions.length}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-stretch px-5 py-8">
        <div className="max-w-md w-full mx-auto flex flex-col gap-6">
          <div className="bg-slate-800/40 backdrop-blur rounded-2xl p-6 border border-slate-700/50">
            <p className="text-xs text-indigo-400 font-semibold mb-3 tracking-wider uppercase">
              Situation {currentIndex + 1}
            </p>
            <h2 className="text-lg sm:text-xl font-bold leading-relaxed text-slate-100">
              {current.text}
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => onSelect("A")}
              className="w-full text-left px-6 py-5 rounded-xl bg-slate-800/50 border-2 border-slate-700 text-slate-200 font-medium text-sm leading-relaxed hover:border-indigo-500 hover:bg-indigo-950/40 transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              {current.optionA.text}
            </button>
            <button
              onClick={() => onSelect("B")}
              className="w-full text-left px-6 py-5 rounded-xl bg-slate-800/50 border-2 border-slate-700 text-slate-200 font-medium text-sm leading-relaxed hover:border-violet-500 hover:bg-violet-950/40 transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              {current.optionB.text}
            </button>
          </div>

          {currentIndex > 0 && (
            <button
              onClick={onPrevious}
              className="mt-2 flex items-center gap-2 self-start text-sm text-slate-400 hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              이전 문항으로
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
