import { useState } from "react";
import Button from "../../components/Button";
import PersonalColorPicker from "../../components/PersonalColorPicker";
import type { PersonalColorResult, PersonalColorTone } from "../../types/onboarding";

interface PersonalColorStepProps {
  onComplete: (
    result: PersonalColorResult | null,
    manualTone: PersonalColorTone | null,
  ) => void;
  onBack: () => void;
}

// 정밀 진단(비전 API)은 아직 없어서, 사진 중앙 색상을 브라우저에서 직접 분석하는
// 간이 진단 + 직접 선택을 함께 제공합니다. 진단은 참고용이라 아래 목록에서 언제든 바꿀 수 있어요.
export default function PersonalColorStep({
  onComplete,
  onBack,
}: PersonalColorStepProps) {
  const [manualTone, setManualTone] = useState<PersonalColorTone | null>(null);

  function handleNext() {
    onComplete(null, manualTone);
  }

  return (
    <div className="flex min-h-full flex-col justify-between">
      <div>
        <p className="text-sm font-semibold text-ink-soft">퍼스널컬러 설정</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">
          나에게 어울리는{"\n"}퍼스널컬러를 찾아봐요
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          사진으로 간이 진단해보거나, 잘 모르겠다면 아래에서 직접 골라주세요.
          나중에 마이페이지에서 언제든 바꿀 수 있어요.
        </p>

        <div className="mt-5">
          <PersonalColorPicker value={manualTone} onChange={setManualTone} />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button onClick={handleNext} disabled={manualTone === null}>
          다음
        </Button>
        <Button variant="ghost" size="md" onClick={onBack}>
          이전으로
        </Button>
      </div>
    </div>
  );
}
