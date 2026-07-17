import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
}

/**
 * 화면 하단(네비게이션 바로 위)에 잠깐 떴다가 사라지는 완료 알림.
 * message가 null이면 아무것도 렌더링하지 않음 — 호출부에서 상태만 관리하면 됨.
 */
export default function Toast({ message, onDismiss, durationMs = 2000 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, onDismiss]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-6">
      <div className="flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-cream shadow-lg">
        <CheckCircle2 size={18} strokeWidth={2} />
        {message}
      </div>
    </div>
  );
}
