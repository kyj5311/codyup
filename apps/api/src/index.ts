// apps/api/src/index.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import closetRoutes from './routes/closet.routes';
import userRoutes from './routes/user.routes';
import roadmapRoutes from './routes/roadmap.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// 테스트용 미들웨어: 모든 요청에 userId 추가 (개발 편의)
app.use('/api/closet', (req, res, next) => {
  (req as any).user = { id: 1 };
  next();
});
app.use('/api/user', (req, res, next) => {
  (req as any).user = { id: 1 };
  next();
});
app.use('/api/purchase-roadmap', (req, res, next) => {
  (req as any).user = { id: 1 };
  next();
});

// ✅ 토큰 발급 API - /api/auth/token 으로 수정!
app.post('/api/auth/token', (req, res) => {
  const token = jwt.sign(
    { id: 1, email: 'test@example.com' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
  res.json({
    success: true,
    data: { token },
    error: null
  });
});

// 라우터 등록
app.use('/api/closet', closetRoutes);
app.use('/api/user', userRoutes);
app.use('/api/purchase-roadmap', roadmapRoutes);

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