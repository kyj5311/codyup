// apps/api/src/routes/closet.routes.ts

import express from 'express';
import { ClosetController } from '../controllers/closet.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const closetController = new ClosetController();

// 모든 옷장 API는 인증 필요 (개발 환경에서는 토큰 없이도 userId=1로 동작)
router.use(authMiddleware);

// 옷장 CRUD
router.post('/', (req, res) => closetController.createItem(req, res));
router.get('/', (req, res) => closetController.getItems(req, res));
router.get('/analysis', (req, res) => closetController.analyzeCloset(req, res));
router.get('/missing', (req, res) => closetController.getMissingItems(req, res));
router.get('/:id', (req, res) => closetController.getItemById(req, res));
router.put('/:id', (req, res) => closetController.updateItem(req, res));
router.delete('/:id', (req, res) => closetController.deleteItem(req, res));

export default router;