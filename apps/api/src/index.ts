// apps/api/src/index.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import closetRoutes from './routes/closet.routes';
import userRoutes from './routes/user.routes';
import roadmapRoutes from './routes/roadmap.routes';
import { coordiEvaluationsRouter, coordiRecommendationsRouter } from './routes/coaching.routes';
import closetInsightRoutes from './routes/closet-insight.routes';
import dashboardRoutes from './routes/dashboard.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 부스 계정(FE1/FE2/BE1/BE2/Planner/Designer) 로그인 — POST /api/auth/login
// 아래 각 라우터가 이미 authMiddleware로 실제 Bearer 토큰을 검증하므로,
// 예전처럼 모든 요청에 userId=1을 강제로 주입하던 개발용 미들웨어는 제거함.
app.use('/api/auth', authRoutes);

// 라우터 등록
app.use('/api/closet', closetRoutes);
app.use('/api/user', userRoutes);
app.use('/api/purchase-roadmap', roadmapRoutes);
app.use('/api/coordi-evaluations', coordiEvaluationsRouter);
app.use('/api/coordi-recommendations', coordiRecommendationsRouter);
app.use('/api/coaching', closetInsightRoutes);
app.use('/api/dashboard-summary', dashboardRoutes);

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'CodyUp API is running' }, error: null });
});

app.listen(PORT, () => {
  console.log(`🚀 CodyUp API running on http://localhost:${PORT}`);
});