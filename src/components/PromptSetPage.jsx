import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PROMPT_SKILL_COACHING,
  PROMPT_FUTURE_IMAGE,
} from "../data/promptSetContent";

const AI_TOOLS = [
  { name: "Gemini", hint: "새 채팅 시작", href: "https://gemini.google.com" },
  { name: "ChatGPT", hint: "새 채팅 시작", href: "https://chatgpt.com" },
  { name: "Claude", hint: "새 채팅 시작", href: "https://claude.ai" },
];

const DIALOG_TIPS = [
  "단답이라도 괜찮습니다 → AI가 후속 질문으로 도와줄 것입니다",
  "모르겠으면 \"잘 모르겠는데 예시를 들어줘\"라고 해보세요",
  "AI의 제안이 마음에 안 들면 \"다른 방향으로 생각해볼래?\"라고 해보세요",
];

const STUCK_HELP = [
  { say: "이유를 모르겠어", aiDoes: "선택 이유를 찾는 질문을 3개 던져줌" },
  { say: "미래 모습이 그려지지 않아", aiDoes: "구체적 시나리오를 예시로 보여줌" },
  { say: "실행 계획이 너무 두루뭉술해", aiDoes: "내일부터 할 수 있는 것으로 좁혀줌" },
  { say: "더 구체적으로 알려줘", aiDoes: "실제 사례와 함께 설명해줌" },
  { say: "다른 이미지 스타일로 해줘", aiDoes: "다른 장르/컨셉으로 새로 생성해줌" },
];

const CAUTION = [
  "AI의 답변은 참고일 뿐입니다. 워크시트에는 반드시 '나의 말'로 다시 다듬어서 적어주세요.",
  "개인정보를 입력하지 마세요. 이름, 사번, 부서명 등 민감한 정보는 입력하지 않아도 됩니다.",
  "회사 기밀정보를 입력하지 마세요. 구체적인 프로젝트명이나 기술 상세 등은 피해주세요.",
  "대화가 막히면 언제든 다시 시작할 수 있습니다. 새 채팅을 열고 프롬프트를 다시 붙여넣으면 됩니다.",
];

function CopyButton({ label, onCopy, disabled }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      disabled={disabled}
      className="w-full min-h-[52px] rounded-2xl bg-[color:var(--key-primary)] text-white font-extrabold text-base shadow-[0_10px_24px_-12px_rgba(255,87,8,0.85)] border border-orange-500/40 active:scale-[0.99] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  );
}

export default function PromptSetPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const copy = useCallback(
    async (key, text) => {
      setBusy(key);
      try {
        await navigator.clipboard.writeText(text);
        showToast("클립보드에 복사했습니다");
      } catch {
        showToast("복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
      } finally {
        setBusy(null);
      }
    },
    [showToast],
  );

  return (
    <div className="min-h-dvh bg-[#f0f2f6] text-slate-950 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-md px-4 pt-4 pb-10 flex flex-col gap-6">
        <header className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="shrink-0 min-w-[44px] min-h-[44px] rounded-2xl bg-white border border-black/10 text-slate-700 font-bold text-sm shadow-sm"
            aria-label="이전 화면"
          >
            ←
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[color:var(--key-primary)] tracking-wide">
              The Tempo · AI Native Canvas
            </p>
            <h1 className="text-xl font-extrabold leading-tight tracking-tight">
              프롬프트 세트
            </h1>
          </div>
        </header>

        <section className="rounded-3xl bg-gradient-to-br from-white to-[#fff7f0] p-5 shadow-[0_12px_40px_-20px_rgba(15,23,42,0.35)] border border-black/5">
          <p className="text-sm font-bold text-slate-800 mb-1">
            AI와 함께 나만의 속도로 AI Native가 되어보세요
          </p>
          <p className="text-[15px] leading-relaxed text-slate-600">
            이 페이지에는{" "}
            <span className="font-semibold text-slate-800">두 가지 AI 프롬프트</span>
            가 있습니다. 강사의 안내에 따라 필요한 시점에 해당 프롬프트를 복사해 AI
            도구에 붙여넣으세요.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm border border-black/5">
          <h2 className="text-base font-extrabold text-slate-900 mb-3">준비물</h2>
          <ul className="space-y-2.5 text-[15px] text-slate-700 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-[color:var(--key-primary)] font-bold">·</span>
              AI Native Canvas 워크시트 (A3 용지)
            </li>
            <li className="flex gap-2">
              <span className="text-[color:var(--key-primary)] font-bold">·</span>
              밸런스게임에서 선택한 나의 AI Native 스킬 카드
            </li>
            <li className="flex gap-2">
              <span className="text-[color:var(--key-primary)] font-bold">·</span>
              AI 도구 (Gemini, ChatGPT, Claude 등 아무거나 OK)
            </li>
            <li className="flex gap-2">
              <span className="text-[color:var(--key-primary)] font-bold">·</span>
              편안한 마음과 약간의 용기 😄
            </li>
          </ul>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm border border-black/5">
          <h2 className="text-base font-extrabold text-slate-900 mb-2">사용 방법</h2>
          <p className="text-[15px] text-slate-600 leading-relaxed">
            강사의 안내에 따라, 필요한 시점에 해당 프롬프트를 AI 도구에 붙여넣으세요.
          </p>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm border border-black/5">
          <h2 className="text-base font-extrabold text-slate-900 mb-3">
            프롬프트 접속 방법
          </h2>
          <div className="flex flex-col gap-2">
            {AI_TOOLS.map((t) => (
              <a
                key={t.name}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl bg-[#f6f7f9] border border-black/8 px-4 py-3.5 min-h-[52px] active:bg-slate-100"
              >
                <span className="font-bold text-slate-900">{t.name}</span>
                <span className="text-xs text-slate-500 shrink-0">
                  {t.hint} →
                </span>
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm border border-black/5">
          <h2 className="text-base font-extrabold text-slate-900 mb-3">
            AI와 대화하는 팁
          </h2>
          <ul className="space-y-2 text-[15px] text-slate-700 leading-relaxed">
            {DIALOG_TIPS.map((line) => (
              <li key={line} className="pl-1 border-l-2 border-orange-200 pl-3">
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm border border-black/5 overflow-hidden">
          <h2 className="text-base font-extrabold text-slate-900 mb-1">
            막힐 때 이렇게 말해보세요
          </h2>
          <p className="text-xs text-slate-500 mb-3">AI가 도와주는 방식</p>
          <div className="rounded-2xl border border-slate-200 overflow-hidden text-[13px] sm:text-sm">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-0 bg-slate-50 font-bold text-slate-700 px-3 py-2.5 border-b border-slate-200">
              <span>이렇게 말하면</span>
              <span>AI 반응</span>
            </div>
            {STUCK_HELP.map((row) => (
              <div
                key={row.say}
                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-0 px-3 py-2.5 border-b border-slate-100 last:border-b-0 text-slate-700 leading-snug"
              >
                <span className="font-semibold text-slate-800 pr-2">
                  “{row.say}”
                </span>
                <span className="text-slate-600">{row.aiDoes}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl overflow-hidden shadow-[0_16px_48px_-24px_rgba(234,0,44,0.45)] border border-rose-200/60 bg-white">
          <div className="bg-gradient-to-r from-[#EA002C]/10 to-[#FF5A00]/10 px-5 pt-5 pb-3 border-b border-rose-100/80">
            <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-[#c40026] border border-rose-200/80">
              STEP 1 · 강사 안내 후
            </span>
            <h2 className="mt-3 text-lg font-extrabold text-slate-900 leading-snug">
              프롬프트 1
            </h2>
            <p className="text-[15px] font-semibold text-slate-800 mt-1">
              AI 코칭 파트너 (스킬 탐색용)
            </p>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              나에게 맞는 AI Native 스킬을 탐색하고, 선택 이유를 깊이 생각해보는
              대화형 코칭입니다.{" "}
              <span className="font-semibold text-slate-800">
                아래 전체를 복사
              </span>
              해 AI에 붙여넣으세요.
            </p>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 max-h-[min(40vh,280px)] overflow-y-auto overscroll-contain p-3">
              <pre className="whitespace-pre-wrap break-words font-sans text-[11px] sm:text-xs text-slate-700 leading-relaxed">
                {PROMPT_SKILL_COACHING}
              </pre>
            </div>
            <CopyButton
              label={busy === "p1" ? "복사 중…" : "프롬프트 1 전체 복사"}
              disabled={busy === "p1"}
              onCopy={() => copy("p1", PROMPT_SKILL_COACHING)}
            />
          </div>
        </section>

        <section className="rounded-3xl overflow-hidden shadow-[0_16px_48px_-24px_rgba(79,70,229,0.35)] border border-indigo-200/70 bg-white">
          <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 px-5 pt-5 pb-3 border-b border-indigo-100/90">
            <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-indigo-700 border border-indigo-200/80">
              STEP 2 · 강사 안내 후
            </span>
            <h2 className="mt-3 text-lg font-extrabold text-slate-900 leading-snug">
              프롬프트 2
            </h2>
            <p className="text-[15px] font-semibold text-slate-800 mt-1">
              AI Native 미래 모습 이미지 생성
            </p>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              템플릿의{" "}
              <span className="font-semibold text-slate-800">[ ] 부분만 채워</span>{" "}
              붙여넣으세요. 이미지 생성은{" "}
              <span className="font-semibold">Gemini 또는 ChatGPT</span>를
              권장합니다.
            </p>
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div className="rounded-2xl bg-amber-50 border border-amber-200/90 px-3 py-2.5 text-[13px] text-amber-950 leading-relaxed">
              ⚠️ 이미지가 바로 안 나오면 하단 ‘이미지 생성’을 누르거나 새 채팅에서
              다시 붙여넣어 보세요. Claude는 대화 중 이미지 생성이 제한될 수 있습니다.
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 max-h-[min(45vh,320px)] overflow-y-auto overscroll-contain p-3">
              <pre className="whitespace-pre-wrap break-words font-sans text-[11px] sm:text-xs text-slate-700 leading-relaxed">
                {PROMPT_FUTURE_IMAGE}
              </pre>
            </div>
            <CopyButton
              label={busy === "p2" ? "복사 중…" : "프롬프트 2 전체 복사"}
              disabled={busy === "p2"}
              onCopy={() => copy("p2", PROMPT_FUTURE_IMAGE)}
            />
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900 text-slate-100 p-5 shadow-inner border border-slate-700/50">
          <h2 className="text-base font-extrabold mb-3 text-white">주의사항</h2>
          <ul className="space-y-2.5 text-[14px] leading-relaxed text-slate-300">
            {CAUTION.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="text-[color:var(--key-highlight)] shrink-0">
                  ✓
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-sm font-semibold shadow-lg max-w-[min(90vw,20rem)] text-center"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
