// 사진 기반 퍼스널컬러 간이 진단 — 외부 비전 API 없이 브라우저에서 직접 계산.
// 얼굴 인식 없이 "사진 중앙에 얼굴을 맞춰서 업로드"라는 가정으로 중앙 영역 색상만 샘플링해서
// 웜/쿨·명도·채도 3가지 축으로 대략적인 톤을 추정하는 참고용 기능입니다(전문 진단 대체 아님).
import type { PersonalColorResult, PersonalColorTone } from "../types/onboarding";

interface Hsl {
  h: number;
  s: number;
  l: number;
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
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("이미지를 불러오지 못했어요."));
    image.src = URL.createObjectURL(file);
  });
}

// 사진 중앙 40% 영역(얼굴이 있을 확률이 높은 영역)의 평균 색상을 샘플링
function sampleCenterColor(image: HTMLImageElement): { r: number; g: number; b: number } {
  const size = 100;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("이 브라우저에서는 사진 분석을 지원하지 않아요.");

  ctx.drawImage(image, 0, 0, size, size);

  const boxSize = Math.floor(size * 0.4);
  const offset = Math.floor((size - boxSize) / 2);
  const { data } = ctx.getImageData(offset, offset, boxSize, boxSize);

  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  return { r: r / count, g: g / count, b: b / count };
}

// 웜/쿨 · 명도(밝음/깊음) · 채도(선명/뮤트) 3축을 조합해 12톤 중 대표 8개로 매핑
// (간이 진단이라 세부 3톤 중 가장 특징이 뚜렷한 톤 위주로만 매핑, 나머지는 수동 선택으로 보완)
const TONE_MAP: Record<string, PersonalColorTone> = {
  "warm-light-bright": "봄 브라이트",
  "warm-light-muted": "봄 라이트",
  "warm-deep-bright": "가을 스트롱",
  "warm-deep-muted": "가을 뮤트",
  "cool-light-bright": "여름 브라이트",
  "cool-light-muted": "여름 라이트",
  "cool-deep-bright": "겨울 브라이트",
  "cool-deep-muted": "겨울 딥",
};

export async function diagnosePersonalColorFromPhoto(
  file: File,
): Promise<PersonalColorResult> {
  const image = await loadImage(file);
  const { r, g, b } = sampleCenterColor(image);
  const { h, s, l } = rgbToHsl(r, g, b);

  // 피부톤 색상환에서 노랑~주황 쪽(대략 20~45도)에 가까우면 웜, 그 외(핑크/레드 계열)면 쿨로 간주
  const warmCool = h >= 20 && h <= 45 ? "warm" : "cool";
  const depth = l >= 0.55 ? "light" : "deep";
  const clarity = s >= 0.35 ? "bright" : "muted";

  const key = `${warmCool}-${depth}-${clarity}`;
  const season = TONE_MAP[key] ?? "봄 트루";

  // 기준선에서 얼마나 뚜렷이 떨어져 있는지로 대략적인 신뢰도를 계산 (통계적 근거는 아님)
  const hueMid = 32.5;
  const hueGap = Math.min(1, Math.abs(h - hueMid) / 45);
  const confidence = Math.round((0.6 + hueGap * 0.2) * 100) / 100;

  return { season, confidence };
}
