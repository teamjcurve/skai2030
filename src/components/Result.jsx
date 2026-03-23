import { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { characterData, characterImageFile, badgeData, wefSkills } from "../data/resultData";

function characterImageSrc(memberResult) {
  const file = characterImageFile[memberResult];
  if (!file) return null;
  return `/${encodeURIComponent(file)}`;
}

const CHARACTER_MARKS = {
  TMA: "TMA",
  TMS: "TMS",
  TRA: "TRA",
  TRS: "TRS",
  WMA: "WMA",
  WMS: "WMS",
  WRA: "WRA",
  WRS: "WRS",
};

const AXES = [
  {
    title: "기술 및 대인 관계 (Technology & Working with others)",
    subtitle:
      "문제 해결 시 기술/데이터를 우선할 것인가, 사람과의 소통을 우선할 것인가?",
    left: "T",
    right: "W",
    labelL: "Technology (기술·데이터)",
    labelR: "Working with others (소통·협업)",
    descL: "",
    descR: "",
    colorL: "var(--key-highlight)",
    colorR: "var(--key-primary)",
  },
  {
    title: "자기 효능감 (Self-efficacy)",
    subtitle:
      "불확실성 앞에서 주도적으로 돌파할 것인가, 흔들림 없이 안정성을 유지할 것인가?",
    left: "M",
    right: "R",
    labelL: "Motivation & Agility (동기·민첩성)",
    labelR: "Resilience (회복탄력성)",
    descL: "",
    descR: "",
    colorL: "var(--key-highlight)",
    colorR: "var(--key-primary)",
  },
  {
    title: "인지적 스킬 (Cognitive skills)",
    subtitle:
      "사안을 볼 때 세부 팩트로 분해할 것인가, 전체의 연결성(큰 그림)을 파악할 것인가?",
    left: "A",
    right: "S",
    labelL: "Analytical (분석적)",
    labelR: "Systems (시스템적)",
    descL: "",
    descR: "",
    colorL: "var(--key-highlight)",
    colorR: "var(--key-primary)",
  },
];

const AXIS_LABELS = {
  T: "기술·데이터 중심 해결 우선", W: "소통·협업 중심 해결 우선",
  M: "동기·애자일 돌파", R: "안정·복구(회복) 유지",
  A: "분석적(디테일/팩트)", S: "시스템적(연결/구조)",
};

const SKILL_AXES = {
  "기술 리터러시": ["T"],
  "창의적 사고": ["T", "M"],
  "AI 및 빅데이터 활용": ["T"],
  "분석적 사고": ["A"],
  "시스템적 사고": ["S"],
  "호기심 및 평생 학습": ["A"],
  "회복탄력성 및 민첩성": ["R", "M"],
  "리더십 및 사회적 영향력": ["W", "M"],
  "동기 부여 및 자기 인식": ["W", "M"],
  "인재 관리 및 육성": ["W", "S"],
  "공감 및 적극적 경청": ["W"],

  // Alias labels used in result copy
  "AI 및 빅데이터": ["T", "S"],
  "동기 부여": ["W", "M"],
  "민첩성": ["M"],
  "회복탄력성": ["R"],
  "호기심": ["A"],
  "사회적 영향력": ["W", "M"],
  "리더십": ["W", "M"],
};

const WEF_11 = [
  "회복탄력성 및 민첩성",
  "AI 및 빅데이터 활용",
  "분석적 사고",
  "창의적 사고",
  "기술 리터러시",
  "리더십 및 사회적 영향력",
  "호기심 및 평생 학습",
  "시스템적 사고",
  "인재 관리 및 육성",
  "동기 부여 및 자기 인식",
  "공감 및 적극적 경청",
];

const CANONICAL_SKILL_BY_ALIAS = {
  "민첩성": "회복탄력성 및 민첩성",
  "회복탄력성": "회복탄력성 및 민첩성",
  "AI 및 빅데이터": "AI 및 빅데이터 활용",
  "동기 부여": "동기 부여 및 자기 인식",
  "호기심": "호기심 및 평생 학습",
  "사회적 영향력": "리더십 및 사회적 영향력",
  "리더십": "리더십 및 사회적 영향력",
};

function toCanonicalWefSkill(name) {
  return CANONICAL_SKILL_BY_ALIAS[name] || name;
}

function getDevelopmentSkills({ coreSkills, memberScore, count = 3 }) {
  const coreSet = new Set(coreSkills.map(toCanonicalWefSkill));
  return WEF_11
    .map((name) => {
      const axes = SKILL_AXES[name] || [];
      const score = axes.reduce((sum, a) => sum + (memberScore?.[a] || 0), 0);
      return { name, score };
    })
    .filter((s) => !coreSet.has(s.name))
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map((s) => s.name);
}

function getDominantAxes(code) {
  return [code[0], code[1], code.substring(2)];
}

/* ── Balance Gauge ── */
function BalanceGauge({ memberScore, dominantAxes }) {
  return (
    <div className="w-full rounded-3xl bg-white p-6 sm:p-8 border border-black/5 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="text-base font-bold text-slate-900 uppercase tracking-wider">
          나의 업무 성향 밸런스
        </h3>
      </div>
      <div className="flex flex-col gap-6">
        {AXES.map(({ title, subtitle, left, right, labelL, labelR, descL, descR, colorL, colorR }) => {
          const lVal = memberScore[left] || 0;
          const rVal = memberScore[right] || 0;
          const total = lVal + rVal || 1;
          const leftPct = Math.round((lVal / total) * 100);
          const rightPct = 100 - leftPct;
          const leftDominant = dominantAxes.includes(left);

          const barEl = (
            <div className="relative w-full h-6 sm:h-5 rounded-full bg-black/10 overflow-hidden flex shadow-inner">
              <div
                className="h-full rounded-l-full transition-all duration-500 ease-out"
                style={{ width: `${leftPct}%`, backgroundColor: colorL }}
              />
              <div
                className="h-full rounded-r-full transition-all duration-500 ease-out"
                style={{ width: `${rightPct}%`, backgroundColor: colorR }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[11px] sm:text-xs font-bold text-slate-900 drop-shadow-sm">
                  {leftPct}% · {rightPct}%
                </span>
              </div>
            </div>
          );

          const preferBadge = (compact) => (
            <span
              className={
                compact
                  ? "shrink-0 px-2 py-1 rounded-lg bg-[color:var(--key-primary)] text-white text-[10px] font-extrabold shadow-sm"
                  : "px-2 py-0.5 rounded-full bg-[color:var(--key-primary)]/10 border border-[color:var(--key-primary)]/20 text-[11px] font-bold text-[color:var(--key-primary)]"
              }
            >
              선호
            </span>
          );

          return (
            <div key={left + right} className="flex flex-col gap-2">
              <p className="text-sm font-extrabold text-slate-900">
                {title}
              </p>
              {subtitle && (
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  {subtitle}
                </p>
              )}

              {/* 모바일: 위(왼쪽 축) → 막대 → 아래(오른쪽 축), 선호 카드만 강조 */}
              <div className="flex flex-col gap-3 sm:hidden">
                <div
                  className={`rounded-2xl border-2 px-3 py-3 transition-colors ${
                    leftDominant
                      ? "border-[color:var(--key-primary)] bg-[color:var(--key-primary)]/[0.07] shadow-[0_1px_0_rgba(0,0,0,0.04)]"
                      : "border-black/[0.08] bg-slate-50/90"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        왼쪽 방향
                      </p>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{labelL}</p>
                      {descL ? (
                        <p className="text-xs text-slate-500 leading-snug mt-1">{descL}</p>
                      ) : null}
                    </div>
                    {leftDominant ? preferBadge(true) : null}
                  </div>
                </div>

                <div className="px-0.5">
                  {barEl}
                  <p className="text-[10px] text-center text-slate-400 mt-1.5">
                    막대 왼쪽은 상단 항목, 오른쪽은 하단 항목 비중입니다
                  </p>
                </div>

                <div
                  className={`rounded-2xl border-2 px-3 py-3 transition-colors ${
                    !leftDominant
                      ? "border-[color:var(--key-primary)] bg-[color:var(--key-primary)]/[0.07] shadow-[0_1px_0_rgba(0,0,0,0.04)]"
                      : "border-black/[0.08] bg-slate-50/90"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        오른쪽 방향
                      </p>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{labelR}</p>
                      {descR ? (
                        <p className="text-xs text-slate-500 leading-snug mt-1">{descR}</p>
                      ) : null}
                    </div>
                    {!leftDominant ? preferBadge(true) : null}
                  </div>
                </div>
              </div>

              {/* 태블릿·데스크톱: 가로 2열 + 막대 */}
              <div className="hidden sm:flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{labelL}</span>
                      {leftDominant && preferBadge(false)}
                    </div>
                    {descL ? (
                      <p className="text-xs text-slate-500 leading-snug mt-0.5">{descL}</p>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {!leftDominant && preferBadge(false)}
                      <span className="text-sm font-semibold text-slate-900">{labelR}</span>
                    </div>
                    {descR ? (
                      <p className="text-xs text-slate-500 leading-snug mt-0.5">{descR}</p>
                    ) : null}
                  </div>
                </div>
                {barEl}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-sm text-slate-500 text-center leading-relaxed">
        ‘선호’는 응답에서 더 높은 점수를 받은 방향입니다.
      </p>
    </div>
  );
}

/* ── Skill Tooltip (화면 중앙 모달, 잘림 방지) ── */
function SkillTooltip({ skill }) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const definition = wefSkills[skill];
  const relatedAxes = SKILL_AXES[skill];

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!definition) return <span>{skill}</span>;

  const modal = open
    ? createPortal(
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            aria-label="설명 닫기"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-sm max-h-[min(85vh,32rem)] overflow-y-auto rounded-2xl bg-white border border-black/10 shadow-2xl shadow-black/20 text-left px-4 py-3 sm:px-5 sm:py-4 text-xs text-slate-700 leading-relaxed animate-fade-in"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span id={titleId} className="font-bold text-slate-900 text-sm">
                {skill}
              </span>
              <span className="shrink-0 px-1.5 py-0.5 rounded bg-[color:var(--key-primary)]/10 border border-[color:var(--key-primary)]/20 text-[9px] font-bold text-[color:var(--key-primary)] uppercase tracking-wider">
                WEF 2030
              </span>
            </div>
            <p className="mb-3 text-slate-700">{definition}</p>
            {relatedAxes && (
              <p className="text-[10px] text-slate-500 leading-snug">
                관련 성향 축:{" "}
                {relatedAxes.map((a) => `${AXIS_LABELS[a]}(${a})`).join(", ")}
            </p>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[color:var(--key-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              확인
            </button>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <span className="inline-flex items-center gap-1">
      <span>{skill}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="shrink-0 w-4 h-4 rounded-full bg-[color:var(--key-primary)]/12 border border-[color:var(--key-primary)]/20 text-[10px] font-bold text-[color:var(--key-primary)] flex items-center justify-center cursor-pointer hover:bg-[color:var(--key-primary)]/18 transition-colors"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        ?
      </button>
      {modal}
    </span>
  );
}

/* ── Core Skills with Tooltip (Character) ── */
function CoreSkillsWithTooltip({ coreSkillsStr, memberScore }) {
  const skills = coreSkillsStr.split(",").map((s) => s.trim());
  const devSkills = getDevelopmentSkills({ coreSkills: skills, memberScore, count: 3 });

  return (
    <div className="mb-6">
      <div className="flex flex-col gap-3">
        <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 bg-[color:var(--key-primary)]/10 border border-[color:var(--key-primary)]/20 rounded-lg px-4 py-2">
          <span className="text-sm text-[color:var(--key-primary)] font-semibold">핵심 스킬</span>
          {skills.map((skill, i) => (
            <span key={skill} className="text-sm text-slate-900 inline-flex items-center gap-0.5">
              {i > 0 && <span className="mr-1 text-slate-500">·</span>}
              <SkillTooltip skill={skill} />
            </span>
          ))}
        </div>

        {devSkills.length > 0 && (
          <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 bg-[color:var(--key-highlight)]/18 border border-[color:var(--key-highlight)]/35 rounded-lg px-4 py-2">
            <span className="text-sm text-[#7A5200] font-semibold">개발 스킬</span>
            {devSkills.map((skill, i) => (
              <span key={skill} className="text-sm text-slate-900 inline-flex items-center gap-0.5">
                {i > 0 && <span className="mr-1 text-slate-500">·</span>}
                <SkillTooltip skill={skill} />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Core Skills with Tooltip (Badge) ── */
function BadgeCoreSkillsWithTooltip({ coreSkillsStr }) {
  const skills = coreSkillsStr.split(",").map((s) => s.trim());

  return (
    <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 bg-[color:var(--key-highlight)]/18 border border-[color:var(--key-highlight)]/35 rounded-lg px-4 py-2 mb-5">
      <span className="text-sm text-[#7A5200] font-semibold">핵심 스킬</span>
      {skills.map((skill, i) => (
        <span key={skill} className="text-sm text-slate-900 inline-flex items-center gap-0.5">
          {i > 0 && <span className="mr-1 text-slate-500">·</span>}
          <SkillTooltip skill={skill} />
        </span>
      ))}
    </div>
  );
}

/* ── WEF Accordion ── */
function WefAccordion({ coreSkills, devSkills }) {
  const coreSet = new Set(coreSkills.map(toCanonicalWefSkill));
  const devSet = new Set(devSkills);

  return (
    <div className="w-full rounded-3xl border border-black/5 bg-white overflow-hidden shadow-sm">
      <div className="w-full flex items-center justify-between gap-3 px-6 py-5">
        <span className="text-sm sm:text-base font-bold text-slate-900 text-left">
          WEF 2030 미래 핵심 스킬 11가지 전체 보기
        </span>
      </div>

      <div className="px-6 pb-6">
        <div className="border-t border-black/5 pt-4 mb-4">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            아래 스킬은{" "}
            <span className="text-slate-700 font-semibold">
              세계경제포럼(World Economic Forum)
            </span>
            이 발표한 「Future of Jobs Report」에서 선정한 2030년 미래 핵심 스킬입니다.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {WEF_11.map((name, i) => {
            const def = wefSkills[name];
            const isCoreSkill = coreSet.has(name);
            const isDevSkill = devSet.has(name);
            const relatedAxes = SKILL_AXES[name];
            return (
              <div
                key={name}
                className={`flex gap-3 rounded-2xl p-3 transition-colors ${
                  isCoreSkill
                    ? "bg-[color:var(--key-primary)]/8 border border-[color:var(--key-primary)]/18"
                    : isDevSkill
                      ? "bg-[color:var(--key-highlight)]/14 border border-[color:var(--key-highlight)]/25"
                    : "bg-transparent"
                }`}
              >
                <span
                  className={`shrink-0 w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center mt-0.5 ${
                    isCoreSkill
                      ? "bg-[color:var(--key-primary)]/15 text-[color:var(--key-primary)]"
                      : isDevSkill
                        ? "bg-[color:var(--key-highlight)]/35 text-[#7A5200]"
                      : "bg-slate-700/40 text-slate-500"
                  }`}
                >
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p
                      className={`text-sm font-semibold ${
                        isCoreSkill
                          ? "text-[color:var(--key-primary)]"
                          : isDevSkill
                            ? "text-[#7A5200]"
                            : "text-slate-900"
                      }`}
                    >
                      {name}
                    </p>
                    {isCoreSkill && (
                      <span className="px-2 py-0.5 rounded-full bg-[color:var(--key-primary)]/10 border border-[color:var(--key-primary)]/20 text-[9px] font-bold text-[color:var(--key-primary)] uppercase tracking-wider">
                        핵심 스킬
                      </span>
                    )}
                    {!isCoreSkill && isDevSkill && (
                      <span className="px-2 py-0.5 rounded-full bg-[color:var(--key-highlight)]/20 border border-[color:var(--key-highlight)]/35 text-[9px] font-bold text-[#7A5200] uppercase tracking-wider">
                        개발 스킬
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {def}
                  </p>
                  {relatedAxes && (
                    <p className="text-xs text-slate-500 mt-1">
                      관련 축:{" "}
                      {relatedAxes.map((a) => AXIS_LABELS[a]).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Shared Section / ListItem ── */
function Section({ title, icon, children, accent = "indigo" }) {
  const colors = {
    skBlue: "border-[color:var(--key-primary)]/25 from-[color:var(--key-primary)]/10 to-black/10",
    skOrange:
      "border-[color:var(--sk-orange)]/25 from-[color:var(--sk-orange)]/10 to-black/10",
    skRed: "border-[color:var(--sk-red)]/25 from-[color:var(--sk-red)]/10 to-black/10",
    skNeutral: "border-[color:var(--sk-border)] from-white/5 to-black/10",
  };

  return (
    <div
      className={`w-full rounded-3xl bg-white p-6 border border-black/5 shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function ListItem({ text, index }) {
  return (
    <li className="flex gap-3 text-base text-slate-700 leading-relaxed">
      <span className="shrink-0 w-5 h-5 rounded-full bg-black/5 text-[10px] font-bold flex items-center justify-center text-slate-500 mt-0.5">
        {index + 1}
      </span>
      <span>{text}</span>
    </li>
  );
}

/* ── Main Result Component ── */
export default function Result({ resultType, userType, memberScore, onRestart }) {
  const captureRef = useRef(null);
  const [isSavingPdf, setIsSavingPdf] = useState(false);

  const character = characterData[resultType?.memberResult];
  const badge = userType === "leader" && resultType?.leaderResult
    ? badgeData[resultType.leaderResult]
    : null;

  if (!character) return null;

  const mark = CHARACTER_MARKS[resultType.memberResult] || resultType.memberResult;
  const charImgSrc = characterImageSrc(resultType.memberResult);
  const dominantAxes = getDominantAxes(resultType.memberResult);
  const userCoreSkills = character.coreSkills.split(",").map((s) => s.trim());
  const userDevSkills = getDevelopmentSkills({ coreSkills: userCoreSkills, memberScore, count: 3 });

  const saveResultAsPdf = useCallback(() => {
    const el = captureRef.current;
    if (!el) return;
    setIsSavingPdf(true);

    const originalTitle = document.title;
    const filenameBase = `skill-balance-result-${mark}`;
    const styleTag = document.createElement("style");

    styleTag.setAttribute("data-result-print", "true");
    styleTag.textContent = `
      @media print {
        @page { size: A4; margin: 12mm; }
        body * { visibility: hidden !important; }
        .result-print-target, .result-print-target * { visibility: visible !important; }
        .result-print-target {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
        }
      }
    `;

    const cleanup = () => {
      window.removeEventListener("afterprint", cleanup);
      el.classList.remove("result-print-target");
      styleTag.remove();
      document.title = originalTitle;
      setIsSavingPdf(false);
    };

    try {
      document.title = filenameBase;
      el.classList.add("result-print-target");
      document.head.appendChild(styleTag);
      window.addEventListener("afterprint", cleanup, { once: true });
      // 스타일 적용 후 인쇄 대화상자를 연다.
      setTimeout(() => window.print(), 50);
    } catch (e) {
      cleanup();
      console.error(e);
      window.alert("PDF 저장을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    }
  }, [mark]);

  return (
    <div className="min-h-dvh bg-[#f6f7f9] text-slate-950">
      <div className="max-w-2xl mx-auto px-5 py-10 sm:py-14 flex flex-col items-center gap-6">

        <div ref={captureRef} className="flex flex-col gap-6 w-full bg-[#f6f7f9]">

        {/* Hero Card */}
        <div className="w-full rounded-3xl bg-white border border-black/5 shadow-sm overflow-hidden">
          {charImgSrc && (
            <div className="-mb-px flex justify-center bg-gradient-to-b from-[color:var(--key-primary)]/[0.07] via-[#f6f7f9] to-white px-4 pt-6 pb-2 sm:px-8 sm:pt-8 sm:pb-3">
              <img
                src={charImgSrc}
                alt={character.name}
                className="h-auto w-full max-w-full object-contain max-h-[min(52vh,440px)] sm:max-h-[min(56vh,520px)] drop-shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
                loading="eager"
                decoding="async"
              />
            </div>
          )}
          <div className="p-7 sm:p-9 pt-6 sm:pt-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] text-[color:var(--key-primary)] font-semibold tracking-widest uppercase mb-2">
            AI 시대 스킬 캐릭터
          </p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 mb-2 leading-tight">
            {character.name}
          </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium mb-5">
            {character.subtitle}
          </p>
            </div>
            <div className="shrink-0">
              <div className="rounded-2xl bg-[#f6f7f9] border border-black/10 px-3 py-2 text-xs font-bold text-slate-800 tabular-nums">
                {mark}
              </div>
            </div>
          </div>

          <CoreSkillsWithTooltip coreSkillsStr={character.coreSkills} memberScore={memberScore} />

          <p className="text-sm sm:text-base text-slate-700 leading-relaxed text-left">
            {character.description}
          </p>

          <div className="mt-5 rounded-3xl bg-[#f6f7f9] border border-black/10 px-6 py-5">
            <p className="text-base font-extrabold text-slate-900 mb-2">
              나의 핵심 무기와 성장 포인트
            </p>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              핵심 스킬은 거센 기술의 변화 속에서도 당신이 가장 자연스럽고 강력하게 발휘하는 고유의 무기입니다. 반면, 개발 스킬은 다가오는 에이전틱 AI 시대에 의식적으로 보완해야 할 성장 포인트입니다. 이 낯선 스킬들을 장착한다면, 기술과 인간의 협업 딜레마 속에서도 대체 불가능한 리더십을 완성할 수 있습니다.
            </p>
          </div>
          </div>
        </div>

        {/* Balance Gauge */}
        <BalanceGauge memberScore={memberScore} dominantAxes={dominantAxes} />

        {/* Strengths */}
        <Section title="이런 점이 강합니다 (핵심 스킬)" icon="" accent="skBlue">
          <ul className="flex flex-col gap-4">
            {character.strengths.map((s, i) => (
              <ListItem key={i} text={s} index={i} />
            ))}
          </ul>
        </Section>

        {/* Improvements */}
        <Section title="이런 점은 보완하면 좋습니다 (개발 스킬)" icon="" accent="skOrange">
          <ul className="flex flex-col gap-4">
            {character.improvements.map((s, i) => (
              <ListItem key={i} text={s} index={i} />
            ))}
          </ul>
        </Section>

        {/* WEF List */}
        <WefAccordion coreSkills={userCoreSkills} devSkills={userDevSkills} />

        {/* Leader Badge */}
        {badge && (
          <div className="w-full rounded-3xl bg-white p-7 sm:p-9 border border-black/5 shadow-sm">
            <p className="text-[11px] text-[color:var(--sk-orange)] font-semibold tracking-widest uppercase mb-2">
              리더십 뱃지
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 mb-2">
              {badge.name}
            </h2>
            <p className="text-sm text-slate-600 font-medium mb-5">
              {badge.subtitle}
            </p>

            <BadgeCoreSkillsWithTooltip coreSkillsStr={badge.coreSkills} />

            <p className="text-sm text-slate-700 leading-relaxed text-left">
              {badge.description}
            </p>
          </div>
        )}

        </div>

        <div className="w-full max-w-xs flex flex-col gap-3 mt-1">
          <button
            type="button"
            onClick={saveResultAsPdf}
            disabled={isSavingPdf}
            className={`w-full py-4 rounded-3xl font-bold text-sm transition-all duration-200 border-2 ${
              isSavingPdf
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-wait"
                : "bg-white text-[color:var(--key-primary)] border-[color:var(--key-primary)] hover:bg-[color:var(--key-primary)]/5 cursor-pointer"
            }`}
          >
            {isSavingPdf ? "PDF 준비 중…" : "결과 PDF로 저장"}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-4 rounded-3xl bg-[color:var(--key-primary)] text-white font-bold text-sm hover:opacity-90 transition-all duration-200 cursor-pointer"
          >
            다시 하기
          </button>
        </div>
      </div>
    </div>
  );
}
