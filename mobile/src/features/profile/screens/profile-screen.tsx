import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ListRow } from '@/components/ui/list-row';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/lib/auth';
import { formatPhone, initials } from '@/utils/format';

/** Design 12-01. */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const summary = useApi<{ tripsTaken: number; activeTickets: number; savedRoutes: number }>('/users/me/summary', { refreshOnFocus: true });
  const [confirmOut, setConfirmOut] = useState(false);

  if (!user) return null;

  return (
    <Screen scroll edges={['top']} header={<ScreenHeader title="Profile" right={{ icon: 'bell', label: 'Notifications', onPress: () => router.push('/notifications') }} />}>
      <LinearGradient colors={['#1D7A50', colors.forest600, '#06331F']} locations={[0, 0.45, 1]} start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }} style={styles.hero}>
        <View style={styles.ring} />
        <Pressable onPress={() => router.push('/profile/edit')} style={styles.edit} accessibilityLabel="Edit profile">
          <Icon name="edit-2" size={16} color="#FFFFFF" />
        </Pressable>
        <View style={styles.who}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(user.fullName)}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.name} numberOfLines={1}>
              {user.fullName}
            </Text>
            <Text variant="caption" color="rgba(255,255,255,0.8)">
              {formatPhone(user.phone)}
            </Text>
            {user.phoneVerified && (
              <View style={styles.verified}>
                <Icon name="shield" size={12} color={colors.forest900} />
                <Text variant="captionStrong" color={colors.forest900}>
                  Verified account
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.stats}>
          <Stat value={summary.data?.tripsTaken} label="Trips taken" />
          <Stat value={summary.data?.activeTickets} label="Active tickets" divider />
          <Stat value={summary.data?.savedRoutes} label="Saved routes" divider />
        </View>
      </LinearGradient>

      <SectionLabel label="Account" />
      <Card padding={0}>
        <ListRow divider={false} icon="user" title="Personal information" onPress={() => router.push('/profile/edit')} />
        <ListRow icon="credit-card" title="Payment methods" subtitle={`Mobile Money · ${formatPhone(user.phone)}`} />
        <ListRow icon="bookmark" title="Saved routes" subtitle={user.homeStop ? `Home stop: ${user.homeStop.name}` : 'Pin routes from Route Details'} onPress={() => router.push('/routes')} />
      </Card>

      <SectionLabel label="Preferences" />
      <Card padding={0}>
        <ListRow divider={false} icon="sliders" title="Settings" onPress={() => router.push('/settings')} />
        <ListRow icon="headphones" title="Help & support" onPress={() => router.push('/support')} />
        <ListRow icon="log-out" title="Log out" destructive onPress={() => setConfirmOut(true)} />
      </Card>

      <BottomSheet visible={confirmOut} onClose={() => setConfirmOut(false)}>
        <Text variant="title" align="center">
          Log out of LINE-UP?
        </Text>
        <Text variant="body" color={colors.textSecondary} align="center">
          Your tickets stay in your account. Log in again with your phone number.
        </Text>
        <Button label="Log Out" variant="danger" iconLeft="log-out" onPress={() => void signOut()} />
        <Button label="Cancel" variant="secondary" onPress={() => setConfirmOut(false)} />
      </BottomSheet>
    </Screen>
  );
}

function Stat({ value, label, divider }: { value?: number; label: string; divider?: boolean }) {
  return (
    <View style={[styles.stat, divider && styles.statDivider]}>
      <Text style={styles.statValue}>{value ?? '–'}</Text>
      <Text variant="caption" color="rgba(255,255,255,0.75)">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { borderRadius: radius.xxl, padding: 18, overflow: 'hidden' },
  ring: { position: 'absolute', right: -50, bottom: -70, width: 200, height: 200, borderRadius: 100, borderWidth: 28, borderColor: 'rgba(112,251,190,0.08)' },
  edit: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingRight: 40 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.25)' },
  avatarText: { fontFamily: fonts.display, fontSize: 22, color: colors.forest900 },
  name: { fontFamily: fonts.display, fontSize: 20, color: '#FFFFFF' },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: colors.mint, borderRadius: radius.full, paddingHorizontal: 9, paddingVertical: 3, marginTop: 6 },
  stats: { flexDirection: 'row', marginTop: 18, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.lg, paddingVertical: 12 },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.15)' },
  statValue: { fontFamily: fonts.display, fontSize: 19, color: '#FFFFFF' },
});
