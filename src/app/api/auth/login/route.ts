import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { loginSchema, firstZodError } from '@/lib/validation';
import { createSession } from '@/lib/auth';
import { toUserDTO } from '@/lib/serialize';
import { ok, fail, serverError } from '@/lib/api';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return fail(firstZodError(parsed.error), 400);

    const { email, password } = parsed.data;
    await connectDB();

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return fail('Invalid email or password.', 401);

    const valid = await bcrypt.compare(password, user.passwordHash as string);
    if (!valid) return fail('Invalid email or password.', 401);

    const dto = toUserDTO(user);
    await createSession(dto);
    return ok({ user: dto });
  } catch (err) {
    return serverError(err);
  }
}
