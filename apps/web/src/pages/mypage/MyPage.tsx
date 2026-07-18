import { useEffect, useState } from "react";
import { ChevronLeft, Palette, Ruler, Wallet, User } from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Chip from "../../components/Chip";
import PageHeader from "../../components/PageHeader";
import PersonalColorPicker from "../../components/PersonalColorPicker";
import { fetchMyProfile, updateMyProfile } from "../../api/mypage-api";
import type { UserProfile } from "../../types/mypage";
import {
  PERSONAL_COLOR_SEASONS,
  type BodyShape,
  type PersonalColorTone,
} from "../../types/onboarding";

const ALL_PERSONAL_COLOR_TONES: PersonalColorTone[] = PERSONAL_COLOR_SEASONS.flatMap(
  (group) => group.tones,
);

const BODY_SHAPES: BodyShape[] = [
  "스트레이트",
  "웨이브",
  "내추럴",
  "모래시계",
  "직사각형",
  "역삼각형",
];

export default function MyPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 예산
  const [budgetInput, setBudgetInput] = useState("");
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // 닉네임 + 체형 정보
  const [nicknameInput, setNicknameInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [bodyShapeInput, setBodyShapeInput] = useState<BodyShape | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // 퍼스널컬러
  const [personalColorInput, setPersonalColorInput] = useState<PersonalColorTone | null>(null);
  const [isSavingPersonalColor, setIsSavingPersonalColor] = useState(false);
  const [personalColorError, setPersonalColorError] = useState<string | null>(null);
  const [isEditingPersonalColor, setIsEditingPersonalColor] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchMyProfile().then((res) => {
      if (ignore) return;
      if (res.success && res.data) {
        applyProfileToForm(res.data);
      }
      setIsLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  function applyProfileToForm(data: UserProfile) {
    setProfile(data);
    setBudgetInput(String(data.budget.monthlyBudgetKrw ?? ""));
    setNicknameInput(data.nickname);
    setHeightInput(data.bodyInfo.heightCm != null ? String(data.bodyInfo.heightCm) : "");
    setWeightInput(data.bodyInfo.weightKg != null ? String(data.bodyInfo.weightKg) : "");
    setBodyShapeInput(data.bodyInfo.bodyShape);
    // 저장된 값이 선택 가능한 9톤 중 하나와 정확히 일치할 때만 칩을 미리 선택해둠
    // (예전 "봄 웜"처럼 톤이 아닌 값이 저장돼 있으면 아무 칩도 선택 안 된 상태로 둠)
    const savedTone = data.personalColorResult?.season;
    setPersonalColorInput(
      ALL_PERSONAL_COLOR_TONES.find((tone) => tone === savedTone) ?? null,
    );
  }

  async function handleSaveBudget() {
    if (!profile) return;
    const monthlyBudgetKrw = Number(budgetInput.replace(/[^0-9]/g, ""));
    if (!monthlyBudgetKrw) return;

    setIsSavingBudget(true);
    setBudgetError(null);
    const res = await updateMyProfile({ budget: { monthlyBudgetKrw } });
    setIsSavingBudget(false);
    if (res.success && res.data) {
      applyProfileToForm(res.data);
    } else {
      setBudgetError(res.error?.message ?? "저장에 실패했어요. 다시 시도해 주세요.");
    }
  }

  async function handleSavePersonalColor() {
    if (!profile || !personalColorInput) return;

    setIsSavingPersonalColor(true);
    setPersonalColorError(null);
    const res = await updateMyProfile({ personalColor: personalColorInput });
    setIsSavingPersonalColor(false);
    if (res.success && res.data) {
      applyProfileToForm(res.data);
      setIsEditingPersonalColor(false);
    } else {
      setPersonalColorError(res.error?.message ?? "저장에 실패했어요. 다시 시도해 주세요.");
    }
  }

  function handleCancelPersonalColorEdit() {
    // 저장 안 하고 나가는 거라 선택값을 마지막으로 저장된 값으로 되돌림
    const savedTone = profile?.personalColorResult?.season;
    setPersonalColorInput(
      ALL_PERSONAL_COLOR_TONES.find((tone) => tone === savedTone) ?? null,
    );
    setPersonalColorError(null);
    setIsEditingPersonalColor(false);
  }

  async function handleSaveProfile() {
    if (!profile) return;

    setIsSavingProfile(true);
    setProfileError(null);
    const res = await updateMyProfile({
      nickname: nicknameInput.trim() || undefined,
      bodyInfo: {
        heightCm: heightInput ? Number(heightInput.replace(/[^0-9]/g, "")) : null,
        weightKg: weightInput ? Number(weightInput.replace(/[^0-9]/g, "")) : null,
        bodyShape: bodyShapeInput,
      },
    });
    setIsSavingProfile(false);
    if (res.success && res.data) {
      applyProfileToForm(res.data);
    } else {
      setProfileError(res.error?.message ?? "저장에 실패했어요. 다시 시도해 주세요.");
    }
  }

  if (isLoading) {
    return <p className="p-5 text-sm text-gray-text">불러오는 중...</p>;
  }

  if (!profile) {
    return (
      <p className="p-5 text-sm text-gray-text">
        프로필을 불러오지 못했어요. 잠시 후 다시 시도해주세요.
      </p>
    );
  }

  if (isEditingPersonalColor) {
    return (
      <div className="flex min-h-full flex-col p-5">
        <header className="flex items-center py-2">
          <button
            type="button"
            onClick={handleCancelPersonalColorEdit}
            aria-label="뒤로가기"
            className="text-ink"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <p className="flex-1 text-center text-lg font-bold text-ink">
            퍼스널컬러 수정
          </p>
          <span className="w-[22px]" />
        </header>

        <p className="mt-2 text-sm text-ink-soft">
          사진으로 간이 진단해보거나, 잘 모르겠다면 아래에서 직접 골라주세요.
        </p>

        <div className="mt-5">
          <PersonalColorPicker
            value={personalColorInput}
            onChange={setPersonalColorInput}
          />
        </div>

        {personalColorError && (
          <p className="mt-3 text-sm text-danger">{personalColorError}</p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={handleSavePersonalColor}
            disabled={!personalColorInput || isSavingPersonalColor}
          >
            {isSavingPersonalColor ? "저장 중..." : "저장"}
          </Button>
          <Button variant="ghost" size="md" onClick={handleCancelPersonalColorEdit}>
            취소
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      <PageHeader title="마이페이지" />
      <div>
        <p className="text-[15px] font-medium text-ink">{profile.nickname}</p>
        <p className="text-sm text-gray-text">{profile.email}</p>
      </div>

      <Card tone="yellow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-ink">
            <Palette size={16} />
            <p className="text-sm font-semibold">퍼스널컬러</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditingPersonalColor(true)}
            className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-cream"
          >
            수정하기
          </button>
        </div>

        <p className="mt-1 text-xl font-bold text-ink">
          {profile.personalColorResult?.season ?? "아직 설정 안 함"}
        </p>
      </Card>

      {/* 닉네임 + 체형 정보 (수정 가능) */}
      <Card tone="cream">
        <div className="flex items-center gap-1.5 text-ink">
          <User size={16} />
          <p className="text-sm font-semibold">내 정보</p>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-text">닉네임</label>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="닉네임"
              className="mt-1 h-11 w-full rounded-2xl border border-line bg-cream px-4 text-sm text-ink outline-none focus:border-ink"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-text">키(cm)</label>
              <input
                type="text"
                inputMode="numeric"
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                placeholder="168"
                className="mt-1 h-11 w-full rounded-2xl border border-line bg-cream px-4 text-sm text-ink outline-none focus:border-ink"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-text">몸무게(kg)</label>
              <input
                type="text"
                inputMode="numeric"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="56"
                className="mt-1 h-11 w-full rounded-2xl border border-line bg-cream px-4 text-sm text-ink outline-none focus:border-ink"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-text">체형</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {BODY_SHAPES.map((shape) => (
                <Chip
                  key={shape}
                  selected={bodyShapeInput === shape}
                  onClick={() => setBodyShapeInput(shape)}
                >
                  {shape}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-gray-text">
          <Ruler size={14} />
          <span>
            현재: 키 {profile.bodyInfo.heightCm ?? "-"}cm · 몸무게{" "}
            {profile.bodyInfo.weightKg ?? "-"}kg ·{" "}
            {profile.bodyInfo.bodyShape ?? "미입력"}
          </span>
        </div>

        {profileError && (
          <p className="mt-2 text-xs text-danger">{profileError}</p>
        )}

        <Button
          size="md"
          className="mt-3"
          onClick={handleSaveProfile}
          disabled={isSavingProfile}
        >
          {isSavingProfile ? "저장 중..." : "내 정보 저장"}
        </Button>
      </Card>

      {/* 예산 */}
      <Card tone="cream">
        <div className="flex items-center gap-1.5 text-ink">
          <Wallet size={16} />
          <p className="text-sm font-semibold">월 스타일링 예산</p>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={budgetInput}
            onChange={(e) => setBudgetInput(e.target.value)}
            placeholder="300000"
            className="h-11 flex-1 rounded-2xl border border-line bg-cream px-4 text-sm text-ink outline-none focus:border-ink"
          />
          <span className="text-sm text-ink-soft">원</span>
        </div>
        {budgetError && (
          <p className="mt-2 text-xs text-danger">{budgetError}</p>
        )}
        <Button
          size="md"
          className="mt-3"
          onClick={handleSaveBudget}
          disabled={isSavingBudget}
        >
          {isSavingBudget ? "저장 중..." : "저장"}
        </Button>
      </Card>
    </div>
  );
}