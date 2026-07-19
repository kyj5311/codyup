// apps/api/src/services/coaching/coaching.service.ts

import { PrismaClient, ClosetItem as PrismaClosetItem } from '@prisma/client';
import { CoordiEvaluationResult, CoordiRecommendation, DashboardSummary } from '../../types';
import { RoadmapService } from '../roadmap/roadmap.service';
import {
  COLOR_HEX,
  evaluateCombo,
  GENERIC_COMPLETION_STRENGTH,
  resolveBodyTypeRule,
  resolveToneColors,
  type ScoredCombo,
} from './coordi-scoring';

const prisma = new PrismaClient();
const roadmapService = new RoadmapService();

// 코디 추천에서 몇 개까지 보여줄지 — 예전엔 3개로 고정돼 있었음
const RECOMMENDATION_COUNT = 6;

export class CoachingService {
  async evaluateCoordi(userId: number, closetItemIds: number[]): Promise<CoordiEvaluationResult | null> {
    const items = await prisma.closetItem.findMany({
      where: { userId, id: { in: closetItemIds } },
    });
    if (items.length === 0) return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const result = evaluateCombo(items, user?.personalColor ?? null, user?.bodyType ?? null);

    return {
      id: `eval-${Date.now()}`,
      closetItemIds: items.map((i) => i.id),
      score: result.score,
      summary: result.summary,
      strengths: result.strengths,
      improvements: result.improvements,
      evaluatedAt: new Date().toISOString(),
    };
  }

  // 옷장에서 상의·하의(+아우터/신발) 조합을 만들고 점수순으로 정렬한 뒤,
  // 상의·하의 조합이 겹치지 않는 상위 N개를 뽑음 (추천/오늘의 코디에서 공용으로 사용)
  private async computeTopCombos(
    userId: number,
  ): Promise<Array<{ combo: PrismaClosetItem[] } & ScoredCombo>> {
    const [user, items] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.closetItem.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    // 카테고리별 후보 아이템 — 예전엔 색상 다양성을 위해 카테고리당 상위 3개로 제한했는데,
    // 그러면 후보 풀 밖의 아이템으로만 만들 수 있는 진짜 최고점 조합이 추천에서 아예 빠지는
    // 문제가 있었음(예: 90점 조합이 후보 제한 때문에 75점 조합에 밀려 안 보임).
    // 옷장 규모가 작아(카테고리당 수십 벌 이하) 전체 조합을 다 계산해도 충분히 빠르므로
    // 후보를 제한하지 않고 전부 사용 — 최종 3개 노출 시의 색상 다양성은 아래 선정 로직이 담당.
    const byCategory = (category: string) => items.filter((i) => i.category === category);

    const tops = byCategory('상의');
    const bottoms = byCategory('하의');
    if (tops.length === 0 || bottoms.length === 0) return [];

    const outers = [null, ...byCategory('아우터')];
    const shoes = [null, ...byCategory('신발')];

    const candidates: PrismaClosetItem[][] = [];
    for (const top of tops) {
      for (const bottom of bottoms) {
        for (const outer of outers) {
          for (const shoe of shoes) {
            const combo = [top, bottom, outer, shoe].filter(
              (i): i is PrismaClosetItem => i !== null,
            );
            candidates.push(combo);
          }
        }
      }
    }

    const scored = candidates.map((combo) => ({
      combo,
      ...evaluateCombo(combo, user?.personalColor ?? null, user?.bodyType ?? null),
    }));
    scored.sort((a, b) => b.score - a.score);

    // 상위 점수만 뽑으면 상의+하의 조합이 똑같고 아우터/신발만 다른 경우가 많아
    // 추천이 거의 똑같아 보임 — 상의 색상이 겹치지 않는 조합을 최우선으로,
    // 그다음 상의·하의 조합 자체가 겹치지 않는 것 위주로 다양성 확보
    const selected: typeof scored = [];
    const usedPairs = new Set<string>();
    const usedTopColors = new Set<string>();

    for (const entry of scored) {
      if (selected.length === RECOMMENDATION_COUNT) break;
      const topItem = entry.combo.find((i) => i.category === '상의');
      const bottomItem = entry.combo.find((i) => i.category === '하의');
      const pairKey = `${topItem?.id}-${bottomItem?.id}`;
      if (usedPairs.has(pairKey)) continue;
      if (topItem && usedTopColors.has(topItem.color)) continue;
      usedPairs.add(pairKey);
      if (topItem) usedTopColors.add(topItem.color);
      selected.push(entry);
    }
    for (const entry of scored) {
      if (selected.length === RECOMMENDATION_COUNT) break;
      const topItem = entry.combo.find((i) => i.category === '상의');
      const bottomItem = entry.combo.find((i) => i.category === '하의');
      const pairKey = `${topItem?.id}-${bottomItem?.id}`;
      if (usedPairs.has(pairKey)) continue;
      usedPairs.add(pairKey);
      selected.push(entry);
    }
    for (const entry of scored) {
      if (selected.length === RECOMMENDATION_COUNT) break;
      if (!selected.includes(entry)) selected.push(entry);
    }

    return selected;
  }

  async getRecommendations(userId: number): Promise<CoordiRecommendation[]> {
    const combos = await this.computeTopCombos(userId);

    return combos.map((entry, index) => {
      const topItem = entry.combo.find((i) => i.category === '상의');
      const bottomItem = entry.combo.find((i) => i.category === '하의');
      const title =
        topItem && bottomItem
          ? `${topItem.color}·${bottomItem.color} 코디`
          : `추천 코디 ${index + 1}`;
      const composition = entry.combo.map((i) => `${i.category} ${i.color}`).join(' + ');

      // "상의·하의·신발을 모두 갖췄다"는 너무 당연한 말이라, 이유 문구에서는 그보다
      // 구체적인 강점(색상 조화·퍼스널컬러·체형 매칭·즐겨찾기 등)을 우선 사용
      const specificStrengths = entry.strengths.filter((s) => s !== GENERIC_COMPLETION_STRENGTH);
      const highlight = specificStrengths[0] ?? entry.strengths[0] ?? entry.summary;

      return {
        id: `rec-${Date.now()}-${index}`,
        title,
        score: entry.score,
        closetItemIds: entry.combo.map((i) => i.id),
        reason: `${composition} · ${highlight}`,
      };
    });
  }

  // AI 종합 분석 — 옷장 카테고리/색상 분포와 퍼스널컬러를 바탕으로 한 텍스트 인사이트
  async getClosetSummary(userId: number): Promise<{ summary: string }> {
    const [user, items] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.closetItem.findMany({ where: { userId } }),
    ]);

    if (items.length === 0) {
      return { summary: '아직 등록된 옷이 없어요. 옷을 몇 벌 등록하면 AI가 옷장을 분석해드려요.' };
    }

    const categoryCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};
    items.forEach((item) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      colorCounts[item.color] = (colorCounts[item.color] || 0) + 1;
    });

    const [topCategory] = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
    const [topColor] = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]);
    const requiredCategories = ['상의', '하의', '아우터', '신발'];
    const missing = requiredCategories.filter((c) => !categoryCounts[c]);

    const parts: string[] = [];
    parts.push(`옷장에 총 ${items.length}벌이 등록되어 있고, ${topCategory[0]}(${topCategory[1]}개)이(가) 가장 많아요.`);
    parts.push(`${topColor[0]} 계열을 자주 선택하시네요.`);

    if (missing.length > 0) {
      parts.push(`${missing.join('·')}이(가) 부족해서 코디 조합의 폭이 좁을 수 있어요.`);
    }

    if (user?.personalColor) {
      const tone = resolveToneColors(user.personalColor);
      if (tone) {
        parts.push(`퍼스널컬러(${tone.label})를 고려하면 ${tone.colors.slice(0, 3).join('·')} 계열을 더하면 더 잘 어울려요.`);
      }
    }

    if (user?.bodyType) {
      const bodyRule = resolveBodyTypeRule(user.bodyType);
      if (bodyRule) {
        parts.push(`체형(${bodyRule.label})을 고려하면 ${bodyRule.tip}. ${bodyRule.colorTip}.`);
      }
    }

    return { summary: parts.join(' ') };
  }

  // 활용 가능한 코디 — 기존 코디 추천 로직을 재사용해 화면용 요약 형태로 변환
  async getUsableCoordis(userId: number): Promise<{ id: number; title: string; itemIds: number[] }[]> {
    const recommendations = await this.getRecommendations(userId);
    return recommendations.map((rec, index) => ({
      id: index + 1,
      title: rec.title,
      itemIds: rec.closetItemIds,
    }));
  }

  // 홈 대시보드 요약 — 옷장 완성도(BE1 데이터) + 오늘의 추천 코디/다음 로드맵 아이템/최근 평가 점수(BE2 데이터)
  async getDashboardSummary(userId: number): Promise<DashboardSummary> {
    const [user, closetItems, top3, roadmap] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.closetItem.findMany({ where: { userId } }),
      this.computeTopCombos(userId),
      roadmapService.getOrCreateForUser(userId),
    ]);

    const categoryCounts: Record<string, number> = {};
    closetItems.forEach((item) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });
    const requiredCategories = ['상의', '하의', '아우터', '신발'];
    const presentCount = requiredCategories.filter((c) => categoryCounts[c]).length;
    const closetCompletionPercent = Math.round((presentCount / requiredCategories.length) * 100);

    const top = top3[0] ?? null;
    const todayCoordi = top
      ? top.combo.map((item) => ({
          id: String(item.id),
          imageUrl: item.imageUrl || null,
          colorHex: COLOR_HEX[item.color] ?? '#cccccc',
          colorName: item.color,
          label: item.category,
        }))
      : [];

    const nextRoadmapCandidate =
      roadmap.items.find((item) => !item.isPurchased) ?? roadmap.items[0] ?? null;
    const nextRoadmapItem = nextRoadmapCandidate
      ? {
          id: String(nextRoadmapCandidate.id),
          itemName: nextRoadmapCandidate.itemName,
          estimatedPriceKrw: nextRoadmapCandidate.estimatedPriceKrw,
        }
      : null;

    return {
      nickname: user?.email ? user.email.split('@')[0] : '코디업러',
      closetCompletionPercent,
      todayCoordi,
      nextRoadmapItem,
      latestEvaluationScore: top ? top.score : null,
    };
  }
}
