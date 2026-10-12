import { useState } from "react";
import { Menu } from "lucide-react";
import AppMenuSheet from "./AppMenuSheet";

/**
 * 홈 화면과 톤을 맞춘 공용 페이지 헤더.
 * 모든 화면에서 페이지별 타이틀 대신 "Codyup" 브랜드 텍스트로 통일한다.
 * 특정 화면에 종속되지 않는 전역 레이아웃 조각이라 공용 components/ 에 둔다.
 */
export default function PageHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={() => setIsMenuOpen(true)}
        aria-label="메뉴"
        className="text-ink"
      >
        <Menu size={22} />
      </button>
      <p
        className="text-2xl text-ink"
        style={{ fontFamily: "'Brush Script MT', cursive" }}
      >
        Codyup
      </p>
      <span className="w-[22px]" />

      {isMenuOpen && <AppMenuSheet onClose={() => setIsMenuOpen(false)} />}
    </div>
  );
}