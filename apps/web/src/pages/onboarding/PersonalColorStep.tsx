import { useRef, useState } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import { requestPersonalColorDiagnosis } from "../../api/onboarding-api";
import type { PersonalColorResult } from "../../types/onboarding";

interface PersonalColorStepProps {
  onComplete: (
    result: PersonalColorResult | null,
    manualTone: "웜톤" | "쿨톤" | null,
  ) => void;
  onBack: () => void;
}

type DiagnosisStatus = "idle" | "loading" | "done" | "error";

export default function PersonalColorStep({
  onComplete,
  onBack,
}: PersonalColorStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<DiagnosisStatus>("idle");
  const [result, setResult] = useState<PersonalColorResult | null>(null);
  const [manualTone, setManualTone] = useState<"웜톤" | "쿨톤" | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setManualTone(null);
  }

  async function handleDiagnose() {
    if (!selectedFile) return;
    setStatus("loading");
    try {
      // BE1 연동: 비전 API 기반 퍼스널컬러 진단
      const response = await requestPersonalColorDiagnosis(selectedFile);
      if (response.success && response.data) {
        setResult(response.data);
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  function handleSkipWithManualTone(tone: "웜톤" | "쿨톤") {
    setManualTone(tone);
    setResult(null);
    setStatus("idle");
  }

  function handleNext() {
    onComplete(result, manualTone);
  }

  const canProceed = status === "done" || manualTone !== null;

  return (
    <div className="flex min-h-full flex-col justify-between">
      <div>
        <p className="text-sm font-semibold text-ink-soft">퍼스널컬러 설정</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">
          얼굴 사진으로{"\n"}퍼스널컬러를 진단해요
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          자연광에서 찍은 정면 사진일수록 정확해요. 원하지 않으면 직접 선택할
          수도 있어요.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleFileChange}
        />

        <Card
          tone="cream"
          className="mt-6 flex min-h-[220px] cursor-pointer flex-col items-center justify-center border border-dashed border-line text-center"
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="업로드한 얼굴 사진 미리보기"
              className="h-40 w-40 rounded-2xl object-cover"
            />
          ) : (
            <>
              <p className="text-[15px] font-medium text-ink">
                사진을 업로드해 주세요
              </p>
              <p className="mt-1 text-xs text-gray-text">
                JPG, PNG / 최대 30MB
              </p>
            </>
          )}
        </Card>

        {selectedFile && status !== "done" && (
          <Button
            className="mt-4"
            variant="secondary"
            onClick={handleDiagnose}
            disabled={status === "loading"}
          >
            {status === "loading" ? "진단 중..." : "퍼스널컬러 진단하기"}
          </Button>
        )}

        {status === "error" && (
          <p className="mt-3 text-sm text-danger">
            진단에 실패했어요. 다시 시도하거나 아래에서 직접 선택해 주세요.
          </p>
        )}

        {status === "done" && result && (
          <Card tone="yellow" className="mt-4">
            <p className="text-sm font-semibold text-ink-soft">진단 결과</p>
            <p className="mt-1 text-xl font-bold text-ink">{result.season}</p>
            <p className="mt-1 text-xs text-ink-soft">
              신뢰도 {Math.round(result.confidence * 100)}%
            </p>
          </Card>
        )}

        <div className="mt-6">
          <p className="text-sm font-medium text-ink-soft">
            사진 없이 직접 선택할래요
          </p>
          <div className="mt-3 flex gap-2">
            <Chip
              selected={manualTone === "웜톤"}
              onClick={() => handleSkipWithManualTone("웜톤")}
            >
              웜톤
            </Chip>
            <Chip
              selected={manualTone === "쿨톤"}
              onClick={() => handleSkipWithManualTone("쿨톤")}
            >
              쿨톤
            </Chip>
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
