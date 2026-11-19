import { Redirect } from 'expo-router';

import { useAuth } from '@/lib/auth';

/** Entry point: sends people to Home, Log In or the welcome screen. */
export default function Index() {
  const { user, onboarded } = useAuth();
  if (user) return <Redirect href="/home" />;
  return <Redirect href={onboarded ? '/login' : '/welcome'} />;
}
