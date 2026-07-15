import { useState } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";

interface IntroSlideProps {
  onComplete: () => void;
}

interface SlideContent {
  eyebrow: string;
  title: string;
  description: string;
  tone: "cream" | "yellow";
}

const SLIDES: SlideContent[] = [
  {
    eyebrow: "옷장 관리",
    title: "가진 옷,\n한눈에 정리해요",
    description:
      "옷장 속 옷을 사진으로 등록하면 카테고리·색상·계절까지 자동으로 정리돼요.",
    tone: "cream",
  },
  {
    eyebrow: "예산 기반 로드맵",
    title: "이번 달 예산 안에서\n똑똑하게 채워요",
    description:
      "월 예산을 입력하면 지금 옷장에 진짜 필요한 아이템 우선순위를 알려드려요.",
    tone: "yellow",
  },
  {
    eyebrow: "AI 코디 평가",
    title: "오늘 코디,\nAI에게 물어보세요",
    description:
      "체형과 퍼스널컬러를 반영한 코디 추천과 개선 피드백을 받아볼 수 있어요.",
    tone: "cream",
  },
];

export default function IntroSlide({ onComplete }: IntroSlideProps) {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  function handleNext() {
    if (isLast) {
      onComplete();
      return;
    }
    setIndex((prev) => prev + 1);
  }

  return (
    <div className="flex min-h-full flex-col justify-between">
      <div>
        <div className="mb-8 flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <span
              key={s.title}
              className={[
                "h-1.5 flex-1 rounded-pill transition-colors",
                i <= index ? "bg-ink" : "bg-cream-deep",
              ].join(" ")}
            />
          ))}
        </div>

        <Card tone={slide.tone} className="min-h-[420px]">
          <p className="text-sm font-semibold text-ink-soft">
            {slide.eyebrow}
          </p>
          <h1 className="mt-4 whitespace-pre-line text-[28px] font-bold leading-snug text-ink">
            {slide.title}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
            {slide.description}
          </p>
        </Card>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Button onClick={handleNext}>{isLast ? "시작하기" : "다음"}</Button>
        {!isLast && (
          <Button variant="ghost" size="md" onClick={onComplete}>
            건너뛰기
          </Button>
        )}
      </div>
    </div>
  );
}
