# 🌐 DevMesh

> A social platform built for developers — share ideas, follow peers, and collaborate through code.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Node.js%20%7C%20Prisma%20%7C%20PostgreSQL-blue)
![License](https://img.shields.io/badge/License-ISC-green)

---

## ✨ Features

- 🔐 **Authentication** — Session-based login/register with Passport.js. GitHub OAuth ready.
- 📝 **Posts** — Create, edit, and delete posts with text, code snippets, and images.
- 🖼️ **Media Uploads** — Cloudinary-backed image uploads for posts (5MB) and avatars (2MB).
- ❤️ **Likes** — Toggle likes on any post.
- 💬 **Comments** — Add and delete comments per post.
- 👥 **Follow System** — Send, accept, and reject follow requests. PENDING / ACCEPTED states.
- 📰 **Feed** — Global feed (all posts) and a Following feed (posts from people you follow).
- 💬 **Real-time Chat** — Socket.io powered private messaging (in progress).
- 👤 **Profiles** — View and edit profiles with bio, tech stack, and avatar.

---

## 🏗️ Tech Stack

### Client
| | |
|---|---|
| Framework | React 19 + Vite |
| Routing | React Router v7 |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form |
| Styling | Tailwind CSS v4 |
| HTTP | Axios |
| Notifications | React Hot Toast |

### Server
| | |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express v5 |
| ORM | Prisma v6 |
| Database | PostgreSQL |
| Auth | Passport.js (Local + GitHub OAuth) |
| Sessions | express-session + connect-pg-simple |
| Media | Cloudinary + Multer |
| Real-time | Socket.io |

---

## 📁 Project Structure

```
DevMesh/
├── Client/                  # React frontend
│   └── src/
│       ├── app/             # Router and QueryClient setup
│       ├── components/      # Shared UI (Navbar, PostCard, Avatar, etc.)
│       ├── features/        # Feature modules (auth, posts, profile, follow, etc.)
│       ├── hooks/           # Global hooks (useAuth)
│       └── services/        # Axios API client
│
└── Server/                  # Express backend
    ├── prisma/              # Prisma schema and seed
    └── src/
        ├── config/          # Passport & Prisma setup
        ├── core/            # ApiResponse, ApiError, asyncHandler
        ├── middleware/       # Auth guard, Multer upload
        ├── modules/         # Feature modules (post, user, like, comment, follow, chat)
        └── utils/           # Cloudinary helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL database
- Cloudinary account

### 1. Clone the repo
```bash
git clone https://github.com/your-username/devmesh.git
cd devmesh
```

### 2. Setup the Server
```bash
cd Server
npm install
```

Create a `.env` file in the `Server` directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/devmesh
SESSION_SECRET=your_super_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Run Prisma migrations and seed:
```bash
npx prisma migrate dev
npm run seed
```

Start the dev server:
```bash
npm run dev
```
> Runs on `http://localhost:3000`

---

### 3. Setup the Client
```bash
cd ../Client
npm install
```

Create a `.env` file in the `Client` directory:
```env
VITE_BASE_URL=http://localhost:3000/api
```

Start the dev server:
```bash
npm run dev
```
> Runs on `http://localhost:5173`

---

## 🛣️ API Reference

### Auth — `/api/auth`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/register` | Register a new user |
| POST | `/login` | Login with username/email + password |
| POST | `/logout` | Logout |
| GET | `/me` | Get current user |
| GET | `/profile/:userId` | Get user profile |
| PATCH | `/profile` | Update profile (bio, avatar, tech stack) |

### Posts — `/api/post`
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Global feed (paginated) |
| GET | `/feed/following` | Following-only feed |
| GET | `/:id` | Get single post |
| GET | `/user/:userId` | Get user's posts |
| POST | `/` | Create post (with optional image) |
| PATCH | `/:id` | Update post (author only) |
| DELETE | `/:id` | Delete post + Cloudinary cleanup |

### Social — `/api/like`, `/api/comment`, `/api/follow`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/like/:id` | Like a post |
| DELETE | `/like/:id` | Unlike a post |
| POST | `/comment/:postId` | Add a comment |
| GET | `/comment/:postId` | Get comments |
| DELETE | `/comment/:commentId` | Delete a comment |
| POST | `/follow/:userId` | Send follow request |
| PATCH | `/follow/:userId/accept` | Accept follow request |
| DELETE | `/follow/:userId/reject` | Reject follow request |
| DELETE | `/follow/:userId` | Unfollow a user |
| GET | `/follow/:userId/followers` | List followers |
| GET | `/follow/:userId/following` | List following |
| GET | `/follow/pending` | Pending follow requests |
| GET | `/follow/:userId/status` | Follow status |

---

## 🧹 Scripts

### Server
```bash
npm run dev      # Start with nodemon
npm run lint     # Run ESLint
npm run format   # Run Prettier
npm run seed     # Seed the database
```

### Client
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run lint     # Run ESLint
```

---

## 📄 License

ISC © DevMesh
