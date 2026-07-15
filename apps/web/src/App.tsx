import { useEffect, useState } from "react";
import OnboardingFlow from "./pages/onboarding/OnboardingFlow";
import ClosetFlow from "./pages/closet/ClosetFlow";
import { ensureTestToken } from "./api/auth-api";
import type { OnboardingState } from "./types/onboarding";

type Screen = "onboarding" | "closet";

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");

  useEffect(() => {
    // BE1 명세서: POST /auth/token으로 테스트 토큰 발급 (로그인 화면 생기기 전 임시)
    ensureTestToken();
  }, []);

  function handleOnboardingFinish(state: OnboardingState) {
    console.log("온보딩 완료", state);
    setScreen("closet");
  }

  if (screen === "onboarding") {
    return <OnboardingFlow onFinish={handleOnboardingFinish} />;
  }

  return <ClosetFlow />;
}
