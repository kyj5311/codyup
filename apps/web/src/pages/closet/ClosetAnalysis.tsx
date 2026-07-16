import { useEffect, useState } from "react";
import { ChevronLeft, Sparkles } from "lucide-react";
import Card from "../../components/Card";
import {
  fetchClosetAnalysis,
  fetchMissingClosetItems,
} from "../../api/closet-api";
import {
  MOCK_CLOSET_ANALYSIS,
  MOCK_MISSING_ITEMS,
} from "../../utils/mock-closet-data";
import type { ClosetAnalysis, MissingClosetItem } from "../../types/closet";

interface ClosetAnalysisViewProps {
  onBack: () => void;
}

const CATEGORY_BAR_COLOR = "#f0c452";

export default function ClosetAnalysisView({
  onBack,
}: ClosetAnalysisViewProps) {
  const [analysis, setAnalysis] = useState<ClosetAnalysis | null>(null);
  const [missing, setMissing] = useState<MissingClosetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockData, setIsMockData] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      // BE1 연동: GET /closet/analysis
      fetchClosetAnalysis(),
      // BE1 연동: GET /closet/missing
      fetchMissingClosetItems(),
    ])
      .then(([analysisRes, missingRes]) => {
        if (!isMounted) return;
        const analysisOk = analysisRes.success && analysisRes.data;
        const missingOk = missingRes.success && missingRes.data;

        if (analysisOk) {
          setAnalysis(analysisRes.data);
        }
        if (missingOk) {
          setMissing(missingRes.data ?? []);
        }
        if (!analysisOk && !missingOk) {
          // 둘 다 실패 — 데모가 비어 보이지 않도록 목업으로 대체
          setAnalysis(MOCK_CLOSET_ANALYSIS);
          setMissing(MOCK_MISSING_ITEMS);
          setIsMockData(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAnalysis(MOCK_CLOSET_ANALYSIS);
          setMissing(MOCK_MISSING_ITEMS);
          setIsMockData(true);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const categoryEntries = analysis
    ? Object.entries(analysis.categoryCounts).filter(
        (entry): entry is [string, number] => entry[1] !== undefined,
      )
    : [];
  const maxCategoryCount = Math.max(1, ...categoryEntries.map(([, c]) => c));

  const colorEntries = analysis ? Object.entries(analysis.colorCounts) : [];
  const maxColorCount = Math.max(1, ...colorEntries.map(([, c]) => c));

  return (
    <div className="flex min-h-full flex-col pb-10">
      <header className="flex items-center py-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
          className="text-ink"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-ink">
          옷장 분석
        </h1>
        <span className="w-[22px]" />
      </header>

      {isMockData && !isLoading && (
        <p className="mt-2 rounded-xl bg-cream-deep px-3 py-1.5 text-xs text-gray-text">
          서버 연결 전이라 샘플 데이터를 보여주고 있어요.
        </p>
      )}

      {isLoading ? (
        <p className="mt-10 text-center text-sm text-gray-text">
          옷장을 분석하는 중...
        </p>
      ) : (
        <>
          <Card tone="yellow" className="mt-4">
            <p className="text-sm font-semibold text-ink-soft">
              등록된 옷 개수
            </p>
            <p className="mt-1 text-3xl font-bold text-ink">
              {analysis?.totalItems ?? 0}
              <span className="text-base font-medium text-ink-soft">개</span>
            </p>
          </Card>

          {categoryEntries.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-ink-soft">
                카테고리별 분포
              </p>
              <div className="mt-3 flex flex-col gap-2.5">
                {categoryEntries.map(([category, count]) => (
                  <div key={category} className="flex items-center gap-3">
                    <span className="w-14 shrink-0 text-sm text-ink">
                      {category}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-pill bg-cream-deep">
                      <div
                        className="h-full rounded-pill"
                        style={{
                          width: `${(count / maxCategoryCount) * 100}%`,
                          backgroundColor: CATEGORY_BAR_COLOR,
                        }}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right text-sm text-ink-soft">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {colorEntries.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-ink-soft">
                색상별 분포
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {colorEntries
                  .sort((a, b) => b[1] - a[1])
                  .map(([color, count]) => (
                    <span
                      key={color}
                      className="rounded-2xl border border-line px-3 py-1.5 text-sm text-ink"
                      style={{
                        opacity: 0.5 + (count / maxColorCount) * 0.5,
                      }}
                    >
                      {color} {count}
                    </span>
                  ))}
              </div>
            </div>
          )}

          {missing.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-1.5">
                <Sparkles size={16} strokeWidth={2} className="text-ink" />
                <p className="text-sm font-medium text-ink-soft">
                  부족한 아이템 추천
                </p>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {[...missing]
                  .sort((a, b) => a.priority - b.priority)
                  .map((item) => (
                    <Card key={item.category} tone="cream">
                      <div className="flex items-center justify-between">
                        <p className="text-[15px] font-semibold text-ink">
                          {item.category}
                        </p>
                        <span className="rounded-full bg-cream-deep px-2 py-0.5 text-xs text-ink-soft">
                          우선순위 {item.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink-soft">
                        {item.reason}
                      </p>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {!isLoading &&
            categoryEntries.length === 0 &&
            missing.length === 0 && (
              <p className="mt-10 text-center text-sm text-gray-text">
                아직 분석할 옷이 없어요. 옷을 먼저 등록해 보세요.
              </p>
            )}
        </>
      )}
    </div>
  );
}
