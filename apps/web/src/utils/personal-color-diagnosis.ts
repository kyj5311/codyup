// 사진 기반 퍼스널컬러 간이 진단 — 외부 비전 API 없이 브라우저에서 직접 계산.
// 얼굴 인식 없이 "사진 중앙에 얼굴을 맞춰서 업로드"라는 가정으로 얼굴 추정 영역 색상을 샘플링해서
// 웜/쿨·명도·채도 3가지 축으로 대략적인 톤을 추정하는 참고용 기능입니다(전문 진단 대체 아님).
//
// 주의: 실내 조명(대부분 따뜻한 색 조명)이 사진 전체에 색 편향을 주기 때문에, 얼굴 픽셀의
// 절대 색상값만 보면 실제 피부 톤과 무관하게 대부분 "웜톤"으로 쏠리는 문제가 있었음.
// → 네 모서리(배경일 확률이 높은 영역)의 평균 색을 "조명 기준값"으로 삼아,
//   얼굴 영역 색을 그 기준 대비 상대적으로 보정(gray-world 화이트밸런스)한 뒤 분류함.
import type { PersonalColorResult, PersonalColorTone } from "../types/onboarding";

interface Hsl {
  h: number;
  s: number;
  l: number;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn:
        h = ((gn - bn) / d) % 6;
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s, l };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl); // 로드 완료 후엔 필요 없으니 즉시 해제(메모리 누수 방지)
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 불러오지 못했어요."));
    };
    image.src = objectUrl;
  });
}

function sampleRegionAverage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): Rgb {
  const { data } = ctx.getImageData(x, y, w, h);
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 10) continue; // 투명 픽셀 제외
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }
  if (count === 0) return { r: 128, g: 128, b: 128 };
  return { r: r / count, g: g / count, b: b / count };
}

// 중앙(얼굴 추정 영역)과 네 모서리(배경 추정 영역) 색상을 함께 샘플링
function sampleFaceAndBackground(image: HTMLImageElement): { face: Rgb; background: Rgb } {
  const size = 160;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이 브라우저에서는 사진 분석을 지원하지 않아요.");

  ctx.drawImage(image, 0, 0, size, size);

  const faceBox = Math.floor(size * 0.28);
  const faceOffset = Math.floor((size - faceBox) / 2);
  const face = sampleRegionAverage(ctx, faceOffset, faceOffset, faceBox, faceBox);

  const cornerSize = Math.floor(size * 0.16);
  const corners = [
    sampleRegionAverage(ctx, 0, 0, cornerSize, cornerSize),
    sampleRegionAverage(ctx, size - cornerSize, 0, cornerSize, cornerSize),
    sampleRegionAverage(ctx, 0, size - cornerSize, cornerSize, cornerSize),
    sampleRegionAverage(ctx, size - cornerSize, size - cornerSize, cornerSize, cornerSize),
  ];
  const background = {
    r: corners.reduce((sum, c) => sum + c.r, 0) / corners.length,
    g: corners.reduce((sum, c) => sum + c.g, 0) / corners.length,
    b: corners.reduce((sum, c) => sum + c.b, 0) / corners.length,
  };

  return { face, background };
}

// 배경 색을 "중립 회색"이라고 가정하고, 얼굴 색을 그 기준 대비 상대적으로 보정
// (조명이 사진 전체에 준 색 편향을 얼굴/배경 모두에서 같이 상쇄시킴)
function correctForLighting(face: Rgb, background: Rgb): Rgb {
  const bgGray = (background.r + background.g + background.b) / 3;
  const correctChannel = (value: number, bgChannel: number) => {
    // bgChannel이 너무 작으면 나눗셈 결과가 과도하게 증폭될 수 있어 보수적으로 넓게 방어
    const ratio = bgChannel < 10 ? 1 : bgGray / bgChannel;
    return Math.min(255, Math.max(0, value * ratio));
  };
  return {
    r: correctChannel(face.r, background.r),
    g: correctChannel(face.g, background.g),
    b: correctChannel(face.b, background.b),
  };
}

// 웜/쿨 · 명도(밝음/깊음) · 채도 3축을 조합해 12톤 중 대표 9개로 매핑
// cool-light(여름 계열)만 채도를 3분할해서 라이트/브라이트/뮤트를 구분하고,
// 나머지 구간(웜톤 전체 + 겨울)은 기존처럼 채도 2분할 유지 — 두 방식 다 구간 사이 빈틈은 없음
const TONE_MAP: Record<string, PersonalColorTone> = {
  "warm-light-bright": "봄 브라이트",
  "warm-light-muted": "봄 라이트",
  "warm-deep-bright": "가을 스트롱",
  "warm-deep-muted": "가을 뮤트",
  "cool-light-high-s": "여름 브라이트",
  "cool-light-mid-s": "여름 라이트",
  "cool-light-low-s": "여름 뮤트",
  "cool-deep-bright": "겨울 브라이트",
  "cool-deep-muted": "겨울 딥",
};

export async function diagnosePersonalColorFromPhoto(
  file: File,
): Promise<PersonalColorResult> {
  const image = await loadImage(file);
  const { face, background } = sampleFaceAndBackground(image);
  const corrected = correctForLighting(face, background);
  const { h, s, l } = rgbToHsl(corrected.r, corrected.g, corrected.b);

  // 조명 보정 후 남은 색상환 상 위치로 웜/쿨 판정 — 노랑~주황(웜) vs 빨강/핑크·청록 쪽(쿨)
  // Hue 범위만으로는 경계에서 오판정이 나올 수 있어 R>B 직접 비교로 이중 체크
  const warmCool = h >= 15 && h <= 45 && corrected.r > corrected.b ? "warm" : "cool";
  const depth = l >= 0.5 ? "light" : "deep";

  let key: string;
  if (warmCool === "cool" && depth === "light") {
    // 여름 계열만 3분할: 저채도(뮤트)~중채도(라이트)~고채도(브라이트)
    const clarity = s >= 0.45 ? "high-s" : s < 0.22 ? "low-s" : "mid-s";
    key = `cool-light-${clarity}`;
  } else {
    const clarity = s >= 0.3 ? "bright" : "muted";
    key = `${warmCool}-${depth}-${clarity}`;
  }

  const season = TONE_MAP[key] ?? "여름 라이트";

  // 기준선에서 얼마나 뚜렷이 떨어져 있는지로 대략적인 신뢰도를 계산 (통계적 근거는 아님)
  const hueMid = 32.5;
  const hueGap = Math.min(1, Math.abs(h - hueMid) / 45);
  const confidence = Math.round((0.6 + hueGap * 0.2) * 100) / 100;

  return { season, confidence };
}
