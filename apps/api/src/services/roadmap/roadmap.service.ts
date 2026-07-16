// apps/api/src/services/roadmap/roadmap.service.ts

import { PrismaClient } from '@prisma/client';
import { RoadmapData, RoadmapItem, RoadmapPriority } from '../../types';

const prisma = new PrismaClient();

interface CatalogEntry {
  itemName: string;
  estimatedPriceKrw: number;
  colorName: string;
}

// 색상 팔레트는 FE1 옷장 화면(CLOSET_COLORS)과 동일하게 유지
const COLOR_HEX: Record<string, string> = {
  블랙: '#1c1b19',
  화이트: '#ffffff',
  그레이: '#a8a49c',
  베이지: '#d8c3a0',
  브라운: '#8a5a3b',
  네이비: '#33456b',
  그린: '#4c6b4f',
};

// 실제 상품 카탈로그/쇼핑 API 연동 전까지 쓰는 큐레이션 후보 목록 (카테고리별)
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

const REASON_BY_PRIORITY: Record<RoadmapPriority, (category: string) => string> = {
  high: (category) => `옷장에 ${category} 아이템이 없어요. 활용도가 가장 높아요.`,
  medium: (category) => `보유하신 ${category} 아이템과 함께 코디하기 좋은 기본템이에요.`,
  low: () => '여유 있을 때 추가하면 코디 다양성이 좋아질 아이템이에요.',
};

interface GeneratedItem {
  category: string;
  itemName: string;
  estimatedPriceKrw: number;
  priority: RoadmapPriority;
  reason: string;
  recommendedColorName: string | null;
  recommendedColorHex: string | null;
  order: number;
}

export class RoadmapService {
  // 옷장 부족 카테고리 + 예산을 바탕으로 추천 아이템 목록 생성 (아직 미저장)
  private buildCandidates(categoryCounts: Record<string, number>): GeneratedItem[] {
    const items: GeneratedItem[] = [];

    CATEGORIES.forEach((category) => {
      const count = categoryCounts[category] || 0;
      let priority: RoadmapPriority | null = null;
      if (count === 0) priority = 'high';
      else if (count === 1) priority = 'medium';
      else if (count === 2) priority = 'low';
      // count >= 3인 카테고리는 이미 충분히 보유했다고 보고 추천에서 제외

      if (!priority) return;

      const candidates = CATALOG[category];
      if (!candidates || candidates.length === 0) return;
      const picked = candidates[0];

      items.push({
        category,
        itemName: picked.itemName,
        estimatedPriceKrw: picked.estimatedPriceKrw,
        priority,
        reason: REASON_BY_PRIORITY[priority](category),
        recommendedColorName: picked.colorName,
        recommendedColorHex: COLOR_HEX[picked.colorName] ?? null,
        order: 0,
      });
    });

    const priorityRank: Record<RoadmapPriority, number> = { high: 0, medium: 1, low: 2 };
    items.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
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

    const categoryCounts: Record<string, number> = {};
    closetItems.forEach((item) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    const candidates = this.buildCandidates(categoryCounts);

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
