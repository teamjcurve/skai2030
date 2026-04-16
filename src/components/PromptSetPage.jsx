import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const JOB_ROLES = [
  { ko: "반도체 설계", en: "Semiconductor Design & Architecture" },
  { ko: "공정 관리", en: "Process Management & Yield Optimization" },
  { ko: "전략 기획", en: "Strategic Planning & Business Operation" },
  { ko: "데이터 분석", en: "Data Analysis & AI Modeling" },
  { ko: "HR & 조직개발", en: "Human Resources & Organizational Development" },
  { ko: "품질 관리", en: "Quality Assurance & Reliability Engineering" },
  { ko: "연구 개발 (R&D)", en: "Research & Development Innovation" },
  { ko: "제품 기획", en: "Product Planning & Roadmap Strategy" },
  { ko: "마케팅 & 세일즈", en: "Marketing & Global Sales" },
  { ko: "IT 인프라", en: "IT Infrastructure & System Engineering" },
  { ko: "재무 & 회계", en: "Finance & Accounting Management" },
  { ko: "소프트웨어 개발", en: "Software Engineering & Development" },
  { ko: "구매 & 조달", en: "Procurement & Supply Chain Management" },
  { ko: "설비 관리", en: "Equipment & Facility Management" },
  { ko: "생산 관리", en: "Production Management & Manufacturing" },
  { ko: "법무 & 컴플라이언스", en: "Legal Affairs & Compliance" },
  { ko: "환경 안전 (EHS)", en: "Environmental Health & Safety" },
  { ko: "고객 지원 & CX", en: "Customer Experience & Technical Support" },
  { ko: "지적재산권 관리", en: "Intellectual Property Management" },
  { ko: "패키징 & 테스트", en: "Semiconductor Packaging & Testing" },
];

/** 드롭다운 '기타' 선택 시 직접 입력과 매칭되는 값 */
const JOB_OTHER = "기타";

const CORE_SKILLS = [
  { ko: "회복탄력성 및 민첩성", en: "Resilience & Agility", char: "다이내믹 서퍼" },
  { ko: "AI 및 빅데이터 활용", en: "AI & Big Data Utilization", char: "디지털 오라클" },
  { ko: "분석적 사고", en: "Analytical Thinking", char: "데이터 연금술사" },
  { ko: "창의적 사고", en: "Creative Thinking", char: "아이디어 스파크" },
  { ko: "기술 리터러시", en: "Tech Literacy & Digital Fluency", char: "테크 플루언트" },
  { ko: "리더십 및 사회적 영향력", en: "Leadership & Social Influence", char: "컬처 크리에이터" },
  { ko: "호기심 및 평생 학습", en: "Curiosity & Lifelong Learning", char: "지적 유목민" },
  { ko: "시스템적 사고", en: "Systems Thinking", char: "매크로 렌즈" },
  { ko: "인재 관리 및 육성", en: "Talent Management & Development", char: "포텐셜 부스터" },
  { ko: "동기 부여 및 자기 인식", en: "Self-Motivation & Self-Awareness", char: "코어 모티베이터" },
  { ko: "공감 및 적극적 경청", en: "Empathy & Active Listening", char: "하트 핑퐁" },
];

const TASK_EXAMPLES = [
  { ko: "DRAM 설계 및 시뮬레이션", en: "DRAM design and simulation" },
  { ko: "낸드(NAND) 플래시 설계·개발", en: "NAND flash design and development" },
  { ko: "HBM·고대역폭 패키징 기술", en: "HBM and high-bandwidth packaging technology" },
  { ko: "반도체 장비 구매·조달", en: "Semiconductor equipment procurement and sourcing" },
  { ko: "수율 예측 시스템 구축", en: "Building yield prediction systems" },
  { ko: "웨이퍼 공정 조건 최적화", en: "Optimizing wafer process conditions" },
  { ko: "클린룸·FAB 생산 운영", en: "Cleanroom and fab production operations" },
  { ko: "메모리 신뢰성·품질 검증", en: "Memory reliability and quality verification" },
  { ko: "차세대 메모리 기술 연구", en: "Researching next-generation memory technologies" },
  { ko: "공정 장비 유지보수·교정", en: "Process equipment maintenance and calibration" },
  { ko: "반도체 제조 데이터 분석", en: "Analyzing semiconductor manufacturing data" },
  { ko: "원재료·부품 공급망 관리", en: "Managing materials and component supply chains" },
  { ko: "글로벌 고객 기술 지원", en: "Providing global customer technical support" },
  { ko: "스마트 팩토리·자동화 구축", en: "Implementing smart factory and automation solutions" },
];

const MOOD_KEYWORDS = [
  { ko: "속도", en: "Dynamic motion blur, pulsing light trails, high-speed evolution" },
  { ko: "조화", en: "Harmonious blend of human intuition and digital intelligence" },
  { ko: "미래지향적", en: "Hyper-tech Future Fab environment, neon accents" },
  { ko: "전문적인", en: "Cinematic lighting, sharp focus, professional corporate atmosphere" },
  { ko: "따뜻한", en: "Warm ambient glow, golden-hour lighting, nurturing and inviting aura" },
  { ko: "강렬한", en: "Bold dramatic contrast, vivid saturated colors, high-impact visual" },
  { ko: "혁신적인", en: "Glowing holographic overlays, floating AR/VR elements, cutting-edge tech" },
  { ko: "신비로운", en: "Ethereal mist, mystical aurora, otherworldly luminescence" },
  { ko: "자연친화적", en: "Bio-digital fusion, organic circuits intertwined with lush nature" },
  { ko: "에너지 넘치는", en: "Electric energy sparks, vibrant plasma effects, explosive particles" },
  { ko: "우주적인", en: "Deep space nebula, cosmic constellation patterns, interstellar backdrop" },
  { ko: "미니멀한", en: "Clean minimalist composition, soft gradients, elegant negative space" },
];

const IMAGE_TYPES = [
  { ko: "3D 캐릭터 (픽사 스타일)", en: "Pixar/Disney style 3D cute and expressive character", icon: "🧸" },
  { ko: "고품질 애니메이션", en: "High-end Studio Ghibli or Cyberpunk Anime style", icon: "🎨" },
  { ko: "실사 인물 사진", en: "Hyper-realistic 8k cinematic photography, professional portrait", icon: "📸" },
  { ko: "예술적 일러스트", en: "Abstract and artistic digital illustration, vibrant colors", icon: "🖌️" },
  {
    ko: "귀여운 동물·마스코트",
    en: "Adorable fluffy animal mascot character, kawaii illustration style, soft pastel palette, big expressive eyes, charming and friendly vibe",
    icon: "🐾",
  },
];

const AI_TOOLS = [
  { name: "ChatGPT", href: "https://chatgpt.com", desc: "이미지 생성 추천" },
  { name: "Gemini", href: "https://gemini.google.com", desc: "이미지 생성 추천" },
  { name: "Arena AI", href: "https://lmarena.ai", desc: "다양한 모델 비교" },
];

const hasKorean = (text) => /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text);

function StepBadge({ step, total }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-0.5 text-[11px] font-bold text-white tracking-wide shadow-sm">
      STEP {step}
      <span className="text-white/60">/ {total}</span>
    </span>
  );
}

function Chip({ selected, onClick, children, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-2xl px-3.5 py-2.5 text-left text-sm font-semibold transition-all duration-200 border-2 ${
        selected
          ? "bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-400 text-violet-900 shadow-[0_4px_16px_-6px_rgba(124,58,237,0.4)] scale-[1.02]"
          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
      }`}
    >
      <span className="block leading-snug">{children}</span>
      {sub && (
        <span className={`block text-xs mt-0.5 font-medium ${selected ? "text-violet-500" : "text-slate-400"}`}>
          {sub}
        </span>
      )}
      {selected && (
        <span className="absolute top-1.5 right-2 text-violet-500 text-xs">✓</span>
      )}
    </button>
  );
}

function MiniChip({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-[13px] font-semibold transition-all duration-200 border-2 ${
        selected
          ? "bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-400 text-violet-800 shadow-[0_3px_10px_-4px_rgba(124,58,237,0.35)] scale-[1.02]"
          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 active:scale-[0.97]"
      }`}
    >
      {selected && <span className="mr-1 text-violet-500">✓</span>}
      {children}
    </button>
  );
}

function ImageTypeCard({ item, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl p-4 text-left transition-all duration-200 border-2 ${
        selected
          ? "bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-400 shadow-[0_6px_20px_-8px_rgba(124,58,237,0.45)] scale-[1.01]"
          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.99]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
        <div className="min-w-0 flex-1">
          <p className={`font-bold text-sm ${selected ? "text-violet-900" : "text-slate-800"}`}>
            {item.ko}
          </p>
          <p className={`text-xs mt-0.5 leading-relaxed ${selected ? "text-violet-500" : "text-slate-400"}`}>
            {item.en}
          </p>
        </div>
        {selected && <span className="text-violet-500 text-sm font-bold shrink-0">✓</span>}
      </div>
    </button>
  );
}

export default function PromptSetPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const [selectedJob, setSelectedJob] = useState("");
  const [customJob, setCustomJob] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customStrength, setCustomStrength] = useState("");
  const [selectedTaskChips, setSelectedTaskChips] = useState([]);
  const [customTask, setCustomTask] = useState("");
  const [selectedMoods, setSelectedMoods] = useState([]);
  const [selectedImageType, setSelectedImageType] = useState("");
  const [promptExpanded, setPromptExpanded] = useState(true);

  const showToast = useCallback((message) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }, []);

  const toggleSkill = useCallback((skillKo) => {
    setSelectedSkills((prev) =>
      prev.includes(skillKo) ? prev.filter((s) => s !== skillKo) : [...prev, skillKo]
    );
  }, []);

  const toggleTaskChip = useCallback((taskKo) => {
    setSelectedTaskChips((prev) =>
      prev.includes(taskKo) ? prev.filter((s) => s !== taskKo) : [...prev, taskKo]
    );
  }, []);

  const toggleMood = useCallback((moodKo) => {
    setSelectedMoods((prev) =>
      prev.includes(moodKo) ? prev.filter((m) => m !== moodKo) : [...prev, moodKo]
    );
  }, []);

  const jobEn = useMemo(() => {
    if (selectedJob === JOB_OTHER) return customJob.trim();
    return JOB_ROLES.find((j) => j.ko === selectedJob)?.en ?? "";
  }, [selectedJob, customJob]);

  const skillsEn = useMemo(
    () => selectedSkills.map((ko) => CORE_SKILLS.find((s) => s.ko === ko)?.en).filter(Boolean),
    [selectedSkills]
  );

  const moodsEn = useMemo(
    () => selectedMoods.map((ko) => MOOD_KEYWORDS.find((m) => m.ko === ko)?.en).filter(Boolean),
    [selectedMoods]
  );

  const imageTypeEn = useMemo(
    () => IMAGE_TYPES.find((t) => t.ko === selectedImageType)?.en ?? "",
    [selectedImageType]
  );

  const taskEn = useMemo(() => {
    const fromChips = selectedTaskChips
      .map((ko) => TASK_EXAMPLES.find((t) => t.ko === ko)?.en)
      .filter(Boolean);
    const custom = customTask.trim();
    const parts = [...fromChips];
    if (custom) parts.push(custom);
    return parts.join("; ");
  }, [selectedTaskChips, customTask]);

  const strengthsText = useMemo(() => {
    const parts = [...skillsEn];
    if (customStrength.trim()) parts.push(customStrength.trim());
    return parts.join(", ");
  }, [skillsEn, customStrength]);

  const hasFreeKorean = useMemo(
    () =>
      hasKorean(customStrength) ||
      hasKorean(customTask) ||
      (selectedJob === JOB_OTHER && hasKorean(customJob)),
    [customStrength, customTask, selectedJob, customJob]
  );

  const generatedPrompt = useMemo(() => {
    const imgPart = imageTypeEn || "[이미지 유형을 선택하세요]";
    const jobPart = jobEn || "[직무를 선택하세요]";
    const strengthPart = strengthsText || "[핵심 스킬 또는 강점을 입력하세요]";
    const taskPart = taskEn || "[나의 업무를 입력하세요]";
    const moodPart = moodsEn.length > 0 ? moodsEn.join(". ") : "[분위기 키워드를 선택하세요]";

    let prompt = `${imgPart}, portraying a professional expert at SK Hynix. The character represents an 'AI Native' identity.\n\nPersonal Identity: A top-tier specialist in ${jobPart}.\n\nStrengths & Focus: Driven by core strengths such as '${strengthPart}', currently focusing on '${taskPart}'.\n\nAtmosphere & Style: ${moodPart}. 8k resolution, highly detailed, Unreal Engine 5 aesthetic.`;

    if (hasFreeKorean) {
      prompt += `\n\n(Note: Some parts of this prompt contain Korean text. Please interpret and translate them into natural English meaning for image generation.)`;
    }

    return prompt;
  }, [imageTypeEn, jobEn, strengthsText, taskEn, moodsEn, hasFreeKorean]);

  const isComplete = imageTypeEn && jobEn && strengthsText && taskEn && moodsEn.length > 0;

  const completedSteps = [
    selectedJob &&
      (selectedJob !== JOB_OTHER || customJob.trim()),
    selectedSkills.length > 0 || customStrength.trim(),
    taskEn,
    selectedMoods.length > 0,
    selectedImageType,
  ].filter(Boolean).length;

  const copyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      showToast("프롬프트가 클립보드에 복사되었습니다!");
    } catch {
      showToast("복사에 실패했습니다. 브라우저 권한을 확인해주세요.");
    }
  }, [generatedPrompt, showToast]);

  return (
    <div className="min-h-dvh bg-[#f0f2f6] text-slate-950 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto w-full max-w-md px-4 pt-4 pb-10 flex flex-col gap-5">

        {/* ── Header ── */}
        <header className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="shrink-0 w-11 h-11 rounded-2xl bg-white border border-black/10 text-slate-700 font-bold text-sm shadow-sm flex items-center justify-center"
            aria-label="이전 화면"
          >
            ←
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-violet-600 tracking-wide">
              The Tempo · AI Native Canvas
            </p>
            <h1 className="text-lg font-extrabold leading-tight tracking-tight">
              AI Native 이미지 프롬프트 빌더
            </h1>
          </div>
        </header>

        {/* ── Intro Card ── */}
        <section className="rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 p-5 shadow-[0_16px_48px_-16px_rgba(124,58,237,0.5)] text-white">
          <h2 className="text-base font-extrabold mb-1.5">나만의 AI Native 페르소나 이미지 만들기</h2>
          <p className="text-sm text-white/85 leading-relaxed">
            아래 항목을 선택하면 영문 프롬프트가 자동으로 생성됩니다.
            완성된 프롬프트를 복사해 AI 도구에 붙여넣으세요!
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/90 transition-all duration-500"
                style={{ width: `${(completedSteps / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-white/70">{completedSteps}/5</span>
          </div>
        </section>

        {/* ── STEP 1: 직무 선택 ── */}
        <section className="rounded-3xl bg-white p-5 shadow-sm border border-black/5">
          <div className="flex items-center gap-2 mb-3">
            <StepBadge step={1} total={5} />
            <h2 className="text-base font-extrabold text-slate-900">직무 선택</h2>
          </div>
          <p className="text-sm text-slate-500 mb-3">회사 내 나의 직무를 선택해주세요</p>
          <select
            value={selectedJob}
            onChange={(e) => {
              const v = e.target.value;
              setSelectedJob(v);
              if (v !== JOB_OTHER) setCustomJob("");
            }}
            className={`w-full rounded-2xl border-2 px-4 py-3.5 text-sm font-semibold transition-colors appearance-none bg-no-repeat bg-[length:16px] bg-[center_right_14px] ${
              selectedJob
                ? "border-violet-400 bg-violet-50/50 text-violet-900"
                : "border-slate-200 bg-[#f6f7f9] text-slate-500"
            }`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E")`,
            }}
          >
            <option value="">직무를 선택하세요</option>
            {JOB_ROLES.map((j) => (
              <option key={j.ko} value={j.ko}>{j.ko}</option>
            ))}
            <option value={JOB_OTHER}>{JOB_OTHER}</option>
          </select>
          {selectedJob === JOB_OTHER && (
            <div className="mt-3">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                직무 직접 입력
              </label>
              <input
                type="text"
                value={customJob}
                onChange={(e) => setCustomJob(e.target.value)}
                placeholder="예: 반도체 장비 엔지니어링, 글로벌 SCM"
                className="w-full rounded-2xl border-2 border-slate-200 bg-[#f6f7f9] px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:bg-violet-50/30 transition-colors"
              />
              {customJob.trim() && hasKorean(customJob) && (
                <p className="mt-1.5 text-xs text-amber-600 font-medium">
                  한국어가 감지되었습니다. 프롬프트에 AI 자동 번역 지시가 추가됩니다.
                </p>
              )}
            </div>
          )}
          {selectedJob && selectedJob !== JOB_OTHER && (
            <p className="mt-2 text-xs text-violet-500 font-medium">→ {jobEn}</p>
          )}
          {selectedJob === JOB_OTHER && customJob.trim() && (
            <p className="mt-2 text-xs text-violet-500 font-medium break-words">→ {jobEn}</p>
          )}
        </section>

        {/* ── STEP 2: 핵심 스킬 & 강점 ── */}
        <section className="rounded-3xl bg-white p-5 shadow-sm border border-black/5">
          <div className="flex items-center gap-2 mb-1">
            <StepBadge step={2} total={5} />
            <h2 className="text-base font-extrabold text-slate-900">핵심 스킬 & 강점 (복수 선택 가능)</h2>
          </div>

          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">캐릭터 연동 스킬</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {CORE_SKILLS.map((s) => (
              <Chip
                key={s.ko}
                selected={selectedSkills.includes(s.ko)}
                onClick={() => toggleSkill(s.ko)}
                sub={s.char}
              >
                {s.ko}
              </Chip>
            ))}
          </div>

          {selectedSkills.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-violet-50/60 border border-violet-100">
              <p className="text-xs text-violet-600 leading-relaxed">
                → {skillsEn.join(", ")}
              </p>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              위에 없는 강점 직접 입력 <span className="font-medium text-slate-400">(선택)</span>
            </label>
            <input
              type="text"
              value={customStrength}
              onChange={(e) => setCustomStrength(e.target.value)}
              placeholder="예: Global mindset, Networking"
              className="w-full rounded-2xl border-2 border-slate-200 bg-[#f6f7f9] px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:bg-violet-50/30 transition-colors"
            />
            {customStrength.trim() && hasKorean(customStrength) && (
              <p className="mt-1.5 text-xs text-amber-600 font-medium">
                한국어가 감지되었습니다. 프롬프트에 AI 자동 번역 지시가 추가됩니다.
              </p>
            )}
          </div>
        </section>

        {/* ── STEP 3: 나의 업무 ── */}
        <section className="rounded-3xl bg-white p-5 shadow-sm border border-black/5">
          <div className="flex items-center gap-2 mb-1">
            <StepBadge step={3} total={5} />
            <h2 className="text-base font-extrabold text-slate-900">나의 업무 (복수 선택 가능)</h2>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4 mt-3">
            {TASK_EXAMPLES.map((t) => (
              <MiniChip
                key={t.ko}
                selected={selectedTaskChips.includes(t.ko)}
                onClick={() => toggleTaskChip(t.ko)}
              >
                {t.ko}
              </MiniChip>
            ))}
          </div>

          {(selectedTaskChips.length > 0 || customTask.trim()) && taskEn && (
            <div className="mb-4 p-3 rounded-xl bg-violet-50/60 border border-violet-100">
              <p className="text-xs text-violet-600 leading-relaxed break-words">
                → {taskEn}
              </p>
            </div>
          )}

          <div className="border-t border-slate-100 pt-4">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              또는 직접 입력 <span className="font-medium text-slate-400">(칩과 함께 사용 가능)</span>
            </label>
            <input
              type="text"
              value={customTask}
              onChange={(e) => setCustomTask(e.target.value)}
              placeholder="예: Developing HBM4 advanced packaging solutions"
              className="w-full rounded-2xl border-2 border-slate-200 bg-[#f6f7f9] px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-violet-400 focus:bg-violet-50/30 transition-colors"
            />
            {customTask.trim() && hasKorean(customTask) && (
              <p className="mt-1.5 text-xs text-amber-600 font-medium">
                한국어가 감지되었습니다. 프롬프트에 AI 자동 번역 지시가 추가됩니다.
              </p>
            )}
          </div>
        </section>

        {/* ── STEP 4: 분위기 키워드 ── */}
        <section className="rounded-3xl bg-white p-5 shadow-sm border border-black/5">
          <div className="flex items-center gap-2 mb-1">
            <StepBadge step={4} total={5} />
            <h2 className="text-base font-extrabold text-slate-900">분위기 키워드</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            이미지 분위기를 결정하는 키워드를 선택하세요 (다중 선택 가능)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {MOOD_KEYWORDS.map((m) => (
              <button
                key={m.ko}
                type="button"
                onClick={() => toggleMood(m.ko)}
                className={`rounded-2xl px-3 py-2.5 text-sm font-bold transition-all duration-200 border-2 text-center ${
                  selectedMoods.includes(m.ko)
                    ? "bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-400 text-violet-800 shadow-[0_4px_12px_-4px_rgba(124,58,237,0.35)] scale-[1.03]"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 active:scale-[0.97]"
                }`}
              >
                {m.ko}
              </button>
            ))}
          </div>
          {selectedMoods.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-violet-50/60 border border-violet-100">
              <p className="text-xs text-violet-600 leading-relaxed">
                {moodsEn.join(". ")}
              </p>
            </div>
          )}
        </section>

        {/* ── STEP 5: 이미지 유형 ── */}
        <section className="rounded-3xl bg-white p-5 shadow-sm border border-black/5">
          <div className="flex items-center gap-2 mb-1">
            <StepBadge step={5} total={5} />
            <h2 className="text-base font-extrabold text-slate-900">이미지 유형</h2>
          </div>
          <div className="flex flex-col gap-2 mt-3">
            {IMAGE_TYPES.map((t) => (
              <ImageTypeCard
                key={t.ko}
                item={t}
                selected={selectedImageType === t.ko}
                onClick={() => setSelectedImageType(t.ko)}
              />
            ))}
          </div>
        </section>

        {/* ── Generated Prompt ── */}
        <section className="rounded-3xl overflow-hidden shadow-[0_16px_48px_-24px_rgba(124,58,237,0.4)] border border-violet-200/70 bg-white">
          <button
            type="button"
            onClick={() => setPromptExpanded((p) => !p)}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-4 flex items-center justify-between text-white"
          >
            <div>
              <h2 className="text-base font-extrabold text-left">생성된 영문 프롬프트</h2>
              <p className="text-xs text-white/70 mt-0.5 text-left">
                {isComplete ? "모든 항목이 입력되었습니다!" : "항목을 선택하면 실시간으로 반영됩니다"}
              </p>
            </div>
            <span className={`text-xl transition-transform duration-300 ${promptExpanded ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>

          {promptExpanded && (
            <div className="p-5 flex flex-col gap-4">
              {hasFreeKorean && (
                <div className="rounded-2xl bg-amber-50 border border-amber-200/90 px-3 py-2.5 text-[13px] text-amber-800 leading-relaxed">
                  한국어 자유 입력이 감지되어, AI가 자동으로 영어로 해석하도록 지시문이 추가되었습니다.
                </div>
              )}
              <div className="rounded-2xl bg-slate-50 border border-slate-200/80 max-h-[min(50vh,360px)] overflow-y-auto overscroll-contain p-4">
                <pre className="whitespace-pre-wrap break-words font-sans text-[12px] sm:text-[13px] text-slate-700 leading-relaxed">
                  {generatedPrompt}
                </pre>
              </div>

              <button
                type="button"
                onClick={copyPrompt}
                className={`w-full min-h-[52px] rounded-2xl font-extrabold text-base shadow-lg border transition-all active:scale-[0.99] ${
                  isComplete
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-violet-400/40 shadow-[0_10px_24px_-12px_rgba(124,58,237,0.7)]"
                    : "bg-gradient-to-r from-violet-500/80 to-fuchsia-500/80 text-white/90 border-violet-300/40 shadow-[0_10px_24px_-12px_rgba(124,58,237,0.4)]"
                }`}
              >
                프롬프트 복사하기
              </button>
            </div>
          )}
        </section>

        {/* ── AI 도구 바로가기 ── */}
        <section className="rounded-3xl bg-white p-5 shadow-sm border border-black/5">
          <h2 className="text-base font-extrabold text-slate-900 mb-1">
            AI 도구에 붙여넣기
          </h2>
          <p className="text-sm text-slate-500 mb-3">
            프롬프트를 복사한 후, 아래 도구에서 새 채팅을 열어 붙여넣으세요
          </p>
          <div className="flex flex-col gap-2">
            {AI_TOOLS.map((t) => (
              <a
                key={t.name}
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl bg-[#f6f7f9] border border-black/8 px-4 py-3.5 min-h-[48px] active:bg-slate-100"
              >
                <div>
                  <span className="font-bold text-slate-900">{t.name}</span>
                  <span className="ml-2 text-xs text-slate-400">{t.desc}</span>
                </div>
                <span className="text-xs text-slate-500 shrink-0">새 채팅 →</span>
              </a>
            ))}
          </div>
        </section>

        {/* ── 주의사항 ── */}
        <section className="rounded-3xl bg-slate-900 text-slate-100 p-5 shadow-inner border border-slate-700/50">
          <h2 className="text-base font-extrabold mb-3 text-white">주의사항</h2>
          <ul className="space-y-2.5 text-[14px] leading-relaxed text-slate-300">
            <li className="flex gap-2">
              <span className="text-violet-400 shrink-0">✓</span>
              이미지가 바로 안 나오면 &apos;이미지 생성&apos; 버튼을 누르거나 새 채팅에서 다시 붙여넣어 보세요.
            </li>
            <li className="flex gap-2">
              <span className="text-violet-400 shrink-0">✓</span>
              개인정보나 회사 기밀정보는 입력하지 마세요.
            </li>
            <li className="flex gap-2">
              <span className="text-violet-400 shrink-0">✓</span>
              결과가 마음에 들지 않으면 키워드를 바꿔 다시 시도해보세요!
            </li>
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
