// apps/api/src/config/booth-accounts.ts
//
// 부스 운영/발표 시연용 고정 계정 6개 — 역할 이름을 그대로 로그인 버튼 라벨로 쓴다.
// PIN(평문)은 seed.ts에서만 다루고, 여기는 role -> email 매핑만 공유한다.

export const BOOTH_ROLES = [
  'FE1',
  'FE2',
  'BE1',
  'BE2',
  'Planner',
  'Designer',
] as const;

export type BoothRole = (typeof BOOTH_ROLES)[number];

// BE2는 이번 세션 내내 데모 데이터(옷장 29벌 등)를 쌓아온 기존 test@example.com 계정을
// 그대로 재사용 — 새 계정으로 바꾸면 그동안 쌓은 데모 데이터를 잃게 됨.
// 나머지 5개는 부스에서 각자 온보딩부터 새로 진행할 빈 계정.
export const BOOTH_ROLE_EMAIL: Record<BoothRole, string> = {
  FE1: 'fe1@codyup.local',
  FE2: 'fe2@codyup.local',
  BE1: 'be1@codyup.local',
  BE2: 'test@example.com',
  Planner: 'planner@codyup.local',
  Designer: 'designer@codyup.local',
};

export function isBoothRole(value: string): value is BoothRole {
  return (BOOTH_ROLES as readonly string[]).includes(value);
}
