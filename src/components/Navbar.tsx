import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { initials } from '@/lib/format';
import LogoutButton from './LogoutButton';

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="Codomax Blog home">
          <span className="logo-mark" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 12a8 8 0 0 1 13.66-5.66" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M20 12a8 8 0 0 1-13.66 5.66" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="12" cy="12" r="2.4" fill="currentColor" />
            </svg>
          </span>
          <span>
            Codomax<span className="logo-accent">Blog</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Primary">
          <Link href="/" className="nav-link">
            Blogs
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link href="/write" className="btn btn-primary btn-sm">
                Write a post
              </Link>
              <span className="avatar" title={user.name}>
                {initials(user.name)}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Log in
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
