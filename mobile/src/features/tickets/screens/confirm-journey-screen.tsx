import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { ErrorState, LoadingState } from '@/components/shared/states';
import { RouteBadge, RouteLine, StopTimeline } from '@/components/shared/transit';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { Pill } from '@/components/ui/pill';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { colors, fonts, shadow } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useFormat, useT } from '@/i18n';
import { api, ApiError } from '@/lib/api';
import type { RouteDetails, Ticket } from '@/lib/types';
import { formatRwf, formatTime } from '@/utils/format';

/** Design 06-01. Creates the ticket (awaiting payment) and moves on to payment. */
export default function ConfirmJourneyScreen() {
  const t = useT();
  const f = useFormat();
  const { routeId, from, to, tripStartAt } = useLocalSearchParams<{ routeId: string; from: string; to: string; tripStartAt: string }>();
  const { data, error, loading, refresh } = useApi<RouteDetails>(`/routes/${routeId}?from=${from}&to=${to}`);
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const header = <ScreenHeader title={t('confirm.title')} back />;
  if (loading) return <Screen header={header}><LoadingState /></Screen>;
  if (error || !data) return <Screen header={header}><ErrorState message={error ?? t('route.notFound')} onRetry={refresh} /></Screen>;

  // Shift the timetable to the departure the passenger chose.
  const firstTripStart = new Date(data.nextDepartures[0]?.tripStartAt ?? data.stops[0].time).getTime();
  const shift = new Date(tripStartAt).getTime() - firstTripStart;
  const stops = data.stops.map((s) => ({ ...s, time: new Date(new Date(s.time).getTime() + shift).toISOString() }));
  const bay = f.bay(data.from.bay);

  const reserve = async () => {
    setBusy(true);
    setPayError(null);
    try {
      const ticket = await api<Ticket>('/tickets', { method: 'POST', body: { routeId, fromStopId: from, toStopId: to, tripStartAt } });
      router.push({ pathname: '/checkout/pay', params: { ticketId: ticket.id } });
    } catch (e) {
      setPayError(e instanceof ApiError ? e.message : t('confirm.couldNotReserve'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      scroll
      header={header}
      footer={
        <>
          {payError && (
            <Text variant="caption" color={colors.danger} align="center">
              {payError}
            </Text>
          )}
          <Button label={t('confirm.payNow')} iconRight="chevron-right" onPress={reserve} loading={busy} />
          <Pressable onPress={() => router.back()} style={styles.cancel} accessibilityRole="button">
            <Text variant="captionStrong" color={colors.textSecondary}>
              {t('confirm.cancelJourney')}
            </Text>
          </Pressable>
        </>
      }
    >
      <Card style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <RouteBadge code={data.route.code} />
            <Pill label={f.kind(data.route.kind)} />
          </View>
          <Text variant="caption" color={colors.textSecondary} numberOfLines={1} style={styles.shrink}>
            {data.route.operator}
          </Text>
        </View>
        <View style={styles.divider} />
        <RouteLine from={data.from.name} to={data.to.name} size={18} />
        <View style={styles.rowWrap}>
          <Icon name="clock" size={14} color={colors.emerald} />
          <Text variant="captionStrong" color={colors.textSecondary}>
            {f.formatMinutes(data.durationMin)} · {f.formatDay(stops[0].time)}, {formatTime(stops[0].time)}
          </Text>
          <Text variant="caption" color={colors.muted}>•</Text>
          <Text variant="captionStrong">{formatRwf(data.fare)}</Text>
        </View>
      </Card>

      <SectionLabel label={t('confirm.breakdown')} action={<Text variant="captionStrong" color={colors.emerald}>{t('transit.stops', { count: stops.length })}</Text>} />
      <Card>
        <StopTimeline
          stops={stops.map((s) => ({
            id: s.id,
            name: s.name,
            time: s.time,
            subtitle:
              s.role === 'departure'
                ? `${t('confirm.origin')}${bay ? ` · ${bay}` : ''}`
                : s.role === 'arrival'
                  ? t('confirm.dropoff')
                  : t('confirm.intermediate'),
          }))}
          timeFormatter={formatTime}
        />
      </Card>

      <SectionLabel label={t('confirm.facilities')} />
      <View style={styles.facilities}>
        <Card style={styles.facility}>
          <IconTile name="credit-card" size={34} />
          <View style={styles.flex}>
            <Text variant="captionStrong">{t('confirm.tapGo')}</Text>
            <Text variant="caption" color={colors.textSecondary}>
              {data.route.acceptsTapGo ? t('confirm.cardAccepted') : t('confirm.notOnBus')}
            </Text>
          </View>
        </Card>
        <Card style={styles.facility}>
          <View style={styles.momo}>
            <Icon name="smartphone" size={16} color="#7A5B00" />
          </View>
          <View style={styles.flex}>
            <Text variant="captionStrong">{t('confirm.mobileMoney')}</Text>
            <Text variant="caption" color={colors.textSecondary}>
              {t('confirm.momoProviders')}
            </Text>
          </View>
        </Card>
      </View>

      <SectionLabel label={t('confirm.fareBreakdown')} />
      <Card style={styles.fare}>
        <FareRow label={t('confirm.single')} value={formatRwf(data.fare)} />
        <FareRow label={t('confirm.serviceFee')} value={formatRwf(0)} />
        <View style={styles.divider} />
        <View style={styles.rowBetween}>
          <Text variant="bodyStrong">{t('confirm.total')}</Text>
          <Text style={styles.total}>{formatRwf(data.fare)}</Text>
        </View>
      </Card>
    </Screen>
  );
}

function FareRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.rowBetween}>
      <Text variant="body" color={colors.textSecondary}>
        {label}
      </Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  card: { gap: 12, ...shadow.card },
  divider: { height: 1, backgroundColor: colors.divider },
  facilities: { flexDirection: 'row', gap: 10 },
  facility: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#F7FBF9' },
  momo: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#FFF4C2', alignItems: 'center', justifyContent: 'center' },
  fare: { gap: 10 },
  total: { fontFamily: fonts.display, fontSize: 20, color: colors.forest900 },
  cancel: { alignItems: 'center', paddingVertical: 4 },
});
