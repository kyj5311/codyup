// apps/api/src/services/roadmap/roadmap.service.ts

import { PrismaClient } from '@prisma/client';
import { RoadmapData, RoadmapItem, RoadmapPriority } from '../../types';
import { COLOR_HEX, evaluateCombo, GENERIC_COMPLETION_STRENGTH, resolveBodyTypeRule, type ScorableItem } from '../coaching/coordi-scoring';

const prisma = new PrismaClient();

interface CatalogEntry {
  itemName: string;
  estimatedPriceKrw: number;
  colorName: string;
}

// 실제 상품 카탈로그/쇼핑 API 연동 전까지 쓰는 큐레이션 후보 목록 (카테고리별)
// 색상은 coaching/coordi-scoring의 COLOR_HEX 팔레트 이름과 맞춰야 점수 계산에 반영됨
const CATALOG: Record<string, CatalogEntry[]> = {
  상의: [
    { itemName: '기본 니트', estimatedPriceKrw: 45000, colorName: '그레이' },
    { itemName: '옥스포드 셔츠', estimatedPriceKrw: 39000, colorName: '화이트' },
  ],
  하의: [
    { itemName: '슬랙스', estimatedPriceKrw: 59000, colorName: '네이비' },
    { itemName: '스트레이트 데님', estimatedPriceKrw: 69000, colorName: '블랙' },
  ],
  아우터: [
    { itemName: '트렌치코트', estimatedPriceKrw: 120000, colorName: '베이지' },
    { itemName: '울 코트', estimatedPriceKrw: 150000, colorName: '블랙' },
  ],
  신발: [
    { itemName: '스니커즈', estimatedPriceKrw: 89000, colorName: '화이트' },
    { itemName: '로퍼', estimatedPriceKrw: 79000, colorName: '브라운' },
  ],
  악세서리: [
    { itemName: '가죽 벨트', estimatedPriceKrw: 35000, colorName: '블랙' },
  ],
};

const CATEGORIES = ['상의', '하의', '아우터', '신발', '악세서리'];

interface GeneratedItem {
  category: string;
  itemName: string;
  estimatedPriceKrw: number;
  priority: RoadmapPriority;
  reason: string;
  recommendedColorName: string | null;
  recommendedColorHex: string | null;
  order: number;
  // 정렬용 — DB에는 저장하지 않음(우선순위 계산 후 order로 확정)
  scoreDelta: number;
}

const FITTABLE_CATEGORIES = ['상의', '하의', '아우터'] as const;
type FittableCategory = (typeof FITTABLE_CATEGORIES)[number];

// 옷장 아이템만으로(구매 없이) 만들 수 있는 상의+하의(+아우터/신발) 조합 중 최고 점수 —
// coaching의 evaluateCombo와 동일한 "코디 규칙" 점수 시스템을 그대로 재사용
function bestAchievableScore(
  items: ScorableItem[],
  personalColor: string | null,
  bodyType: string | null,
): number {
  const tops = items.filter((i) => i.category === '상의');
  const bottoms = items.filter((i) => i.category === '하의');
  if (tops.length === 0 || bottoms.length === 0) return 0;

  const outers: Array<ScorableItem | null> = [null, ...items.filter((i) => i.category === '아우터')];
  const shoes: Array<ScorableItem | null> = [null, ...items.filter((i) => i.category === '신발')];

  let best = 0;
  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const outer of outers) {
        for (const shoe of shoes) {
          const combo = [top, bottom, outer, shoe].filter((i): i is ScorableItem => i !== null);
          best = Math.max(best, evaluateCombo(combo, personalColor, bodyType).score);
        }
      }
    }
  }
  return best;
}

// 아직 사지 않은 후보 아이템을 옷장에 더했을 때 달성 가능한 최고 점수 —
// 후보는 자기 카테고리 슬롯에 고정하고 나머지 슬롯은 기존 옷장에서 최적 조합을 탐색
function bestScoreWithCandidate(
  candidate: ScorableItem,
  category: string,
  items: ScorableItem[],
  personalColor: string | null,
  bodyType: string | null,
): { score: number; strengths: string[] } {
  const tops = category === '상의' ? [candidate] : items.filter((i) => i.category === '상의');
  const bottoms = category === '하의' ? [candidate] : items.filter((i) => i.category === '하의');
  const outers: Array<ScorableItem | null> =
    category === '아우터' ? [candidate] : [null, ...items.filter((i) => i.category === '아우터')];
  const shoes: Array<ScorableItem | null> =
    category === '신발' ? [candidate] : [null, ...items.filter((i) => i.category === '신발')];
  const accessory = category === '악세서리' ? candidate : null;

  if (tops.length === 0 || bottoms.length === 0) return { score: 0, strengths: [] };

  let best = 0;
  let bestStrengths: string[] = [];
  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const outer of outers) {
        for (const shoe of shoes) {
          const combo = [top, bottom, outer, shoe, accessory].filter(
            (i): i is ScorableItem => i !== null,
          );
          const result = evaluateCombo(combo, personalColor, bodyType);
          if (result.score > best) {
            best = result.score;
            bestStrengths = result.strengths;
          }
        }
      }
    }
  }
  return { score: best, strengths: bestStrengths };
}

// 후보 아이템 구매 시 이상적인 핏·기장을 가정 — 체형 규칙에서 해당 카테고리의 1순위 선호값을 사용
function buildVirtualItem(category: string, entry: CatalogEntry, bodyType: string | null): ScorableItem {
  const rule = bodyType ? resolveBodyTypeRule(bodyType) : null;
  const categoryRule =
    rule && (FITTABLE_CATEGORIES as readonly string[]).includes(category)
      ? rule[category as FittableCategory]
      : null;

  return {
    category,
    color: entry.colorName,
    fit: categoryRule?.preferredFits[0] ?? null,
    length: categoryRule?.preferredLengths[0] ?? null,
    isFavorite: false,
  };
}

export class RoadmapService {
  // 코디 점수 시스템(coaching의 evaluateCombo) 기준으로, 지금 옷장에 더했을 때
  // 코디 점수를 실제로 올려주는 아이템만 골라 추천 목록 생성 (아직 미저장)
  // — 카테고리별 보유 개수만 보던 예전 방식은 "옷장이 이미 꽉 차 있으면 추천이 하나도 안 뜨는"
  //   문제가 있었음. 지금은 개수와 무관하게 "이 아이템을 사면 코디 점수가 얼마나 오르는지"로 판단.
  private buildCandidates(
    closetItems: ScorableItem[],
    personalColor: string | null,
    bodyType: string | null,
  ): GeneratedItem[] {
    const baseline = bestAchievableScore(closetItems, personalColor, bodyType);
    const items: GeneratedItem[] = [];

    CATEGORIES.forEach((category) => {
      const candidates = CATALOG[category];
      if (!candidates || candidates.length === 0) return;

      // 카테고리 안에서는 점수를 가장 많이 올려주는 후보 하나만 추천
      let bestPick: CatalogEntry | null = null;
      let bestScore = -1;
      let bestStrengths: string[] = [];

      candidates.forEach((entry) => {
        const virtualItem = buildVirtualItem(category, entry, bodyType);
        const { score, strengths } = bestScoreWithCandidate(
          virtualItem,
          category,
          closetItems,
          personalColor,
          bodyType,
        );
        if (score > bestScore) {
          bestScore = score;
          bestPick = entry;
          bestStrengths = strengths;
        }
      });

      if (!bestPick) return;
      const delta = bestScore - baseline;
      if (delta <= 0) return; // 이미 있는 옷만으로도 이만큼은 나와서 굳이 살 필요 없음

      const priority: RoadmapPriority = baseline === 0 || delta >= 15 ? 'high' : delta >= 5 ? 'medium' : 'low';

      const specificStrengths = bestStrengths.filter((s) => s !== GENERIC_COMPLETION_STRENGTH);
      const highlight = specificStrengths[0];
      const reason =
        baseline === 0
          ? `옷장에 ${category} 조합이 아직 없어요. 이 아이템으로 코디를 완성할 수 있어요.`
          : highlight
            ? `${highlight} (코디 점수 ${baseline}점 → ${bestScore}점으로 올라가요)`
            : `이 아이템을 더하면 코디 점수가 최대 ${bestScore}점까지 올라가요 (현재 ${baseline}점)`;

      const picked = bestPick as CatalogEntry;
      items.push({
        category,
        itemName: picked.itemName,
        estimatedPriceKrw: picked.estimatedPriceKrw,
        priority,
        reason,
        recommendedColorName: picked.colorName,
        recommendedColorHex: COLOR_HEX[picked.colorName] ?? null,
        order: 0,
        scoreDelta: delta,
      });
    });

    const priorityRank: Record<RoadmapPriority, number> = { high: 0, medium: 1, low: 2 };
    items.sort(
      (a, b) => priorityRank[a.priority] - priorityRank[b.priority] || b.scoreDelta - a.scoreDelta,
    );
    items.forEach((item, index) => {
      item.order = index;
    });

    return items;
  }

  // 유저의 활성 로드맵을 최신 옷장 상태로 재생성하되, 기존 구매완료 체크는 보존
  async generateAndPersist(userId: number): Promise<RoadmapData> {
    const [user, closetItems] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.closetItem.findMany({ where: { userId } }),
    ]);

    const monthlyBudgetKrw = user?.monthlyBudget ?? 0;

    const candidates = this.buildCandidates(
      closetItems,
      user?.personalColor ?? null,
      user?.bodyType ?? null,
    );

    let roadmap = await prisma.purchaseRoadmap.findFirst({
      where: { userId, status: 'active' },
      include: { items: true },
    });

    if (!roadmap) {
      roadmap = await prisma.purchaseRoadmap.create({
        data: { userId, totalBudget: monthlyBudgetKrw, status: 'active' },
        include: { items: true },
      });
    } else if (roadmap.totalBudget !== monthlyBudgetKrw) {
      await prisma.purchaseRoadmap.update({
        where: { id: roadmap.id },
        data: { totalBudget: monthlyBudgetKrw },
      });
    }

    // 기존 아이템의 구매완료 여부를 (category, itemName) 기준으로 이어받음
    const previousPurchased = new Map<string, boolean>();
    roadmap.items.forEach((item) => {
      previousPurchased.set(`${item.category}::${item.itemName}`, item.isPurchased);
    });

    await prisma.roadmapItem.deleteMany({ where: { roadmapId: roadmap.id } });

    const created = await Promise.all(
      candidates.map((candidate) =>
        prisma.roadmapItem.create({
          data: {
            roadmapId: roadmap!.id,
            category: candidate.category,
            itemName: candidate.itemName,
            estimatedPriceKrw: candidate.estimatedPriceKrw,
            priority: candidate.priority,
            reason: candidate.reason,
            recommendedColorName: candidate.recommendedColorName,
            recommendedColorHex: candidate.recommendedColorHex,
            order: candidate.order,
            isPurchased: previousPurchased.get(`${candidate.category}::${candidate.itemName}`) ?? false,
          },
        }),
      ),
    );

    return this.toRoadmapData(monthlyBudgetKrw, created);
  }

  async getOrCreateForUser(userId: number): Promise<RoadmapData> {
    return this.generateAndPersist(userId);
  }

  async toggleItemPurchased(
    userId: number,
    itemId: number,
    isPurchased: boolean,
  ): Promise<RoadmapItem | null> {
    const item = await prisma.roadmapItem.findFirst({
      where: { id: itemId, roadmap: { userId } },
    });
    if (!item) return null;

    const updated = await prisma.roadmapItem.update({
      where: { id: itemId },
      data: { isPurchased, purchasedAt: isPurchased ? new Date() : null },
    });

    return this.toRoadmapItem(updated);
  }

  private toRoadmapData(monthlyBudgetKrw: number, items: Array<Awaited<ReturnType<typeof prisma.roadmapItem.create>>>): RoadmapData {
    const sorted = [...items].sort((a, b) => a.order - b.order);

    let allocatedKrw = 0;
    const priorityRank: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const inBudgetOrder = [...sorted].sort(
      (a, b) => (priorityRank[a.priority] ?? 3) - (priorityRank[b.priority] ?? 3),
    );
    inBudgetOrder.forEach((item) => {
      if (monthlyBudgetKrw > 0 && allocatedKrw + item.estimatedPriceKrw <= monthlyBudgetKrw) {
        allocatedKrw += item.estimatedPriceKrw;
      }
    });

    return {
      summary: {
        monthlyBudgetKrw,
        allocatedKrw,
        remainingKrw: Math.max(0, monthlyBudgetKrw - allocatedKrw),
      },
      items: sorted.map((item) => this.toRoadmapItem(item)),
    };
  }

  private toRoadmapItem(item: Awaited<ReturnType<typeof prisma.roadmapItem.create>>): RoadmapItem {
    return {
      id: item.id,
      category: item.category,
      itemName: item.itemName,
      estimatedPriceKrw: item.estimatedPriceKrw,
      priority: item.priority as RoadmapPriority,
      reason: item.reason,
      recommendedColor: item.recommendedColorName
        ? { name: item.recommendedColorName, hex: item.recommendedColorHex ?? '#000000' }
        : null,
      isPurchased: item.isPurchased,
    };
  }
}
