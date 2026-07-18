import { useEffect, useState } from "react";
import OnboardingFlow from "./pages/onboarding/OnboardingFlow";
import ClosetFlow from "./pages/closet/ClosetFlow";
import DashboardHome from "./pages/dashboard/DashboardHome";
import StylePlanHome from "./pages/style-plan/StylePlanHome";
import CoachingHome from "./pages/coaching/CoachingHome";
import MyPage from "./pages/mypage/MyPage";
import BottomNavBar, { type NavTab } from "./components/BottomNavBar";
import { ensureTestToken } from "./api/auth-api";
import type { OnboardingState } from "./types/onboarding";

type Screen = "onboarding" | NavTab;

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");
  // "내 옷장" 탭으로 평범하게 들어갈 땐 목록부터, 대시보드의 "AI 분석"으로
  // 들어갈 땐 분석 화면부터 보여주기 위한 진입점 구분.
  const [closetEntryView, setClosetEntryView] = useState<"list" | "analysis">(
    "list",
  );
  // "코디 코칭" 탭으로 평범하게 들어갈 땐 평가부터, 대시보드의 "오늘의 추천 코디"로
  // 들어갈 땐 추천 탭부터 보여주기 위한 진입점 구분.
  const [coachingEntryTab, setCoachingEntryTab] = useState<"평가" | "추천">(
    "평가",
  );

  useEffect(() => {
    // BE1 명세서: POST /auth/token으로 테스트 토큰 발급 (로그인 화면 생기기 전 임시)
    ensureTestToken();
  }, []);

  function handleOnboardingFinish(state: OnboardingState) {
    console.log("온보딩 완료", state);
    setScreen("home");
  }

  // 하단 탭바로 화면을 바꿀 땐 항상 기본 화면(옷장 목록/코칭 평가)부터 시작하도록 초기화
  function handleTabChange(tab: NavTab) {
    if (tab === "closet") setClosetEntryView("list");
    if (tab === "coaching") setCoachingEntryTab("평가");
    setScreen(tab);
  }

  if (screen === "onboarding") {
    return <OnboardingFlow onFinish={handleOnboardingFinish} />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {screen === "home" && (
          <DashboardHome
            onNavigateStylePlan={() => setScreen("style-plan")}
            onNavigateCoaching={() => setScreen("coaching")}
            onNavigateCloset={() => {
              setClosetEntryView("list");
              setScreen("closet");
            }}
            onNavigateAiAnalysis={() => {
              setClosetEntryView("analysis");
              setScreen("closet");
            }}
            onNavigateTodayCoordi={() => {
              setCoachingEntryTab("추천");
              setScreen("coaching");
            }}
          />
        )}
        {screen === "closet" && <ClosetFlow initialView={closetEntryView} />}
        {screen === "style-plan" && <StylePlanHome />}
        {screen === "coaching" && <CoachingHome initialTab={coachingEntryTab} />}
        {screen === "mypage" && <MyPage />}
      </div>
      <BottomNavBar active={screen} onChange={handleTabChange} />
    </div>
  );
}
