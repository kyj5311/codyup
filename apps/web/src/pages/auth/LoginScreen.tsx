import { useState } from "react";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { BOOTH_ROLES, login, saveSession, type BoothRole } from "../../api/auth-api";

interface LoginScreenProps {
  onSuccess: () => void;
}

/** 부스 운영/발표 시연용 로그인 — 역할 6개 중 하나를 고르고 PIN을 입력해 접속. */
export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<BoothRole | null>(null);
  const [pin, setPin] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleSelectRole(role: BoothRole) {
    setSelectedRole(role);
    setPin("");
    setErrorMessage(null);
  }

  async function handleSubmit() {
    if (!selectedRole || pin.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await login(selectedRole, pin);
      if (res.success && res.data) {
        saveSession(selectedRole, res.data.token);
        onSuccess();
      } else {
        setErrorMessage(res.error?.message ?? "로그인에 실패했어요.");
      }
    } catch {
      setErrorMessage("서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center p-5">
      <p
        className="text-center text-3xl text-ink"
        style={{ fontFamily: "'Brush Script MT', cursive" }}
      >
        Codyup
      </p>
      <p className="mt-2 text-center text-sm text-ink-soft">
        부스 운영/시연용 계정으로 로그인해 주세요.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {BOOTH_ROLES.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => handleSelectRole(role)}
            className={[
              "rounded-2xl px-4 py-4 text-center text-[15px] font-semibold transition-colors",
              selectedRole === role
                ? "bg-ink text-cream"
                : "bg-cream-deep text-ink",
            ].join(" ")}
          >
            {role}
          </button>
        ))}
      </div>

      {selectedRole && (
        <Card tone="cream" className="mt-5">
          <p className="text-sm font-semibold text-ink">
            {selectedRole} 계정 PIN 입력
          </p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="4자리 PIN"
            className="mt-3 w-full rounded-xl border border-line bg-cream px-4 py-3 text-center text-lg tracking-[0.5em] text-ink outline-none"
          />
          {errorMessage && (
            <p className="mt-2 text-center text-sm text-danger">{errorMessage}</p>
          )}
          <div className="mt-4">
            <Button
              onClick={handleSubmit}
              disabled={pin.length === 0 || isSubmitting}
            >
              {isSubmitting ? "확인 중..." : "로그인"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
