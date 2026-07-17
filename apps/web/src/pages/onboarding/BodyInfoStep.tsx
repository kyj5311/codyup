import { useState } from "react";
import Button from "../../components/Button";
import Chip from "../../components/Chip";
import type { BodyInfoInput, BodyShape } from "../../types/onboarding";

interface BodyInfoStepProps {
  onComplete: (input: BodyInfoInput) => void;
  onBack: () => void;
}

const BODY_SHAPES: BodyShape[] = [
  "스트레이트",
  "웨이브",
  "내추럴",
  "모래시계",
  "직사각형",
  "역삼각형",
];

export default function BodyInfoStep({
  onComplete,
  onBack,
}: BodyInfoStepProps) {
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [bodyShape, setBodyShape] = useState<BodyShape | null>(null);

  const canProceed = heightCm !== "" && weightKg !== "" && bodyShape !== null;

  function handleNext() {
    if (!canProceed) return;
    onComplete({
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      bodyShape,
    });
  }

  return (
    <div className="flex min-h-full flex-col justify-between">
      <div>
        <p className="text-sm font-semibold text-ink-soft">체형 정보 입력</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">
          체형에 맞는 코디를{"\n"}추천해 드릴게요
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          입력한 정보는 코디 추천·평가에만 사용돼요.
        </p>

        <div className="mt-6 flex gap-3">
          <label className="flex-1">
            <span className="text-sm font-medium text-ink-soft">키 (cm)</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="165"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-line bg-transparent px-4 text-[15px] outline-none focus:border-ink"
            />
          </label>
          <label className="flex-1">
            <span className="text-sm font-medium text-ink-soft">
              몸무게 (kg)
            </span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="55"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-line bg-transparent px-4 text-[15px] outline-none focus:border-ink"
            />
          </label>
        </div>

        <div className="mt-6">
          <span className="text-sm font-medium text-ink-soft">체형 타입</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {BODY_SHAPES.map((shape) => (
              <Chip
                key={shape}
                selected={bodyShape === shape}
                onClick={() => setBodyShape(shape)}
              >
                {shape}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button onClick={handleNext} disabled={!canProceed}>
          다음
        </Button>
        <Button variant="ghost" size="md" onClick={onBack}>
          이전으로
        </Button>
      </div>
    </div>
  );
}
