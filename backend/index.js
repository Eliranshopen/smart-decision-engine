require('dotenv').config();
const express = require('express');
const cors = require('cors');

const affiliatesRouter = require('./routes/affiliates');
const newsRouter = require('./routes/news');
const recommendationsRouter = require('./routes/recommendations');
const subscriptionRouter = require('./routes/subscription');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ data: { status: 'ok', timestamp: new Date().toISOString() }, meta: {}, error: null });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/affiliates', affiliatesRouter);
app.use('/api/news', newsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/subscription', subscriptionRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ data: null, meta: {}, error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[backend] Smart Decision Engine API running on port ${PORT}`);
});

module.exports = app;
