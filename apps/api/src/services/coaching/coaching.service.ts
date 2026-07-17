// apps/api/src/services/coaching/coaching.service.ts

import { PrismaClient, ClosetItem as PrismaClosetItem } from '@prisma/client';
import { CoordiEvaluationResult, CoordiRecommendation } from '../../types';

const prisma = new PrismaClient();

const NEUTRAL_COLORS = ['블랙', '화이트', '그레이', '베이지', '네이비'];

// 퍼스널컬러 4계절 12톤별 추천 색상 — apps/web/src/types/closet.ts의 CLOSET_COLORS와 이름을 맞춤
const TONE_COLORS: Record<string, string[]> = {
  '봄 라이트': ['피치', '라이트 옐로우', '라이트 핑크', '아이보리', '페일 핑크'],
  '봄 브라이트': ['오렌지', '레드', '라이트 그린', '옐로우', '라이트 오렌지'],
  '봄 트루': ['오렌지', '레드', '옐로우', '카멜', '라이트 오렌지'],
  '여름 라이트': ['스카이 블루', '라벤더', '라이트 핑크', '페일 핑크'],
  '여름 뮤트': ['다크핑크', '민트', '라이트 그레이', '그레이'],
  '여름 브라이트': ['다크핑크', '핑크', '블루', '퍼플'],
  '가을 뮤트': ['베이지', '샌드', '카키', '올리브 그린', '다크 베이지'],
  '가을 딥': ['버건디', '다크 브라운', '다크 그린', '딥레드'],
  '가을 스트롱': ['브릭', '오렌지', '머스타드', '카멜'],
  '겨울 브라이트': ['다크핑크', '블루', '옐로우', '퍼플'],
  '겨울 딥': ['다크 네이비', '버건디', '딥레드', '다크 브라운'],
  '겨울 클리어': ['화이트', '블랙', '실버'],
};

// 세부 12톤을 알 수 없을 때(예전 데이터의 "웜톤"/"쿨톤"만 있는 경우 등) 대비한 계절/톤 단위 폴백
const SEASON_FALLBACK_COLORS: Record<string, string[]> = {
  봄: TONE_COLORS['봄 트루'],
  여름: TONE_COLORS['여름 라이트'],
  가을: TONE_COLORS['가을 뮤트'],
  겨울: TONE_COLORS['겨울 브라이트'],
};
const WARM_FALLBACK_COLORS = [...TONE_COLORS['봄 트루'], ...TONE_COLORS['가을 뮤트']];
const COOL_FALLBACK_COLORS = [...TONE_COLORS['여름 라이트'], ...TONE_COLORS['겨울 브라이트']];

function resolveToneColors(personalColor: string): { label: string; colors: string[] } | null {
  const matchedTone = Object.keys(TONE_COLORS).find((tone) => personalColor.includes(tone));
  if (matchedTone) return { label: matchedTone, colors: TONE_COLORS[matchedTone] };

  const matchedSeason = Object.keys(SEASON_FALLBACK_COLORS).find((season) =>
    personalColor.includes(season),
  );
  if (matchedSeason) return { label: matchedSeason, colors: SEASON_FALLBACK_COLORS[matchedSeason] };

  if (personalColor.includes('웜')) return { label: '웜톤', colors: WARM_FALLBACK_COLORS };
  if (personalColor.includes('쿨')) return { label: '쿨톤', colors: COOL_FALLBACK_COLORS };

  return null;
}

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
    const tone = resolveToneColors(personalColor);
    if (tone) {
      const toneMatch = [...colors].some((c) => tone.colors.includes(c));
      if (toneMatch) {
        score += 10;
        strengths.push(`퍼스널컬러(${tone.label})와 잘 어울리는 컬러가 포함됐어요`);
      } else {
        improvements.push(
          `퍼스널컬러(${tone.label})에 어울리는 ${tone.colors.slice(0, 3).join('·')} 계열을 더하면 더 화사해 보여요`,
        );
      }
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
