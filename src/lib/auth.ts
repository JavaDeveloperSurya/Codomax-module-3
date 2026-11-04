import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { connectDB } from './db';
import { User } from './models/User';
import { toUserDTO, type UserDTO } from './serialize';
import { SESSION_COOKIE } from './constants';

export { SESSION_COOKIE };
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters.');
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(user: { id: string; email: string; name: string }) {
  const token = await new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<UserDTO | null> => {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;

    await connectDB();
    const user = await User.findById(payload.sub);
    if (!user) return null;
    return toUserDTO(user);
  } catch {
    return null;
  }
});

export async function verifySessionToken(token: string) {
  return jwtVerify(token, getSecret());
}
