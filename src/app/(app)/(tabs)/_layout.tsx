import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { colors } from '@/constants/palette';

const tabItems = {
  home: { title: 'Home', symbol: '⌂' },
  archive: { title: 'Archive', symbol: '▤' },
  places: { title: 'Places', symbol: '⌖' },
  profile: { title: 'You', symbol: '◉' },
} as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 66,
          paddingTop: 7,
          paddingBottom: 8,
          borderTopColor: colors.line,
          backgroundColor: colors.white,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}>
      {Object.entries(tabItems).map(([name, item]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title: item.title,
            tabBarIcon: ({ focused }) => (
              <Text style={{ color: focused ? colors.green : colors.muted, fontSize: 21 }}>
                {item.symbol}
              </Text>
            ),
          }}
        />
      ))}
      <Tabs.Screen name="songs" options={{ href: null }} />
      <Tabs.Screen name="attire" options={{ href: null }} />
      <Tabs.Screen name="dances" options={{ href: null }} />
    </Tabs>
  );
}
