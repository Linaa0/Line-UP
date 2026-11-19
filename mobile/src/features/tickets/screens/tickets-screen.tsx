import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { RouteBadge, RouteLine } from '@/components/shared/transit';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { colors, shadow } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import type { Ticket } from '@/lib/types';
import { formatDay, formatRwf, formatTime } from '@/utils/format';

/** My Tickets list (not in the Figma file; designed to match). */
export default function TicketsScreen() {
  const { data, error, loading, refresh, refreshing } = useApi<{ active: Ticket[]; past: Ticket[] }>('/tickets', { refreshOnFocus: true });

  const header = <ScreenHeader title="My Tickets" />;
  if (loading) return <Screen header={header} edges={['top']}><LoadingState /></Screen>;
  if (error || !data) return <Screen header={header} edges={['top']}><ErrorState message={error ?? ''} onRetry={refresh} /></Screen>;

  if (!data.active.length && !data.past.length) {
    return (
      <Screen header={header} edges={['top']}>
        <EmptyState
          icon="credit-card"
          title="No tickets yet"
          message="Search a route, pick a bus and pay with Mobile Money. Your QR ticket appears here."
          action={{ label: 'Find a Route', onPress: () => router.push('/routes') }}
        />
      </Screen>
    );
  }

  return (
    <Screen header={header} edges={['top']} padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.emerald} />}
      >
        {!!data.active.length && <SectionLabel label={`Active · ${data.active.length}`} />}
        {data.active.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
        {!!data.past.length && <SectionLabel label="History" />}
        {data.past.map((t) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </ScrollView>
    </Screen>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const pending = ticket.state === 'awaiting_payment';
  const live = ticket.state === 'active';
  const onPress = () =>
    pending ? router.push({ pathname: '/checkout/pay', params: { ticketId: ticket.id } }) : router.push(`/tickets/${ticket.id}`);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
      <Card style={[styles.card, !live && !pending && styles.faded]}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <RouteBadge code={ticket.route.code} size="sm" />
            <Text variant="captionStrong" color={colors.textSecondary}>
              #{ticket.code}
            </Text>
          </View>
          {pending ? (
            <Pill label="Awaiting payment" tone="warning" />
          ) : live ? (
            <Pill label={ticket.status === 'BOARDED' ? 'On board' : 'Valid'} dot />
          ) : (
            <Pill label={ticket.state === 'used' ? 'Used' : 'Expired'} tone="outline" />
          )}
        </View>
        <RouteLine from={ticket.from.name} to={ticket.to.name} size={17} />
        <View style={styles.foot}>
          <Icon name="calendar" size={14} color={colors.textSecondary} />
          <Text variant="caption" color={colors.textSecondary} style={styles.flex}>
            {formatDay(ticket.departureAt)} · {formatTime(ticket.departureAt)}
            {ticket.from.bay ? ` · ${ticket.from.bay}` : ''}
          </Text>
          <Text variant="captionStrong">{formatRwf(ticket.fare)}</Text>
          <Icon name="chevron-right" size={16} color="#B6C2BC" />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 18, paddingBottom: 24, gap: 12 },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: { gap: 10, ...shadow.card },
  faded: { opacity: 0.7 },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 10 },
});
