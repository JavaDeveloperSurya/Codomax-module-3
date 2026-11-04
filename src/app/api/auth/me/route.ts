import { getCurrentUser } from '@/lib/auth';
import { ok, serverError } from '@/lib/api';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return ok({ user });
  } catch (err) {
    return serverError(err);
  }
}
