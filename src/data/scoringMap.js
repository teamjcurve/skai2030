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

export function calculateResult(memberScore) {
  const entries = Object.entries(memberScore || {});
  const normalized = SKILL_CODES.map((code) => [
    code,
    Number(memberScore?.[code] ?? 0),
  ]);

  const sorted = normalized
    .slice()
    .sort((a, b) => b[1] - a[1] || SKILL_CODES.indexOf(a[0]) - SKILL_CODES.indexOf(b[0]));

  const top = sorted[0]?.[0] ?? SKILL_CODES[0];
  const topScore = sorted[0]?.[1] ?? 0;

  return {
    memberResult: top,
    topSkillCode: top,
    topSkillScore: topScore,
    scores: Object.fromEntries(normalized),
    ranking: sorted.map(([code, score]) => ({ code, score })),
    _rawEntries: entries,
  };
}
