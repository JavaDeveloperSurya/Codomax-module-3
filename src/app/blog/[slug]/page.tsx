import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Markdown from '@/components/Markdown';
import BlogCard from '@/components/BlogCard';
import DeleteButton from '@/components/DeleteButton';
import { getBlogBySlug, getRelatedBlogs } from '@/lib/blogs';
import { getCurrentUser } from '@/lib/auth';
import { formatDate, initials } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: 'Post not found' };
  return {
    title: blog.title,
    description: blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      type: 'article',
      publishedTime: blog.createdAt,
      authors: [blog.author.name],
      tags: blog.tags,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const blog = await getBlogBySlug(slug, user?.id);
  if (!blog) notFound();

  const related = await getRelatedBlogs(blog);
  const isOwner = Boolean(user && (user.id === blog.author.id || user.role === 'admin'));

  return (
    <article>
      <div className={`article-cover cover-${blog.coverTheme}`}>
        <div className="container article-cover-inner">
          <Link href="/" className="back-link">
            ← All blogs
          </Link>
          <span className="cover-category">{blog.category}</span>
          {blog.published === 'draft' && <span className="badge badge-draft">Draft</span>}
        </div>
      </div>

      <div className="container container-narrow article">
        <header className="article-header">
          <h1>{blog.title}</h1>
          <p className="article-excerpt">{blog.excerpt}</p>

          <div className="article-meta">
            <span className="avatar avatar-lg">{initials(blog.author.name)}</span>
            <div>
              <strong>{blog.author.name}</strong>
              <div className="muted">
                <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time> · {blog.readingTime} min read
              </div>
            </div>
            {isOwner && (
              <div className="article-actions">
                <Link href={`/blog/${blog.slug}/edit`} className="btn btn-ghost btn-sm">
                  Edit
                </Link>
                <DeleteButton slug={blog.slug} redirectTo="/" />
              </div>
            )}
          </div>
        </header>

        <Markdown content={blog.content} />

        {blog.tags.length > 0 && (
          <div className="tags article-tags">
            {blog.tags.map((tag) => (
              <Link key={tag} href={`/?q=${encodeURIComponent(tag)}`} className="tag">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <section className="author-box">
          <span className="avatar avatar-lg">{initials(blog.author.name)}</span>
          <div>
            <strong>Written by {blog.author.name}</strong>
            <p>Part of the Codomax Internship Module 3 blog project.</p>
          </div>
        </section>
      </div>

      {related.length > 0 && (
        <section className="container section">
          <div className="section-head">
            <h2>Related posts</h2>
            <Link href="/" className="read-more">
              View all →
            </Link>
          </div>
          <div className="grid">
            {related.map((post) => (
              <BlogCard key={post.id} blog={post} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
