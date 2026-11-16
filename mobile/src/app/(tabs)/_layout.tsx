import { Tabs } from 'expo-router';

import { Icon, type IconName } from '@/components/ui/icon';
import { colors } from '@/constants/theme';

const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: 'Home', icon: 'home' },
  { name: 'routes', title: 'Routes', icon: 'git-branch' },
  { name: 'tickets', title: 'Tickets', icon: 'credit-card' },
  { name: 'live-map', title: 'Live Map', icon: 'map' },
  { name: 'profile', title: 'Profile', icon: 'user' },
];

/** Bottom tab bar: Home · Routes · Tickets · Live Map · Profile (see design/SCREEN_FLOW.md). */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.forest700,
        tabBarInactiveTintColor: '#8A96A3',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: '#EDF1EF',
          height: 86,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
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
