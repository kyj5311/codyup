// apps/api/prisma/clone-demo-data.ts
//
// 부스 운영용 — BE2(test@example.com) 계정의 프로필 + 옷장 더미데이터를
// 나머지 5개 계정(FE1/FE2/BE1/Planner/Designer)에 그대로 복제한다.
// 여러 번 실행해도 안전하도록, 대상 계정의 기존 옷장은 매번 비우고 다시 채운다.
// 시연 전날 등 데모 상태를 초기화하고 싶을 때 다시 실행하면 된다.

import { PrismaClient } from '@prisma/client';
import { BOOTH_ROLE_EMAIL } from '../src/config/booth-accounts';

const prisma = new PrismaClient();

const SOURCE_EMAIL = BOOTH_ROLE_EMAIL.BE2; // 'test@example.com' — 데모 데이터가 쌓여있는 계정

async function main() {
  const source = await prisma.user.findUnique({ where: { email: SOURCE_EMAIL } });
  if (!source) {
    throw new Error(`원본 계정(${SOURCE_EMAIL})을 찾을 수 없습니다. 먼저 db:seed를 실행하세요.`);
  }

  const sourceItems = await prisma.closetItem.findMany({ where: { userId: source.id } });

  const targetEmails = Object.values(BOOTH_ROLE_EMAIL).filter((email) => email !== SOURCE_EMAIL);

  for (const email of targetEmails) {
    const target = await prisma.user.findUnique({ where: { email } });
    if (!target) {
      console.warn(`⚠️ 건너뜀: ${email} 계정이 없습니다. 먼저 db:seed를 실행하세요.`);
      continue;
    }

    await prisma.user.update({
      where: { id: target.id },
      data: {
        personalColor: source.personalColor,
        bodyType: source.bodyType,
        heightCm: source.heightCm,
        weightKg: source.weightKg,
        monthlyBudget: source.monthlyBudget,
      },
    });

    // 재실행 시 중복 생성 방지 — 기존 옷장을 비우고 다시 채움
    await prisma.closetItem.deleteMany({ where: { userId: target.id } });

    await prisma.closetItem.createMany({
      data: sourceItems.map((item) => ({
        userId: target.id,
        // blob: 이미지 URL은 원본 브라우저 세션에만 유효해서 복사해도 의미가 없음 —
        // 빈 값으로 두면 카테고리 아이콘으로 자연스럽게 대체됨(기존 데모와 동일한 방식)
        imageUrl: '',
        category: item.category,
        color: item.color,
        brand: item.brand,
        memo: item.memo,
        fit: item.fit,
        length: item.length,
        isFavorite: item.isFavorite,
      })),
    });

    console.log(`✅ ${email} 에 더미데이터 복제 완료 — 옷장 ${sourceItems.length}벌, 프로필 동기화`);
  }
}

main()
  .catch((error) => {
    console.error('❌ 복제 실패:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
