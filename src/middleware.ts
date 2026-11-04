import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE } from '@/lib/constants';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('next', req.nextUrl.pathname);

  if (!token) return NextResponse.redirect(loginUrl);

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('Missing JWT_SECRET');
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }
}

export const config = {
  matcher: ['/write/:path*', '/dashboard/:path*', '/blog/:path*/edit'],
};
