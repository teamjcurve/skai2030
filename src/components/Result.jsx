import { useState, useRef, useEffect } from "react";
import { characterData, badgeData, wefSkills } from "../data/resultData";

const CHARACTER_ICONS = {
  TBMi: "🏄", TBMa: "🏗️", TSMi: "🔍", TSMa: "⚙️",
  PBMi: "🚀", PBMa: "🎼", PSMi: "🤝", PSMa: "🛡️",
};

const BADGE_ICONS = {
  Task_Innovation: "🔭", People_Innovation: "🧗",
  People_Stability: "💚", Task_Stability: "⚖️",
};

const AXES = [
  { left: "T", right: "P", labelL: "데이터/기술", labelR: "사람/협업", colorL: "from-sky-500 to-cyan-400", colorR: "from-rose-400 to-pink-500" },
  { left: "B", right: "S", labelL: "과감한 실행", labelR: "안정 지향", colorL: "from-amber-400 to-orange-500", colorR: "from-emerald-400 to-teal-500" },
  { left: "Mi", right: "Ma", labelL: "미시적 디테일", labelR: "거시적 시스템", colorL: "from-violet-400 to-purple-500", colorR: "from-indigo-400 to-blue-500" },
];

const AXIS_LABELS = {
  T: "데이터/기술 중심", P: "사람/협업 중심",
  B: "과감한 실행", S: "안정 지향",
  Mi: "미시적 디테일", Ma: "거시적 시스템",
};

const SKILL_AXES = {
  "기술 리터러시": ["T"],
  "창의적 사고": ["T", "B"],
  "AI 및 빅데이터 활용": ["T"],
  "분석적 사고": ["T", "S"],
  "시스템적 사고": ["Ma"],
  "호기심 및 평생 학습": ["Mi"],
  "회복탄력성 및 민첩성": ["S"],
  "리더십 및 사회적 영향력": ["P", "B"],
  "동기 부여 및 자기 인식": ["P", "Mi"],
  "인재 관리 및 육성": ["P", "Ma"],
  "공감 및 적극적 경청": ["P"],
};

function getDominantAxes(code) {
  return [code[0], code[1], code.substring(2)];
}

function buildRationale(dominantAxes, coreSkillsStr) {
  const axisDescriptions = dominantAxes.map((a) => `${AXIS_LABELS[a]}(${a})`);
  const skills = coreSkillsStr.split(",").map((s) => s.trim());
  const skillsText = skills.map((s) => `'${s}'`).join(skills.length === 2 ? "와 " : ", ");

  return `당신의 ${axisDescriptions[0]} 성향과 ${axisDescriptions[1]} 성향, ${axisDescriptions[2]} 관점을 바탕으로, WEF 2030 미래 핵심 역량 중 ${skillsText}가 핵심 역량으로 도출되었습니다.`;
}

/* ── Balance Gauge ── */
function BalanceGauge({ memberScore, dominantAxes }) {
  return (
    <div className="w-full bg-gradient-to-br from-slate-900/60 to-slate-800/40 backdrop-blur rounded-2xl p-6 sm:p-8 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-base">📊</span>
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">나의 업무 성향 밸런스</h3>
      </div>
      <div className="flex flex-col gap-6">
        {AXES.map(({ left, right, labelL, labelR, colorL, colorR }) => {
          const lVal = memberScore[left] || 0;
          const rVal = memberScore[right] || 0;
          const total = lVal + rVal || 1;
          const leftPct = Math.round((lVal / total) * 100);
          const rightPct = 100 - leftPct;
          const leftDominant = dominantAxes.includes(left);

          return (
            <div key={left + right} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={`flex items-center gap-1 ${leftDominant ? "text-white" : "text-slate-500"}`}>
                  {leftDominant && <span className="text-amber-400 text-[10px]">★</span>}
                  {labelL} ({left})
                </span>
                <span className={`flex items-center gap-1 ${!leftDominant ? "text-white" : "text-slate-500"}`}>
                  {labelR} ({right})
                  {!leftDominant && <span className="text-amber-400 text-[10px]">★</span>}
                </span>
              </div>
              <div className="relative w-full h-5 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className={`h-full bg-gradient-to-r ${colorL} rounded-l-full transition-all duration-700 ease-out`}
                  style={{ width: `${leftPct}%` }}
                />
                <div
                  className={`h-full bg-gradient-to-r ${colorR} rounded-r-full transition-all duration-700 ease-out`}
                  style={{ width: `${rightPct}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white drop-shadow-md">
                    {leftPct}% : {rightPct}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-[11px] text-slate-500 text-center leading-relaxed">
        ★ 표시된 우세 축이 핵심 역량 선정의 직접적인 근거가 됩니다
      </p>
    </div>
  );
}

/* ── Skill Tooltip ── */
function SkillTooltip({ skill }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const definition = wefSkills[skill];
  const relatedAxes = SKILL_AXES[skill];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [open]);

  if (!definition) return <span>{skill}</span>;

  return (
    <span ref={ref} className="relative inline-flex items-center gap-1">
      <span>{skill}</span>
      <button
        onClick={() => setOpen((v) => !v)}
        className="shrink-0 w-4 h-4 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-[10px] font-bold text-indigo-300 flex items-center justify-center cursor-pointer hover:bg-indigo-500/50 transition-colors"
      >
        ?
      </button>
      {open && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 px-4 py-3 rounded-xl bg-slate-800 border border-indigo-500/40 shadow-xl shadow-indigo-900/30 text-xs text-slate-200 leading-relaxed animate-fade-in">
          <span className="flex items-center gap-2 mb-2">
            <span className="font-bold text-indigo-300">{skill}</span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-600/30 border border-indigo-500/30 text-[9px] font-bold text-indigo-300 uppercase tracking-wider">WEF 2030</span>
          </span>
          <span className="block mb-2">{definition}</span>
          {relatedAxes && (
            <span className="block text-[10px] text-slate-400">
              관련 성향 축: {relatedAxes.map((a) => `${AXIS_LABELS[a]}(${a})`).join(", ")}
            </span>
          )}
          <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-800" />
        </span>
      )}
    </span>
  );
}

/* ── Core Skills with Tooltip (Character) ── */
function CoreSkillsWithTooltip({ coreSkillsStr, rationale }) {
  const skills = coreSkillsStr.split(",").map((s) => s.trim());

  return (
    <div className="mb-6">
      <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full px-4 py-2 mb-3">
        <span className="text-xs text-indigo-300 font-semibold">Core Skills</span>
        {skills.map((skill, i) => (
          <span key={skill} className="text-xs text-indigo-100 inline-flex items-center gap-0.5">
            {i > 0 && <span className="mr-1 text-indigo-500">·</span>}
            <SkillTooltip skill={skill} />
          </span>
        ))}
      </div>
      <p className="text-xs text-indigo-300/70 leading-relaxed px-1">
        {rationale}
      </p>
    </div>
  );
}

/* ── Core Skills with Tooltip (Badge) ── */
function BadgeCoreSkillsWithTooltip({ coreSkillsStr }) {
  const skills = coreSkillsStr.split(",").map((s) => s.trim());

  return (
    <div className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 bg-violet-600/20 border border-violet-500/30 rounded-full px-4 py-2 mb-5">
      <span className="text-xs text-violet-300 font-semibold">Core Skills</span>
      {skills.map((skill, i) => (
        <span key={skill} className="text-xs text-violet-100 inline-flex items-center gap-0.5">
          {i > 0 && <span className="mr-1 text-violet-500">·</span>}
          <SkillTooltip skill={skill} />
        </span>
      ))}
    </div>
  );
}

/* ── WEF Accordion ── */
function WefAccordion({ userCoreSkills }) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(wefSkills);

  return (
    <div className="w-full rounded-2xl border border-slate-700/50 bg-slate-900/40 backdrop-blur overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-6 py-5 cursor-pointer hover:bg-slate-800/40 transition-colors"
      >
        <span className="text-sm sm:text-base font-bold text-slate-200 text-left">
          💡 WEF 2030 미래 핵심 역량 11가지 전체 보기
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`grid transition-all duration-500 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6">
            <div className="border-t border-slate-700/50 pt-4 mb-4">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                아래 역량은 <span className="text-slate-400 font-semibold">세계경제포럼(World Economic Forum)</span>이 발표한 「Future of Jobs Report」에서 선정한 2030년 미래 핵심 역량입니다.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {entries.map(([name, def], i) => {
                const isUserSkill = userCoreSkills.includes(name);
                const relatedAxes = SKILL_AXES[name];
                return (
                  <div
                    key={name}
                    className={`flex gap-3 rounded-xl p-3 transition-colors ${isUserSkill ? "bg-indigo-600/15 border border-indigo-500/25" : "bg-transparent"}`}
                  >
                    <span className={`shrink-0 w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center mt-0.5 ${isUserSkill ? "bg-indigo-500/30 text-indigo-200" : "bg-slate-700/40 text-slate-500"}`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className={`text-sm font-semibold ${isUserSkill ? "text-indigo-200" : "text-slate-300"}`}>{name}</p>
                        {isUserSkill && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/25 border border-indigo-400/30 text-[9px] font-bold text-indigo-300 uppercase tracking-wider">
                            나의 역량
                          </span>
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed ${isUserSkill ? "text-slate-300" : "text-slate-500"}`}>{def}</p>
                      {relatedAxes && (
                        <p className="text-[10px] text-slate-500 mt-1">
                          관련 축: {relatedAxes.map((a) => AXIS_LABELS[a]).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Shared Section / ListItem ── */
function Section({ title, icon, children, accent = "indigo" }) {
  const colors = {
    indigo: "border-indigo-700/30 from-indigo-900/30 to-indigo-950/20",
    violet: "border-violet-700/30 from-violet-900/30 to-violet-950/20",
    emerald: "border-emerald-700/30 from-emerald-900/30 to-emerald-950/20",
    amber: "border-amber-700/30 from-amber-900/30 to-amber-950/20",
  };

  return (
    <div className={`w-full bg-gradient-to-br ${colors[accent]} backdrop-blur rounded-2xl p-6 border`}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ListItem({ text, index }) {
  return (
    <li className="flex gap-3 text-sm text-slate-300 leading-relaxed">
      <span className="shrink-0 w-5 h-5 rounded-full bg-slate-700/60 text-[10px] font-bold flex items-center justify-center text-slate-400 mt-0.5">
        {index + 1}
      </span>
      <span>{text}</span>
    </li>
  );
}

/* ── Main Result Component ── */
export default function Result({ resultType, userType, memberScore, onRestart }) {
  const character = characterData[resultType?.memberResult];
  const badge = userType === "leader" && resultType?.leaderResult
    ? badgeData[resultType.leaderResult]
    : null;

  if (!character) return null;

  const icon = CHARACTER_ICONS[resultType.memberResult] || "🧬";
  const badgeIcon = badge ? (BADGE_ICONS[resultType.leaderResult] || "🏅") : null;
  const dominantAxes = getDominantAxes(resultType.memberResult);
  const rationale = buildRationale(dominantAxes, character.coreSkills);
  const userCoreSkills = character.coreSkills.split(",").map((s) => s.trim());

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-5 py-10 sm:py-16 flex flex-col items-center gap-6">

        {/* Hero Card */}
        <div className="w-full bg-gradient-to-br from-indigo-900/40 to-violet-900/20 backdrop-blur rounded-3xl p-8 sm:p-10 border border-indigo-700/30 text-center">
          <p className="text-6xl mb-5">{icon}</p>
          <p className="text-xs text-indigo-400 font-semibold tracking-widest uppercase mb-2">
            AI 시대 생존 캐릭터
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
            {character.name}
          </h1>
          <p className="text-sm sm:text-base text-indigo-300 font-medium mb-6">
            {character.subtitle}
          </p>

          <CoreSkillsWithTooltip coreSkillsStr={character.coreSkills} rationale={rationale} />

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed text-left">
            {character.description}
          </p>
        </div>

        {/* Balance Gauge */}
        <BalanceGauge memberScore={memberScore} dominantAxes={dominantAxes} />

        {/* Strengths */}
        <Section title="이런 점이 강합니다" icon="💪" accent="emerald">
          <ul className="flex flex-col gap-4">
            {character.strengths.map((s, i) => (
              <ListItem key={i} text={s} index={i} />
            ))}
          </ul>
        </Section>

        {/* Improvements */}
        <Section title="이런 점을 보완하면 좋습니다" icon="📌" accent="amber">
          <ul className="flex flex-col gap-4">
            {character.improvements.map((s, i) => (
              <ListItem key={i} text={s} index={i} />
            ))}
          </ul>
        </Section>

        {/* Leader Badge */}
        {badge && (
          <div className="w-full bg-gradient-to-br from-violet-900/40 to-fuchsia-900/20 backdrop-blur rounded-3xl p-8 sm:p-10 border border-violet-600/30 text-center">
            <p className="text-5xl mb-4">{badgeIcon}</p>
            <p className="text-xs text-violet-400 font-semibold tracking-widest uppercase mb-2">
              리더십 뱃지
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
              {badge.name}
            </h2>
            <p className="text-sm text-violet-300 font-medium mb-5">
              {badge.subtitle}
            </p>

            <BadgeCoreSkillsWithTooltip coreSkillsStr={badge.coreSkills} />

            <p className="text-sm text-slate-300 leading-relaxed text-left">
              {badge.description}
            </p>
          </div>
        )}

        {/* Next Step 티저 */}
        <div className="w-full relative overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-br from-cyan-950/50 via-slate-900/60 to-indigo-950/50 backdrop-blur p-8 sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="relative">
            <h3 className="text-lg sm:text-xl font-black text-white mb-6 leading-snug">
              🚀 Next Step : AI 코치와 함께 나만의 New Role 만들기
            </h3>

            <div className="flex flex-col gap-4 text-sm sm:text-base text-slate-200 leading-relaxed">
              <p>
                확인하신 당신의 캐릭터 코드는{" "}
                <span className="inline-flex items-center gap-1.5 bg-cyan-500/15 border border-cyan-400/30 rounded-lg px-3 py-1 font-bold text-cyan-300">
                  {resultType.memberResult} – {character.name}
                </span>{" "}
                입니다.
              </p>
              <p>
                이 캐릭터의 강력한 무기를 활용해 내일 당장 내 업무를 어떻게 바꿀 수 있을까요?
              </p>
              <p>
                이어지는 실습 시간에서 이 결과 코드를{" "}
                <span className="font-bold text-cyan-300">'AI New Role Coach'</span>에게
                입력하고, 나만의 완벽한 업무 재설계(Job Crafting) 팁을 처방받아 보세요!
              </p>
            </div>
          </div>
        </div>

        {/* WEF Accordion */}
        <WefAccordion userCoreSkills={userCoreSkills} />

        {/* Restart */}
        <button
          onClick={onRestart}
          className="w-full max-w-xs py-4 rounded-xl bg-slate-800 border-2 border-slate-700 text-slate-200 font-bold text-sm hover:border-indigo-500 hover:bg-indigo-950/40 transition-all duration-200 cursor-pointer mt-2"
        >
          🔄 다시 하기
        </button>
      </div>
    </div>
  );
}
