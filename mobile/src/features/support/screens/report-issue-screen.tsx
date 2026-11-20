import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { EmptyState } from '@/components/shared/states';
import { RouteBadge, shortName } from '@/components/shared/transit';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { colors, radius } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { type MessageKey, useFormat, useT } from '@/i18n';
import { api, ApiError } from '@/lib/api';
import type { Ticket } from '@/lib/types';
import { formatTime } from '@/utils/format';

const CATEGORIES: { id: 'PAYMENT' | 'TICKET' | 'DELAY' | 'CONDUCT' | 'LOST_ITEM' | 'OTHER'; label: MessageKey }[] = [
  { id: 'PAYMENT', label: 'report.payment' },
  { id: 'TICKET', label: 'report.ticket' },
  { id: 'DELAY', label: 'report.delay' },
  { id: 'CONDUCT', label: 'report.conduct' },
  { id: 'LOST_ITEM', label: 'report.lostItem' },
  { id: 'OTHER', label: 'report.other' },
];

/** Design 13-02. Reports are stored and confirmed with a notification. */
export default function ReportIssueScreen() {
  const t = useT();
  const f = useFormat();
  const tickets = useApi<{ active: Ticket[]; past: Ticket[] }>('/tickets');
  const all = [...(tickets.data?.active ?? []), ...(tickets.data?.past ?? [])].filter((x) => x.state !== 'awaiting_payment');
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id'] | null>(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const report = await api<{ id: string }>('/support/reports', {
        method: 'POST',
        body: { category, description: description.trim(), ...(ticketId ? { ticketId } : {}) },
      });
      setSent(report.id.slice(0, 8).toUpperCase());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('report.couldNotSend'));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Screen header={<ScreenHeader title={t('report.title')} back />}>
        <EmptyState
          icon="check"
          title={t('report.sentTitle')}
          message={t('report.sentBody', { ref: sent })}
          action={{ label: t('report.backToHelp'), onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      header={<ScreenHeader title={t('report.title')} back />}
      footer={
        <>
          {error && (
            <Text variant="caption" color={colors.danger} align="center">
              {error}
            </Text>
          )}
          <Button label={t('report.submit')} iconLeft="send" onPress={submit} loading={busy} disabled={!category || description.trim().length < 10} />
          <Text variant="caption" color={colors.textSecondary} align="center">
            {t('report.respond')}
          </Text>
        </>
      }
    >
      <SectionLabel label={t('report.relatedTrip')} />
      {all.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trips}>
          {all.slice(0, 6).map((x) => {
            const on = ticketId === x.id;
            return (
              <Pressable key={x.id} onPress={() => setTicketId(on ? null : x.id)} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                <Card style={[styles.trip, on && styles.tripOn]}>
                  <RouteBadge code={x.route.code} size="sm" />
                  <View>
                    <Text variant="captionStrong">
                      {shortName(x.from.name)} → {shortName(x.to.name)}
                    </Text>
                    <Text variant="caption" color={colors.textSecondary}>
                      {f.formatDay(x.departureAt)}, {formatTime(x.departureAt)}
                    </Text>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <Text variant="caption" color={colors.textSecondary}>
          {t('report.noTrips')}
        </Text>
      )}

      <SectionLabel label={t('report.whatWrong')} />
      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <Chip key={c.id} label={t(c.label)} selected={category === c.id} onPress={() => setCategory(c.id)} />
        ))}
      </View>

      <SectionLabel label={t('report.describe')} />
      <TextField
        value={description}
        onChangeText={(text) => setDescription(text.slice(0, 500))}
        multiline
        placeholder={t('report.placeholder')}
        hint={`${description.length} / 500`}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  trips: { gap: 10 },
  trip: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  tripOn: { borderColor: colors.forest900, borderWidth: 2, borderRadius: radius.xl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
