import { ONBOARDING_STEPS, type OnboardingStep } from "../types/onboarding";

interface SwatchProgressProps {
  current: OnboardingStep;
}

const STEP_LABELS: Record<OnboardingStep, string> = {
  intro: "소개",
  "personal-color": "퍼스널컬러",
  "body-info": "체형",
  budget: "예산",
  "initial-closet": "옷장",
};

/**
 * 홈 대시보드의 '오늘의 추천 코디' 스와치(색상 블록이 이어붙은 형태)를
 * 온보딩 진행률로 재해석한 시그니처 컴포넌트.
 * 완료된 스텝은 채워지고, 현재 스텝은 옐로우로 강조된다.
 */
export default function SwatchProgress({ current }: SwatchProgressProps) {
  const currentIndex = ONBOARDING_STEPS.indexOf(current);

  return (
    <div className="w-full">
      <div className="flex h-3 w-full overflow-hidden rounded-pill bg-cream-deep">
        {ONBOARDING_STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          return (
            <div
              key={step}
              className={[
                "h-full flex-1 transition-colors duration-300",
                index > 0 ? "border-l border-cream" : "",
                isDone ? "bg-ink" : "",
                isCurrent ? "bg-yellow" : "",
                !isDone && !isCurrent ? "bg-transparent" : "",
              ].join(" ")}
            />
          );
        })}
      </div>
      <p className="mt-2 text-xs text-gray-text">
        {currentIndex + 1} / {ONBOARDING_STEPS.length} · {STEP_LABELS[current]}
      </p>
    </div>
  );
}
