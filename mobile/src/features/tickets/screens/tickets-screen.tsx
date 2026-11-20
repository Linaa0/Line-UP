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
import { useFormat, useT } from '@/i18n';
import type { Ticket } from '@/lib/types';
import { formatRwf, formatTime } from '@/utils/format';

/** My Tickets list (not in the Figma file; designed to match). */
export default function TicketsScreen() {
  const t = useT();
  const { data, error, loading, refresh, refreshing } = useApi<{ active: Ticket[]; past: Ticket[] }>('/tickets', { refreshOnFocus: true });

  const header = <ScreenHeader title={t('tickets.title')} />;
  if (loading) return <Screen header={header} edges={['top']}><LoadingState /></Screen>;
  if (error || !data) return <Screen header={header} edges={['top']}><ErrorState message={error ?? ''} onRetry={refresh} /></Screen>;

  if (!data.active.length && !data.past.length) {
    return (
      <Screen header={header} edges={['top']}>
        <EmptyState
          icon="credit-card"
          title={t('tickets.emptyTitle')}
          message={t('tickets.emptyBody')}
          action={{ label: t('tickets.findRoute'), onPress: () => router.push('/routes') }}
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
        {!!data.active.length && <SectionLabel label={t('tickets.active', { count: data.active.length })} />}
        {data.active.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
        {!!data.past.length && <SectionLabel label={t('tickets.history')} />}
        {data.past.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} />
        ))}
      </ScrollView>
    </Screen>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const t = useT();
  const f = useFormat();
  const pending = ticket.state === 'awaiting_payment';
  const live = ticket.state === 'active';
  const bay = f.bay(ticket.from.bay);
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
            <Pill label={t('tickets.awaitingPayment')} tone="warning" />
          ) : live ? (
            <Pill label={ticket.status === 'BOARDED' ? t('tickets.onBoard') : t('tickets.valid')} dot />
          ) : (
            <Pill label={ticket.state === 'used' ? t('tickets.used') : t('tickets.expired')} tone="outline" />
          )}
        </View>
        <RouteLine from={ticket.from.name} to={ticket.to.name} size={17} />
        <View style={styles.foot}>
          <Icon name="calendar" size={14} color={colors.textSecondary} />
          <Text variant="caption" color={colors.textSecondary} style={styles.flex} numberOfLines={1}>
            {f.formatDay(ticket.departureAt)} · {formatTime(ticket.departureAt)}
            {bay ? ` · ${bay}` : ''}
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
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  card: { gap: 10, ...shadow.card },
  faded: { opacity: 0.7 },
  foot: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 10 },
});
