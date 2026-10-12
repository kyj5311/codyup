import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Layers, Shirt, Sparkles } from "lucide-react";
import Card from "../../components/Card";
import {
  fetchClosetAnalysis,
  fetchMissingClosetItems,
} from "../../api/closet-api";
import {
  fetchAiClosetSummary,
  fetchUsableCoordis,
  type UsableCoordi,
} from "../../api/closet-insight-api";
import {
  MOCK_CLOSET_ANALYSIS,
  MOCK_MISSING_ITEMS,
} from "../../utils/mock-closet-data";
import type { ClosetAnalysis, MissingClosetItem } from "../../types/closet";

interface ClosetAnalysisViewProps {
  onBack: () => void;
  // 지정하면 "활용 가능한 코디" 섹션을 눌렀을 때 코디 코칭(추천 탭)으로 이동.
  onNavigateToRecommendation?: () => void;
}

const CATEGORY_BAR_COLOR = "#f0c452";

export default function ClosetAnalysisView({
  onBack,
  onNavigateToRecommendation,
}: ClosetAnalysisViewProps) {
  const [analysis, setAnalysis] = useState<ClosetAnalysis | null>(null);
  const [missing, setMissing] = useState<MissingClosetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMockData, setIsMockData] = useState(false);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  // 카테고리를 1개씩만 채워도 100%였던 예전 방식 대신, 코디 규칙 점수 시스템 기준
  // "지금 옷장으로 만들 수 있는 최고 코디 점수"를 완성도로 사용 (BE2 /coaching/closet-summary)
  const [completenessScore, setCompletenessScore] = useState<number | null>(null);
  const [usableCoordis, setUsableCoordis] = useState<UsableCoordi[]>([]);

  useEffect(() => {
    let isMounted = true;

    // 옷장 완성도 / 부족한 아이템 — BE1 연동: GET /closet/analysis, GET /closet/missing
    Promise.all([fetchClosetAnalysis(), fetchMissingClosetItems()])
      .then(([analysisRes, missingRes]) => {
        if (!isMounted) return;
        const analysisOk = analysisRes.success && analysisRes.data;
        const missingOk = missingRes.success && missingRes.data;

        if (analysisOk) setAnalysis(analysisRes.data);
        if (missingOk) setMissing(missingRes.data ?? []);

        if (!analysisOk && !missingOk) {
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

    // AI 종합 분석 / 옷장 완성도 점수 — BE2 연동: GET /coaching/closet-summary
    fetchAiClosetSummary()
      .then((res) => {
        if (!isMounted || !res.success || !res.data) return;
        setAiSummary(res.data.summary);
        setCompletenessScore(res.data.completenessScore);
      })
      .catch(() => {
        // BE2 엔드포인트 연결 실패 — 화면엔 "준비 중"으로 안내
      });

    fetchUsableCoordis()
      .then((res) => {
        if (isMounted && res.success && res.data) setUsableCoordis(res.data);
      })
      .catch(() => {
        // BE2 엔드포인트 준비 전 — 화면엔 "준비 중"으로 안내
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

  // 활용 가능한 코디 추천은 상의·하의가 하나씩은 있어야 조합이 나옴 —
  // 둘 중 하나라도 없어서 빈 배열이 온 것인지, 진짜 준비 중인지 구분해서 안내
  const hasTopsAndBottoms =
    (analysis?.categoryCounts["상의"] ?? 0) > 0 &&
    (analysis?.categoryCounts["하의"] ?? 0) > 0;

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
          AI 옷장 분석 결과
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
        <div className="mt-4 flex flex-col gap-5">
          {/* 1. 옷장 완성도 */}
          <section>
            <div className="flex items-center gap-1.5">
              <Layers size={16} strokeWidth={2} className="text-ink" />
              <p className="text-sm font-semibold text-ink-soft">
                옷장 완성도
              </p>
            </div>
            <Card tone="yellow" className="mt-2">
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-bold text-ink">
                  {completenessScore === null ? (
                    "–"
                  ) : (
                    <>
                      {completenessScore}
                      <span className="text-base font-medium text-ink-soft">%</span>
                    </>
                  )}
                </p>
                <p className="text-sm text-ink-soft">
                  등록된 옷 {analysis?.totalItems ?? 0}개
                </p>
              </div>
              <p className="mt-1 text-xs text-gray-text">
                {completenessScore !== null && !hasTopsAndBottoms
                  ? "상의·하의를 하나씩 등록하면 완성도를 확인할 수 있어요"
                  : "지금 옷장으로 만들 수 있는 최고 코디 점수예요"}
              </p>

              {categoryEntries.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {categoryEntries.map(([category, count]) => (
                    <div key={category} className="flex items-center gap-3">
                      <span className="w-14 shrink-0 text-xs text-ink">
                        {category}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-pill bg-cream">
                        <div
                          className="h-full rounded-pill"
                          style={{
                            width: `${(count / maxCategoryCount) * 100}%`,
                            backgroundColor: CATEGORY_BAR_COLOR,
                          }}
                        />
                      </div>
                      <span className="w-5 shrink-0 text-right text-xs text-ink-soft">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>

          {/* 2. AI 종합 분석 */}
          <section>
            <div className="flex items-center gap-1.5">
              <Sparkles size={16} strokeWidth={2} className="text-ink" />
              <p className="text-sm font-semibold text-ink-soft">
                AI 종합 분석
              </p>
            </div>
            <Card tone="cream" className="mt-2">
              {aiSummary ? (
                <p className="text-[15px] leading-relaxed text-ink">
                  {aiSummary}
                </p>
              ) : (
                <p className="text-sm text-gray-text">
                  AI 종합 분석은 준비 중이에요. 곧 만나보실 수 있어요.
                </p>
              )}
            </Card>
          </section>

          {/* 3. 활용 가능한 코디 — 누르면 코디 코칭(추천 탭)으로 이동 */}
          <button
            type="button"
            onClick={onNavigateToRecommendation}
            disabled={!onNavigateToRecommendation}
            className="block w-full text-left"
          >
            <section>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shirt size={16} strokeWidth={2} className="text-ink" />
                  <p className="text-sm font-semibold text-ink-soft">
                    활용 가능한 코디
                  </p>
                </div>
                {onNavigateToRecommendation && (
                  <ChevronRight size={16} strokeWidth={2} className="text-ink-soft" />
                )}
              </div>
              {usableCoordis.length > 0 ? (
                <div className="mt-2 flex flex-col gap-2">
                  {usableCoordis.map((coordi) => (
                    <Card key={coordi.id} tone="cream">
                      <p className="text-[15px] font-medium text-ink">
                        {coordi.title}
                      </p>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card tone="cream" className="mt-2">
                  <p className="text-sm text-gray-text">
                    {hasTopsAndBottoms
                      ? "활용 가능한 코디 추천은 준비 중이에요. 곧 만나보실 수 있어요."
                      : "상의·하의를 하나씩 등록하면 AI가 활용 가능한 코디를 추천해드려요."}
                  </p>
                </Card>
              )}
            </section>
          </button>

          {/* 4. 부족한 아이템 */}
          {missing.length > 0 && (
            <section>
              <div className="flex items-center gap-1.5">
                <Sparkles size={16} strokeWidth={2} className="text-ink" />
                <p className="text-sm font-semibold text-ink-soft">
                  부족한 아이템
                </p>
              </div>
              <div className="mt-2 flex flex-col gap-2">
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
            </section>
          )}
        </div>
      )}
    </div>
  );
}
