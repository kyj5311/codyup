import express from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'CodyUp API is running' }, error: null });
});

app.listen(PORT, () => {
  console.log(`CodyUp API running on http://localhost:${PORT}`);
});