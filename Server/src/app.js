import express from 'express';
import session from 'express-session';
import passport from './config/passport.js';
import userRouter from './modules/user/user.route.js';
import msgRouter from './modules/post/post.route.js';
import likeRouter from './modules/like/like.route.js';
import commentRouter from './modules/comment/comment.route.js';
import followRouter from './modules/Follow/follow.route.js';
import chatRouter from './modules/chat/chat.route.js';
import bookmarkRouter from './modules/bookmark/bookmark.route.js';
import cors from 'cors';
import connectPgSimple from 'connect-pg-simple';
import pkg from 'pg';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const PgSession = connectPgSimple(session);

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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
    const safeBody = { ...req.body };
    if (typeof safeBody.password === 'string') safeBody.password = '[REDACTED]';
    if (typeof safeBody.confirmPassword === 'string') safeBody.confirmPassword = '[REDACTED]';
    console.log('  Body:', JSON.stringify(safeBody, null, 2));
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
app.use('/api/bookmark', bookmarkRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
