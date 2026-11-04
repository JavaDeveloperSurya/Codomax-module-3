import Link from 'next/link';
import type { BlogDTO } from '@/lib/serialize';
import { formatDate } from '@/lib/format';

export default function BlogCard({ blog, featured = false }: { blog: BlogDTO; featured?: boolean }) {
  return (
    <article className={featured ? 'card card-featured' : 'card'}>
      <Link href={`/blog/${blog.slug}`} className={`cover cover-${blog.coverTheme}`} aria-hidden="true" tabIndex={-1}>
        <span className="cover-category">{blog.category}</span>
        <span className="cover-glyph">
          {blog.category === 'AI & Machine Learning'
            ? '◍'
            : blog.category === 'Design'
              ? '✦'
              : blog.category === 'Career'
                ? '↗'
                : blog.category === 'Product'
                  ? '▣'
                  : blog.category === 'Tutorial'
                    ? '✎'
                    : '⌘'}
        </span>
      </Link>

      <div className="card-body">
        <div className="card-meta">
          <span>{blog.author.name}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
          <span aria-hidden="true">·</span>
          <span>{blog.readingTime} min read</span>
          {blog.published === 'draft' && <span className="badge badge-draft">Draft</span>}
        </div>

        <h2 className="card-title">
          <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
        </h2>
        <p className="card-excerpt">{blog.excerpt}</p>

        <div className="card-footer">
          <div className="tags">
            {blog.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
          <Link href={`/blog/${blog.slug}`} className="read-more">
            Read post <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
