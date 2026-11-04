# Codomax Internship — Module 3: Database-Backed Blog

A full-stack **Next.js App Router + MongoDB** blog that completes the Module 3 objectives:

1. **Connect the application with MongoDB** (MongoDB Atlas or local MongoDB).
2. **Store user credentials and blog posts securely** (bcrypt password hashing, HTTP-only JWT session cookie, Zod validation, author ownership checks).
3. **Retrieve and display all blogs from the database** (home feed with search and category filters).
4. **Create a page to view individual blog details** (`/blog/[slug]` with Markdown content, metadata, related posts).

---

## Live demo mode

If you do not have MongoDB Atlas credentials yet, run:

```bash
npm install
npm run demo
```

This starts:

- an **in-memory MongoDB** using `mongodb-memory-server`,
- seeds **6 sample posts**,
- launches Next.js at `http://localhost:3000`.

Demo login:

```txt
Email:    demo@codomax.dev
Password: DemoPass123!
```

> Demo mode is for learning/previews. Data is stored in memory and resets when the demo process stops. For persistent storage, connect MongoDB Atlas.

---

## Connect MongoDB Atlas

### 1. Create a free Atlas cluster

1. Go to MongoDB Atlas and create a project/cluster.
2. Create a database user with a strong password.
3. Add your IP address under **Network Access**.
4. Copy the Node.js connection string.

### 2. Add environment variables

Create `.env.local` in the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/codomax?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
```

Generate a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Run the app

```bash
npm install
npm run dev
```

Optional: seed sample posts into your Atlas database:

```bash
npm run seed
```

> The seed script creates a demo account (`demo@codomax.dev` / `DemoPass123!`). Remove or change it before any real deployment.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Next.js using `MONGODB_URI` from `.env.local` |
| `npm run demo` | Start in-memory MongoDB + seed + Next.js demo |
| `npm run seed` | Seed sample posts into the configured MongoDB |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run typecheck` | TypeScript check |

---

## Pages

| Route | Description |
| --- | --- |
| `/` | Blog feed retrieved from MongoDB, with search and category filters |
| `/blog/[slug]` | Individual blog detail page with Markdown rendering and related posts |
| `/blog/[slug]/edit` | Edit a post (owner/admin only) |
| `/register` | Create account; password is hashed before storage |
| `/login` | Login; sets HTTP-only session cookie |
| `/write` | Create a blog post (protected) |
| `/dashboard` | Manage your posts (protected) |

---

## API routes

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register user, hash password, create session |
| `POST` | `/api/auth/login` | Validate credentials, create session |
| `POST` | `/api/auth/logout` | Clear session cookie |
| `GET` | `/api/auth/me` | Current session user |
| `GET` | `/api/blogs` | List published blogs (`q`, `category`, `page`, `limit`) |
| `POST` | `/api/blogs` | Create blog post (authenticated) |
| `GET` | `/api/blogs/[slug]` | Get one blog by slug |
| `PATCH` | `/api/blogs/[slug]` | Update own post |
| `DELETE` | `/api/blogs/[slug]` | Delete own post |
| `GET` | `/api/health` | Database health check |

---

## Security notes

- Passwords are **never stored in plain text**. Registration uses `bcrypt.hash(password, 12)`.
- The password hash field uses `select: false` and is removed from serialized responses.
- Sessions use a signed JWT stored in an **HTTP-only**, `SameSite=Lax` cookie; `Secure` is enabled in production.
- Protected pages are guarded by middleware and server-side session checks.
- Blog create/update/delete APIs verify that the requester owns the post (or is admin).
- Inputs are validated with **Zod**.
- Markdown is rendered with `react-markdown` without raw HTML, reducing XSS risk.
- Secrets live in `.env.local`, which is gitignored.

For a public production launch, also add rate limiting, monitoring, HTTPS, least-privilege Atlas credentials, and stricter network access.

---

## Project structure

```txt
codomax-module3/
├─ scripts/
│  ├─ demo.mjs          # in-memory MongoDB + seed + Next dev
│  ├─ seed.mjs          # idempotent sample data
│  └─ load-env.mjs
├─ src/
│  ├─ app/
│  │  ├─ api/           # auth + blogs + health routes
│  │  ├─ blog/[slug]/   # detail + edit pages
│  │  ├─ dashboard/
│  │  ├─ login/
│  │  ├─ register/
│  │  ├─ write/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx       # database-backed blog feed
│  │  └─ globals.css
│  ├─ components/
│  └─ lib/
│     ├─ db.ts          # cached Mongoose connection
│     ├─ auth.ts        # JWT session helpers
│     ├─ blogs.ts       # database queries
│     ├─ models/        # User + Blog schemas
│     ├─ validation.ts  # Zod schemas
│     └─ serialize.ts   # safe DTOs
└─ .env.example
```

---

## Module 3 objective checklist

- [x] Application connected to MongoDB via Mongoose.
- [x] User credentials stored securely with bcrypt + HTTP-only session cookie.
- [x] Blog posts stored in MongoDB with author reference, slug, tags, category, and draft/published state.
- [x] All blogs retrieved from the database and displayed on the home feed.
- [x] Individual blog detail page implemented at `/blog/[slug]`.
