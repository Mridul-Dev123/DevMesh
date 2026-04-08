# DevMesh

A full-stack developer social network inspired by X, built to explore real-time systems and social graph architecture. DevMesh empowers developers to share posts, follow each other, save content, and connect through real-time chat.

## Features

### Real-Time & Social Graph
- **Realtime Direct Messaging:** Secure chat with mutual-follow access control (both users must follow each other), typing indicators, read receipts (single/double tick), and unread message count badges.
- **Follow Graph:** Comprehensive follow system featuring a request flow (`PENDING` -> `ACCEPTED`), followers/following lists, and status tracking.
- **Realtime Notifications:** Instant WebSocket-powered notifications for post likes and comments when the post owner is online.

### Content
- **Rich Feeds:** Create, update, delete, and browse posts across a global timeline or a curated following feed.
- **Interactions:** Like, comment on, and bookmark posts for later viewing.
- **Media Uploads:** Integrated image upload support for posts and avatars using Cloudinary.

### Auth & Profiles
- **Session Auth:** Secure, session-based authentication (register, login, logout, current user).
- **Developer Profiles:** Customizable user profiles featuring bios, tech stacks, and avatar uploads.
- **Robust Infrastructure:** Centralized request validation and comprehensive error handling.

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

## Architecture & Project Structure

The repository is organized to enforce a strict separation of concerns, making it easy to add new domains or features without touching unrelated code. 

- **Client:** Employs a **feature-based architecture** (`src/features`). Grouping related UI components, custom hooks, and API calls by feature (e.g., auth, chat, posts) keeps the codebase cohesive and intuitive as the frontend grows.
- **Server:** Follows a **modular, domain-driven structure** (`src/modules`). Each domain (e.g., user, chat, post) encapsulates its own controllers, services, repositories, and routes, ensuring clear boundaries and isolated business logic.

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
git clone https://github.com/Mridul-Dev123/DevMesh.git
cd DevMesh
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

Testing deliberately covers critical system paths to ensure core functionality and resilience. The test suite validates:

- Consistent `ApiError` structure, error normalization, and middleware responses.
- Robust request validation middleware behavior.
- Realtime notification utility behavior and reliability.

## License

ISC
