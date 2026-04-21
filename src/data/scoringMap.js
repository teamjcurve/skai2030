export const SKILL_CODES = [
  "resilience_agility",
  "ai_bigdata",
  "analytical_thinking",
  "creative_thinking",
  "tech_literacy",
  "leadership_influence",
  "curiosity_lifelong_learning",
  "systems_thinking",
  "talent_development",
  "motivation_self_awareness",
  "empathy_active_listening",
];

export const INITIAL_MEMBER_SCORE = Object.fromEntries(
  SKILL_CODES.map((code) => [code, 0]),
);

function pickRandomTopSkill(candidates) {
  if (!candidates || candidates.length === 0) return SKILL_CODES[0];
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}

export function calculateResult(memberScore, options = {}) {
  const { tieResolution = "random" } = options;
  const entries = Object.entries(memberScore || {});

  const normalized = SKILL_CODES.map((code) => [
    code,
    Number(memberScore?.[code] ?? 0),
  ]);

  const sorted = normalized.slice().sort((a, b) => b[1] - a[1]);

  const topScore = sorted[0]?.[1] ?? 0;
  const topSkillCandidates = sorted
    .filter(([, score]) => score === topScore)
    .map(([code]) => code);

  const isTied = topSkillCandidates.length > 1;

  let top;
  if (!isTied) {
    top = topSkillCandidates[0];
  } else if (tieResolution === "random") {
    top = pickRandomTopSkill(topSkillCandidates);
  } else {
    top = topSkillCandidates[0];
  }

  return {
    memberResult: top,
    topSkillCode: top,
    topSkillScore: topScore,
    topSkillCandidates,
    isTied,
    scores: Object.fromEntries(normalized),
    ranking: sorted.map(([code, score]) => ({ code, score })),
    _rawEntries: entries,
  };
}

export function applyTiebreakerPick(memberScore, skillCode) {
  if (!skillCode) return memberScore;
  const next = { ...memberScore };
  next[skillCode] = (next[skillCode] ?? 0) + 1;
  return next;
}
