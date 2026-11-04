import type { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';
import { getCurrentUser } from '@/lib/auth';
import { blogSchema, firstZodError } from '@/lib/validation';
import { makeExcerpt, toBlogDTO } from '@/lib/serialize';
import { uniqueSlug } from '@/lib/blogs';
import { ok, fail, serverError } from '@/lib/api';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const category = searchParams.get('category')?.trim();
    const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 50) || 50));

    const query: Record<string, unknown> = { published: 'published' };
    if (category) query.category = category;
    if (q) {
      const regex = new RegExp(escapeRegExp(q), 'i');
      query.$or = [{ title: regex }, { excerpt: regex }, { tags: regex }, { content: regex }];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name'),
      Blog.countDocuments(query),
    ]);

    return ok({ blogs: blogs.map(toBlogDTO), total, page, limit });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail('You must be logged in to create a post.', 401);

    const body = await req.json().catch(() => null);
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) return fail(firstZodError(parsed.error), 400);

    const data = parsed.data;
    const slug = await uniqueSlug(data.title);
    const blog = await Blog.create({
      title: data.title,
      slug,
      excerpt: data.excerpt && data.excerpt.length > 0 ? data.excerpt : makeExcerpt(data.content),
      content: data.content,
      category: data.category,
      tags: data.tags,
      coverTheme: data.coverTheme,
      published: data.published,
      author: user.id,
    });
    await blog.populate('author', 'name');

    return ok({ blog: toBlogDTO(blog) }, 201);
  } catch (err) {
    return serverError(err);
  }
}
