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
import { api, ApiError } from '@/lib/api';
import type { Ticket } from '@/lib/types';
import { formatDay, formatTime } from '@/utils/format';

const CATEGORIES = [
  { id: 'PAYMENT', label: 'Payment' },
  { id: 'TICKET', label: 'Ticket / QR' },
  { id: 'DELAY', label: 'Bus delay' },
  { id: 'CONDUCT', label: 'Driver conduct' },
  { id: 'LOST_ITEM', label: 'Lost item' },
  { id: 'OTHER', label: 'Other' },
] as const;

/** Design 13-02. Reports are stored and confirmed with a notification. */
export default function ReportIssueScreen() {
  const tickets = useApi<{ active: Ticket[]; past: Ticket[] }>('/tickets');
  const all = [...(tickets.data?.active ?? []), ...(tickets.data?.past ?? [])].filter((t) => t.state !== 'awaiting_payment');
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
      setError(e instanceof ApiError ? e.message : 'Could not send your report.');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Screen header={<ScreenHeader title="Report an Issue" back />}>
        <EmptyState
          icon="check"
          title="Report sent"
          message={`Reference ${sent}. Our team usually replies within 24 hours by SMS.`}
          action={{ label: 'Back to Help Center', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      header={<ScreenHeader title="Report an Issue" back />}
      footer={
        <>
          {error && (
            <Text variant="caption" color={colors.danger} align="center">
              {error}
            </Text>
          )}
          <Button label="Submit Report" iconLeft="send" onPress={submit} loading={busy} disabled={!category || description.trim().length < 10} />
          <Text variant="caption" color={colors.textSecondary} align="center">
            We usually respond within 24 hours via SMS.
          </Text>
        </>
      }
    >
      <SectionLabel label="Related trip (optional)" />
      {all.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trips}>
          {all.slice(0, 6).map((t) => {
            const on = ticketId === t.id;
            return (
              <Pressable key={t.id} onPress={() => setTicketId(on ? null : t.id)} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                <Card style={[styles.trip, on && styles.tripOn]}>
                  <RouteBadge code={t.route.code} size="sm" />
                  <View>
                    <Text variant="captionStrong">
                      {shortName(t.from.name)} → {shortName(t.to.name)}
                    </Text>
                    <Text variant="caption" color={colors.textSecondary}>
                      {formatDay(t.departureAt)}, {formatTime(t.departureAt)}
                    </Text>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <Text variant="caption" color={colors.textSecondary}>
          No trips yet. You can still report a general issue.
        </Text>
      )}

      <SectionLabel label="What went wrong?" />
      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <Chip key={c.id} label={c.label} selected={category === c.id} onPress={() => setCategory(c.id)} />
        ))}
      </View>

      <SectionLabel label="Describe the issue" />
      <TextField
        value={description}
        onChangeText={(t) => setDescription(t.slice(0, 500))}
        multiline
        placeholder="Tell us what happened, when, and where."
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
