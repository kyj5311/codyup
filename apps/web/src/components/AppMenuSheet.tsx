import { LogOut, Mail, X } from "lucide-react";
import { getLoggedInRole, logout } from "../api/auth-api";

interface AppMenuSheetProps {
  onClose: () => void;
}

const APP_VERSION_LABEL = "베타";
const CONTACT_EMAIL = "kyj5311kr@gmail.com";

/** 헤더 햄버거 메뉴를 누르면 뜨는 바텀시트 — 앱 정보/버전, 문의하기, 로그아웃만 담은 최소 메뉴. */
export default function AppMenuSheet({ onClose }: AppMenuSheetProps) {
  const role = getLoggedInRole();

  function handleLogout() {
    logout();
    // App.tsx의 로그인 상태는 마운트 시 localStorage 기준으로만 정해지므로,
    // 프롭 드릴링 없이 가장 간단하게 초기화하려고 새로고침으로 로그인 화면을 다시 띄움.
    window.location.reload();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] rounded-t-3xl bg-cream p-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-bold text-ink">메뉴</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-ink"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-4 flex flex-col divide-y divide-line border-t border-line text-[15px]">
          <div className="flex items-center justify-between py-4">
            <span className="font-medium text-ink">앱 정보</span>
            <span className="text-gray-text">코디업 (CodyUp) · {APP_VERSION_LABEL}</span>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center justify-between py-4"
          >
            <span className="font-medium text-ink">문의하기</span>
            <span className="flex items-center gap-1.5 text-gray-text">
              <Mail size={14} strokeWidth={2} />
              {CONTACT_EMAIL}
            </span>
          </a>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-between py-4 text-left"
          >
            <span className="font-medium text-ink">로그아웃</span>
            <span className="flex items-center gap-1.5 text-danger">
              {role && `${role} 계정`}
              <LogOut size={14} strokeWidth={2} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
