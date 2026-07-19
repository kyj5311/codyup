// apps/api/src/services/coaching/coordi-scoring.ts
//
// 코디 평가/추천(coaching)과 구매 로드맵(roadmap)이 공유하는 "코디 규칙" 점수 시스템.
// 원래 coaching.service.ts에 있던 색상/체형/퍼스널컬러 채점 로직을 분리했다 —
// 로드맵도 이 점수 시스템을 그대로 써서 "점수를 올려줄 수 있는 아이템"을 추천하기 위함.

// 코디 점수 계산에 필요한 최소 필드만 요구 — Prisma ClosetItem(실제 보유 옷)과
// 아직 구매 전인 카탈로그 후보(가상 아이템) 둘 다 이 형태로 넘길 수 있음.
export interface ScorableItem {
  category: string;
  color: string;
  fit?: string | null;
  length?: string | null;
  isFavorite?: boolean;
}

// 팔레트의 "무채색/기본" 그룹과 동일한 기준 — 색상 궁합(isNeutralHsl) 판정과 통일
export const NEUTRAL_COLORS = [
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
export const COLOR_HEX: Record<string, string> = {
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
export const TONE_COLORS: Record<string, string[]> = {
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

export function resolveToneColors(personalColor: string): { label: string; colors: string[] } | null {
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

// 체형별 선호 핏·기장 — 상의/하의/아우터 아이템에 fit·length가 입력된 경우에만 반영됨
// (값이 없는 아이템은 중립 처리 — 감점/가점 없음)
// 상의·아우터의 기장은 소매 기장(반팔/긴팔)이라 체형 실루엣과는 무관 — preferredLengths를
// 빈 배열로 둬서 핏만으로 판단하고, 하의 기장(숏/롱/버뮤다)만 다리 라인에 영향을 주므로 채점에 사용
interface BodyTypeCategoryRule {
  preferredFits: string[];
  preferredLengths: string[];
}

// 체형 보완 색상 배치 — 명도(밝기) 착시 원리: 밝은 색은 확대되어, 어두운 색은 축소되어 보임
type BodyTypeColorMode = 'monotone' | 'top-lighter' | 'bottom-lighter' | 'contrast' | 'neutral-tone';

export interface BodyTypeRule {
  label: string;
  tip: string;
  colorMode: BodyTypeColorMode;
  colorTip: string;
  상의: BodyTypeCategoryRule;
  하의: BodyTypeCategoryRule;
  아우터: BodyTypeCategoryRule;
}

export const BODY_TYPE_RULES: Record<string, BodyTypeRule> = {
  스트레이트: {
    label: '스트레이트',
    tip: '허리 라인을 강조하기보다 세로 라인을 살려주는 슬림·레귤러 핏과 롱 팬츠가 잘 어울려요',
    colorMode: 'monotone',
    colorTip: '상하의를 비슷한 톤으로 맞추면 세로 라인이 강조돼 슬림해 보여요',
    상의: { preferredFits: ['슬림', '레귤러'], preferredLengths: [] },
    하의: { preferredFits: ['슬림', '레귤러'], preferredLengths: ['롱'] },
    아우터: { preferredFits: ['슬림', '레귤러'], preferredLengths: [] },
  },
  웨이브: {
    label: '웨이브',
    tip: '허리 라인을 드러내는 슬림 핏 상의·하의가 체형의 곡선을 살려줘요',
    colorMode: 'top-lighter',
    colorTip: '상의를 하의보다 밝은 색으로 입으면 상체에 볼륨감이 생겨 체형 밸런스가 좋아져요',
    상의: { preferredFits: ['슬림'], preferredLengths: [] },
    하의: { preferredFits: ['슬림'], preferredLengths: ['롱'] },
    아우터: { preferredFits: ['슬림'], preferredLengths: [] },
  },
  내추럴: {
    label: '내추럴',
    tip: '여유 있는 오버·루즈 핏이 편안하면서도 세련된 느낌을 줘요',
    colorMode: 'neutral-tone',
    colorTip: '화려한 색보다 무채색·자연스러운 톤이 내추럴한 체형과 잘 어울려요',
    상의: { preferredFits: ['오버', '루즈'], preferredLengths: [] },
    하의: { preferredFits: ['오버', '루즈', '레귤러'], preferredLengths: ['롱'] },
    아우터: { preferredFits: ['오버', '루즈'], preferredLengths: [] },
  },
  모래시계: {
    label: '모래시계',
    tip: '허리 라인이 드러나는 슬림·레귤러 핏이 체형의 곡선을 살려줘요',
    colorMode: 'contrast',
    colorTip: '상하의를 대비되는 색으로 입으면 잘록한 허리가 더 부각돼요',
    상의: { preferredFits: ['슬림', '레귤러'], preferredLengths: [] },
    하의: { preferredFits: ['슬림', '레귤러'], preferredLengths: ['롱'] },
    아우터: { preferredFits: ['슬림', '레귤러'], preferredLengths: [] },
  },
  직사각형: {
    label: '직사각형',
    tip: '오버핏 상의로 허리 라인에 입체감을 더하면 좋아요',
    colorMode: 'contrast',
    colorTip: '상하의를 다른 색으로 나눠 입으면 허리 라인 착시 효과를 줄 수 있어요',
    상의: { preferredFits: ['오버', '루즈'], preferredLengths: [] },
    하의: { preferredFits: ['오버', '루즈'], preferredLengths: ['롱'] },
    아우터: { preferredFits: ['오버'], preferredLengths: [] },
  },
  역삼각형: {
    label: '역삼각형',
    tip: '상체는 슬림하게, 하체는 여유 있는 핏으로 밸런스를 맞추면 좋아요',
    colorMode: 'bottom-lighter',
    colorTip: '하의를 상의보다 밝은 색으로 입으면 넓은 어깨와 밸런스가 맞아요',
    상의: { preferredFits: ['슬림', '레귤러'], preferredLengths: [] },
    하의: { preferredFits: ['오버', '루즈'], preferredLengths: ['롱'] },
    아우터: { preferredFits: ['슬림'], preferredLengths: [] },
  },
};

export function resolveBodyTypeRule(bodyType: string): BodyTypeRule | null {
  const matched = Object.keys(BODY_TYPE_RULES).find((key) => bodyType.includes(key));
  return matched ? BODY_TYPE_RULES[matched] : null;
}

// 상/하의 색상의 명도(L)를 비교해 체형 보완 색상 배치 규칙에 맞는지 판정
// 색상 정보가 없거나 팔레트에 없는 색이면 null(중립) 반환
const LIGHTNESS_MARGIN = 0.12;

function evaluateBodyTypeColorMatch(
  topColor: string | undefined,
  bottomColor: string | undefined,
  mode: BodyTypeColorMode,
): boolean | null {
  const topHex = topColor ? COLOR_HEX[topColor] : undefined;
  const bottomHex = bottomColor ? COLOR_HEX[bottomColor] : undefined;
  if (!topHex || !bottomHex) return null;

  const top = hexToHsl(topHex);
  const bottom = hexToHsl(bottomHex);

  switch (mode) {
    case 'monotone':
      return Math.abs(top.l - bottom.l) < LIGHTNESS_MARGIN;
    case 'top-lighter':
      return top.l - bottom.l > LIGHTNESS_MARGIN;
    case 'bottom-lighter':
      return bottom.l - top.l > LIGHTNESS_MARGIN;
    case 'contrast':
      return Math.abs(top.l - bottom.l) >= LIGHTNESS_MARGIN;
    case 'neutral-tone':
      return isNeutralHsl(top) && isNeutralHsl(bottom);
    default:
      return null;
  }
}

export interface ScoredCombo {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
}

// 코디의 기본 골격 — 상의·하의·신발을 모두 갖춰야 기본 점수(40점)를 다 받을 수 있음
// 점수 배점(총 100점 기준): 기본완성도40 + 아우터5 + 색상궁합10 + 무채색5
//   + 퍼스널컬러15 + 체형핏15 + 체형색상10 = 100, 즐겨찾기+3은 가산(클리핑으로 100 상한)
export const CORE_CATEGORIES = ['상의', '하의', '신발'];

// 거의 모든 유효한 코디에서 공통으로 뜨는 뻔한 문구라, 추천 이유 문구에서는 우선순위를 낮춤
export const GENERIC_COMPLETION_STRENGTH = '상의·하의·신발을 모두 갖춘 완성도 높은 코디예요';

export function evaluateCombo(
  items: ScorableItem[],
  personalColor: string | null,
  bodyType: string | null,
): ScoredCombo {
  const categories = new Set(items.map((i) => i.category));
  const colors = new Set(items.map((i) => i.color));
  const strengths: string[] = [];
  const improvements: string[] = [];

  const presentCoreCount = CORE_CATEGORIES.filter((c) => categories.has(c)).length;
  let score = Math.round((presentCoreCount / CORE_CATEGORIES.length) * 40);

  if (presentCoreCount === CORE_CATEGORIES.length) {
    strengths.push(GENERIC_COMPLETION_STRENGTH);
  } else {
    const missingCore = CORE_CATEGORIES.filter((c) => !categories.has(c));
    improvements.push(`${missingCore.join('·')}이(가) 빠져 있어요. 셋을 모두 갖추면 기본 점수가 올라가요`);
  }

  if (categories.has('아우터')) {
    score += 5;
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
        score += 15;
        strengths.push(`퍼스널컬러(${tone.label})와 잘 어울리는 컬러가 포함됐어요`);
      } else {
        improvements.push(
          `퍼스널컬러(${tone.label})에 어울리는 ${tone.colors.slice(0, 3).join('·')} 계열을 더하면 더 화사해 보여요`,
        );
      }
    }
  }

  if (bodyType) {
    const rule = resolveBodyTypeRule(bodyType);
    if (rule) {
      let matchCount = 0;
      let dataCount = 0;
      (['상의', '하의', '아우터'] as const).forEach((category) => {
        const item = items.find((i) => i.category === category);
        if (!item) return;
        const categoryRule = rule[category];
        // 상의/아우터는 preferredLengths가 비어 있어 소매 기장은 채점에서 제외되고 핏만 봄
        const hasScorableFit = Boolean(item.fit);
        const hasScorableLength = Boolean(item.length) && categoryRule.preferredLengths.length > 0;
        if (!hasScorableFit && !hasScorableLength) return;
        dataCount++;
        const fitMatch = hasScorableFit ? categoryRule.preferredFits.includes(item.fit!) : false;
        const lengthMatch = hasScorableLength
          ? categoryRule.preferredLengths.includes(item.length!)
          : false;
        if (fitMatch || lengthMatch) matchCount++;
      });

      if (dataCount > 0) {
        if (matchCount > 0) {
          score += Math.min(15, matchCount * 5);
          strengths.push(`체형(${rule.label})에 잘 맞는 핏·기장을 갖췄어요`);
        } else {
          improvements.push(`체형(${rule.label})을 고려하면: ${rule.tip}`);
        }
      }

      // 체형 보완 색상 배치 — 상의·하의 색상의 명도 관계가 체형 보완 규칙에 맞는지 판정
      const topItem = items.find((i) => i.category === '상의');
      const bottomItem = items.find((i) => i.category === '하의');
      const colorMatch = evaluateBodyTypeColorMatch(topItem?.color, bottomItem?.color, rule.colorMode);
      if (colorMatch === true) {
        score += 10;
        strengths.push(`체형(${rule.label}) 보완에 좋은 색상 배치예요`);
      } else if (colorMatch === false) {
        improvements.push(`체형(${rule.label}) 보완 팁: ${rule.colorTip}`);
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

// 지금 옷장(구매 없이)만으로 만들 수 있는 상의+하의(+아우터/신발) 조합 중 최고 코디 점수 —
// 구매 로드맵의 baseline과 "옷장 완성도" 지표가 공통으로 이 값을 사용한다.
// 상의·하의가 하나도 없으면 조합 자체를 만들 수 없어 0점.
export function bestAchievableScore(
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
