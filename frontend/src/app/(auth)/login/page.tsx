import AuthForm from '@/components/auth/AuthForm';

export const metadata = {
  title: 'Sign In — AUDIOSYNC',
  description: 'Sign in to your AUDIOSYNC account to access your podcast studio.',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
