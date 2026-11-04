'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteButton({
  slug,
  redirectTo = '/dashboard',
  label = 'Delete',
}: {
  slug: string;
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blogs/${slug}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        alert(json.error ?? 'Could not delete post.');
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={loading}>
      {loading ? 'Deleting…' : label}
    </button>
  );
}
