import { Stack } from 'expo-router';

import { colors } from '@/constants/palette';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="entry/[id]" />
      <Stack.Screen name="entry/[id]/edit" />
      <Stack.Screen name="contribute" />
    </Stack>
  );
}
