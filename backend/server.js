require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();

/* ── Middleware ─────────────────────────────────────────── */
app.use(cors({
  origin: (origin, callback) => {
    const frontendUrl = process.env.FRONTEND_URL;
    const isLocalDevelopmentOrigin =
      process.env.NODE_ENV !== 'production' &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');

    if (!origin || !frontendUrl || origin === frontendUrl || isLocalDevelopmentOrigin) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

/* ── Routes ─────────────────────────────────────────────── */
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/content',  require('./routes/content'));
// TODO: app.use('/api/menu', require('./routes/menu'));  ← add when menu is ready

/* ── Health check ───────────────────────────────────────── */
app.get('/api/health', (_req, res) => res.json({ ok: true }));

/* ── 404 handler ────────────────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

/* ── Global error handler ───────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

/* ── Database + Start ───────────────────────────────────── */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
