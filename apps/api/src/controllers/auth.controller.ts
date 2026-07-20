// apps/api/src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { ApiResponse } from '../types';

const authService = new AuthService();

interface LoginBody {
  role?: string;
  pin?: string;
}

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { role, pin } = req.body as LoginBody;

      if (!role || !pin) {
        res.status(400).json({
          success: false,
          data: null,
          error: { code: 'AUTH_003', message: '계정과 PIN을 모두 입력해주세요.' },
        } as ApiResponse);
        return;
      }

      const result = await authService.login(role, pin);
      if (!result) {
        res.status(401).json({
          success: false,
          data: null,
          error: { code: 'AUTH_004', message: '계정 또는 PIN이 올바르지 않습니다.' },
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('로그인 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'AUTH_005', message: '로그인에 실패했습니다.' },
      } as ApiResponse);
    }
  }
}
