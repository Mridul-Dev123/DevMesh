# DevMesh

DevMesh is a full-stack social platform for developers to share posts, follow each other, save content, and chat in real time.

## Features

- Session-based authentication (register, login, logout, current user).
- Developer profiles with bio, tech stack, and avatar upload.
- Create, update, delete, and browse posts (global + following feed).
- Image upload support for posts and avatars (Cloudinary).
- Likes and comments on posts.
- Bookmarks (save/unsave posts and list saved posts).
- Follow graph with request flow (`PENDING` -> `ACCEPTED`), followers/following lists, and status endpoint.
- Realtime notifications for post likes/comments (when the post owner is online).
- Realtime direct messaging with:
  - mutual-follow access control (both users must follow each other),
  - typing indicator,
  - read receipts (single tick / double tick),
  - unread message count badge in navbar.
- Request validation and centralized error handling.
- Basic unit/integration test coverage for core error and validation behavior.

## Tech Stack

### Client

| Area | Stack |
|---|---|
| Framework | React 19 + Vite |
| Routing | React Router |
| State/Data | TanStack Query |
| HTTP | Axios |
| Styling | Tailwind CSS |
| Realtime | Socket.IO Client |
| Notifications | React Hot Toast |

### Server

| Area | Stack |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | Passport Local + Express Session |
| Session Store | connect-pg-simple |
| Uploads | Multer + Cloudinary |
| Realtime | Socket.IO |

## Project Structure

```text
DevMesh/
|-- Client/
|   `-- src/
|       |-- app/
|       |-- components/
|       |-- features/
|       |-- hooks/
|       |-- services/
|       `-- utils/
`-- Server/
    |-- prisma/
    |-- src/
    |   |-- config/
    |   |-- core/
    |   |-- middleware/
    |   |-- modules/
    |   `-- utils/
    `-- test/
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Cloudinary account

### 1. Clone

```bash
git clone https://github.com/your-username/devmesh.git
cd devmesh
```

### 2. Setup Server

```bash
cd Server
npm install
```

Create `Server/.env`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/devmesh
SESSION_SECRET=replace_with_a_secure_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=3000

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run migrations (and optional seed):

```bash
npx prisma migrate dev
npm run seed
```

Start backend:

```bash
npm run dev
```

### 3. Setup Client

```bash
cd ../Client
npm install
```

Create `Client/.env`:

```env
VITE_BASE_URL=http://localhost:3000/api
```

Start frontend:

```bash
npm run dev
```

## Scripts

### Server (`/Server`)

```bash
npm run dev
npm run lint
npm run lint:ci
npm run lint:fix
npm run test
npm run test:watch
npm run seed
npm run format
```

### Client (`/Client`)

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run lint:ci
npm run lint:fix
```

## API Overview

### Auth (`/api/auth`)

- `POST /register`
- `POST /login`
- `POST /logout`
- `GET /me`
- `GET /profile/:userId`
- `PATCH /profile`

### Posts (`/api/post`)

- `GET /` (global feed)
- `GET /feed/following`
- `GET /:id`
- `GET /user/:userId`
- `POST /`
- `PATCH /:id`
- `DELETE /:id`

### Likes (`/api/like`)

- `POST /:id`
- `DELETE /:id`

### Comments (`/api/comment`)

- `POST /:postId`
- `GET /:postId`
- `DELETE /:commentId`

### Follow (`/api/follow`)

- `GET /pending`
- `POST /:userId`
- `PATCH /:userId/accept`
- `DELETE /:userId/reject`
- `DELETE /:userId`
- `GET /:userId/status`
- `GET /:userId/followers`
- `GET /:userId/following`

### Bookmarks (`/api/bookmark`)

- `GET /`
- `POST /:postId`
- `DELETE /:postId`

### Chat (`/api/chat`)

- `GET /conversations`
- `POST /conversations/:userId`
- `GET /conversations/:conversationId/messages`
- `POST /conversations/:conversationId/messages`
- `GET /unread`

### Realtime Socket Events (Chat)

- Client emits: `join_conversation`, `leave_conversation`, `send_message`, `typing_start`, `typing_stop`, `conversation_seen`
- Server emits: `new_message`, `conversation_typing`, `messages_read`

## Testing

Server tests are runnable with:

```bash
cd Server
npm run test
```

Current tests cover key unit/integration behavior for:

- `ApiError` structure,
- error normalization and middleware responses,
- request validation middleware,
- realtime notification utility behavior.

## License

ISC
