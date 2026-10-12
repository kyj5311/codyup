// apps/api/src/routes/user.routes.ts

import express from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const userController = new UserController();

router.use(authMiddleware);

router.get('/profile', (req, res) => userController.getProfile(req, res));
router.put('/profile', (req, res) => userController.updateProfile(req, res));

export default router;
