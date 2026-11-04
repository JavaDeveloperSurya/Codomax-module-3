import { redirect } from 'next/navigation';
import BlogForm from '@/components/BlogForm';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function WritePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/write');

  return (
    <div className="container">
      <div className="page-head">
        <span className="eyebrow">New post</span>
        <h1>Write a blog post</h1>
        <p>Signed in as {user.name}. Your post will be saved to MongoDB and linked to your account.</p>
      </div>
      <BlogForm mode="create" />
    </div>
  );
}
