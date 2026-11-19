import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { BusMark } from '@/components/shared/logo';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { RouteBadge, RouteLine, shortName } from '@/components/shared/transit';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useNow } from '@/hooks/use-now';
import type { SearchResult } from '@/lib/types';
import { formatRwf, formatTime, KIND_LABEL, payLabel } from '@/utils/format';

const FILTERS = ['All', 'Express', 'Direct', 'Fastest'] as const;

/** Design 04-02. */
export default function ResultsScreen() {
  const { from, to, fromName, toName, at } = useLocalSearchParams<{ from: string; to: string; fromName: string; toName: string; at?: string }>();
  const path = `/routes/search?from=${from}&to=${to}${at ? `&at=${encodeURIComponent(at)}` : ''}`;
  const { data, error, loading, refresh } = useApi<{ results: SearchResult[] }>(path, { pollMs: 60_000 });
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const now = useNow();

  const results = useMemo(() => {
    const list = data?.results ?? [];
    if (filter === 'Express') return list.filter((r) => r.route.kind === 'EXPRESS');
    if (filter === 'Direct') return list.filter((r) => r.route.kind === 'DIRECT');
    if (filter === 'Fastest') return [...list].sort((a, b) => a.durationMin - b.durationMin);
    return list;
  }, [data, filter]);

  const later = at && new Date(at).getTime() - now > 5 * 60_000;

  return (
    <Screen padded={false} header={<ScreenHeader title="Available Routes" back right={{ icon: 'refresh-cw', label: 'Refresh', onPress: refresh }} />}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.trip}>
          <RouteLine from={fromName ?? ''} to={toName ?? ''} size={17} color={colors.forest900} />
          <Pill label={later ? formatTime(at!) : 'Now'} tone="outline" />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((f) => (
            <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
          ))}
        </ScrollView>

        {loading ? (
          <LoadingState label="Finding buses…" style={styles.state} />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} style={styles.state} />
        ) : !results.length ? (
          <EmptyState
            icon="git-branch"
            title="No direct bus"
            message={`No single route goes from ${shortName(fromName ?? '')} to ${shortName(toName ?? '')}${filter !== 'All' ? ' with this filter' : ''}. Try a nearby stop.`}
            style={styles.state}
          />
        ) : (
          <>
            <View style={styles.dispatch}>
              <View style={styles.flex}>
                <Text variant="label" color={colors.emerald}>
                  Timetable live
                </Text>
                <Text variant="h2">
                  {results.length} route{results.length === 1 ? '' : 's'} running
                </Text>
                <Text variant="caption" color={colors.textSecondary}>
                  Tap a card to see stops, the next buses and the fare.
                </Text>
              </View>
              <View style={styles.dispatchIcon}>
                <BusMark size={30} color={colors.forest900} cutout={colors.mint200} />
              </View>
            </View>
            {results.map((r) => (
              <ResultCard key={r.route.id} r={r} from={from} to={to} />
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function ResultCard({ r, from, to }: { r: SearchResult; from: string; to: string }) {
  const soon = r.minutesAway <= 5;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/routes/[id]', params: { id: r.route.id, from, to } })}
      style={({ pressed }) => [pressed && { opacity: 0.85 }]}
    >
      <Card padding={0} style={styles.card}>
        <View style={styles.cardTop}>
          <RouteBadge code={r.route.code} size="lg" />
          <View style={styles.flex}>
            <Text variant="label" color={colors.emerald}>
              {KIND_LABEL[r.route.kind]}
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              {payLabel(r.route)}
            </Text>
          </View>
          {r.best ? <Pill label="Best" dot /> : soon ? <Pill label="Boarding soon" /> : <Pill label="On time" tone="outline" />}
        </View>
        <View style={styles.cardMid}>
          <RouteLine from={r.from.name} to={r.to.name} size={18} />
          <Text variant="caption" color={colors.textSecondary}>
            Via {r.route.via}
          </Text>
        </View>
        <View style={styles.cardFoot}>
          <Icon name="clock" size={16} color={colors.forest900} />
          <Text variant="captionStrong">{r.durationMin} min</Text>
          <Text variant="caption" color={colors.muted}>
            •
          </Text>
          <Icon name="dollar-sign" size={15} color={colors.forest900} />
          <Text variant="captionStrong">{formatRwf(r.fare)}</Text>
          <View style={styles.flex} />
          {soon ? (
            <View style={styles.inPill}>
              <Icon name="truck" size={13} color={colors.forest900} />
              <Text variant="captionStrong">{r.minutesAway <= 0 ? 'now' : `in ${r.minutesAway} min`}</Text>
            </View>
          ) : (
            <Text variant="caption" color={colors.textSecondary}>
              Arrival <Text style={styles.arrival}>{formatTime(r.arrivalAt)}</Text>
            </Text>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 18, paddingBottom: 30, gap: 14 },
  trip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, backgroundColor: colors.mint100, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 12 },
  filters: { gap: 8 },
  state: { paddingVertical: 50 },
  dispatch: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.xl, padding: 16, ...shadow.card },
  dispatchIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.mint200, alignItems: 'center', justifyContent: 'center' },
  card: { ...shadow.card },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingBottom: 8 },
  cardMid: { paddingHorizontal: 14, paddingBottom: 12, gap: 3 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.emerald50, paddingHorizontal: 14, paddingVertical: 11 },
  inPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.card, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  arrival: { fontFamily: fonts.semibold, color: colors.text },
});
