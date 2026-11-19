import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { HeaderIconButton } from '@/components/navigation/screen-header';
import { ErrorState, LoadingState } from '@/components/shared/states';
import { LoadBar, RouteBadge, RouteLine, StopTimeline } from '@/components/shared/transit';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius, shadow, spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import type { RouteDetails } from '@/lib/types';
import { formatRwf, formatTime, KIND_LABEL } from '@/utils/format';

/** Design 05-01. */
export default function RouteDetailsScreen() {
  const { id, from, to } = useLocalSearchParams<{ id: string; from?: string; to?: string }>();
  const query = [from && `from=${from}`, to && `to=${to}`].filter(Boolean).join('&');
  const { data, error, loading, refresh, setData } = useApi<RouteDetails>(`/routes/${id}${query ? `?${query}` : ''}`, { pollMs: 30_000 });
  const [choice, setChoice] = useState(0);

  const toggleSave = async () => {
    if (!data) return;
    const saved = !data.saved;
    setData({ ...data, saved });
    await api(`/routes/${id}/save`, { method: saved ? 'PUT' : 'DELETE' }).catch(() => setData({ ...data }));
  };

  const header = (
    <View style={styles.header}>
      <HeaderIconButton icon="chevron-left" label="Go back" onPress={() => router.back()} />
      <View style={styles.headerTitle}>
        <Text variant="title">Route Details</Text>
        {data && <RouteBadge code={data.route.code} size="sm" />}
      </View>
      <HeaderIconButton icon={data?.saved ? 'bookmark' : 'bookmark'} label={data?.saved ? 'Remove from saved' : 'Save route'} onPress={toggleSave} />
    </View>
  );

  if (loading) return <Screen header={header}><LoadingState /></Screen>;
  if (error || !data) return <Screen header={header}><ErrorState message={error ?? 'Route not found.'} onRetry={refresh} /></Screen>;

  const departure = data.nextDepartures[choice] ?? data.nextDepartures[0];
  const offset = departure ? new Date(departure.tripStartAt).getTime() - new Date(data.nextDepartures[0].tripStartAt).getTime() : 0;

  return (
    <Screen
      scroll
      header={header}
      footer={
        <Button
          label="Get Ticket"
          iconRight="arrow-right"
          disabled={!departure}
          onPress={() =>
            router.push({
              pathname: '/checkout/confirm',
              params: { routeId: data.route.id, from: data.from.id, to: data.to.id, tripStartAt: departure.tripStartAt },
            })
          }
        />
      }
    >
      <Card style={styles.summary}>
        <View style={styles.rowBetween}>
          <RouteLine from={data.from.name} to={data.to.name} size={18} />
          {data.saved && <Pill label="Saved" />}
        </View>
        <View style={styles.meta}>
          <Icon name="clock" size={14} color={colors.textSecondary} />
          <Text variant="captionStrong" color={colors.textSecondary}>
            {data.durationMin} min
          </Text>
          <Text variant="caption" color={colors.muted}>•</Text>
          <Text variant="captionStrong">{formatRwf(data.fare)}</Text>
          <Text variant="caption" color={colors.muted}>•</Text>
          <Text variant="captionStrong" color={colors.emerald}>
            {KIND_LABEL[data.route.kind]}
          </Text>
        </View>
        <Text variant="caption" color={colors.textSecondary}>
          Operated by {data.route.operator} · every {data.route.frequencyMin} min
        </Text>
      </Card>

      <SectionLabel label="Choose a departure" />
      <View style={styles.departures}>
        {data.nextDepartures.map((d, i) => (
          <Pressable key={d.tripStartAt} onPress={() => setChoice(i)} style={[styles.dep, i === choice && styles.depOn]} accessibilityRole="button" accessibilityState={{ selected: i === choice }}>
            <Text style={[styles.depTime, i === choice && { color: '#FFFFFF' }]}>{formatTime(d.departureAt)}</Text>
            <Text variant="caption" color={i === choice ? colors.mint : colors.textSecondary}>
              {d.minutesAway <= 0 ? 'now' : `in ${d.minutesAway} min`}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionLabel label="Route stops" />
      <Card>
        <StopTimeline
          stops={data.stops.map((s) => ({
            id: s.id,
            name: s.name,
            time: new Date(new Date(s.time).getTime() + offset).toISOString(),
            subtitle: s.role === 'departure' ? `Departure${s.bay ? ` · ${s.bay}` : ''}` : s.role === 'arrival' ? 'Arrival' : undefined,
          }))}
          timeFormatter={formatTime}
        />
      </Card>

      <SectionLabel label="Bus info" />
      <View style={styles.info}>
        <Card style={styles.infoCard}>
          <View style={styles.row}>
            <Icon name="calendar" size={14} color={colors.textSecondary} />
            <Text variant="caption" color={colors.textSecondary}>
              Next bus
            </Text>
          </View>
          <Text style={styles.big}>{data.nextDepartures[0] ? `${data.nextDepartures[0].minutesAway} min` : '—'}</Text>
          <Text variant="caption" color={colors.muted}>
            {data.bus ? `Bus ${data.bus.plate}` : 'From the timetable'}
          </Text>
        </Card>
        <Card style={styles.infoCard}>
          <View style={styles.row}>
            <Icon name="users" size={14} color={colors.textSecondary} />
            <Text variant="caption" color={colors.textSecondary}>
              Current load
            </Text>
          </View>
          <Text style={styles.big}>
            {data.loadPercent}% <Text variant="label" color={colors.emerald}>booked</Text>
          </Text>
          <LoadBar percent={data.loadPercent} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screen, paddingTop: 4, paddingBottom: 12 },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  summary: { gap: 8, ...shadow.card },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  departures: { flexDirection: 'row', gap: 10 },
  dep: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingVertical: 10, alignItems: 'center', gap: 2 },
  depOn: { backgroundColor: colors.forest900, borderColor: colors.forest900 },
  depTime: { fontFamily: fonts.heading, fontSize: 17, color: colors.text },
  info: { flexDirection: 'row', gap: 10 },
  infoCard: { flex: 1, gap: 6, backgroundColor: '#F1F8F4' },
  big: { fontFamily: fonts.display, fontSize: 22, color: colors.forest900 },
});
