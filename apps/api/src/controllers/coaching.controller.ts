// apps/api/src/controllers/coaching.controller.ts

import { Response } from 'express';
import { CoachingService } from '../services/coaching/coaching.service';
import { ApiResponse } from '../types';
import { AuthRequest } from '../middlewares/auth.middleware';

const coachingService = new CoachingService();

interface EvaluateBody {
  closetItemIds: number[];
}

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

export class CoachingController {
  async evaluateCoordi(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (userId === null) return;

      const body = req.body as EvaluateBody;
      const closetItemIds = Array.isArray(body.closetItemIds) ? body.closetItemIds : [];

      if (closetItemIds.length === 0) {
        res.status(400).json({
          success: false,
          data: null,
          error: { code: 'EVAL_001', message: '평가할 옷을 1개 이상 선택해주세요.' },
        } as ApiResponse);
        return;
      }

      const result = await coachingService.evaluateCoordi(userId, closetItemIds);
      if (!result) {
        res.status(400).json({
          success: false,
          data: null,
          error: { code: 'EVAL_001', message: '평가할 옷을 1개 이상 선택해주세요.' },
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('AI 코디 평가 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'EVAL_002', message: 'AI 코디 평가에 실패했습니다.' },
      } as ApiResponse);
    }
  }

  async getRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (userId === null) return;

      const recommendations = await coachingService.getRecommendations(userId);
      res.status(200).json({
        success: true,
        data: recommendations,
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('AI 코디 추천 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'EVAL_002', message: 'AI 코디 추천에 실패했습니다.' },
      } as ApiResponse);
    }
  }
}
