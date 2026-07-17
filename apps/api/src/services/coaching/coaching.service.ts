// apps/api/src/services/coaching/coaching.service.ts

import { PrismaClient, ClosetItem as PrismaClosetItem } from '@prisma/client';
import { CoordiEvaluationResult, CoordiRecommendation } from '../../types';

const prisma = new PrismaClient();

// 팔레트의 "무채색/기본" 그룹과 동일한 기준 — 색상 궁합(isNeutralHsl) 판정과 통일
const NEUTRAL_COLORS = [
  '화이트',
  '클리어',
  '라이트 그레이',
  '그레이',
  '다크 그레이',
  '블랙',
  '아이보리',
  '오트밀',
  '샌드',
  '베이지',
  '다크 베이지',
  '카키 베이지',
];

// 옷장 색상 팔레트 — apps/web/src/types/closet.ts의 CLOSET_COLORS와 이름/값을 맞춤
const COLOR_HEX: Record<string, string> = {
  화이트: '#ffffff',
  클리어: '#f5f5f0',
  '라이트 그레이': '#d4d1cb',
  그레이: '#a8a49c',
  '다크 그레이': '#6b6862',
  블랙: '#1c1b19',
  아이보리: '#f2ead9',
  오트밀: '#ded2bd',
  샌드: '#d9c7a3',
  베이지: '#d8c3a0',
  '다크 베이지': '#b89b73',
  '카키 베이지': '#ac9a72',
  '라이트 브라운': '#a97c50',
  카멜: '#c19a6b',
  브라운: '#8a5a3b',
  '다크 브라운': '#5c3d28',
  머스타드: '#d1a83b',
  카키: '#8c8552',
  '올리브 그린': '#6f7239',
  '페일 핑크': '#f2d6d6',
  '라이트 핑크': '#f0b8c2',
  핑크: '#e893a8',
  다크핑크: '#c85c78',
  피치: '#f4b393',
  '라이트 오렌지': '#f2a35c',
  오렌지: '#e8792e',
  '다크 오렌지': '#c15a1e',
  브릭: '#a8442c',
  레드: '#c62828',
  딥레드: '#8e1f1f',
  버건디: '#5e1f2e',
  라벤더: '#c3b1d9',
  퍼플: '#7c5a9e',
  '스카이 블루': '#8fc3e0',
  블루: '#3a6ea8',
  '다크 블루': '#294c73',
  네이비: '#33456b',
  '다크 네이비': '#1f2c47',
  라임: '#b5cc4e',
  '라이트 옐로우': '#f2e28a',
  옐로우: '#f0cc3c',
  '라이트 그린': '#a8cc8c',
  그린: '#4c6b4f',
  '다크 그린': '#2f4530',
  민트: '#a3d9c5',
  연청: '#a9c2d9',
  중청: '#5d84ab',
  진청: '#35547a',
  흑청: '#22334a',
  데님: '#4a6d8c',
  실버: '#c7c9cb',
  골드: '#cba135',
  로즈골드: '#d9a892',
};

interface Hsl {
  h: number;
  s: number;
  l: number;
}

function hexToHsl(hex: string): Hsl {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, l };
}

// 채도가 낮거나 극단적으로 밝고/어두운 색은 "무채색 취급" — 어떤 색과도 무난하게 어울림
function isNeutralHsl({ s, l }: Hsl): boolean {
  return s < 0.25 || l > 0.9 || l < 0.12;
}

function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

type ColorPairRelation = 'neutral' | 'harmonious' | 'bold' | 'clash';

// 색상환(Hue) 기준: 무채색은 항상 무난, 색상끼리는 각도 차이로 유사색/보색/충돌 판단
function classifyColorPair(nameA: string, nameB: string): ColorPairRelation | null {
  const hexA = COLOR_HEX[nameA];
  const hexB = COLOR_HEX[nameB];
  if (!hexA || !hexB) return null;

  const a = hexToHsl(hexA);
  const b = hexToHsl(hexB);
  if (isNeutralHsl(a) || isNeutralHsl(b)) return 'neutral';

  const diff = hueDistance(a.h, b.h);
  if (diff <= 30) return 'harmonious'; // 유사색
  if (diff >= 150) return 'bold'; // 보색 — 과감하지만 의도적이면 괜찮음
  return 'clash'; // 어중간하게 튀는 조합
}

// 퍼스널컬러 4계절 12톤별 추천 색상 — apps/web/src/types/closet.ts의 CLOSET_COLORS와 이름을 맞춤
// 실제 등록된 옷 색상 데이터 기준으로 최적화된 목록 (팀 검증 완료)
const TONE_COLORS: Record<string, string[]> = {
  '봄 라이트': ['화이트', '클리어', '아이보리', '피치', '페일 핑크', '라이트 핑크', '라이트 옐로우', '민트'],
  '봄 브라이트': ['화이트', '클리어', '라이트 오렌지', '오렌지', '옐로우', '라임', '라이트 그린', '그린'],
  '봄 트루': ['베이지', '카멜', '라이트 브라운', '머스타드', '오렌지', '옐로우', '올리브 그린', '연청', '중청', '골드'],
  '여름 라이트': ['화이트', '클리어', '라이트 그레이', '페일 핑크', '라이트 핑크', '라벤더', '스카이 블루', '연청', '실버'],
  '여름 뮤트': ['그레이', '다크 그레이', '오트밀', '샌드', '카키 베이지', '핑크', '다크핑크', '퍼플', '블루', '중청'],
  '여름 브라이트': ['화이트', '라이트 그레이', '핑크', '레드', '스카이 블루', '블루', '민트', '실버'],
  '가을 뮤트': ['오트밀', '샌드', '베이지', '다크 베이지', '카키 베이지', '라이트 브라운', '카멜', '카키', '올리브 그린', '데님'],
  '가을 딥': ['다크 베이지', '브라운', '다크 브라운', '다크 오렌지', '브릭', '버건디', '딥레드', '다크 그린', '진청', '흑청', '데님', '골드'],
  '가을 스트롱': ['카멜', '브라운', '머스타드', '오렌지', '다크 오렌지', '브릭', '레드', '올리브 그린', '중청', '골드'],
  '겨울 브라이트': ['화이트', '클리어', '블랙', '핑크', '레드', '퍼플', '블루', '라임', '실버'],
  '겨울 딥': ['다크 그레이', '블랙', '버건디', '딥레드', '다크 블루', '네이비', '다크 네이비', '다크 그린', '진청', '흑청', '데님'],
  '겨울 클리어': ['화이트', '클리어', '라이트 그레이', '블랙', '스카이 블루', '블루', '연청', '실버', '골드', '로즈골드'],
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

  const colorList = [...colors];
  if (colorList.length >= 2) {
    let clashCount = 0;
    let harmoniousCount = 0;
    for (let i = 0; i < colorList.length; i++) {
      for (let j = i + 1; j < colorList.length; j++) {
        const relation = classifyColorPair(colorList[i], colorList[j]);
        if (relation === 'clash') clashCount++;
        else if (relation === 'harmonious') harmoniousCount++;
      }
    }

    if (clashCount === 0) {
      score += 10;
      strengths.push(
        harmoniousCount > 0
          ? '색상끼리 색상환 기준으로도 잘 어우러져요'
          : '무채색 위주라 어떤 조합이든 무난하게 어울려요',
      );
    } else {
      score -= Math.min(15, clashCount * 8);
      improvements.push('일부 색상 조합이 색상환에서 서로 튀는 위치라 어색해 보일 수 있어요. 무채색을 더하거나 색상 하나를 빼보세요');
    }
  }

  if (colorList.length >= 5) {
    score -= 5;
    improvements.push('색상 종류가 너무 많아서 산만해 보일 수 있어요');
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

    // 상위 점수만 뽑으면 상의+하의 조합이 똑같고 아우터/신발만 다른 경우가 많아
    // 추천 3개가 거의 똑같아 보임 — 상의·하의 조합이 겹치지 않는 것 위주로 다양성 확보
    const top3: typeof scored = [];
    const usedPairs = new Set<string>();
    for (const entry of scored) {
      const topItem = entry.combo.find((i) => i.category === '상의');
      const bottomItem = entry.combo.find((i) => i.category === '하의');
      const pairKey = `${topItem?.id}-${bottomItem?.id}`;
      if (usedPairs.has(pairKey)) continue;
      usedPairs.add(pairKey);
      top3.push(entry);
      if (top3.length === 3) break;
    }
    for (const entry of scored) {
      if (top3.length === 3) break;
      if (!top3.includes(entry)) top3.push(entry);
    }

    return top3.map((entry, index) => {
      const topItem = entry.combo.find((i) => i.category === '상의');
      const bottomItem = entry.combo.find((i) => i.category === '하의');
      const title =
        topItem && bottomItem
          ? `${topItem.color}·${bottomItem.color} 코디`
          : `추천 코디 ${index + 1}`;
      const composition = entry.combo.map((i) => `${i.category} ${i.color}`).join(' + ');

      return {
        id: `rec-${Date.now()}-${index}`,
        title,
        closetItemIds: entry.combo.map((i) => i.id),
        reason: `${composition} · ${entry.strengths[0] ?? entry.summary}`,
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
}
