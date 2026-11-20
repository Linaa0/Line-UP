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
import { useFormat, useT } from '@/i18n';
import { api } from '@/lib/api';
import type { RouteDetails } from '@/lib/types';
import { formatRwf, formatTime } from '@/utils/format';

/** Design 05-01. */
export default function RouteDetailsScreen() {
  const t = useT();
  const f = useFormat();
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
      <HeaderIconButton icon="chevron-left" label={t('common.back')} onPress={() => router.back()} />
      <View style={styles.headerTitle}>
        <Text variant="title" numberOfLines={1} style={styles.shrink}>
          {t('route.title')}
        </Text>
        {data && <RouteBadge code={data.route.code} size="sm" />}
      </View>
      <HeaderIconButton icon="bookmark" label={data?.saved ? t('route.unsave') : t('route.save')} onPress={toggleSave} />
    </View>
  );

  if (loading) return <Screen header={header}><LoadingState /></Screen>;
  if (error || !data) return <Screen header={header}><ErrorState message={error ?? t('route.notFound')} onRetry={refresh} /></Screen>;

  const departure = data.nextDepartures[choice] ?? data.nextDepartures[0];
  const offset = departure ? new Date(departure.tripStartAt).getTime() - new Date(data.nextDepartures[0].tripStartAt).getTime() : 0;
  const bay = f.bay(data.from.bay);

  return (
    <Screen
      scroll
      header={header}
      footer={
        <Button
          label={t('route.getTicket')}
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
          {data.saved && <Pill label={t('route.saved')} />}
        </View>
        <View style={styles.meta}>
          <Icon name="clock" size={14} color={colors.textSecondary} />
          <Text variant="captionStrong" color={colors.textSecondary}>
            {f.formatMinutes(data.durationMin)}
          </Text>
          <Text variant="caption" color={colors.muted}>•</Text>
          <Text variant="captionStrong">{formatRwf(data.fare)}</Text>
          <Text variant="caption" color={colors.muted}>•</Text>
          <Text variant="captionStrong" color={colors.emerald}>
            {f.kind(data.route.kind)}
          </Text>
        </View>
        <Text variant="caption" color={colors.textSecondary}>
          {t('route.operatedBy', { operator: data.route.operator, count: data.route.frequencyMin })}
        </Text>
      </Card>

      <SectionLabel label={t('route.chooseDeparture')} />
      <View style={styles.departures}>
        {data.nextDepartures.map((d, i) => (
          <Pressable key={d.tripStartAt} onPress={() => setChoice(i)} style={[styles.dep, i === choice && styles.depOn]} accessibilityRole="button" accessibilityState={{ selected: i === choice }}>
            <Text style={[styles.depTime, i === choice && { color: '#FFFFFF' }]}>{formatTime(d.departureAt)}</Text>
            <Text variant="caption" color={i === choice ? colors.mint : colors.textSecondary}>
              {d.minutesAway <= 0 ? t('transit.nowShort') : t('transit.inMinutes', { count: d.minutesAway })}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionLabel label={t('route.stops')} />
      <Card>
        <StopTimeline
          stops={data.stops.map((s) => ({
            id: s.id,
            name: s.name,
            time: new Date(new Date(s.time).getTime() + offset).toISOString(),
            subtitle:
              s.role === 'departure' ? `${t('route.departure')}${bay ? ` · ${bay}` : ''}` : s.role === 'arrival' ? t('route.arrival') : undefined,
          }))}
          timeFormatter={formatTime}
        />
      </Card>

      <SectionLabel label={t('route.busInfo')} />
      <View style={styles.info}>
        <Card style={styles.infoCard}>
          <View style={styles.row}>
            <Icon name="calendar" size={14} color={colors.textSecondary} />
            <Text variant="caption" color={colors.textSecondary}>
              {t('route.nextBus')}
            </Text>
          </View>
          <Text style={styles.big}>{data.nextDepartures[0] ? f.formatMinutes(data.nextDepartures[0].minutesAway) : '—'}</Text>
          <Text variant="caption" color={colors.muted}>
            {data.bus ? t('route.busPlate', { plate: data.bus.plate }) : t('route.fromTimetable')}
          </Text>
        </Card>
        <Card style={styles.infoCard}>
          <View style={styles.row}>
            <Icon name="users" size={14} color={colors.textSecondary} />
            <Text variant="caption" color={colors.textSecondary}>
              {t('route.load')}
            </Text>
          </View>
          <Text style={styles.big}>
            {data.loadPercent}% <Text variant="label" color={colors.emerald}>{t('route.booked')}</Text>
          </Text>
          <LoadBar percent={data.loadPercent} />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screen, paddingTop: 4, paddingBottom: 12, gap: 8 },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  shrink: { flexShrink: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  summary: { gap: 8, ...shadow.card },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  departures: { flexDirection: 'row', gap: 10 },
  dep: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingVertical: 10, alignItems: 'center', gap: 2 },
  depOn: { backgroundColor: colors.forest900, borderColor: colors.forest900 },
  depTime: { fontFamily: fonts.heading, fontSize: 17, color: colors.text },
  info: { flexDirection: 'row', gap: 10 },
  infoCard: { flex: 1, gap: 6, backgroundColor: '#F1F8F4' },
  big: { fontFamily: fonts.display, fontSize: 22, color: colors.forest900 },
});
