import { redirect } from 'next/navigation';
import AuthForm from '@/components/AuthForm';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ next?: string }>;

function safeNext(value?: string) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams;
  const target = safeNext(next);
  const user = await getCurrentUser();
  if (user) redirect(target);

  return (
    <div className="container auth-wrap">
      <AuthForm mode="login" next={target} demo={process.env.DEMO_MODE === 'true'} />
    </div>
  );
}
