import { useState } from "react";
import OnboardingFlow from "./pages/onboarding/OnboardingFlow";
import ClosetFlow from "./pages/closet/ClosetFlow";
import type { OnboardingState } from "./types/onboarding";

type Screen = "onboarding" | "closet";

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");

  function handleOnboardingFinish(state: OnboardingState) {
    // TODO: 서버에 온보딩 완료 여부 저장 시 여기서 API 호출 (BE1/BE2)
    console.log("온보딩 완료", state);
    setScreen("closet");
  }

  if (screen === "onboarding") {
    return <OnboardingFlow onFinish={handleOnboardingFinish} />;
  }

  return <ClosetFlow />;
}
