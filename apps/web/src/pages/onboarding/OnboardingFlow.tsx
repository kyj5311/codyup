import { useState } from "react";
import SwatchProgress from "../../components/SwatchProgress";
import IntroSlide from "./IntroSlide";
import PersonalColorStep from "./PersonalColorStep";
import BodyInfoStep from "./BodyInfoStep";
import BudgetStep from "./BudgetStep";
import InitialClosetStep from "./InitialClosetStep";
import { saveUserProfile } from "../../api/onboarding-api";
import {
  buildPersonalColorLabel,
  type OnboardingState,
  type OnboardingStep,
  type PersonalColorTone,
} from "../../types/onboarding";

const INITIAL_STATE: OnboardingState = {
  personalColor: { uploadedImageFile: null, selfSelectedTone: null },
  personalColorResult: null,
  bodyInfo: { heightCm: null, weightKg: null, bodyShape: null },
  budget: { monthlyBudgetKrw: null },
  initialClosetItems: [],
};

interface OnboardingFlowProps {
  onFinish: (state: OnboardingState) => void;
}

export default function OnboardingFlow({ onFinish }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>("intro");
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [manualTone, setManualTone] = useState<PersonalColorTone | null>(null);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] bg-cream px-6 pb-10 pt-8">
      {step !== "intro" && (
        <div className="mb-6">
          <SwatchProgress current={step} />
        </div>
      )}

      {step === "intro" && (
        <IntroSlide onComplete={() => setStep("personal-color")} />
      )}

      {step === "personal-color" && (
        <PersonalColorStep
          onBack={() => setStep("intro")}
          onComplete={(result, tone) => {
            setState((prev) => ({ ...prev, personalColorResult: result }));
            setManualTone(tone);
            setStep("body-info");
          }}
        />
      )}

      {step === "body-info" && (
        <BodyInfoStep
          onBack={() => setStep("personal-color")}
          onComplete={(bodyInfo) => {
            setState((prev) => ({ ...prev, bodyInfo }));
            setStep("budget");
          }}
        />
      )}

      {step === "budget" && (
        <BudgetStep
          onBack={() => setStep("body-info")}
          onComplete={async (budget) => {
            const nextState = { ...state, budget };
            setState(nextState);

            // BE1 연동: 퍼스널컬러+체형+예산을 하나의 프로필로 저장 (PUT /user/profile)
            if (nextState.bodyInfo.bodyShape && budget.monthlyBudgetKrw) {
              try {
                await saveUserProfile({
                  personalColor: buildPersonalColorLabel(
                    nextState.personalColorResult,
                    manualTone,
                  ),
                  bodyType: nextState.bodyInfo.bodyShape,
                  monthlyBudget: budget.monthlyBudgetKrw,
                });
              } catch {
                // BE1 서버 연결 전이라도 온보딩 진행은 막지 않음
              }
            }

            setStep("initial-closet");
          }}
        />
      )}

      {step === "initial-closet" && (
        <InitialClosetStep
          onBack={() => setStep("budget")}
          onComplete={(initialClosetItems) => {
            const finalState = { ...state, initialClosetItems };
            setState(finalState);
            onFinish(finalState);
          }}
        />
      )}
    </div>
  );
}
