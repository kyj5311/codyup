import { httpClient, type ApiResponse } from "./http-client";

interface TestTokenData {
  token: string;
}

/**
 * 테스트용 토큰 발급 — POST /auth/token (Body 없음)
 * BE1 명세서에 응답 필드명이 명시되어 있지 않아 { token } 형태로 가정했습니다.
 * 실제 응답 필드가 다르면 이 함수만 수정하면 됩니다.
 *
 * ⚠️ 이건 로그인 전 임시 테스트용입니다. 실제 로그인/회원가입 플로우가
 * 나오면 이 함수는 삭제하고 로그인 API로 교체해야 합니다.
 */
export async function fetchTestToken(): Promise<ApiResponse<TestTokenData>> {
  const { data } = await httpClient.post<ApiResponse<TestTokenData>>(
    "/auth/token",
  );
  return data;
}

/**
 * 앱 시작 시 저장된 토큰이 없으면 테스트 토큰을 발급받아 저장.
 * TODO: 실제 로그인 화면이 생기면 이 함수 대신 로그인 성공 시 토큰을 저장하도록 교체.
 */
export async function ensureTestToken(): Promise<void> {
  if (localStorage.getItem("accessToken")) return;
  try {
    const res = await fetchTestToken();
    if (res.success && res.data) {
      localStorage.setItem("accessToken", res.data.token);
    }
  } catch {
    // BE1 서버가 아직 안 떠 있으면 조용히 실패 — 이후 API 호출들이 401로 실패하는 것으로 확인 가능
  }
}
