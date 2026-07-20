// apps/api/prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { BOOTH_ROLE_EMAIL } from '../src/config/booth-accounts';

const prisma = new PrismaClient();

// 부스 운영/발표 시연용 PIN — 팀원끼리 구두로 공유하기 쉽게 역할 순서대로 0001~0006
const BOOTH_PINS: Record<string, string> = {
  FE1: '0001',
  FE2: '0002',
  BE1: '0003',
  BE2: '0004',
  Planner: '0005',
  Designer: '0006',
};

async function main() {
  for (const [role, email] of Object.entries(BOOTH_ROLE_EMAIL)) {
    const pin = BOOTH_PINS[role];
    const passwordHash = await bcrypt.hash(pin, 10);

    // BE2(test@example.com)는 이번 세션 동안 쌓아온 데모 데이터(옷장 29벌 등)를 그대로
    // 유지해야 하므로 passwordHash만 갱신하고, 나머지 필드는 손대지 않음.
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
    });

    console.log(`✅ 부스 계정 준비 완료: role=${role}, id=${user.id}, email=${user.email}, PIN=${pin}`);
  }
}

main()
  .catch((error) => {
    console.error('❌ 시드 실패:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
