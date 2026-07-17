// apps/api/src/services/coaching/coaching.service.ts

import { PrismaClient, ClosetItem as PrismaClosetItem } from '@prisma/client';
import { CoordiEvaluationResult, CoordiRecommendation } from '../../types';

const prisma = new PrismaClient();

const NEUTRAL_COLORS = ['블랙', '화이트', '그레이', '베이지', '네이비'];
const WARM_COLORS = ['베이지', '브라운'];
const COOL_COLORS = ['네이비', '그린', '그레이'];

interface ScoredCombo {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
}

// 코디의 기본 골격 — 상의·하의·신발을 모두 갖춰야 기본 점수(60점)를 다 받을 수 있음
const CORE_CATEGORIES = ['상의', '하의', '신발'];

function evaluateCombo(items: PrismaClosetItem[], personalColor: string | null): ScoredCombo {
  const categories = new Set(items.map((i) => i.category));
  const colors = new Set(items.map((i) => i.color));
  const strengths: string[] = [];
  const improvements: string[] = [];

  const presentCoreCount = CORE_CATEGORIES.filter((c) => categories.has(c)).length;
  let score = Math.round((presentCoreCount / CORE_CATEGORIES.length) * 60);

  if (presentCoreCount === CORE_CATEGORIES.length) {
    strengths.push('상의·하의·신발을 모두 갖춘 완성도 높은 코디예요');
  } else {
    const missingCore = CORE_CATEGORIES.filter((c) => !categories.has(c));
    improvements.push(`${missingCore.join('·')}이(가) 빠져 있어요. 셋을 모두 갖추면 기본 점수가 올라가요`);
  }

  if (categories.has('아우터')) {
    score += 10;
    strengths.push('아우터까지 더해져서 스타일링이 풍성해요');
  }

  if (colors.size <= 2) {
    score += 10;
    strengths.push('색상 조합이 깔끔하고 통일감 있어요');
  } else if (colors.size >= 4) {
    score -= 10;
    improvements.push('색상이 너무 다양해서 산만해 보일 수 있어요. 1~2가지 컬러로 정리해보세요');
  }

  const hasNeutral = [...colors].some((c) => NEUTRAL_COLORS.includes(c));
  if (hasNeutral) {
    score += 5;
  } else {
    improvements.push('무채색(블랙/화이트/그레이) 아이템을 하나 더하면 밸런스가 좋아져요');
  }

  if (personalColor) {
    const isWarm = personalColor.includes('웜');
    const isCool = personalColor.includes('쿨');
    const warmMatch = [...colors].some((c) => WARM_COLORS.includes(c));
    const coolMatch = [...colors].some((c) => COOL_COLORS.includes(c));

    if (isWarm && warmMatch) {
      score += 10;
      strengths.push('퍼스널컬러(웜톤)와 잘 어울리는 따뜻한 컬러가 포함됐어요');
    } else if (isWarm && !warmMatch) {
      improvements.push('웜톤이시라면 베이지·브라운 계열을 더하면 얼굴이 화사해 보여요');
    }

    if (isCool && coolMatch) {
      score += 10;
      strengths.push('퍼스널컬러(쿨톤)와 잘 어울리는 차분한 컬러가 포함됐어요');
    } else if (isCool && !coolMatch) {
      improvements.push('쿨톤이시라면 네이비·그레이 계열을 더하면 톤이 더 살아나요');
    }
  }

  if (items.some((i) => i.isFavorite)) {
    score += 3;
    strengths.push('평소 즐겨 입는 아이템이 포함돼서 만족도가 높을 거예요');
  }

  score = Math.max(0, Math.min(100, score));

  const summary =
    score >= 80
      ? '전체적으로 조화로운 코디예요!'
      : score >= 60
        ? '괜찮은 조합이지만 다듬을 부분이 있어요.'
        : '몇 가지 포인트를 보완하면 훨씬 좋아질 거예요.';

  return { score, summary, strengths, improvements };
}

export class CoachingService {
  async evaluateCoordi(userId: number, closetItemIds: number[]): Promise<CoordiEvaluationResult | null> {
    const items = await prisma.closetItem.findMany({
      where: { userId, id: { in: closetItemIds } },
    });
    if (items.length === 0) return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const result = evaluateCombo(items, user?.personalColor ?? null);

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

  async getRecommendations(userId: number): Promise<CoordiRecommendation[]> {
    const [user, items] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.closetItem.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const byCategory = (category: string) =>
      items
        .filter((i) => i.category === category)
        .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite))
        .slice(0, 2);

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
      ...evaluateCombo(combo, user?.personalColor ?? null),
    }));
    scored.sort((a, b) => b.score - a.score);

    const top3 = scored.slice(0, 3);
    return top3.map((entry, index) => {
      const primaryColor = entry.combo[0]?.color ?? '';
      return {
        id: `rec-${Date.now()}-${index}`,
        title: primaryColor ? `${primaryColor} 톤 코디` : `추천 코디 ${index + 1}`,
        closetItemIds: entry.combo.map((i) => i.id),
        reason: entry.strengths[0] ?? entry.summary,
      };
    });
  }
}
