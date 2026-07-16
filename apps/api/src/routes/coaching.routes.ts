// apps/api/src/routes/coaching.routes.ts

import express from 'express';
import { CoachingController } from '../controllers/coaching.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const coachingController = new CoachingController();

export const coordiEvaluationsRouter = express.Router();
coordiEvaluationsRouter.use(authMiddleware);
coordiEvaluationsRouter.post('/', (req, res) => coachingController.evaluateCoordi(req, res));

export const coordiRecommendationsRouter = express.Router();
coordiRecommendationsRouter.use(authMiddleware);
coordiRecommendationsRouter.get('/', (req, res) => coachingController.getRecommendations(req, res));
