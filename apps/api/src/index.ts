// apps/api/src/index.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';  // ✅ 추가!
import closetRoutes from './routes/closet.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ✅ 임시 토큰 발급 API (테스트용!)
app.post('/auth/token', (req, res) => {
  // 테스트용 userId = 1
  const token = jwt.sign(
    { id: 1, email: 'test@example.com' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  );
  res.json({
    success: true,
    data: { token },
    error: null
  });
});

app.use('/api/closet', closetRoutes);
app.use('/api/user', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'CodyUp API is running' }, error: null });
});

app.listen(PORT, () => {
  console.log(`🚀 CodyUp API running on http://localhost:${PORT}`);
});