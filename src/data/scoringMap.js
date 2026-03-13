export const INITIAL_MEMBER_SCORE = { T: 0, P: 0, B: 0, S: 0, Mi: 0, Ma: 0 };
export const INITIAL_LEADER_SCORE = { Task: 0, People: 0, Innovation: 0, Stability: 0 };

export function calculateResult(memberScore, leaderScore, userType) {
  const axis1 = memberScore.T >= memberScore.P ? "T" : "P";
  const axis2 = memberScore.B >= memberScore.S ? "B" : "S";
  const axis3 = memberScore.Mi >= memberScore.Ma ? "Mi" : "Ma";

  const memberResult = axis1 + axis2 + axis3;

  let leaderResult = null;
  if (userType === "leader") {
    const lAxis1 = leaderScore.Task >= leaderScore.People ? "Task" : "People";
    const lAxis2 = leaderScore.Innovation >= leaderScore.Stability ? "Innovation" : "Stability";
    leaderResult = `${lAxis1}_${lAxis2}`;
  }

  return { memberResult, leaderResult };
}
