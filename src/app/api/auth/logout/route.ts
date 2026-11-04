import { destroySession } from '@/lib/auth';
import { ok, serverError } from '@/lib/api';

export async function POST() {
  try {
    await destroySession();
    return ok({ loggedOut: true });
  } catch (err) {
    return serverError(err);
  }
}
