import { useEffect, useState } from "react";
import { Palette, Ruler, Wallet } from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import { fetchMyProfile, updateMyProfile } from "../../api/mypage-api";
import type { UserProfile } from "../../types/mypage";

export default function MyPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [budgetInput, setBudgetInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchMyProfile().then((res) => {
      if (ignore) return;
      if (res.success && res.data) {
        setProfile(res.data);
        setBudgetInput(String(res.data.budget.monthlyBudgetKrw ?? ""));
      }
      setIsLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSaveBudget() {
    if (!profile) return;
    const monthlyBudgetKrw = Number(budgetInput.replace(/[^0-9]/g, ""));
    if (!monthlyBudgetKrw) return;

    setIsSaving(true);
    const res = await updateMyProfile({ budget: { monthlyBudgetKrw } });
    setIsSaving(false);
    if (res.success && res.data) setProfile(res.data);
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

  return (
    <div className="flex flex-col gap-5 p-5">
      <PageHeader title="마이페이지" />
      <div>
        <p className="text-[15px] font-medium text-ink">{profile.nickname}</p>
        <p className="text-sm text-gray-text">{profile.email}</p>
      </div>

      {profile.personalColorResult && (
        <Card tone="yellow">
          <div className="flex items-center gap-1.5 text-ink">
            <Palette size={16} />
            <p className="text-sm font-semibold">퍼스널컬러</p>
          </div>
          <p className="mt-1 text-xl font-bold text-ink">
            {profile.personalColorResult.season}
          </p>
          <div className="mt-2 flex gap-2">
            {profile.personalColorResult.recommendedColors.map((hex) => (
              <span
                key={hex}
                className="h-6 w-6 rounded-full border border-line"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </Card>
      )}

      <Card tone="cream">
        <div className="flex items-center gap-1.5 text-ink">
          <Ruler size={16} />
          <p className="text-sm font-semibold">체형 정보</p>
        </div>
        <div className="mt-2 flex gap-4 text-sm text-ink-soft">
          <span>키 {profile.bodyInfo.heightCm ?? "-"}cm</span>
          <span>몸무게 {profile.bodyInfo.weightKg ?? "-"}kg</span>
          <span>{profile.bodyInfo.bodyShape ?? "미입력"}</span>
        </div>
      </Card>

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
        <Button
          size="md"
          className="mt-3"
          onClick={handleSaveBudget}
          disabled={isSaving}
        >
          {isSaving ? "저장 중..." : "저장"}
        </Button>
      </Card>
    </div>
  );
}