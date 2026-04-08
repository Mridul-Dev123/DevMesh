import assert from 'node:assert/strict';
import express from 'express';
import multer from 'multer';
import ApiError from '../src/core/ApiError.js';
import errorHandler, { normalizeError } from '../src/middleware/errorHandler.js';
import notFound from '../src/middleware/notFound.js';
import {
  buildPostInteractionNotification,
  emitNotificationToUser,
} from '../src/utils/notifications.js';
import {
  validateCreateCommentBody,
  validateRegisterBody,
  validateUuidParam,
} from '../src/middleware/validateRequest.js';

process.env.NODE_ENV = 'test';

const tests = [];

const addTest = (name, fn) => {
  tests.push({ name, fn });
};

const runMiddleware = (middleware, req) =>
  new Promise((resolve) => {
    middleware(req, {}, (error) => resolve(error));
  });

const withServer = async (app, fn) => {
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  try {
    const port = server.address().port;
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
};

addTest('ApiError stores status, code, and details', () => {
  const error = new ApiError(422, 'Invalid payload', {
    code: 'VALIDATION_ERROR',
    errors: [{ field: 'email', message: 'invalid' }],
  });

  assert.equal(error.statusCode, 422);
  assert.equal(error.code, 'VALIDATION_ERROR');
  assert.equal(error.success, false);
  assert.deepEqual(error.errors, [{ field: 'email', message: 'invalid' }]);
});

addTest('normalizeError maps Prisma unique errors to 409', () => {
  const prismaError = new Error('duplicate');
  prismaError.name = 'PrismaClientKnownRequestError';
  prismaError.code = 'P2002';
  prismaError.meta = { target: ['email'] };

  const normalized = normalizeError(prismaError);
  assert.equal(normalized.statusCode, 409);
  assert.equal(normalized.code, 'PRISMA_UNIQUE_CONSTRAINT');
});

addTest('buildPostInteractionNotification creates message payload', () => {
  const payload = buildPostInteractionNotification({
    type: 'post_commented',
    actor: { id: 'u1', username: 'alice', avatarUrl: null },
    post: { id: 'p1', content: 'This is a detailed content line for the post body' },
  });

  assert.equal(payload.type, 'post_commented');
  assert.equal(payload.actor.username, 'alice');
  assert.equal(payload.post.id, 'p1');
  assert.ok(payload.message.includes('commented on your post'));
});

addTest('emitNotificationToUser sends only when recipient is online', () => {
  const emitted = [];
  const rooms = new Map();
  const roomName = 'user:u-1';
  rooms.set(roomName, new Set(['socket-1']));

  const io = {
    sockets: { adapter: { rooms } },
    to: (room) => ({
      emit: (event, payload) => emitted.push({ room, event, payload }),
    }),
  };

  const sent = emitNotificationToUser(io, 'u-1', { message: 'Hello' });
  const notSent = emitNotificationToUser(io, 'u-2', { message: 'Hello' });

  assert.equal(sent, true);
  assert.equal(notSent, false);
  assert.equal(emitted.length, 1);
  assert.equal(emitted[0].event, 'notification');
});

addTest('validateRegisterBody normalizes and accepts valid input', async () => {
  const req = {
    body: {
      username: '  dev_user ',
      email: ' USER@EXAMPLE.com ',
      password: 'supersecret',
    },
  };

  const error = await runMiddleware(validateRegisterBody, req);
  assert.equal(error, undefined);
  assert.equal(req.body.username, 'dev_user');
  assert.equal(req.body.email, 'user@example.com');
});

addTest('validateUuidParam rejects malformed UUID', async () => {
  const req = { params: { postId: 'bad-id' } };
  const error = await runMiddleware(validateUuidParam('postId'), req);

  assert.ok(error instanceof ApiError);
  assert.equal(error.statusCode, 400);
});

addTest('error handler returns structured 400 for invalid JSON', async () => {
  const app = express();
  app.use(express.json());
  app.post('/echo', (_req, res) => {
    res.status(200).json({ ok: true });
  });
  app.use(notFound);
  app.use(errorHandler);

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/echo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"badJson":',
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.code, 'VALIDATION_ERROR');
    assert.equal(payload.message, 'Invalid JSON payload');
  });
});

addTest('error handler maps Multer file-size errors to 400', async () => {
  const app = express();
  app.get('/upload-error', () => {
    throw new multer.MulterError('LIMIT_FILE_SIZE');
  });
  app.use(errorHandler);

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/upload-error`);
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.code, 'VALIDATION_ERROR');
    assert.ok(payload.errors.some((item) => item.field === 'file'));
  });
});

addTest('validation middleware protects routes in integration flow', async () => {
  const app = express();
  app.use(express.json());

  app.post(
    '/comment/:postId',
    validateUuidParam('postId'),
    validateCreateCommentBody,
    (req, res) => {
      res.status(200).json({ ok: true, content: req.body.content });
    }
  );
  app.use(errorHandler);

  await withServer(app, async (baseUrl) => {
    const invalidResponse = await fetch(`${baseUrl}/comment/not-a-uuid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'hello' }),
    });
    assert.equal(invalidResponse.status, 400);

    const validResponse = await fetch(`${baseUrl}/comment/550e8400-e29b-41d4-a716-446655440000`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '  hello world  ' }),
    });
    const payload = await validResponse.json();
    assert.equal(validResponse.status, 200);
    assert.equal(payload.content, 'hello world');
  });
});

let passed = 0;
let failed = 0;

for (const { name, fn } of tests) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

console.log(`\nTest summary: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exitCode = 1;
}
