# Module 3 Submission Checklist

## Key objective 1: Connect your application with MongoDB or Supabase

**Chosen database:** MongoDB

Implemented in:

- `src/lib/db.ts` — cached Mongoose connection using `MONGODB_URI`.
- `.env.example` — environment variable template.
- `scripts/demo.mjs` — runnable in-memory MongoDB demo when Atlas credentials are unavailable.

Verification:

```bash
curl http://localhost:3000/api/health
# {"ok":true,"data":{"status":"healthy","database":"connected"}}
```

## Key objective 2: Store user credentials and blog posts data securely

Implemented in:

- `src/lib/models/User.ts` — stores `passwordHash`, not plain password; hash is `select: false`.
- `src/app/api/auth/register/route.ts` — bcrypt hash with cost factor 12.
- `src/app/api/auth/login/route.ts` — bcrypt compare, generic invalid-credentials error.
- `src/lib/auth.ts` — signed JWT in HTTP-only cookie.
- `src/lib/models/Blog.ts` — blog posts reference author and validate required fields.
- `src/app/api/blogs/route.ts` and `src/app/api/blogs/[slug]/route.ts` — authenticated create/update/delete with ownership checks.
- `src/lib/validation.ts` — Zod input validation.

## Key objective 3: Retrieve and display all blogs from the database

Implemented in:

- `src/lib/blogs.ts` — `getPublishedBlogs()` queries MongoDB.
- `src/app/page.tsx` — server-rendered blog feed.
- `src/components/BlogCard.tsx` — blog cards with author, date, reading time, tags.
- Search and category filters are applied at the database query level.

## Key objective 4: Create a page to view individual blog details

Implemented in:

- `src/app/blog/[slug]/page.tsx` — dynamic detail route.
- `getBlogBySlug()` retrieves one post by slug.
- Markdown content is rendered safely.
- `generateMetadata()` creates per-post SEO metadata.
- Related posts are fetched from MongoDB.
- Draft posts are only visible to their author/admin.

## Extra features included

- Register/login/logout.
- Protected write/edit/dashboard pages.
- Create, edit, delete own posts.
- Draft/published states.
- Seed data and demo account.
- Responsive UI.
