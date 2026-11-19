import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { colors, radius, shadow } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';

type Topic = 'tickets' | 'payments' | 'queues' | 'account';

const TOPICS: { id: Topic; label: string; icon: IconName }[] = [
  { id: 'tickets', label: 'Tickets & QR', icon: 'grid' },
  { id: 'payments', label: 'Payments', icon: 'credit-card' },
  { id: 'queues', label: 'Queues', icon: 'users' },
  { id: 'account', label: 'My account', icon: 'user' },
];

const FAQ: { topic: Topic; q: string; a: string }[] = [
  { topic: 'tickets', q: 'How do I use my ticket?', a: 'Open My Tickets, tap your ticket and show the QR code to the conductor or at the turnstile. Turn up your screen brightness for faster scanning.' },
  { topic: 'tickets', q: 'How long is my ticket valid?', a: 'A single-journey ticket is valid for the bus you chose, until 30 minutes after its scheduled arrival.' },
  { topic: 'payments', q: 'Which payment methods can I use?', a: 'MTN Mobile Money and Airtel Money. Many buses also accept Tap&Go cards at the door.' },
  { topic: 'payments', q: 'My payment went through but I see no ticket', a: 'Pull down on My Tickets to refresh. If it still is missing, report a payment issue with the time you paid and we will check it.' },
  { topic: 'queues', q: 'How does the virtual queue work?', a: 'After buying a ticket, join the queue for your bus. Your number is your place in line at the boarding bay; boarding opens about 3 minutes before departure.' },
  { topic: 'queues', q: 'Where are bus times from?', a: 'Times and bus positions are estimated from each route’s timetable. Live GPS tracking will be added when operators connect their buses.' },
  { topic: 'account', q: 'How do I change my home stop?', a: 'Go to Profile → Personal information and choose your usual stop. Home then shows the next buses from there.' },
  { topic: 'account', q: 'I forgot my password', a: 'On the Log In screen tap “Forgot password?”, enter your phone number and the code we send you, then choose a new password.' },
];

/** Design 13-01. */
export default function HelpCenterScreen() {
  const reports = useApi<unknown[]>('/support/reports', { refreshOnFocus: true });
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [open, setOpen] = useState<string | null>(FAQ[0].q);

  const faqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ.filter((f) => (!topic || f.topic === topic) && (!q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)));
  }, [query, topic]);

  return (
    <Screen scroll header={<ScreenHeader title="Help Center" back />}>
      <TextField iconLeft="search" placeholder="Search tickets, payments, queues…" value={query} onChangeText={setQuery} />

      <View style={styles.contact}>
        <Pressable onPress={() => router.push('/support/report')} style={[styles.contactCard, styles.primary]} accessibilityRole="button">
          <View style={styles.primaryIcon}>
            <Icon name="message-square" size={20} color={colors.mint} />
          </View>
          <Text variant="bodyStrong" color="#FFFFFF">
            Report an issue
          </Text>
          <Text variant="caption" color="rgba(255,255,255,0.75)">
            Payments, delays, lost items
          </Text>
        </Pressable>
        <View style={styles.contactCard}>
          <IconTile name="inbox" />
          <Text variant="bodyStrong">My reports</Text>
          <Text variant="caption" color={colors.textSecondary}>
            {reports.data ? `${reports.data.length} sent · replies by SMS` : 'Replies by SMS'}
          </Text>
        </View>
      </View>

      <SectionLabel label="Browse topics" />
      <View style={styles.topics}>
        {TOPICS.map((t) => {
          const on = topic === t.id;
          return (
            <Pressable key={t.id} onPress={() => setTopic(on ? null : t.id)} style={[styles.topic, on && styles.topicOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
              <IconTile name={t.icon} size={34} tone={on ? 'dark' : 'mint'} />
              <Text variant="bodyStrong">{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionLabel label={topic ? TOPICS.find((t) => t.id === topic)!.label : 'Popular questions'} />
      <Card padding={0}>
        {faqs.length ? (
          faqs.map((f, i) => {
            const expanded = open === f.q;
            return (
              <Pressable key={f.q} onPress={() => setOpen(expanded ? null : f.q)} style={[styles.faq, i > 0 && styles.divider]} accessibilityRole="button" accessibilityState={{ expanded }}>
                <View style={styles.faqRow}>
                  <Text variant="bodyStrong" style={styles.flex}>
                    {f.q}
                  </Text>
                  <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
                </View>
                {expanded && (
                  <Text variant="caption" color={colors.textSecondary} style={styles.answer}>
                    {f.a}
                  </Text>
                )}
              </Pressable>
            );
          })
        ) : (
          <Text variant="body" color={colors.textSecondary} style={styles.faq}>
            No answers match “{query}”. Report an issue and our team will help.
          </Text>
        )}
      </Card>

      <View style={styles.sos}>
        <IconTile name="alert-triangle" tone="danger" round />
        <View style={styles.flex}>
          <Text variant="bodyStrong" color="#991B1B">
            Emergency on a bus?
          </Text>
          <Text variant="caption" color="#B45353">
            Contact Rwanda emergency services
          </Text>
        </View>
        <Pressable onPress={() => void Linking.openURL('tel:112')} style={styles.call} accessibilityRole="button">
          <Text variant="captionStrong" color="#FFFFFF">
            Call 112
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  contact: { flexDirection: 'row', gap: 10, marginTop: 14 },
  contactCard: { flex: 1, gap: 6, padding: 14, borderRadius: radius.xl, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  primary: { backgroundColor: colors.forest900, borderColor: colors.forest900, ...shadow.card },
  primaryIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(112,251,190,0.16)', alignItems: 'center', justifyContent: 'center' },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  topic: { width: '48.4%', flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.xl, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  topicOn: { borderColor: colors.forest900 },
  faq: { padding: 14 },
  faqRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  answer: { marginTop: 8, lineHeight: 19 },
  divider: { borderTopWidth: 1, borderTopColor: colors.divider },
  sos: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.xl, backgroundColor: colors.danger50, borderWidth: 1, borderColor: '#F8D7D7', marginTop: 14 },
  call: { backgroundColor: colors.danger, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8 },
});
