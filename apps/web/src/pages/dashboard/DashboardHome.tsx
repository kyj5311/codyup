import { useEffect, useState } from "react";
import { fetchDashboardSummary } from "../../api/dashboard-api";
import type { DashboardSummary } from "../../types/dashboard";
import PageHeader from "../../components/PageHeader";
import TodayCoordiSwatch from "./components/TodayCoordiSwatch";

interface DashboardHomeProps {
  onNavigateStylePlan?: () => void;
  onNavigateCoaching?: () => void;
  onNavigateCloset?: () => void;
  onNavigateAiAnalysis?: () => void;
  onNavigateTodayCoordi?: () => void;
}

export default function DashboardHome({
  onNavigateStylePlan,
  onNavigateCoaching,
  onNavigateCloset,
  onNavigateAiAnalysis,
  onNavigateTodayCoordi,
}: DashboardHomeProps) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    fetchDashboardSummary().then((res) => {
      if (ignore) return;
      if (res.success && res.data) setSummary(res.data);
      setIsLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-5 p-5">
      <PageHeader />

      {isLoading || !summary ? (
        <p className="py-8 text-center text-sm text-gray-text">
          불러오는 중...
        </p>
      ) : (
        <>
          {/* 오늘의 추천 코디 */}
          <button
            type="button"
            onClick={onNavigateTodayCoordi}
            className="flex items-center justify-between rounded-card bg-cream-deep p-5 text-left"
          >
            <p className="text-sm text-ink-soft">오늘의 추천 코디</p>
            <div className="flex h-10 w-24 overflow-hidden rounded-xl">
              <TodayCoordiSwatch items={summary.todayCoordi} compact />
            </div>
          </button>

          {/* AI 스타일 플랜 */}
          <button
            type="button"
            onClick={onNavigateStylePlan}
            className="rounded-card bg-yellow p-5 text-left"
          >
            <p className="text-sm font-medium text-ink">AI 스타일 플랜</p>
          </button>

          {/* 내 옷장 / AI 분석 */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={onNavigateCloset}
              className="aspect-square rounded-card bg-cream-deep p-5 text-left"
            >
              <p className="text-sm font-medium text-ink">내 옷장</p>
            </button>
            <button
              type="button"
              onClick={onNavigateAiAnalysis}
              className="aspect-square rounded-card bg-cream-deep p-5 text-left"
            >
              <p className="text-sm font-medium text-ink">AI 분석</p>
            </button>
          </div>

          {/* 코디 코칭 바로가기 */}
          <button
            type="button"
            onClick={onNavigateCoaching}
            className="rounded-card bg-yellow p-5 text-left"
          >
            <p className="text-sm font-medium text-ink">코디 코칭</p>
          </button>
        </>
      )}
    </div>
  );
}