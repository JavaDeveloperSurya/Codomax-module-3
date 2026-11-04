import { NextResponse } from 'next/server';

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export function serverError(err: unknown) {
  console.error('[api]', err);
  return fail('Something went wrong on the server. Please try again.', 500);
}
