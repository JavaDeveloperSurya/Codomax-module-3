'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn btn-ghost btn-sm" onClick={logout} disabled={loading}>
      {loading ? 'Signing out…' : 'Sign out'}
    </button>
  );
}
