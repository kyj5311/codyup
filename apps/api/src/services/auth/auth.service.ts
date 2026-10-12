// apps/api/src/services/auth/auth.service.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BOOTH_ROLE_EMAIL, isBoothRole } from '../../config/booth-accounts';

const prisma = new PrismaClient();

const getJwtSecret = (): string => process.env.JWT_SECRET || 'secret';

export class AuthService {
  // 부스 계정(FE1/FE2/BE1/BE2/Planner/Designer) 중 하나로 로그인 — 역할 + PIN이 맞으면 JWT 발급
  async login(role: string, pin: string): Promise<{ token: string } | null> {
    if (!isBoothRole(role)) return null;

    const email = BOOTH_ROLE_EMAIL[role];
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isMatch = await bcrypt.compare(pin, user.passwordHash);
    if (!isMatch) return null;

    const token = jwt.sign(
      { id: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: '24h' },
    );
    return { token };
  }
}
