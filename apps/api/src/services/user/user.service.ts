// apps/api/src/services/user/user.service.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserProfile {
  id: number;
  email: string;
  personalColor: string | null;  // ✅ null 허용으로 변경
  bodyType: string | null;       // ✅ null 허용으로 변경
  heightCm: number | null;
  weightKg: number | null;
  monthlyBudget: number | null;  // ✅ null 허용으로 변경
  createdAt: string;
  updatedAt: string;
}

export class UserService {
  // 프로필 조회
  async getProfile(userId: number): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        personalColor: true,
        bodyType: true,
        heightCm: true,
        weightKg: true,
        monthlyBudget: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      personalColor: user.personalColor,      // null 그대로 반환
      bodyType: user.bodyType,                // null 그대로 반환
      heightCm: user.heightCm,
      weightKg: user.weightKg,
      monthlyBudget: user.monthlyBudget,      // null 그대로 반환
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  // 프로필 수정 (퍼스널컬러, 체형, 키/몸무게, 예산)
  async updateProfile(
    userId: number,
    data: {
      personalColor?: string;
      bodyType?: string;
      heightCm?: number;
      weightKg?: number;
      monthlyBudget?: number;
    }
  ): Promise<UserProfile | null> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        personalColor: data.personalColor,
        bodyType: data.bodyType,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        monthlyBudget: data.monthlyBudget,
      },
      select: {
        id: true,
        email: true,
        personalColor: true,
        bodyType: true,
        heightCm: true,
        weightKg: true,
        monthlyBudget: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      id: user.id,
      email: user.email,
      personalColor: user.personalColor,
      bodyType: user.bodyType,
      heightCm: user.heightCm,
      weightKg: user.weightKg,
      monthlyBudget: user.monthlyBudget,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}