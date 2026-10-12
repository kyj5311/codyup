// apps/api/src/routes/dashboard.routes.ts
// 홈 대시보드(FE2)가 바라보는 GET /api/dashboard-summary

import express from 'express';
import { CoachingController } from '../controllers/coaching.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const coachingController = new CoachingController();

router.use(authMiddleware);

router.get('/', (req, res) => coachingController.getDashboardSummary(req, res));

export default router;
