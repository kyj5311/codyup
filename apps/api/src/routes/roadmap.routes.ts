// apps/api/src/routes/roadmap.routes.ts

import express from 'express';
import { RoadmapController } from '../controllers/roadmap.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const roadmapController = new RoadmapController();

router.use(authMiddleware);

router.get('/', (req, res) => roadmapController.getRoadmap(req, res));
router.patch('/:itemId', (req, res) => roadmapController.toggleItemPurchased(req, res));

export default router;
