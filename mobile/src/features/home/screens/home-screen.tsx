import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BusMark } from '@/components/shared/logo';
import { ErrorState } from '@/components/shared/states';
import { LoadBar, RouteBadge, RouteLine } from '@/components/shared/transit';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius, shadow, spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useAuth } from '@/lib/auth';
import type { Departure, QueueEntry, Stop } from '@/lib/types';
import { firstName, formatRwf, greeting, initials, KIND_LABEL, payLabel } from '@/utils/format';

const skyline = require('@/assets/images/illustrations/kigali-skyline.png');

/** Design 03-01. */
export default function HomeScreen() {
  const { user } = useAuth();
  const fallbackStop = useApi<Stop[]>(user?.homeStop ? null : '/stops?q=Nyabugogo');
  const stopId = user?.homeStop?.id ?? fallbackStop.data?.[0]?.id ?? null;

  const departures = useApi<{ stop: { name: string }; items: Departure[] }>(stopId ? `/stops/${stopId}/departures?limit=4` : null, {
    refreshOnFocus: true,
    pollMs: 30_000,
  });
  const active = useApi<{ entry: QueueEntry | null }>('/queues/active', { refreshOnFocus: true });
  const notes = useApi<{ unread: number }>('/notifications', { refreshOnFocus: true });
  const summary = useApi<{ activeTickets: number; savedRoutes: number }>('/users/me/summary', { refreshOnFocus: true });

  const refresh = () => {
    void departures.refresh();
    void active.reload();
    void notes.reload();
    void summary.reload();
  };

  const trip = active.data?.entry;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={departures.refreshing} onRefresh={refresh} tintColor={colors.emerald} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandTile}>
              <BusMark size={22} cutout={colors.forest900} />
            </View>
            <View>
              <Text variant="label" color={colors.emerald}>
                LINE-UP Kigali
              </Text>
              <Text variant="title">Home</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={() => router.push('/notifications')} hitSlop={8} accessibilityLabel="Notifications">
              <Icon name="bell" size={23} />
              {!!notes.data?.unread && <View style={styles.badgeDot} />}
            </Pressable>
            <Pressable onPress={() => router.push('/profile')} style={styles.avatar} accessibilityLabel="Profile">
              <Text style={styles.avatarText}>{initials(user?.fullName ?? '')}</Text>
            </Pressable>
          </View>
        </View>

        {/* Greeting */}
        <View style={styles.greet}>
          <View style={styles.greetTop}>
            <Text variant="label" color={colors.emerald}>
              Kigali smart transit
            </Text>
            <Pill label="Live system" dot />
          </View>
          <Text variant="h1">
            {greeting()}, {firstName(user?.fullName ?? '')}
          </Text>
          <Text variant="body" color={colors.textSecondary}>
            Ready for your commute across the hills?
          </Text>
        </View>

        {/* Search */}
        <Pressable onPress={() => router.push('/routes')} style={styles.search} accessibilityRole="search">
          <Icon name="search" size={20} color={colors.emerald} />
          <Text variant="body" color={colors.muted} style={styles.flex}>
            Where are you going today?
          </Text>
          <View style={styles.searchTune}>
            <Icon name="sliders" size={16} color={colors.forest900} />
          </View>
        </Pressable>

        {/* Active trip */}
        {trip && trip.status !== 'COMPLETED' && (
          <Pressable onPress={() => router.push(`/queue/${trip.id}`)}>
            <LinearGradient colors={[colors.forest700, colors.forest900]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.trip}>
              <View style={styles.tripIcon}>
                <Icon name={trip.status === 'ON_BUS' ? 'navigation' : 'users'} size={20} color={colors.forest900} />
              </View>
              <View style={styles.flex}>
                <Text variant="label" color={colors.mint}>
                  {trip.status === 'ON_BUS' ? 'Trip in progress' : trip.status === 'BOARDING' ? 'Boarding now' : 'In the virtual queue'}
                </Text>
                <Text variant="bodyStrong" color="#FFFFFF">
                  {trip.status === 'ON_BUS'
                    ? `${trip.route.code} to ${trip.to.name} · ${trip.remainingMin} min left`
                    : `#${trip.position} for ${trip.route.code} · departs ${trip.departureLabel}`}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color="#FFFFFF" />
            </LinearGradient>
          </Pressable>
        )}

        {/* Quick actions */}
        <View style={styles.quick}>
          <QuickAction icon="credit-card" title="My Tickets" sub={`${summary.data?.activeTickets ?? 0} active`} onPress={() => router.push('/tickets')} />
          <QuickAction icon="bookmark" title="Saved Routes" sub={`${summary.data?.savedRoutes ?? 0} pinned`} onPress={() => router.push('/routes')} />
          <QuickAction icon="headphones" title="Help Desk" sub="Report & FAQ" onPress={() => router.push('/support')} />
        </View>

        {/* Banner */}
        <Pressable onPress={() => router.push('/live-map')} style={styles.banner}>
          <Image source={skyline} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={['rgba(0,37,19,0.92)', 'rgba(0,37,19,0.35)']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
          <Text variant="label" color={colors.mint}>
            Kigali smart urban hub
          </Text>
          <Text style={styles.bannerTitle}>Express Corridor</Text>
          <Text variant="caption" color="rgba(255,255,255,0.85)">
            Nyabugogo • Downtown • Kicukiro · see buses on the map
          </Text>
        </Pressable>

        {/* Nearby buses */}
        <View style={styles.sectionHead}>
          <View style={styles.sectionTitle}>
            <Text variant="h2">Nearby Buses</Text>
            {!!departures.data?.items.length && <Pill label={`${departures.data.items.length} soon`} />}
          </View>
          <Pressable onPress={() => router.push('/live-map')} style={styles.viewAll} accessibilityRole="link">
            <Text variant="captionStrong" color={colors.forest700}>
              View all
            </Text>
            <Icon name="arrow-right" size={14} color={colors.forest700} />
          </Pressable>
        </View>
        {departures.data && (
          <Text variant="caption" color={colors.textSecondary} style={styles.atStop}>
            Departing from {departures.data.stop.name} · times from the timetable
          </Text>
        )}

        {departures.error && !departures.data ? (
          <ErrorState message={departures.error} onRetry={departures.refresh} style={styles.inlineState} />
        ) : !departures.data ? (
          <View style={styles.skeletons}>
            {[0, 1].map((i) => (
              <View key={i} style={styles.skeleton} />
            ))}
          </View>
        ) : (
          <View style={styles.cards}>
            {departures.data.items.map((d) => (
              <BusCard key={d.route.id} item={d} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({ icon, title, sub, onPress }: { icon: IconName; title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && styles.pressed]} accessibilityRole="button">
      <View style={styles.quickIcon}>
        <Icon name={icon} size={20} color={colors.forest900} />
      </View>
      <Text variant="bodyStrong" align="center" numberOfLines={1}>
        {title}
      </Text>
      <Text variant="caption" color={colors.emerald} align="center">
        {sub}
      </Text>
    </Pressable>
  );
}

function BusCard({ item }: { item: Departure }) {
  const soon = item.minutesAway <= 3;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/routes/[id]', params: { id: item.route.id, from: item.from.id, to: item.to.id } })}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card style={styles.busCard}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <RouteBadge code={item.route.code} size="sm" />
            <Pill label={KIND_LABEL[item.route.kind]} />
          </View>
          <View style={styles.row}>
            <View style={[styles.statusDot, soon && { backgroundColor: colors.warning }]} />
            <Text variant="captionStrong" color={soon ? colors.warning : colors.forest700}>
              {soon ? 'Arriving soon' : 'On schedule'}
            </Text>
          </View>
        </View>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <RouteLine from={item.from.name} to={item.to.name} size={17} />
            <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
              Via {item.route.via}
              {item.from.bay ? ` • ${item.from.bay}` : ''}
            </Text>
          </View>
          <View style={styles.fare}>
            <Text style={styles.fareText}>{formatRwf(item.fare)}</Text>
            <Text variant="caption" color={colors.textSecondary}>
              {payLabel(item.route)}
            </Text>
          </View>
        </View>
        <View style={styles.eta}>
          <Icon name="clock" size={16} color={colors.forest900} />
          <Text variant="captionStrong">{item.minutesAway <= 0 ? 'Departing now' : `Arriving in ${item.minutesAway} min`}</Text>
          <Text variant="caption" color={colors.textSecondary} style={styles.flex}>
            • {item.stopsAway === 0 ? 'at the first stop' : `${item.stopsAway} stop${item.stopsAway === 1 ? '' : 's'} away`}
          </Text>
          <Icon name="users" size={14} color={colors.forest900} />
          <Text variant="captionStrong">{item.loadPercent}% full</Text>
        </View>
        <LoadBar percent={item.loadPercent} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.screen, paddingBottom: 28, gap: 16 },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  pressed: { opacity: 0.85 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandTile: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.forest900, alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  badgeDot: { position: 'absolute', top: -1, right: -1, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.emerald, borderWidth: 2, borderColor: colors.background },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.forest900, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.heading, color: colors.mint, fontSize: 14 },
  greet: { gap: 4, marginTop: 4 },
  greetTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingLeft: 18,
    paddingRight: 8,
    height: 56,
    ...shadow.card,
  },
  searchTune: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.mint100, alignItems: 'center', justifyContent: 'center' },
  trip: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.xl },
  tripIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  quick: { flexDirection: 'row', gap: 10 },
  quickCard: { flex: 1, backgroundColor: colors.card, borderRadius: radius.xl, paddingVertical: 14, paddingHorizontal: 6, alignItems: 'center', gap: 4, ...shadow.card },
  quickIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.mint100, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  banner: { height: 128, borderRadius: radius.xl, overflow: 'hidden', padding: 16, justifyContent: 'center', gap: 2 },
  bannerTitle: { fontFamily: fonts.display, fontSize: 22, color: '#FFFFFF' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  atStop: { marginTop: -10 },
  cards: { gap: 12 },
  busCard: { gap: 12, ...shadow.card },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.emerald },
  fare: { alignItems: 'flex-end' },
  fareText: { fontFamily: fonts.display, fontSize: 19, color: colors.forest900 },
  eta: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.emerald50, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 9 },
  skeletons: { gap: 12 },
  skeleton: { height: 150, borderRadius: radius.xl, backgroundColor: '#E8F1EC' },
  inlineState: { flex: 0, paddingVertical: 20 },
});
