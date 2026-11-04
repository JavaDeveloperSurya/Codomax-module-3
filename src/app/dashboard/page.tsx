import Link from 'next/link';
import { redirect } from 'next/navigation';
import DeleteButton from '@/components/DeleteButton';
import { getCurrentUser } from '@/lib/auth';
import { getUserBlogs } from '@/lib/blogs';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/dashboard');

  const blogs = await getUserBlogs(user.id);
  const published = blogs.filter((b) => b.published === 'published').length;
  const drafts = blogs.length - published;

  return (
    <div className="container">
      <div className="page-head row-between">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Your posts</h1>
          <p>
            {blogs.length} total · {published} published · {drafts} draft{drafts === 1 ? '' : 's'}
          </p>
        </div>
        <Link href="/write" className="btn btn-primary">
          Write a post
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="empty-state">
          <h3>You haven’t written anything yet</h3>
          <p>Create your first post and it will be stored securely in MongoDB.</p>
          <Link href="/write" className="btn btn-primary">
            Write your first post
          </Link>
        </div>
      ) : (
        <div className="table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Post</th>
                <th>Status</th>
                <th>Category</th>
                <th>Updated</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id}>
                  <td>
                    <Link href={`/blog/${blog.slug}`} className="table-title">
                      {blog.title}
                    </Link>
                    <div className="muted table-excerpt">{blog.excerpt}</div>
                  </td>
                  <td>
                    <span className={`badge ${blog.published === 'published' ? 'badge-live' : 'badge-draft'}`}>
                      {blog.published}
                    </span>
                  </td>
                  <td>{blog.category}</td>
                  <td>
                    <time dateTime={blog.updatedAt}>{formatDate(blog.updatedAt)}</time>
                  </td>
                  <td className="table-actions">
                    <Link href={`/blog/${blog.slug}/edit`} className="btn btn-ghost btn-sm">
                      Edit
                    </Link>
                    <DeleteButton slug={blog.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
