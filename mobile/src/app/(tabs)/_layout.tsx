import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { colors, fonts } from '@/constants/theme';

const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: 'home', title: 'Home', icon: 'home' },
  { name: 'routes', title: 'Routes', icon: 'git-branch' },
  { name: 'tickets', title: 'Tickets', icon: 'credit-card' },
  { name: 'live-map', title: 'Live Map', icon: 'map' },
  { name: 'profile', title: 'Profile', icon: 'user' },
];

/** Bottom tab bar: Home · Routes · Tickets · Live Map · Profile (see design/SCREEN_FLOW.md). */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, Platform.OS === 'web' ? 10 : 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.forest700,
        tabBarInactiveTintColor: '#8A96A3',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: '#EDF1EF',
          height: 58 + bottom,
          paddingTop: 7,
          paddingBottom: bottom,
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: fonts.semibold },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color }) => <Icon name={tab.icon} size={22} color={typeof color === 'string' ? color : undefined} />,
          }}
        />
      ))}
    </Tabs>
  );
}
