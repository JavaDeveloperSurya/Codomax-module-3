import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Codomax Blog — Module 3',
    template: '%s · Codomax Blog',
  },
  description:
    'Codomax Internship Module 3: a Next.js + MongoDB blog with secure authentication, blog storage, a database-backed feed, and individual post pages.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <div className="container footer-inner">
            <div>
              <strong>Codomax Internship · Module 3</strong>
              <p>MongoDB · Secure credentials · Blog feed · Individual post pages</p>
            </div>
            <div className="footer-links">
              <Link href="/">All blogs</Link>
              <Link href="/write">Write</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
