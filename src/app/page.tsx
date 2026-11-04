import Link from 'next/link';
import BlogCard from '@/components/BlogCard';
import { getBlogStats, getPublishedBlogs } from '@/lib/blogs';
import { BLOG_CATEGORIES } from '@/lib/taxonomy';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ q?: string; category?: string }>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const { q, category } = await searchParams;
  const [blogs, stats] = await Promise.all([
    getPublishedBlogs({ q, category }),
    getBlogStats(),
  ]);

  const isFiltering = Boolean(q || category);
  const featured = !isFiltering ? blogs[0] : undefined;
  const rest = featured ? blogs.slice(1) : blogs;
  const isDemo = process.env.DEMO_MODE === 'true';

  function hrefFor(cat?: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cat) params.set('category', cat);
    const qs = params.toString();
    return qs ? `/?${qs}` : '/';
  }

  return (
    <div className="container">
      {isDemo && (
        <div className="demo-banner">
          Live demo: this preview uses an in-memory MongoDB seeded with sample posts. Add your Atlas
          <code>MONGODB_URI</code> in <code>.env.local</code> for persistent storage.
        </div>
      )}

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Module 3 · Database-backed blog</span>
          <h1>
            Stories, tutorials, and notes from the <span className="gradient-text">Codomax</span> internship.
          </h1>
          <p>
            Every post on this page is retrieved from MongoDB. Create an account, write a post, and it
            appears here with its own detail page.
          </p>
          <div className="hero-actions">
            <Link href="/write" className="btn btn-primary">
              Write a post
            </Link>
            <Link href="/register" className="btn btn-ghost">
              Create account
            </Link>
          </div>
        </div>

        <div className="hero-stats" aria-label="Blog statistics">
          <div className="stat">
            <span className="stat-number">{stats.totalPosts}</span>
            <span className="stat-label">Published posts</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.totalAuthors}</span>
            <span className="stat-label">Authors</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.totalCategories}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
      </section>

      <section className="toolbar" aria-label="Search and filter blogs">
        <form action="/" method="get" className="search-form">
          {category && <input type="hidden" name="category" value={category} />}
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder="Search posts, tags, or content…"
            aria-label="Search posts"
          />
          <button className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="chips" role="list">
          <Link role="listitem" href={hrefFor(undefined)} className={`chip ${!category ? 'chip-active' : ''}`}>
            All
          </Link>
          {BLOG_CATEGORIES.map((cat) => (
            <Link
              role="listitem"
              key={cat}
              href={hrefFor(cat)}
              className={`chip ${category === cat ? 'chip-active' : ''}`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {isFiltering && (
        <div className="filter-summary">
          <span>
            {blogs.length} result{blogs.length === 1 ? '' : 's'}
            {q ? ` for “${q}”` : ''}
            {category ? ` in ${category}` : ''}
          </span>
          <Link href="/" className="read-more">
            Clear filters
          </Link>
        </div>
      )}

      {featured && (
        <section className="section">
          <div className="section-head">
            <h2>Latest post</h2>
          </div>
          <BlogCard blog={featured} featured />
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>{isFiltering ? 'Results' : 'All blogs'}</h2>
          <span className="muted">{blogs.length} post{blogs.length === 1 ? '' : 's'}</span>
        </div>

        {rest.length > 0 ? (
          <div className="grid">
            {rest.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        ) : (
          !featured && (
            <div className="empty-state">
              <h3>No posts found</h3>
              <p>
                {isFiltering
                  ? 'Try a different search term or category.'
                  : 'The database is empty. Be the first to publish a post.'}
              </p>
              <Link href="/write" className="btn btn-primary">
                Write the first post
              </Link>
            </div>
          )
        )}
      </section>
    </div>
  );
}
