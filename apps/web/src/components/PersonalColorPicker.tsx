import { useRef, useState } from "react";
import Button from "./Button";
import Card from "./Card";
import Chip from "./Chip";
import { diagnosePersonalColorFromPhoto } from "../utils/personal-color-diagnosis";
import {
  PERSONAL_COLOR_SEASONS,
  type PersonalColorResult,
  type PersonalColorTone,
} from "../types/onboarding";

interface PersonalColorPickerProps {
  value: PersonalColorTone | null;
  onChange: (tone: PersonalColorTone) => void;
}

type DiagnosisStatus = "idle" | "loading" | "done" | "error";

/**
 * 사진 간이 진단 + 직접 선택 UI. 온보딩(PersonalColorStep)과 마이페이지(수정하기)에서 공유.
 * "선택된 톤" 자체는 부모가 들고 있고(value/onChange), 이 컴포넌트는 사진 업로드·진단만 담당.
 */
export default function PersonalColorPicker({
  value,
  onChange,
}: PersonalColorPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<DiagnosisStatus>("idle");
  const [result, setResult] = useState<PersonalColorResult | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setStatus("idle");
  }

  async function handleDiagnose() {
    if (!selectedFile) return;
    setStatus("loading");
    try {
      // 외부 비전 API 없이 브라우저에서 사진 중앙 색상만 분석하는 간이 진단
      const diagnosed = await diagnosePersonalColorFromPhoto(selectedFile);
      setResult(diagnosed);
      onChange(diagnosed.season as PersonalColorTone);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />

      <Card
        tone="cream"
        className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center border border-dashed border-line text-center"
        onClick={() => fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="업로드한 얼굴 사진 미리보기"
            className="h-36 w-36 rounded-full object-cover"
          />
        ) : (
          <>
            <p className="text-[15px] font-medium text-ink">
              얼굴 사진을 올려주세요
            </p>
            <p className="mt-1 text-xs text-gray-text">
              자연광에서 정면으로, 얼굴이 가운데 오게 찍으면 더 정확해요
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
          {status === "loading" ? "진단 중..." : "간이 진단하기"}
        </Button>
      )}

      {status === "error" && (
        <p className="mt-3 text-sm text-danger">
          진단에 실패했어요. 다시 시도하거나 아래에서 직접 선택해 주세요.
        </p>
      )}

      {status === "done" && result && (
        <Card tone="yellow" className="mt-4">
          <p className="text-sm font-semibold text-ink-soft">간이 진단 결과</p>
          <p className="mt-1 text-xl font-bold text-ink">{result.season}</p>
          <p className="mt-1 text-xs text-ink-soft">
            참고용 결과예요(신뢰도 {Math.round(result.confidence * 100)}%). 아래에서
            언제든 다른 톤으로 바꿀 수 있어요.
          </p>
        </Card>
      )}

      <div className="mt-6">
        <p className="text-sm font-medium text-ink-soft">직접 선택할래요</p>
        <div className="mt-3 flex flex-col gap-3">
          {PERSONAL_COLOR_SEASONS.map((group) => (
            <div key={group.season}>
              <p className="text-xs font-medium text-gray-text">{group.season}</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {group.tones.map((tone) => (
                  <Chip
                    key={tone}
                    selected={value === tone}
                    onClick={() => onChange(tone)}
                  >
                    {tone}
                  </Chip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
