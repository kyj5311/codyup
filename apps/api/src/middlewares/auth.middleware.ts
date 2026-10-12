// apps/api/src/middlewares/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types';

export interface AuthRequest extends Request {
  user?: { id: number };
}

const getJwtSecret = (): string => process.env.JWT_SECRET || 'secret';

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { id: number };
      req.user = { id: decoded.id };
      next();
      return;
    } catch {
      res.status(401).json({
        success: false,
        data: null,
        error: { code: 'AUTH_002', message: '유효하지 않은 인증 토큰입니다.' },
      } as ApiResponse);
      return;
    }
  }

  // 개발 환경: 토큰 없이도 테스트 유저(id=1)로 동작
  if (process.env.NODE_ENV !== 'production') {
    req.user = { id: 1 };
    next();
    return;
  }

  res.status(401).json({
    success: false,
    data: null,
    error: { code: 'AUTH_001', message: '인증 토큰이 필요합니다.' },
  } as ApiResponse);
};
