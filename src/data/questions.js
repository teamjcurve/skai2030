export const questions = [
  // --- [구성원 22문항 / 11스킬 연결] ---
  {
    id: 1,
    text: "오늘 아침 출근을 하며, 나는?",
    optionA: {
      text: "“지금 내 삶의 밸런스가 참 좋다. 오늘 하루도 이 페이스를 잘 유지해야지!”",
      skill: "motivation_self_awareness",
    },
    optionB: {
      text: "“슬슬 새로운 프로젝트나 스터디로 신선한 자극을 얻어볼까?”",
      skill: "curiosity_lifelong_learning",
    },
  },
  {
    id: 2,
    text: "본격적인 일과 시간, 자리에 앉자마자 시작된 데이터 취합 업무. 나의 업무 스타일은?",
    optionA: {
      text: "“이 프로세스를 더 단축할 수 있는 단축키나 AI는 없을까? 더 효율적인 방법을 한번 찾아보자.”",
      skill: "tech_literacy",
    },
    optionB: {
      text: "“데이터 정리는 정확성이 생명이지!” 나에게 익숙한 방식으로 꼼꼼하고 완성도 높게 처리한다.",
      skill: "analytical_thinking",
    },
  },
  {
    id: 3,
    text: "사내에 새롭게 도입된 스마트 업무 시스템에 처음 접속했다.",
    optionA: { text: "“백문이 불여일견!” 직접 메뉴들을 클릭해 보며 기능을 파악한다.", skill: "tech_literacy" },
    optionB: { text: "“가이드부터 보는 게 효율적이지!” 공지된 가이드나 튜토리얼을 꼼꼼히 읽어 전체 구조부터 이해한다.", skill: "systems_thinking" },
  },
  {
    id: 4,
    text: "우리 팀의 업무 프로세스에서 개선하면 좋을 사소한 포인트를 발견했다.",
    optionA: { text: "현재 진행 중인 나의 메인 업무와 당면한 목표에 우선 집중한다.", skill: "motivation_self_awareness" },
    optionB: { text: "이 부분이 타 부서와의 협업에도 영향을 줄 수 있으니, 전체 흐름을 고려해 개선안을 메모해 둔다.", skill: "systems_thinking" },
  },
  {
    id: 5,
    text: "방대한 분량의 영문 리포트에서 필요한 핵심만 신속하게 추출해야 한다면?",
    optionA: { text: "“AI의 힘을 빌리자!” LLM에 리포트를 업로드하고 프롬프트를 입력해 핵심을 빠르게 추출한다.", skill: "ai_bigdata" },
    optionB: { text: "“맥락을 아는 내가 하는 게 더 퀄리티가 높지!” 목차를 훑으며 필요한 부분만 상세 확인하여 효율적으로 직접 핵심을 뽑아낸다.", skill: "analytical_thinking" },
  },
  {
    id: 6,
    text: "갑작스러운 메신저 알림음! 예정된 회의가 앞당겨져 일찍 시작된다고 한다.",
    optionA: { text: "“오케이, 문제없지!” 상황에 맞춰 빠르게 텐션을 올리고 회의실로 향한다.", skill: "resilience_agility" },
    optionB: { text: "“논의할 핵심이 뭐였지?” 이동하는 동안 아젠다와 논의 포인트를 머릿속으로 구조화해 되새긴다.", skill: "analytical_thinking" },
  },
  {
    id: 7,
    text: "회의 중 타 부서 구성원이 나의 제안과 결이 다른 새로운 접근법을 제시했다.",
    optionA: { text: "“저 팀의 입장에서는 저렇게 볼 수도 있겠다.” 우선 상대방의 의견을 열린 마음으로 전부 경청한다.", skill: "empathy_active_listening" },
    optionB: { text: "“저 제안을 뒷받침하는 데이터는 무엇일까?” 듣는 동안 머릿속으로 상대방 논리의 구조와 타당성을 분석해 본다.", skill: "analytical_thinking" },
  },
  {
    id: 8,
    text: "다양한 의견이 오가며 논의가 길어지던 중, 잠시 정적이 흐를 때 나는?",
    optionA: { text: "“그럼 우리 이 아이디어부터 가볍게 실행해 보는 건 어떨까요?” 분위기를 환기시키며 먼저 나선다.", skill: "leadership_influence" },
    optionB: { text: "“지금까지 나온 팩트와 데이터를 정리해 보면 이 방향이 합리적이네요.” 참석자들을 위해 최대한 객관적으로 기준을 잡아본다.", skill: "analytical_thinking" },
  },
  {
    id: 9,
    text: "점심시간, 팀 단톡방에 '요즘 핫한 AI 툴 업무 적용 사례'가 공유되었다.",
    optionA: { text: "“오, 흥미롭네!” 식사를 마치고 바로 내 폰이나 PC에서 가볍게 테스트해 본다.", skill: "tech_literacy" },
    optionB: { text: "“우리 팀 업무의 어떤 프로세스에 이걸 접목할 수 있을까?” 우선 머릿속으로 팀 전체에 발생할 파급 효과를 시뮬레이션해 본다.", skill: "systems_thinking" },
  },
  {
    id: 10,
    text: "티타임 중, 동료가 최근 맡은 프로젝트의 어려움과 고민을 조심스레 나눈다.",
    optionA: { text: "“그런 고충이 있었군요. 정말 고생이 많아요!” 진심 어린 공감과 격려로 마음을 든든하게 해준다.", skill: "empathy_active_listening" },
    optionB: { text: "“이런 방식은 어때요?” 나의 경험과 노하우를 바탕으로 도움이 될만한 조언을 아낌없이 나눈다.", skill: "talent_development" },
  },
  {
    id: 11,
    text: "리프레시 겸 들어간 SKHU에서, 업무와 관련된 최신 트렌드 영상이 추천에 떴다.",
    optionA: { text: "“이게 요즘 화제구나!” 새로운 지식에 대한 호기심으로 가볍게 영상을 시청해 본다.", skill: "curiosity_lifelong_learning" },
    optionB: { text: "“좋은 자료네!” 일단 북마크에 저장 후 지금 집중하고 있는 메인 업무로 돌아온다.", skill: "motivation_self_awareness" },
  },
  {
    id: 12,
    text: "오후 근무, 집중의 시간. 전사 공지사항이 떴다. 회사의 미래를 준비하는 '신기술 도입 혁신 TF' 인원을 모집한다고 한다.",
    optionA: { text: "“성장의 기회다!” 새로운 도전으로 나만의 특별한 커리어를 만들 생각에 기대감이 든다.", skill: "motivation_self_awareness" },
    optionB: { text: "“합류한다면 어떤 역량이 필요할까?” TF의 목표 달성에 필요한 기술적 요구사항과 나의 강점을 매칭해 본다.", skill: "analytical_thinking" },
  },
  {
    id: 13,
    text: "전사적으로 더 스마트한 협업을 위한 새로운 디지털 툴이 도입되었다.",
    optionA: { text: "설치하자마자 유용한 숨겨진 기능이나 단축키를 찾아내는 데서 즐거움을 느낀다.", skill: "tech_literacy" },
    optionB: { text: "현재 나의 안정적인 업무 리듬을 유지하면서, 새 시스템에 점진적으로 익숙해지는 방식을 택한다.", skill: "resilience_agility" },
  },
  {
    id: 14,
    text: "중요한 팀 프로젝트 킥오프! 역할 조율 시 내가 더 강점을 발휘하는 부분은?",
    optionA: { text: "동료들의 강점과 업무 성향을 고려해 가장 시너지가 날 수 있도록 역할을 제안하기.", skill: "talent_development" },
    optionB: { text: "프로젝트가 원활히 흘러가도록 전체 일정을 기획하고 협업 툴로 진척도를 체크하기.", skill: "systems_thinking" },
  },
  {
    id: 15,
    text: "집중 근무 시간, 동료가 특정 업무 구간에서 진도가 나가지 않아 고민하는 모습이 보인다.",
    optionA: { text: "“이 부분은 이렇게 풀면 훨씬 수월해요!” 핵심 노하우를 명쾌하게 공유해 동료의 업무 진행 속도를 높여준다.", skill: "talent_development" },
    optionB: { text: "“어떤 방향으로 접근해 보고 있어요?” 스스로 인사이트를 얻을 수 있도록 좋은 질문을 던져준다.", skill: "leadership_influence" },
  },
  {
    id: 16,
    text: "유관 부서에서 업무에 참고하기 좋은 인사이트라며 새로운 통계 리포트를 공유해 주었다.",
    optionA: { text: "“이런 트렌드도 있구나!” 흥미로운 최신 정보 자체에 반가움을 느끼고 빠르게 훑은 다음 북마크해 둔다.", skill: "ai_bigdata" },
    optionB: { text: "“이 데이터의 도출 기준은 뭘까?” 신뢰성 있는 정보인지 객관적 조건과 맥락을 먼저 확인한다.", skill: "analytical_thinking" },
  },
  {
    id: 17,
    text: "돌발 상황 발생! 중요한 자료 제출을 앞두고, 잘 작동하던 소프트웨어에 일시적인 오류가 발생했다.",
    optionA: { text: "“일단 침착하자.” 상황을 유연하게 받아들이고 담당 부서(IT)에 명확하게 상황을 설명하며 도움을 청한다.", skill: "resilience_agility" },
    optionB: { text: "“어떤 설정 문제일까?” 스스로 해결 방법을 빠르게 검색해 보며 트러블슈팅을 시도한다.", skill: "tech_literacy" },
  },
  {
    id: 18,
    text: "심혈을 기울인 기획안에 대해 “방향성을 조금 더 트렌디하게 다듬어보자”는 피드백을 받았다.",
    optionA: { text: "“방향성 캐치 완료!” 기존의 탄탄한 뼈대는 살리고, 내가 생각하는 트렌디 요소를 즉각 반영해 빠르게 ‘버전 2.0’을 만들어낸다.", skill: "creative_thinking" },
    optionB: { text: "“트렌디함이라…” 뻔한 수정보다는 새로운 영감을 얻기 위해 폭넓게 탐색해 본다.", skill: "curiosity_lifelong_learning" },
  },
  {
    id: 19,
    text: "프로젝트 마감 직전, 막판 스퍼트를 내던 동료가 다소 지친 기색을 보일 때 나는?",
    optionA: { text: "“우리 잠시 숨 좀 돌리고 올까요?” 따뜻한 말 한마디로 긴장된 마음을 먼저 다독여 준다.", skill: "empathy_active_listening" },
    optionB: { text: "“고지가 눈앞이에요! 제가 이 파트를 서포트해 드릴까요?” 긍정적인 에너지로 실질적 도움의 손길을 건넨다.", skill: "leadership_influence" },
  },
  {
    id: 20,
    text: "퇴근을 앞둔 오후, 난이도는 높지만 성공하면 큰 임팩트를 낼 수 있는 중요 업무가 주어졌다.",
    optionA: { text: "“쉽지 않겠지만 내 성장에 큰 밑거름이 될 거야.” 스스로 의미를 부여하며 도전적인 목표를 세운다.", skill: "motivation_self_awareness" },
    optionB: { text: "“우리 팀의 시너지를 발휘할 기회다!” 동료들과 어떻게 지혜를 모아 해결할지 협업 방안을 떠올린다.", skill: "leadership_influence" },
  },
  {
    id: 21,
    text: "알찬 하루가 거의 다 지나가고, 팀의 활력을 더해줄 다음 달 조직 문화 활동 아이디어를 낼 시간.",
    optionA: { text: "“이번엔 색다르게 이런 액티비티는 어때요?” 형식에 얽매이지 않고 자유롭고 창의적인 아이디어를 제안한다.", skill: "creative_thinking" },
    optionB: { text: "“저번 만족도 조사 결과를 참고해 볼까요?” 구성원들의 선호도와 데이터를 분석해 논리적으로 접근한다.", skill: "analytical_thinking" },
  },
  {
    id: 22,
    text: "기분 좋은 퇴근길, 내일의 업무 일정을 가볍게 머릿속으로 그려본다.",
    optionA: { text: "“오늘 하루도 수고했다! 내일도 힘차게 목표를 향해 달려보자.”", skill: "motivation_self_awareness" },
    optionB: { text: "“내일 오전에는 A 미팅, 오후에는 B 기획안 마무리를 하자.”", skill: "systems_thinking" },
  },
];
