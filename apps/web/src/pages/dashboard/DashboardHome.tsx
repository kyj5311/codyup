import { useEffect, useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { fetchDashboardSummary } from "../../api/dashboard-api";
import type { DashboardSummary } from "../../types/dashboard";
import TodayCoordiSwatch from "./components/TodayCoordiSwatch";

interface DashboardHomeProps {
  onNavigateStylePlan?: () => void;
  onNavigateCoaching?: () => void;
  onNavigateMyPage?: () => void;
}

export default function DashboardHome({
  onNavigateStylePlan,
  onNavigateCoaching,
  onNavigateMyPage,
}: DashboardHomeProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);
    fetchDashboardSummary().then((res) => {
      if (ignore) return;
      if (res.success && res.data) setSummary(res.data);
      setIsLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  if (isLoading) {
    return <p className="p-5 text-sm text-gray-text">불러오는 중...</p>;
  }

  if (!summary) {
    return (
      <p className="p-5 text-sm text-gray-text">
        대시보드 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-5">
      <div>
        <p className="text-sm text-gray-text">안녕하세요,</p>
        <h1 className="text-[22px] font-semibold text-ink">
          {summary.nickname}님
        </h1>
      </div>

      <Card tone="cream">
        <div className="mb-3 flex items-center gap-1.5 text-ink">
          <Sparkles size={16} />
          <h2 className="text-[15px] font-semibold">오늘의 추천 코디</h2>
        </div>
        <TodayCoordiSwatch items={summary.todayCoordi} />
      </Card>

      <Card tone="yellow">
        <p className="text-sm text-ink-soft">옷장 완성도</p>
        <p className="mt-1 text-3xl font-bold text-ink">
          {summary.closetCompletionPercent}%
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-cream">
          <div
            className="h-full rounded-pill bg-ink transition-all"
            style={{ width: `${summary.closetCompletionPercent}%` }}
          />
        </div>
      </Card>

      {summary.nextRoadmapItem && (
        <button
          type="button"
          onClick={onNavigateStylePlan}
          className="w-full text-left"
        >
          <Card tone="cream" className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-text">다음 구매 추천</p>
              <p className="mt-0.5 text-[15px] font-medium text-ink">
                {summary.nextRoadmapItem.itemName}
              </p>
              <p className="text-sm text-ink-soft">
                {summary.nextRoadmapItem.estimatedPriceKrw.toLocaleString(
                  "ko-KR",
                )}
                원
              </p>
            </div>
            <ArrowRight size={20} className="text-ink-soft" />
          </Card>
        </button>
      )}

      {summary.latestEvaluationScore !== null && (
        <button
          type="button"
          onClick={onNavigateCoaching}
          className="w-full text-left"
        >
          <Card tone="cream" className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-text">최근 코디 평가</p>
              <p className="mt-0.5 text-[15px] font-medium text-ink">
                {summary.latestEvaluationScore}점
              </p>
            </div>
            <ArrowRight size={20} className="text-ink-soft" />
          </Card>
        </button>
      )}

      <div className="mt-2 flex gap-3">
        <Button variant="secondary" onClick={onNavigateStylePlan}>
          스타일 플랜 보기
        </Button>
        <Button variant="ghost" onClick={onNavigateMyPage}>
          마이페이지
        </Button>
      </div>
    </div>
  );
}