import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { registerSchema, firstZodError } from '@/lib/validation';
import { createSession } from '@/lib/auth';
import { toUserDTO } from '@/lib/serialize';
import { ok, fail, serverError } from '@/lib/api';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return fail(firstZodError(parsed.error), 400);

    const { name, email, password } = parsed.data;
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) return fail('An account with this email already exists.', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    const dto = toUserDTO(user);
    await createSession(dto);

    return ok({ user: dto }, 201);
  } catch (err: any) {
    if (err?.code === 11000) return fail('An account with this email already exists.', 409);
    return serverError(err);
  }
}
