import { httpClient, type ApiResponse } from "./http-client";

export const BOOTH_ROLES = [
  "FE1",
  "FE2",
  "BE1",
  "BE2",
  "Planner",
  "Designer",
] as const;

export type BoothRole = (typeof BOOTH_ROLES)[number];

interface LoginData {
  token: string;
}

/** 부스 계정 로그인 — POST /auth/login { role, pin } */
export async function login(
  role: BoothRole,
  pin: string,
): Promise<ApiResponse<LoginData>> {
  const { data } = await httpClient.post<ApiResponse<LoginData>>(
    "/auth/login",
    { role, pin },
  );
  return data;
}

const ACCESS_TOKEN_KEY = "accessToken";
const LOGIN_ROLE_KEY = "loginRole";

export function saveSession(role: BoothRole, token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  localStorage.setItem(LOGIN_ROLE_KEY, role);
}

export function getLoggedInRole(): BoothRole | null {
  if (!localStorage.getItem(ACCESS_TOKEN_KEY)) return null;
  const role = localStorage.getItem(LOGIN_ROLE_KEY);
  return role && (BOOTH_ROLES as readonly string[]).includes(role)
    ? (role as BoothRole)
    : null;
}

export function logout(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(LOGIN_ROLE_KEY);
}
