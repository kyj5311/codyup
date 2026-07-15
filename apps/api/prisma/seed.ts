// apps/api/prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash: 'test-password-hash',
      personalColor: '봄 웜',
      bodyType: '보통',
      monthlyBudget: 300000,
    },
  });

  console.log(`✅ 테스트 유저 준비 완료: id=${user.id}, email=${user.email}`);
}

main()
  .catch((error) => {
    console.error('❌ 시드 실패:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
