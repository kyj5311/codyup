import { Menu } from "lucide-react";

/**
 * 홈 화면과 톤을 맞춘 공용 페이지 헤더.
 * 모든 화면에서 페이지별 타이틀 대신 "Codyup" 브랜드 텍스트로 통일한다.
 * 특정 화면에 종속되지 않는 전역 레이아웃 조각이라 공용 components/ 에 둔다.
 */
export default function PageHeader() {
  return (
    <div className="flex items-center justify-between">
      <Menu size={22} className="text-ink" />
      <p
        className="text-2xl text-ink"
        style={{ fontFamily: "'Brush Script MT', cursive" }}
      >
        Codyup
      </p>
      <span className="w-[22px]" />
    </div>
  );
}