// apps/api/src/services/closet/closet.service.ts

import { PrismaClient } from '@prisma/client';
import { ClosetItem, ClosetAnalysis, MissingItemSuggestion } from '../../types';

const prisma = new PrismaClient();

export class ClosetService {
  // apps/api/src/services/closet/closet.service.ts

async createItem(userId: number, data: Omit<ClosetItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ClosetItem> {
  console.log('📝 createItem 호출됨:', { userId, data });  // ✅ 로그 추가!
  
  try {
    const item = await prisma.closetItem.create({
      data: {
        userId,
        imageUrl: data.imageUrl,
        category: data.category,
        color: data.color,
        brand: data.brand,
        memo: data.memo,
        isFavorite: data.isFavorite ?? false,
      },
    });
    return this.toClosetItem(item);
  } catch (error) {
    console.error('❌ Prisma 에러:', error);  // ✅ 에러 로그 추가!
    throw error;
  }
}

  async getItemsByUser(userId: number): Promise<ClosetItem[]> {
    const items = await prisma.closetItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return items.map(this.toClosetItem);
  }

  async getItemById(id: number, userId: number): Promise<ClosetItem | null> {
    const item = await prisma.closetItem.findFirst({
      where: { id, userId },
    });
    return item ? this.toClosetItem(item) : null;
  }

  async updateItem(id: number, userId: number, data: Partial<Omit<ClosetItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<ClosetItem | null> {
    const item = await prisma.closetItem.updateMany({
      where: { id, userId },
      data: {
        imageUrl: data.imageUrl,
        category: data.category,
        color: data.color,
        brand: data.brand,
        memo: data.memo,
        isFavorite: data.isFavorite,
      },
    });
    if (item.count === 0) return null;
    return this.getItemById(id, userId);
  }

  async deleteItem(id: number, userId: number): Promise<boolean> {
    const result = await prisma.closetItem.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }

  async analyzeCloset(userId: number): Promise<ClosetAnalysis> {
    const items = await prisma.closetItem.findMany({
      where: { userId },
    });

    const categoryCounts: Record<string, number> = {};
    const colorCounts: Record<string, number> = {};

    items.forEach((item) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      colorCounts[item.color] = (colorCounts[item.color] || 0) + 1;
    });

    const requiredCategories = ['상의', '하의', '아우터', '신발'];
    const missingCategories = requiredCategories.filter(
      (cat) => !categoryCounts[cat] || categoryCounts[cat] === 0
    );

    return {
      totalItems: items.length,
      categoryCounts,
      colorCounts,
      missingCategories,
    };
  }

  async getMissingItems(userId: number): Promise<MissingItemSuggestion[]> {
    const analysis = await this.analyzeCloset(userId);
    const suggestions: MissingItemSuggestion[] = [];

    const priorityMap: Record<string, number> = {
      상의: 1,
      하의: 2,
      아우터: 3,
      신발: 4,
    };

    analysis.missingCategories.forEach((category) => {
      suggestions.push({
        category,
        reason: `${category} 아이템이 부족합니다. 코디 다양성을 위해 추가를 권장합니다.`,
        priority: priorityMap[category] || 5,
      });
    });

    suggestions.sort((a, b) => a.priority - b.priority);
    return suggestions;
  }

  private toClosetItem(item: any): ClosetItem {
    return {
      id: item.id,
      userId: item.userId,
      imageUrl: item.imageUrl,
      category: item.category,
      color: item.color,
      brand: item.brand || undefined,
      memo: item.memo || undefined,
      isFavorite: item.isFavorite,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}