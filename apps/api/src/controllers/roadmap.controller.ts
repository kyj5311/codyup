// apps/api/src/controllers/roadmap.controller.ts

import { Response } from 'express';
import { RoadmapService } from '../services/roadmap/roadmap.service';
import { ApiResponse } from '../types';
import { AuthRequest } from '../middlewares/auth.middleware';

const roadmapService = new RoadmapService();

interface ToggleItemBody {
  isPurchased: boolean;
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

export class RoadmapController {
  async getRoadmap(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (userId === null) return;

      const roadmap = await roadmapService.getOrCreateForUser(userId);
      res.status(200).json({
        success: true,
        data: roadmap,
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('구매 로드맵 조회 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'ROADMAP_002', message: '구매 로드맵 조회에 실패했습니다.' },
      } as ApiResponse);
    }
  }

  async toggleItemPurchased(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (userId === null) return;

      const itemId = parseInt(String(req.params.itemId));
      if (isNaN(itemId)) {
        res.status(400).json({
          success: false,
          data: null,
          error: { code: 'ROADMAP_003', message: '유효하지 않은 아이템 ID입니다.' },
        } as ApiResponse);
        return;
      }

      const body = req.body as ToggleItemBody;
      if (typeof body.isPurchased !== 'boolean') {
        res.status(400).json({
          success: false,
          data: null,
          error: { code: 'ROADMAP_003', message: 'isPurchased 값은 boolean이어야 합니다.' },
        } as ApiResponse);
        return;
      }

      const updated = await roadmapService.toggleItemPurchased(userId, itemId, body.isPurchased);
      if (!updated) {
        res.status(404).json({
          success: false,
          data: null,
          error: { code: 'ROADMAP_001', message: '로드맵 아이템을 찾을 수 없습니다.' },
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: updated,
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('로드맵 아이템 구매완료 토글 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'ROADMAP_002', message: '로드맵 아이템 수정에 실패했습니다.' },
      } as ApiResponse);
    }
  }
}
