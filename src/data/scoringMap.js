export const INITIAL_MEMBER_SCORE = { T: 0, W: 0, M: 0, R: 0, A: 0, S: 0 };
export const INITIAL_LEADER_SCORE = { Task: 0, People: 0, Change: 0, Stability: 0 };

export function calculateResult(memberScore, leaderScore, userType) {
  const axis1 = memberScore.T >= memberScore.W ? "T" : "W";
  const axis2 = memberScore.M >= memberScore.R ? "M" : "R";
  const axis3 = memberScore.A >= memberScore.S ? "A" : "S";

  const memberResult = axis1 + axis2 + axis3;

  let leaderResult = null;
  if (userType === "leader") {
    const lAxis1 = leaderScore.Task >= leaderScore.People ? "Task" : "People";
    const lAxis2 = leaderScore.Change >= leaderScore.Stability ? "Change" : "Stability";
    leaderResult = `${lAxis1}_${lAxis2}`;
  }

  return { memberResult, leaderResult };
}
