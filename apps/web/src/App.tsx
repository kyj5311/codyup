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

  useEffect(() => {
    // BE1 명세서: POST /auth/token으로 테스트 토큰 발급 (로그인 화면 생기기 전 임시)
    ensureTestToken();
  }, []);

  function handleOnboardingFinish(state: OnboardingState) {
    console.log("온보딩 완료", state);
    setScreen("home");
  }

  if (screen === "onboarding") {
    return <OnboardingFlow onFinish={handleOnboardingFinish} />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 overflow-y-auto">
        {screen === "home" && (
          <DashboardHome
            onNavigateStylePlan={() => setScreen("style-plan")}
            onNavigateCoaching={() => setScreen("coaching")}
            onNavigateCloset={() => setScreen("closet")}
          />
        )}
        {screen === "closet" && <ClosetFlow />}
        {screen === "style-plan" && <StylePlanHome />}
        {screen === "coaching" && <CoachingHome />}
        {screen === "mypage" && <MyPage />}
      </div>
      <BottomNavBar active={screen} onChange={setScreen} />
    </div>
  );
}