import { Mail, X } from "lucide-react";

interface AppMenuSheetProps {
  onClose: () => void;
}

const APP_VERSION_LABEL = "베타";
const CONTACT_EMAIL = "kyj5311kr@gmail.com";

/** 헤더 햄버거 메뉴를 누르면 뜨는 바텀시트 — 앱 정보/버전, 문의하기만 담은 최소 메뉴. */
export default function AppMenuSheet({ onClose }: AppMenuSheetProps) {
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
        </div>
      </div>
    </div>
  );
}
