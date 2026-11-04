import { notFound, redirect } from 'next/navigation';
import BlogForm from '@/components/BlogForm';
import { getCurrentUser } from '@/lib/auth';
import { getBlogBySlug } from '@/lib/blogs';

export const dynamic = 'force-dynamic';

type Params = Promise<{ slug: string }>;

export default async function EditBlogPage({ params }: { params: Params }) {
  const { slug } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/blog/${slug}/edit`);

  const blog = await getBlogBySlug(slug, user.id);
  if (!blog) notFound();
  if (blog.author.id !== user.id && user.role !== 'admin') redirect(`/blog/${slug}`);

  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">Edit post</span>
        <h1>Update your post</h1>
        <p>Changes are saved to MongoDB. The slug updates automatically if you change the title.</p>
      </div>
      <BlogForm mode="edit" initial={blog} />
    </div>
  );
}
