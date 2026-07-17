// apps/api/src/controllers/user.controller.ts

import { Response } from 'express';
import { UserService } from '../services/user/user.service';
import { ApiResponse, UpdateUserProfileInput } from '../types';
import { AuthRequest } from '../middlewares/auth.middleware';

const userService = new UserService();

function getUserId(req: AuthRequest, res: Response): number | null {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({
      success: false,
      data: null,
      error: { code: 'AUTH_001', message: '인증되지 않은 사용자입니다.' },
    } as ApiResponse);
    return null;
  }
  return userId;
}

function validateUpdateBody(body: UpdateUserProfileInput): string | null {
  if (
    body.personalColor !== undefined &&
    (typeof body.personalColor !== 'string' || body.personalColor.trim() === '')
  ) {
    return '퍼스널컬러는 비어 있지 않은 문자열이어야 합니다.';
  }

  if (
    body.bodyType !== undefined &&
    (typeof body.bodyType !== 'string' || body.bodyType.trim() === '')
  ) {
    return '체형은 비어 있지 않은 문자열이어야 합니다.';
  }

  if (body.monthlyBudget !== undefined) {
    if (!Number.isInteger(body.monthlyBudget) || body.monthlyBudget < 0) {
      return '월 예산은 0 이상의 정수여야 합니다.';
    }
  }

  if (body.heightCm !== undefined) {
    if (!Number.isInteger(body.heightCm) || body.heightCm <= 0) {
      return '키는 0보다 큰 정수여야 합니다.';
    }
  }

  if (body.weightKg !== undefined) {
    if (!Number.isInteger(body.weightKg) || body.weightKg <= 0) {
      return '몸무게는 0보다 큰 정수여야 합니다.';
    }
  }

  if (
    body.personalColor === undefined &&
    body.bodyType === undefined &&
    body.heightCm === undefined &&
    body.weightKg === undefined &&
    body.monthlyBudget === undefined
  ) {
    return '수정할 항목이 하나 이상 필요합니다.';
  }

  return null;
}

export class UserController {
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (userId === null) return;

      const profile = await userService.getProfile(userId);
      if (!profile) {
        res.status(404).json({
          success: false,
          data: null,
          error: { code: 'USER_001', message: '사용자 프로필을 찾을 수 없습니다.' },
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: profile,
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('프로필 조회 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'USER_002', message: '프로필 조회에 실패했습니다.' },
      } as ApiResponse);
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (userId === null) return;

      const body = req.body as UpdateUserProfileInput;
      const validationError = validateUpdateBody(body);
      if (validationError) {
        res.status(400).json({
          success: false,
          data: null,
          error: { code: 'USER_003', message: validationError },
        } as ApiResponse);
        return;
      }

      const profile = await userService.updateProfile(userId, body);
      if (!profile) {
        res.status(404).json({
          success: false,
          data: null,
          error: { code: 'USER_001', message: '사용자 프로필을 찾을 수 없습니다.' },
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: profile,
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('프로필 수정 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'USER_002', message: '프로필 수정에 실패했습니다.' },
      } as ApiResponse);
    }
  }
}
