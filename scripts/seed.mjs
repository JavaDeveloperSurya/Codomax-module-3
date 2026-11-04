import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { pathToFileURL } from 'node:url';
import { loadEnv } from './load-env.mjs';

const DEMO_EMAIL = 'demo@codomax.dev';
const DEMO_PASSWORD = 'DemoPass123!';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, select: false },
  role: { type: String, default: 'user' },
}, { timestamps: true });

const BlogSchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  excerpt: String,
  content: String,
  category: String,
  tags: [String],
  coverTheme: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  published: { type: String, default: 'published' },
}, { timestamps: true });

const posts = [
  {
    title: 'Connecting Next.js to MongoDB Atlas: A Practical Module 3 Guide',
    slug: 'connecting-nextjs-to-mongodb-atlas',
    category: 'Web Development',
    coverTheme: 'violet',
    tags: ['nextjs', 'mongodb', 'mongoose', 'atlas'],
    excerpt: 'A step-by-step walkthrough of wiring a Next.js App Router project to MongoDB Atlas with Mongoose, environment variables, and a cached connection helper.',
    content: `## Why a database changes everything

In the first two modules we built interfaces. In Module 3 the app starts to remember things: users, sessions, and posts survive refreshes, deployments, and new devices.

## The connection helper

Next.js hot-reloads server code in development. If every reload opens a new MongoDB connection, you can quickly exhaust Atlas connection limits. The fix is a cached connection stored on \`globalThis\`.

\`\`\`ts
const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.promise ??= mongoose.connect(process.env.MONGODB_URI!);
  cached.conn = await cached.promise;
  return cached.conn;
}
\`\`\`

## Environment variables

Keep the connection string in \`.env.local\`, never in client components or Git:

\`\`\`bash
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/codomax
JWT_SECRET=a-long-random-string
\`\`\`

## What to verify

- The app boots without connection warnings.
- A test document can be written and read back.
- The password is not visible in the browser bundle.
- Atlas Network Access allows your current IP (or your deployment platform).`,
  },
  {
    title: 'Storing User Credentials Securely with bcrypt and HTTP-only Cookies',
    slug: 'storing-user-credentials-securely',
    category: 'Tutorial',
    coverTheme: 'sunset',
    tags: ['security', 'bcrypt', 'jwt', 'auth'],
    excerpt: 'Passwords should never be stored as plain text. Here is the register/login flow used in this project: validate, hash, compare, and issue an HTTP-only session cookie.',
    content: `## The rule

Never store a password. Store a slow, salted hash of the password.

## Registration

1. Validate name, email, and password with Zod.
2. Normalize the email and check for duplicates.
3. Hash with bcrypt at cost factor 12.
4. Save only \`passwordHash\`.
5. Create a signed JWT and set it as an HTTP-only cookie.

\`\`\`ts
const passwordHash = await bcrypt.hash(password, 12);
const user = await User.create({ name, email, passwordHash });
\`\`\`

## Login

Fetch the user with \`.select('+passwordHash')\`, then compare:

\`\`\`ts
const ok = await bcrypt.compare(password, user.passwordHash);
if (!ok) return Response.json({ error: 'Invalid credentials' }, { status: 401 });
\`\`\`

Return the same error for unknown emails and wrong passwords so attackers cannot enumerate accounts.

## Session cookies

- \`httpOnly: true\` so JavaScript cannot read the token.
- \`sameSite: 'lax'\` to reduce CSRF risk.
- \`secure: true\` in production.
- Short-ish expiry plus server-side verification on every protected request.`,
  },
  {
    title: 'Designing Blog and User Schemas in Mongoose',
    slug: 'designing-blog-and-user-schemas',
    category: 'Web Development',
    coverTheme: 'ocean',
    tags: ['mongoose', 'schema', 'mongodb', 'data-modeling'],
    excerpt: 'A clean data model makes the rest of the app easy. This post breaks down the User and Blog schemas, indexes, references, and serialization used in the project.',
    content: `## User schema

The User model keeps only what auth needs:

- \`name\`
- \`email\` (unique, lowercase)
- \`passwordHash\` (select: false)
- \`role\`
- timestamps

\`select: false\` is a small but important default: ordinary queries never accidentally ship the hash to the client.

## Blog schema

The Blog model references its author:

\`\`\`ts
author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
\`\`\`

Useful fields include \`title\`, \`slug\`, \`excerpt\`, \`content\`, \`category\`, \`tags\`, \`coverTheme\`, and \`published\`.

## Indexes

- Unique index on \`User.email\`.
- Unique index on \`Blog.slug\`.
- Index on \`Blog.author\` and \`Blog.createdAt\` for dashboards and feeds.
- Text index on title/excerpt/tags if you want MongoDB text search.

## Serialization

Convert Mongo documents into plain DTOs before sending them to the browser. That is where you rename \`_id\` to \`id\`, format dates, and guarantee that sensitive fields are absent.`,
  },
  {
    title: 'From Database to UI: Rendering a Blog Feed and Detail Page',
    slug: 'from-database-to-ui-blog-feed-detail',
    category: 'Design',
    coverTheme: 'forest',
    tags: ['nextjs', 'app-router', 'ui', 'server-components'],
    excerpt: 'Server Components can query MongoDB directly, then pass safe DTOs to the UI. Here is how the feed, search, category filters, and individual blog pages fit together.',
    content: `## Server Components read the database

In the App Router, a page can be an async function:

\`\`\`tsx
export default async function HomePage() {
  const blogs = await getPublishedBlogs();
  return <BlogGrid blogs={blogs} />;
}
\`\`\`

No client-side fetch waterfall is required for the initial render.

## The feed

The home page supports:

- Search across title, excerpt, tags, and content.
- Category chips.
- A featured latest post.
- Responsive cards with reading time and author.

## The detail page

A dynamic route like \`app/blog/[slug]/page.tsx\` loads one post by slug. If the post is missing or is an unpublished draft owned by someone else, call \`notFound()\`.

Render Markdown with a library that does not allow raw HTML by default. That keeps user-generated content from becoming an XSS hole.

## Metadata

Use \`generateMetadata\` to set the title and description from the post. That makes each blog page shareable and SEO-friendly.`,
  },
  {
    title: 'What I Learned Building Module 3 of the Codomax Internship',
    slug: 'what-i-learned-module-3-codomax',
    category: 'Career',
    coverTheme: 'rose',
    tags: ['internship', 'codomax', 'learning', 'fullstack'],
    excerpt: 'Reflections on moving from static pages to a real full-stack feature: databases, auth, validation, and the small security details that matter.',
    content: `## The shift

Module 1 and 2 taught me to make things look right. Module 3 taught me to make things persist safely.

## The checklist that helped

- Connect the app to MongoDB.
- Store user credentials securely.
- Store blog posts with author references.
- Retrieve and display all blogs.
- Build an individual blog detail page.

## The surprising parts

The hardest bugs were not syntax errors. They were environmental: a missing \`.env.local\`, an Atlas IP allowlist, a model compiled twice during hot reload, or a cookie that was not marked HTTP-only.

## Advice to the next intern

Build the smallest vertical slice first: register, login, create one post, list posts, open one post. Once that loop works, styling and extra features are much less scary.`,
  },
  {
    title: 'Shipping a Full-Stack Blog: Environment, Seed Data, and Deployment Notes',
    slug: 'shipping-fullstack-blog-deployment-notes',
    category: 'Product',
    coverTheme: 'mono',
    tags: ['deployment', 'seed', 'env', 'checklist'],
    excerpt: 'A practical launch checklist for the blog app: seed content, demo mode, Atlas production settings, and the difference between local demo data and real user data.',
    content: `## Local demo vs real database

This project can run in two modes:

1. \`npm run demo\` starts an in-memory MongoDB, seeds sample posts, and launches Next.js.
2. \`npm run dev\` connects to the MongoDB URI in \`.env.local\`, such as MongoDB Atlas.

Demo mode is for previews and learning. It is not a production database.

## Seed data

Seed scripts should be idempotent. Use upserts keyed by slug so running the seed twice does not create duplicates.

## Production checklist

- Use a strong, unique \`JWT_SECRET\`.
- Use Atlas with a least-privilege database user.
- Restrict Network Access to your deployment platform where possible.
- Enable HTTPS so secure cookies work.
- Never commit \`.env.local\`.
- Add rate limiting and monitoring before a public launch.

## Final thought

A blog app is small, but it touches almost every full-stack concern: data modeling, auth, validation, rendering, and deployment. That is why it is such a good internship module.`,
  },
];

export async function seedDatabase(uri) {
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

  let demoUser = await User.findOne({ email: DEMO_EMAIL });
  if (!demoUser) {
    demoUser = await User.create({
      name: 'Demo Author',
      email: DEMO_EMAIL,
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 12),
      role: 'user',
    });
  }

  let editorial = await User.findOne({ email: 'editorial@codomax.dev' });
  if (!editorial) {
    editorial = await User.create({
      name: 'Codomax Editorial',
      email: 'editorial@codomax.dev',
      passwordHash: await bcrypt.hash(`Editorial-${Date.now()}-${Math.random()}`, 12),
      role: 'user',
    });
  }

  const existing = await Blog.countDocuments();
  if (existing === 0) {
    const now = Date.now();
    for (let i = 0; i < posts.length; i += 1) {
      const post = posts[i];
      const createdAt = new Date(now - i * 1000 * 60 * 60 * 24 * 3);
      await Blog.updateOne(
        { slug: post.slug },
        {
          $setOnInsert: {
            ...post,
            author: i % 3 === 1 ? editorial._id : demoUser._id,
            published: 'published',
            createdAt,
            updatedAt: createdAt,
          },
        },
        { upsert: true, timestamps: false }
      );
    }
  }

  const count = await Blog.countDocuments();
  await conn.disconnect();
  return { posts: count, demoEmail: DEMO_EMAIL, demoPassword: DEMO_PASSWORD };
}

async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Add it to .env.local or pass it inline.');
    process.exit(1);
  }
  try {
    const result = await seedDatabase(uri);
    console.log(`Seed complete. Posts in database: ${result.posts}`);
    console.log(`Demo login: ${result.demoEmail} / ${result.demoPassword}`);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
