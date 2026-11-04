import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container empty-state">
      <span className="eyebrow">404</span>
      <h1>Post not found</h1>
      <p>The blog you are looking for does not exist, is a draft, or has been removed.</p>
      <Link href="/" className="btn btn-primary">
        Back to all blogs
      </Link>
    </div>
  );
}
