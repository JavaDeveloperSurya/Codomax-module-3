import { connectDB } from '@/lib/db';
import { ok, fail } from '@/lib/api';

export async function GET() {
  try {
    await connectDB();
    return ok({ status: 'healthy', database: 'connected' });
  } catch (err: any) {
    return fail(err?.message ?? 'Database unavailable', 503);
  }
}
