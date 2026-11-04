import type { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { Blog } from '@/lib/models/Blog';
import { getCurrentUser } from '@/lib/auth';
import { blogUpdateSchema, firstZodError } from '@/lib/validation';
import { getBlogBySlug, uniqueSlug } from '@/lib/blogs';
import { makeExcerpt, toBlogDTO } from '@/lib/serialize';
import { ok, fail, serverError } from '@/lib/api';

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;
    const user = await getCurrentUser();
    const blog = await getBlogBySlug(slug, user?.id);
    if (!blog) return fail('Post not found.', 404);
    return ok({ blog });
  } catch (err) {
    return serverError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail('You must be logged in to edit a post.', 401);

    const { slug } = await params;
    await connectDB();
    const blog = await Blog.findOne({ slug });
    if (!blog) return fail('Post not found.', 404);
    if (String(blog.author) !== user.id && user.role !== 'admin') {
      return fail('You can only edit your own posts.', 403);
    }

    const body = await req.json().catch(() => null);
    const parsed = blogUpdateSchema.safeParse(body);
    if (!parsed.success) return fail(firstZodError(parsed.error), 400);
    const data = parsed.data;

    if (data.title && data.title !== blog.title) {
      blog.title = data.title;
      blog.slug = await uniqueSlug(data.title, String(blog._id));
    }
    if (data.content !== undefined) blog.content = data.content;
    if (data.excerpt !== undefined) {
      blog.excerpt = data.excerpt.length > 0 ? data.excerpt : makeExcerpt(blog.content);
    } else if (data.content !== undefined) {
      blog.excerpt = makeExcerpt(blog.content);
    }
    if (data.category !== undefined) blog.category = data.category;
    if (data.tags !== undefined) blog.tags = data.tags;
    if (data.coverTheme !== undefined) blog.coverTheme = data.coverTheme;
    if (data.published !== undefined) blog.published = data.published;

    await blog.save();
    await blog.populate('author', 'name');
    return ok({ blog: toBlogDTO(blog) });
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser();
    if (!user) return fail('You must be logged in to delete a post.', 401);

    const { slug } = await params;
    await connectDB();
    const blog = await Blog.findOne({ slug });
    if (!blog) return fail('Post not found.', 404);
    if (String(blog.author) !== user.id && user.role !== 'admin') {
      return fail('You can only delete your own posts.', 403);
    }

    await blog.deleteOne();
    return ok({ deleted: true });
  } catch (err) {
    return serverError(err);
  }
}
