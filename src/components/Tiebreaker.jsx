import { useState } from "react";
import {
  tiebreakerPrompt,
  tiebreakerStatements,
} from "../data/tiebreakerQuestions";

export default function Tiebreaker({ candidates, onSubmit }) {
  const [selected, setSelected] = useState(null);

  const options = (candidates ?? []).filter((code) => tiebreakerStatements[code]);

  if (options.length === 0) return null;

  const handleNext = () => {
    if (!selected) return;
    onSubmit(selected);
  };

  return (
    <div className="min-h-dvh bg-[#f6f7f9] text-slate-950">
      <div className="w-full px-5 pt-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
            <span>마지막 한 끗</span>
            <span>거의 다 왔어요</span>
          </div>
          <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[color:var(--key-primary)] rounded-full transition-all duration-500 ease-out"
              style={{ width: "100%" }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-stretch px-5 py-6 pb-28">
        <div className="max-w-md w-full mx-auto flex flex-col gap-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-black/5">
            <p className="text-sm text-slate-500 font-semibold mb-3 tracking-wide uppercase">
              Tiebreaker
            </p>
            <h2 className="text-lg sm:text-xl font-bold leading-relaxed text-slate-900">
              {tiebreakerPrompt}
            </h2>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              두 가지 이상의 강점이 동률로 나왔어요. 평소 가장 가까운 모습을
              한 가지만 골라 주세요.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {options.map((code) => {
              const isSelected = selected === code;
              return (
                <button
                  key={code}
                  onClick={() => setSelected(code)}
                  className={`w-full text-left px-6 py-5 rounded-3xl bg-white border text-slate-900 font-medium text-base leading-relaxed transition-all duration-150 cursor-pointer active:scale-[0.99] ${
                    isSelected
                      ? "border-2 border-[color:var(--key-primary)] bg-[color:var(--key-primary)]/6 ring-2 ring-[color:var(--key-primary)]/15"
                      : "border-black/10 hover:border-[color:var(--key-primary)]"
                  }`}
                >
                  {tiebreakerStatements[code]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#f6f7f9] border-t border-black/10">
        <div className="max-w-md mx-auto px-5 py-4 flex gap-3">
          <button
            onClick={handleNext}
            disabled={!selected}
            className={`flex-1 py-4 rounded-3xl font-bold text-lg transition-all duration-150 ${
              selected
                ? "bg-[color:var(--key-primary)] text-white hover:opacity-90 cursor-pointer shadow-sm"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            결과 보기
          </button>
        </div>
      </div>
    </div>
  );
}
