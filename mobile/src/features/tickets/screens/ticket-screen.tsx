import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { ErrorState, LoadingState } from '@/components/shared/states';
import { shortName } from '@/components/shared/transit';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useNow } from '@/hooks/use-now';
import { api, ApiError } from '@/lib/api';
import type { QueueEntry, Ticket } from '@/lib/types';
import { formatMinutes, formatTime } from '@/utils/format';

/** Design 08-01. The QR encodes the ticket code for the conductor's scanner. */
export default function TicketScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: ticket, error, loading, refresh } = useApi<Ticket>(`/tickets/${id}`, { refreshOnFocus: true });
  const now = useNow();
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const share = async () => {
    if (!ticket) return;
    await Share.share({
      message: `LINE-UP ticket #${ticket.code}: bus ${ticket.route.code} ${ticket.from.name} → ${ticket.to.name}, departs ${formatTime(ticket.departureAt)}.`,
    }).catch(() => undefined);
  };

  const header = <ScreenHeader title="My Ticket" back right={{ icon: 'share-2', label: 'Share ticket', onPress: share }} />;
  if (loading) return <Screen header={header}><LoadingState /></Screen>;
  if (error || !ticket) return <Screen header={header}><ErrorState message={error ?? 'Ticket not found.'} onRetry={refresh} /></Screen>;

  const minutesLeft = Math.max(0, Math.round((new Date(ticket.validUntil).getTime() - now) / 60_000));
  const valid = ticket.state === 'active';

  const queue = async () => {
    if (ticket.queueEntryId) {
      router.push(`/queue/${ticket.queueEntryId}`);
      return;
    }
    setJoining(true);
    setJoinError(null);
    try {
      const entry = await api<QueueEntry>('/queues', { method: 'POST', body: { ticketId: ticket.id } });
      router.push(`/queue/${entry.id}`);
    } catch (e) {
      setJoinError(e instanceof ApiError ? e.message : 'Could not join the queue.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <Screen
      scroll
      header={header}
      footer={
        valid ? (
          <>
            {joinError && (
              <Text variant="caption" color={colors.danger} align="center">
                {joinError}
              </Text>
            )}
            <Button
              label={ticket.queueEntryId ? 'View My Queue' : 'Join Virtual Queue'}
              iconLeft="users"
              onPress={queue}
              loading={joining}
            />
          </>
        ) : undefined
      }
    >
      <View style={styles.pass}>
        <View style={styles.passTop}>
          <View style={styles.rowBetween}>
            <Pill label="LINE-UP Pass" tone="outline" />
            <View style={styles.busPill}>
              <View style={styles.liveDot} />
              <Text variant="captionStrong" color="#FFFFFF">
                Bus {ticket.route.code}
              </Text>
            </View>
          </View>
          <View style={styles.places}>
            <View style={styles.flex}>
              <Text variant="label" color={colors.muted}>
                Origin
              </Text>
              <Text variant="h2" numberOfLines={1}>
                {shortName(ticket.from.name)}
              </Text>
            </View>
            <Icon name="arrow-right" size={22} color={colors.emerald} />
            <View style={[styles.flex, styles.right]}>
              <Text variant="label" color={colors.muted}>
                Destination
              </Text>
              <Text variant="h2" numberOfLines={1}>
                {shortName(ticket.to.name)}
              </Text>
            </View>
          </View>

          <View style={styles.qrWrap}>
            <View style={[styles.qr, !valid && styles.qrOff]}>
              <QRCode value={`LINEUP:${ticket.code}`} size={180} color={colors.text} backgroundColor="#FFFFFF" />
            </View>
          </View>
          <View style={styles.codeChip}>
            <Text style={styles.code}>#{ticket.code}</Text>
          </View>
          <View style={styles.validRow}>
            <Icon name={valid ? 'clock' : 'x-circle'} size={14} color={valid ? colors.emerald : colors.muted} />
            <Text variant="captionStrong" color={valid ? colors.emerald : colors.muted}>
              {ticket.status === 'BOARDED' && valid
                ? 'On board · enjoy your trip'
                : valid
                  ? `Valid for: ${formatMinutes(minutesLeft)}`
                  : ticket.state === 'used'
                    ? 'Used'
                    : 'Expired'}
            </Text>
          </View>
        </View>

        <View style={styles.tear}>
          <View style={[styles.notch, styles.notchLeft]} />
          <View style={styles.dash} />
          <View style={[styles.notch, styles.notchRight]} />
        </View>

        <View style={styles.passBottom}>
          <Info label="Passenger" value={ticket.passenger.split(' ')[0]} />
          <Info label="Departure" value={ticket.from.bay ?? shortName(ticket.from.name)} />
          <Info label="Boarding" value={formatTime(ticket.departureAt)} />
        </View>
      </View>

      <Text variant="caption" color={colors.textSecondary} align="center" style={styles.note}>
        Show this QR code to the conductor or at the turnstile. Turn up your screen brightness for faster scanning.
      </Text>
    </Screen>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text variant="label" color={colors.muted}>
        {label}
      </Text>
      <Text variant="bodyStrong" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  right: { alignItems: 'flex-end' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pass: { backgroundColor: colors.card, borderRadius: radius.xxl, ...shadow.raised },
  passTop: { padding: 20, gap: 16 },
  busPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.emerald, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.mint },
  places: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.divider, paddingBottom: 14 },
  qrWrap: { alignItems: 'center' },
  qr: { padding: 14, borderRadius: radius.xl, borderWidth: 2, borderColor: '#C9F2DD', backgroundColor: '#FFFFFF' },
  qrOff: { opacity: 0.25 },
  codeChip: { alignSelf: 'center', backgroundColor: '#F1F5F3', borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 5 },
  code: { fontFamily: fonts.heading, fontSize: 14, letterSpacing: 1, color: colors.text },
  validRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  tear: { height: 24, justifyContent: 'center' },
  dash: { marginHorizontal: 22, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: '#D5E2DB' },
  notch: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: colors.background },
  notchLeft: { left: -12 },
  notchRight: { right: -12 },
  passBottom: { flexDirection: 'row', padding: 18, paddingTop: 10, gap: 10, backgroundColor: '#FAFCFB', borderBottomLeftRadius: radius.xxl, borderBottomRightRadius: radius.xxl },
  info: { flex: 1, gap: 3 },
  note: { marginTop: 16, paddingHorizontal: 10 },
});
