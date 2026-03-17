import { useState, useEffect } from "react";
import Main from "./components/Main";
import Intro from "./components/Intro";
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
  Task_Change: "비전",
  People_Change: "퍼실리테이터",
  Task_Stability: "퍼포먼스",
  People_Stability: "가디언",
};

export default function App() {
  const [screen, setScreen] = useState("main");
  const [userType, setUserType] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [draftChoice, setDraftChoice] = useState(null);
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
    if (typeof window === "undefined") return;
    if (screen === "intro") {
      window.scrollTo(0, 0);
    }
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
    setDraftChoice(null);
    setMemberScore({ ...INITIAL_MEMBER_SCORE });
    setLeaderScore({ ...INITIAL_LEADER_SCORE });
    setResultType(null);
    setScreen("intro");
  };

  const handleProceedIntro = () => {
    setDraftChoice(null);
    setScreen("question");
  };

  function applyOptionDelta({ member, leader }, option, delta) {
    const nextMember = { ...member };
    const nextLeader = { ...leader };

    if (option?.axis) nextMember[option.axis] += delta;
    if (option?.axisLeader) {
      for (const axis of option.axisLeader) {
        nextLeader[axis] += delta;
      }
    }

    return { member: nextMember, leader: nextLeader };
  }

  const handleNext = () => {
    if (!draftChoice) return;

    const currentQuestion = questions[currentQuestionIndex];
    const nextOption =
      draftChoice === "A" ? currentQuestion.optionA : currentQuestion.optionB;

    const prevAnswer = answers[currentQuestionIndex];
    const prevChoice =
      prevAnswer?.questionId === currentQuestion.id ? prevAnswer.choice : null;
    const prevOption =
      prevChoice === "A"
        ? currentQuestion.optionA
        : prevChoice === "B"
          ? currentQuestion.optionB
          : null;

    let scores = { member: memberScore, leader: leaderScore };
    if (prevOption && prevChoice !== draftChoice) {
      scores = applyOptionDelta(scores, prevOption, -1);
    }
    if (!prevOption || prevChoice !== draftChoice) {
      scores = applyOptionDelta(scores, nextOption, +1);
    }

    const nextAnswers = [...answers];
    nextAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      choice: draftChoice,
    };

    setAnswers(nextAnswers);
    setMemberScore(scores.member);
    setLeaderScore(scores.leader);

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQ = questions[nextIndex];
      const existing = nextAnswers[nextIndex];
      setDraftChoice(existing?.questionId === nextQ.id ? existing.choice : null);
    } else {
      const result = calculateResult(scores.member, scores.leader, userType);
      setResultType(result);
      setDraftChoice(null);
      setScreen("loading");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex <= 0) {
      setDraftChoice(null);
      setScreen("intro");
      return;
    }
    const nextIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(nextIndex);
    const prevQ = questions[nextIndex];
    const existing = answers[nextIndex];
    setDraftChoice(existing?.questionId === prevQ.id ? existing.choice : null);
  };

  const handleRestart = () => {
    setScreen("main");
    setUserType(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setDraftChoice(null);
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
    case "intro":
      return <Intro onProceed={handleProceedIntro} />;
    case "question":
      return (
        <Question
          questions={questions}
          currentIndex={currentQuestionIndex}
          selectedChoice={draftChoice}
          onChoose={setDraftChoice}
          onNext={handleNext}
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
