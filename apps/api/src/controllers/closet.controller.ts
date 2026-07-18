// apps/api/src/controllers/closet.controller.ts

import { Response } from 'express';
import { ClosetService } from '../services/closet/closet.service';
import { ApiResponse } from '../types';
import { AuthRequest } from '../middlewares/auth.middleware';

const closetService = new ClosetService();

interface CreateItemBody {
  imageUrl: string;
  category: string;
  color: string;
  brand?: string;
  memo?: string;
  fit?: string;
  length?: string;
  isFavorite?: boolean;
}

interface UpdateItemBody extends Partial<CreateItemBody> {}

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

export class ClosetController {
  async createItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (userId === null) return;

      const body = req.body as CreateItemBody;
      const item = await closetService.createItem(userId, body);

      res.status(201).json({
        success: true,
        data: item,
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('옷장 등록 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'CLOSET_001', message: '옷장 아이템 등록에 실패했습니다.' },
      } as ApiResponse);
    }
  }

  async getItems(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (userId === null) return;

      const items = await closetService.getItemsByUser(userId);
      res.status(200).json({
        success: true,
        data: items,
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('옷장 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'CLOSET_002', message: '옷장 목록 조회에 실패했습니다.' },
      } as ApiResponse);
    }
  }

  async getItemById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (userId === null) return;

      const itemId = parseInt(String(req.params.id));
      if (isNaN(itemId)) {
        res.status(400).json({
          success: false,
          data: null,
          error: { code: 'CLOSET_003', message: '유효하지 않은 아이템 ID입니다.' },
        } as ApiResponse);
        return;
      }

      const item = await closetService.getItemById(itemId, userId);
      if (!item) {
        res.status(404).json({
          success: false,
          data: null,
          error: { code: 'CLOSET_004', message: '해당 옷장 아이템을 찾을 수 없습니다.' },
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: item,
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('옷장 단건 조회 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'CLOSET_005', message: '옷장 아이템 조회에 실패했습니다.' },
      } as ApiResponse);
    }
  }

  async updateItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (userId === null) return;

      const itemId = parseInt(String(req.params.id));
      const body = req.body as UpdateItemBody;

      if (isNaN(itemId)) {
        res.status(400).json({
          success: false,
          data: null,
          error: { code: 'CLOSET_003', message: '유효하지 않은 아이템 ID입니다.' },
        } as ApiResponse);
        return;
      }

      const updated = await closetService.updateItem(itemId, userId, body);
      if (!updated) {
        res.status(404).json({
          success: false,
          data: null,
          error: { code: 'CLOSET_004', message: '해당 옷장 아이템을 찾을 수 없습니다.' },
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: updated,
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('옷장 수정 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'CLOSET_006', message: '옷장 아이템 수정에 실패했습니다.' },
      } as ApiResponse);
    }
  }

  async deleteItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (userId === null) return;

      const itemId = parseInt(String(req.params.id));
      if (isNaN(itemId)) {
        res.status(400).json({
          success: false,
          data: null,
          error: { code: 'CLOSET_003', message: '유효하지 않은 아이템 ID입니다.' },
        } as ApiResponse);
        return;
      }

      const deleted = await closetService.deleteItem(itemId, userId);
      if (!deleted) {
        res.status(404).json({
          success: false,
          data: null,
          error: { code: 'CLOSET_004', message: '해당 옷장 아이템을 찾을 수 없습니다.' },
        } as ApiResponse);
        return;
      }

      res.status(200).json({
        success: true,
        data: { id: itemId, deleted: true },
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('옷장 삭제 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'CLOSET_007', message: '옷장 아이템 삭제에 실패했습니다.' },
      } as ApiResponse);
    }
  }

  async analyzeCloset(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (userId === null) return;

      const analysis = await closetService.analyzeCloset(userId);
      res.status(200).json({
        success: true,
        data: analysis,
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('옷장 분석 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'CLOSET_008', message: '옷장 분석에 실패했습니다.' },
      } as ApiResponse);
    }
  }

  async getMissingItems(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = getUserId(req, res);
      if (userId === null) return;

      const suggestions = await closetService.getMissingItems(userId);
      res.status(200).json({
        success: true,
        data: suggestions,
        error: null,
      } as ApiResponse);
    } catch (error) {
      console.error('부족 아이템 분석 오류:', error);
      res.status(500).json({
        success: false,
        data: null,
        error: { code: 'CLOSET_009', message: '부족 아이템 분석에 실패했습니다.' },
      } as ApiResponse);
    }
  }
}
