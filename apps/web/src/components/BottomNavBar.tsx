import { Home, Shirt, ShoppingBag, Search, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavTab = "home" | "closet" | "style-plan" | "coaching" | "mypage";

interface NavItem {
  key: NavTab;
  icon: LucideIcon;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: "home", icon: Home, label: "홈" },
  { key: "closet", icon: Shirt, label: "내 옷장" },
  { key: "style-plan", icon: ShoppingBag, label: "스타일 플랜" },
  { key: "coaching", icon: Search, label: "코디 코칭" },
  { key: "mypage", icon: User, label: "마이페이지" },
];

interface BottomNavBarProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

/**
 * 앱 전체 하단 탭 네비게이션. 특정 도메인 폴더에 속하지 않는
 * 전역 레이아웃 컴포넌트라 공용 components/ 에 둔다.
 * 라우팅 방식(react-router vs 상태전환)이 아직 팀에서 미정이라,
 * 이 컴포넌트는 onChange 콜백만 받는 순수 UI로 만들어 어느 방식에도 붙을 수 있게 했다.
 */
export default function BottomNavBar({ active, onChange }: BottomNavBarProps) {
  return (
    <nav className="flex w-full items-center justify-around border-t border-line bg-cream px-2 py-2">
      {NAV_ITEMS.map(({ key, icon: Icon, label }) => {
        const isActive = key === active;
        return (
          <button
            key={key}
            type="button"
            aria-label={label}
            onClick={() => onChange(key)}
            className="flex flex-col items-center gap-1 px-3 py-1"
          >
            <span
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                isActive ? "bg-yellow text-ink" : "text-gray-text",
              ].join(" ")}
            >
              <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
            </span>
          </button>
        );
      })}
    </nav>
  );
}