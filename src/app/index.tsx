import { Redirect } from 'expo-router';

import { useAuth } from '@/context/auth-context';

export default function IndexRoute() {
  const { session } = useAuth();
  return <Redirect href={session ? '/(app)/(tabs)/home' : '/(auth)/login'} />;
}
