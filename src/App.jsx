import { useState, useEffect } from "react";
import Main from "./components/Main";
import Question from "./components/Question";
import Loading from "./components/Loading";
import Result from "./components/Result";
import { questions as allQuestions } from "./data/questions";
import {
  INITIAL_MEMBER_SCORE,
  INITIAL_LEADER_SCORE,
  calculateResult,
} from "./data/scoringMap";
import { supabase } from "./supabaseClient";

const MEMBER_COUNT = 15;
const LEADER_COUNT = 20;

const LEADER_BADGE_LABELS = {
  Task_Innovation: "비전",
  People_Innovation: "이노베이션",
  People_Stability: "코칭",
  Task_Stability: "실행력",
};

export default function App() {
  const [screen, setScreen] = useState("main");
  const [userType, setUserType] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [memberScore, setMemberScore] = useState({ ...INITIAL_MEMBER_SCORE });
  const [leaderScore, setLeaderScore] = useState({ ...INITIAL_LEADER_SCORE });
  const [resultType, setResultType] = useState(null);

  const [sessionId, setSessionId] = useState(() => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem("session_id");
  });
  const [sessionCode, setSessionCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem("session_code") || "";
  });
  const [isSessionValid, setIsSessionValid] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.sessionStorage.getItem("session_id"));
  });
  const [isValidatingSession, setIsValidatingSession] = useState(false);
  const [sessionError, setSessionError] = useState("");

  const questions = userType === "leader"
    ? allQuestions.slice(0, LEADER_COUNT)
    : allQuestions.slice(0, MEMBER_COUNT);

  useEffect(() => {
    if (screen !== "loading") return;
    const timer = setTimeout(() => setScreen("result"), 3000);
    return () => clearTimeout(timer);
  }, [screen]);

  useEffect(() => {
    if (!supabase || !resultType || !sessionId || !userType) return;

    const saveResult = async () => {
      try {
        const payload = {
          session_id: sessionId,
          user_type: userType,
          result_code: resultType.memberResult,
          leader_badge:
            userType === "leader" && resultType.leaderResult
              ? LEADER_BADGE_LABELS[resultType.leaderResult] ?? null
              : null,
        };

        const { error } = await supabase.from("results").insert(payload);
        if (error) {
          // eslint-disable-next-line no-console
          console.error("[Supabase] 결과 저장 실패:", error.message);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[Supabase] 결과 저장 중 예기치 못한 오류:", err);
      }
    };

    saveResult();
  }, [resultType, sessionId, userType]);

  const handleValidateSession = async () => {
    if (!supabase) {
      setSessionError(
        "Supabase 설정을 찾을 수 없습니다. VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 확인해 주세요.",
      );
      setIsSessionValid(false);
      return;
    }

    const trimmed = sessionCode.trim();
    if (!trimmed) {
      setSessionError("차수 코드를 입력해 주세요.");
      setIsSessionValid(false);
      return;
    }

    setIsValidatingSession(true);
    setSessionError("");

    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("id, session_code")
        .eq("session_code", trimmed)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setIsSessionValid(false);
        setSessionId(null);
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("session_id");
          window.sessionStorage.removeItem("session_code");
        }
        setSessionError("해당 차수 코드를 찾을 수 없습니다.");
        return;
      }

      setSessionId(data.id);
      setIsSessionValid(true);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("session_id", data.id);
        window.sessionStorage.setItem("session_code", data.session_code);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[Supabase] 세션 코드 조회 실패:", err);
      setIsSessionValid(false);
      setSessionError("차수 코드 확인 중 오류가 발생했습니다.");
    } finally {
      setIsValidatingSession(false);
    }
  };

  const handleStart = () => {
    if (!userType) return;
    if (!isSessionValid || !sessionId) {
      setSessionError(
        "게임을 시작하기 전에 유효한 차수 코드를 먼저 확인해 주세요.",
      );
      return;
    }
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setMemberScore({ ...INITIAL_MEMBER_SCORE });
    setLeaderScore({ ...INITIAL_LEADER_SCORE });
    setResultType(null);
    setScreen("question");
  };

  const handleAnswer = (choice) => {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOption = choice === "A" ? currentQuestion.optionA : currentQuestion.optionB;

    const newAnswers = [...answers, { questionId: currentQuestion.id, choice }];
    setAnswers(newAnswers);

    const newMemberScore = { ...memberScore };
    const newLeaderScore = { ...leaderScore };

    if (selectedOption.axis) {
      newMemberScore[selectedOption.axis] += 1;
    }

    if (selectedOption.axisLeader) {
      for (const axis of selectedOption.axisLeader) {
        newLeaderScore[axis] += 1;
      }
    }

    setMemberScore(newMemberScore);
    setLeaderScore(newLeaderScore);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const result = calculateResult(newMemberScore, newLeaderScore, userType);
      setResultType(result);
      setScreen("loading");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex <= 0) return;

    const lastAnswer = answers[answers.length - 1];
    const lastQuestion = questions.find((q) => q.id === lastAnswer.questionId);
    const selectedOption =
      lastAnswer.choice === "A" ? lastQuestion.optionA : lastQuestion.optionB;

    const newMemberScore = { ...memberScore };
    const newLeaderScore = { ...leaderScore };

    if (selectedOption.axis) {
      newMemberScore[selectedOption.axis] -= 1;
    }
    if (selectedOption.axisLeader) {
      for (const axis of selectedOption.axisLeader) {
        newLeaderScore[axis] -= 1;
      }
    }

    setMemberScore(newMemberScore);
    setLeaderScore(newLeaderScore);
    setAnswers(answers.slice(0, -1));
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleRestart = () => {
    setScreen("main");
    setUserType(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setMemberScore({ ...INITIAL_MEMBER_SCORE });
    setLeaderScore({ ...INITIAL_LEADER_SCORE });
    setResultType(null);
  };

  switch (screen) {
    case "main":
      return (
        <Main
          userType={userType}
          setUserType={setUserType}
          sessionCode={sessionCode}
          setSessionCode={setSessionCode}
          onValidateSession={handleValidateSession}
          isSessionValid={isSessionValid}
          isValidatingSession={isValidatingSession}
          sessionError={sessionError}
          onStart={handleStart}
        />
      );
    case "question":
      return (
        <Question
          questions={questions}
          currentIndex={currentQuestionIndex}
          onSelect={handleAnswer}
          onPrevious={handlePrevious}
        />
      );
    case "loading":
      return <Loading />;
    case "result":
      return (
        <Result
          resultType={resultType}
          userType={userType}
          memberScore={memberScore}
          onRestart={handleRestart}
        />
      );
    default:
      return null;
  }
}
