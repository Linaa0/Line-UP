import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { colors, fonts } from '@/constants/theme';
import { type MessageKey, useT } from '@/i18n';

const tabs: { name: string; title: MessageKey; icon: IconName }[] = [
  { name: 'home', title: 'tabs.home', icon: 'home' },
  { name: 'routes', title: 'tabs.routes', icon: 'git-branch' },
  { name: 'tickets', title: 'tabs.tickets', icon: 'credit-card' },
  { name: 'live-map', title: 'tabs.liveMap', icon: 'map' },
  { name: 'profile', title: 'tabs.profile', icon: 'user' },
];

/** Bottom tab bar: Home · Routes · Tickets · Live Map · Profile (see design/SCREEN_FLOW.md). */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const t = useT();
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
            title: t(tab.title),
            tabBarIcon: ({ color }) => <Icon name={tab.icon} size={22} color={typeof color === 'string' ? color : undefined} />,
          }}
        />
      ))}
    </Tabs>
  );
}
