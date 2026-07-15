import { useState } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import Chip from "../../components/Chip";
import { saveMonthlyBudget } from "../../api/onboarding-api";
import type { BudgetInput } from "../../types/onboarding";

interface BudgetStepProps {
  onComplete: (input: BudgetInput) => void;
  onBack: () => void;
}

const PRESET_BUDGETS = [100000, 200000, 300000, 500000];

function formatKrw(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export default function BudgetStep({ onComplete, onBack }: BudgetStepProps) {
  const [budgetInput, setBudgetInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const numericBudget = Number(budgetInput.replace(/[^0-9]/g, ""));
  const canProceed = budgetInput !== "" && numericBudget > 0;

  function handlePresetClick(amount: number) {
    setBudgetInput(String(amount));
  }

  async function handleNext() {
    if (!canProceed) return;
    // 통화/가격: KRW, 정수(원 단위, 소수점 없음) — CLAUDE.md API 규약 준수
    const payload: BudgetInput = { monthlyBudgetKrw: numericBudget };

    setIsSaving(true);
    try {
      // BE2 연동: 예산 데이터 저장, 구매 로드맵 엔진과 연결
      await saveMonthlyBudget(payload);
    } finally {
      setIsSaving(false);
      onComplete(payload);
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-between">
      <div>
        <p className="text-sm font-semibold text-ink-soft">월 예산 입력</p>
        <h1 className="mt-2 text-2xl font-bold text-ink">
          한 달에 옷 사는 데{"\n"}쓸 예산을 알려주세요
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          입력한 예산에 맞춰 구매 우선순위 로드맵을 만들어드려요.
        </p>

        <Card tone="yellow" className="mt-6">
          <span className="text-sm font-medium text-ink-soft">월 예산</span>
          <div className="mt-2 flex items-baseline gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={budgetInput ? Number(budgetInput).toLocaleString("ko-KR") : ""}
              onChange={(e) =>
                setBudgetInput(e.target.value.replace(/[^0-9]/g, ""))
              }
              className="w-full bg-transparent text-3xl font-bold text-ink outline-none placeholder:text-ink-soft/40"
            />
            <span className="text-xl font-bold text-ink">원</span>
          </div>
        </Card>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESET_BUDGETS.map((amount) => (
            <Chip
              key={amount}
              selected={numericBudget === amount}
              onClick={() => handlePresetClick(amount)}
            >
              {formatKrw(amount)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button onClick={handleNext} disabled={!canProceed || isSaving}>
          {isSaving ? "저장 중..." : "다음"}
        </Button>
        <Button variant="ghost" size="md" onClick={onBack}>
          이전으로
        </Button>
      </div>
    </div>
  );
}
