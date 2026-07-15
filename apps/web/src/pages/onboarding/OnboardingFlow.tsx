import { useState } from "react";
import SwatchProgress from "../../components/SwatchProgress";
import IntroSlide from "./IntroSlide";
import PersonalColorStep from "./PersonalColorStep";
import BodyInfoStep from "./BodyInfoStep";
import BudgetStep from "./BudgetStep";
import InitialClosetStep from "./InitialClosetStep";
import type { OnboardingState, OnboardingStep } from "../../types/onboarding";

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
          onComplete={(result) => {
            setState((prev) => ({ ...prev, personalColorResult: result }));
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
          onComplete={(budget) => {
            setState((prev) => ({ ...prev, budget }));
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
