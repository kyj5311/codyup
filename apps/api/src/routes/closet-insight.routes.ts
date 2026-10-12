// apps/api/src/routes/closet-insight.routes.ts
// FE2의 closet-insight-api.ts가 바라보는 GET /coaching/closet-summary, /coaching/usable-coordis

import express from 'express';
import { CoachingController } from '../controllers/coaching.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const coachingController = new CoachingController();

router.use(authMiddleware);

router.get('/closet-summary', (req, res) => coachingController.getClosetSummary(req, res));
router.get('/usable-coordis', (req, res) => coachingController.getUsableCoordis(req, res));

export default router;
