import { useState } from "react";
import Button from "../../components/Button";
import Chip from "../../components/Chip";
import {
  PERSONAL_COLOR_SEASONS,
  type PersonalColorResult,
  type PersonalColorTone,
} from "../../types/onboarding";

interface PersonalColorStepProps {
  onComplete: (
    result: PersonalColorResult | null,
    manualTone: PersonalColorTone | null,
  ) => void;
  onBack: () => void;
}

// 사진 진단(비전 API) 엔드포인트가 아직 없어서, 직접 선택 방식만 제공합니다.
// TODO(BE1): 진단 API 나오면 사진 업로드 + 진단 버튼 UI를 다시 추가.
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
          나에게 어울리는{"\n"}퍼스널컬러를 선택해요
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          잘 모르겠다면 웜톤/쿨톤 중 평소 자주 듣는 톤을 골라주세요. 나중에
          마이페이지에서 언제든 바꿀 수 있어요.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {PERSONAL_COLOR_SEASONS.map((group) => (
            <div key={group.season}>
              <p className="text-xs font-medium text-gray-text">
                {group.season}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {group.tones.map((tone) => (
                  <Chip
                    key={tone}
                    selected={manualTone === tone}
                    onClick={() => setManualTone(tone)}
                  >
                    {tone}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
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
