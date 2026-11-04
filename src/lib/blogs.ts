import { randomBytes } from 'crypto';
import { connectDB } from './db';
import { Blog } from './models/Blog';
import { User } from './models/User';
import { slugify, toBlogDTO, type BlogDTO } from './serialize';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function uniqueSlug(title: string, excludeId?: string): Promise<string> {
  await connectDB();
  const base = slugify(title) || `post-${randomBytes(3).toString('hex')}`;
  let slug = base;
  for (let i = 0; i < 25; i += 1) {
    const query: Record<string, unknown> = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Blog.exists(query);
    if (!exists) return slug;
    slug = `${base}-${randomBytes(2).toString('hex')}`;
  }
  return `${base}-${randomBytes(4).toString('hex')}`;
}

export async function getPublishedBlogs(options?: {
  q?: string;
  category?: string;
  limit?: number;
}): Promise<BlogDTO[]> {
  await connectDB();
  const query: Record<string, unknown> = { published: 'published' };
  if (options?.category) query.category = options.category;
  if (options?.q) {
    const regex = new RegExp(escapeRegExp(options.q.trim()), 'i');
    query.$or = [{ title: regex }, { excerpt: regex }, { tags: regex }, { content: regex }];
  }

  let cursor = Blog.find(query).sort({ createdAt: -1 }).populate('author', 'name');
  if (options?.limit) cursor = cursor.limit(options.limit);
  const blogs = await cursor;
  return blogs.map(toBlogDTO);
}

export async function getBlogBySlug(slug: string, viewerId?: string): Promise<BlogDTO | null> {
  await connectDB();
  const blog = await Blog.findOne({ slug }).populate('author', 'name');
  if (!blog) return null;
  if (blog.published === 'draft') {
    const authorId = String((blog.author as any)?._id ?? blog.author);
    if (!viewerId || viewerId !== authorId) return null;
  }
  return toBlogDTO(blog);
}

export async function getRelatedBlogs(blog: BlogDTO, limit = 3): Promise<BlogDTO[]> {
  await connectDB();
  const blogs = await Blog.find({
    _id: { $ne: blog.id },
    published: 'published',
    $or: [{ category: blog.category }, { tags: { $in: blog.tags } }],
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('author', 'name');
  return blogs.map(toBlogDTO);
}

export async function getUserBlogs(userId: string): Promise<BlogDTO[]> {
  await connectDB();
  const blogs = await Blog.find({ author: userId }).sort({ updatedAt: -1 }).populate('author', 'name');
  return blogs.map(toBlogDTO);
}

export async function getBlogStats() {
  await connectDB();
  const [totalPosts, totalAuthors, categories] = await Promise.all([
    Blog.countDocuments({ published: 'published' }),
    Blog.distinct('author', { published: 'published' }),
    Blog.distinct('category', { published: 'published' }),
  ]);
  return {
    totalPosts,
    totalAuthors: totalAuthors.length,
    totalCategories: categories.length,
  };
}

export async function getAuthorCount() {
  await connectDB();
  return User.countDocuments();
}
