import OnboardingFlow from "./pages/onboarding/OnboardingFlow";
import type { OnboardingState } from "./types/onboarding";

function App() {
  function handleFinish(state: OnboardingState) {
    // TODO: 온보딩 완료 후 홈 대시보드(pages/dashboard, FE2 담당)로 라우팅
    console.log("온보딩 완료", state);
  }

  return <OnboardingFlow onFinish={handleFinish} />;
}

export default App;
