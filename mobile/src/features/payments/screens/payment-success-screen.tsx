import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingState } from '@/components/shared/states';
import { RouteLine } from '@/components/shared/transit';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { api, ApiError } from '@/lib/api';
import type { QueueEntry, Ticket } from '@/lib/types';
import { formatDay, formatTime } from '@/utils/format';

/** Design 07-02. */
export default function PaymentSuccessScreen() {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const { data: ticket } = useApi<Ticket>(`/tickets/${ticketId}`);
  const [scale] = useState(() => new Animated.Value(0.4));
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }).start();
  }, [scale]);

  const joinQueue = async () => {
    setJoining(true);
    setError(null);
    try {
      const entry = await api<QueueEntry>('/queues', { method: 'POST', body: { ticketId } });
      router.replace(`/queue/${entry.id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not join the queue.');
      setJoining(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#DFF8EC', colors.background, colors.background]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <Text variant="label" color={colors.emerald} align="center" style={styles.brand}>
          LINE-UP
        </Text>
        <View style={styles.hero}>
          <Animated.View style={[styles.halo, { transform: [{ scale }] }]}>
            <View style={styles.check}>
              <Icon name="check" size={40} color="#FFFFFF" />
            </View>
          </Animated.View>
          <Text variant="h1" align="center">
            Ticket Purchased!
          </Text>
          <Text variant="body" color={colors.textSecondary} align="center">
            {ticket ? `Your seat on bus ${ticket.route.code} is confirmed.` : 'Your seat is confirmed.'}
          </Text>
        </View>

        {!ticket ? (
          <LoadingState style={styles.loading} />
        ) : (
          <Card style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.row}>
                <View style={styles.code}>
                  <Text style={styles.codeText}>{ticket.route.code}</Text>
                </View>
                <View>
                  <RouteLine from={ticket.from.name} to={ticket.to.name} size={15} />
                  <Text variant="caption" color={colors.textSecondary}>
                    {ticket.route.kind === 'DIRECT' ? 'Direct route' : 'Via ' + ticket.route.via}
                  </Text>
                </View>
              </View>
              <Pill label="Paid" tone="outline" />
            </View>
            <View style={styles.divider} />
            <View style={styles.grid}>
              <Field label="Ticket ID" value={`#${ticket.code}`} />
              <Field label="Departure" value={`${formatDay(ticket.departureAt)}, ${formatTime(ticket.departureAt)}`} />
            </View>
            <View style={styles.validity}>
              <Icon name="clock" size={14} color={colors.forest700} />
              <Text variant="captionStrong" color={colors.forest700}>
                Single journey · valid until {formatTime(ticket.validUntil)}
              </Text>
            </View>
            {ticket.payment?.demo && (
              <Text variant="caption" color={colors.muted} align="center">
                Demo payment · ref {ticket.payment.reference}
              </Text>
            )}
          </Card>
        )}

        <View style={styles.actions}>
          {error && (
            <Text variant="caption" color={colors.danger} align="center">
              {error}
            </Text>
          )}
          <Button label="View Digital Ticket" iconLeft="maximize" onPress={() => router.replace(`/tickets/${ticketId}`)} />
          <Button label="Join Virtual Queue" variant="secondary" iconLeft="users" onPress={joinQueue} loading={joining} />
          <Button label="Back to Home" variant="secondary" onPress={() => router.dismissTo('/home')} style={styles.ghost} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text variant="label" color={colors.muted}>
        {label}
      </Text>
      <Text variant="bodyStrong">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 22 },
  brand: { marginTop: 10 },
  hero: { alignItems: 'center', gap: 10, marginTop: 30 },
  halo: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#C9F2DD', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  check: { width: 78, height: 78, borderRadius: 39, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center', ...shadow.raised },
  loading: { flex: 0, paddingVertical: 40 },
  card: { marginTop: 26, gap: 14, ...shadow.card },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  code: { width: 50, height: 50, borderRadius: 14, backgroundColor: colors.mint100, alignItems: 'center', justifyContent: 'center' },
  codeText: { fontFamily: fonts.display, fontSize: 14, color: colors.forest900 },
  divider: { height: 1, backgroundColor: colors.divider },
  grid: { flexDirection: 'row', gap: 12 },
  field: { flex: 1, gap: 3 },
  validity: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.emerald50, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start' },
  actions: { marginTop: 'auto', gap: 10, paddingBottom: 12 },
  ghost: { borderColor: colors.mint200 },
});
