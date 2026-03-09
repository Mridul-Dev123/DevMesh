import express from 'express';
import session from 'express-session';
import passport from './config/passport.js';
import userRouter from './modules/user/user.route.js';
import msgRouter from './modules/post/post.route.js';
import likeRouter from './modules/like/like.route.js';
import commentRouter from './modules/comment/comment.route.js';
import followRouter from './modules/Follow/follow.route.js';
import chatRouter from './modules/chat/chat.route.js';
import cors from 'cors';
import ApiError from './core/ApiError.js';
import connectPgSimple from 'connect-pg-simple';
import pkg from 'pg';

const PgSession = connectPgSimple(session);

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Request logger ────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  const hasBody = !['GET', 'HEAD', 'DELETE'].includes(req.method);
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  if (hasBody && req.body && Object.keys(req.body).length > 0) {
    console.log('  Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});
// ───────────---─────────────────────────────────────────────────────────────────

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
app.use(
  session({
    store: new PgSession({
      pool,
      tableName: 'Session',
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get('/api', (req, res) => {
  return res.status(200).json({
    message: 'DevMesh  API is live!',
    status: 'active',
    timestamp: new Date(),
  });
});
app.use('/api/auth', userRouter);
app.use('/api/post', msgRouter);
app.use('/api/like', likeRouter);
app.use('/api/comment', commentRouter);
app.use('/api/follow', followRouter);
app.use('/api/chat', chatRouter);

app.use((req, res, next) => {
  next(new ApiError(404, 'Route not found'));
});

app.use((err, req, res, next) => {
  void next;
  console.error(err.stack);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  console.log('final Error', err);
  return res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    errors: [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
