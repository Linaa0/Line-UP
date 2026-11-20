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
import { type MessageKey, useT } from '@/i18n';

type Topic = 'tickets' | 'payments' | 'queues' | 'account';

const TOPICS: { id: Topic; label: MessageKey; icon: IconName }[] = [
  { id: 'tickets', label: 'help.topicTickets', icon: 'grid' },
  { id: 'payments', label: 'help.topicPayments', icon: 'credit-card' },
  { id: 'queues', label: 'help.topicQueues', icon: 'users' },
  { id: 'account', label: 'help.topicAccount', icon: 'user' },
];

const FAQ: { topic: Topic; q: MessageKey; a: MessageKey }[] = [
  { topic: 'tickets', q: 'help.q1', a: 'help.a1' },
  { topic: 'tickets', q: 'help.q2', a: 'help.a2' },
  { topic: 'payments', q: 'help.q3', a: 'help.a3' },
  { topic: 'payments', q: 'help.q4', a: 'help.a4' },
  { topic: 'queues', q: 'help.q5', a: 'help.a5' },
  { topic: 'queues', q: 'help.q6', a: 'help.a6' },
  { topic: 'account', q: 'help.q7', a: 'help.a7' },
  { topic: 'account', q: 'help.q8', a: 'help.a8' },
];

/** Design 13-01. */
export default function HelpCenterScreen() {
  const t = useT();
  const reports = useApi<unknown[]>('/support/reports', { refreshOnFocus: true });
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<Topic | null>(null);
  const [open, setOpen] = useState<MessageKey | null>(FAQ[0].q);

  const faqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ.filter((f) => (!topic || f.topic === topic) && (!q || t(f.q).toLowerCase().includes(q) || t(f.a).toLowerCase().includes(q)));
  }, [query, topic, t]);

  return (
    <Screen scroll header={<ScreenHeader title={t('help.title')} back />}>
      <TextField iconLeft="search" placeholder={t('help.search')} value={query} onChangeText={setQuery} />

      <View style={styles.contact}>
        <Pressable onPress={() => router.push('/support/report')} style={[styles.contactCard, styles.primary]} accessibilityRole="button">
          <View style={styles.primaryIcon}>
            <Icon name="message-square" size={20} color={colors.mint} />
          </View>
          <Text variant="bodyStrong" color="#FFFFFF">
            {t('help.report')}
          </Text>
          <Text variant="caption" color="rgba(255,255,255,0.75)">
            {t('help.reportSub')}
          </Text>
        </Pressable>
        <View style={styles.contactCard}>
          <IconTile name="inbox" />
          <Text variant="bodyStrong">{t('help.myReports')}</Text>
          <Text variant="caption" color={colors.textSecondary}>
            {reports.data ? t('help.reportsSent', { count: reports.data.length }) : t('help.repliesSms')}
          </Text>
        </View>
      </View>

      <SectionLabel label={t('help.browse')} />
      <View style={styles.topics}>
        {TOPICS.map((item) => {
          const on = topic === item.id;
          return (
            <Pressable key={item.id} onPress={() => setTopic(on ? null : item.id)} style={[styles.topic, on && styles.topicOn]} accessibilityRole="button" accessibilityState={{ selected: on }}>
              <IconTile name={item.icon} size={34} tone={on ? 'dark' : 'mint'} />
              <Text variant="bodyStrong" style={styles.flex} numberOfLines={2}>
                {t(item.label)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionLabel label={topic ? t(TOPICS.find((x) => x.id === topic)!.label) : t('help.popular')} />
      <Card padding={0}>
        {faqs.length ? (
          faqs.map((f, i) => {
            const expanded = open === f.q;
            return (
              <Pressable key={f.q} onPress={() => setOpen(expanded ? null : f.q)} style={[styles.faq, i > 0 && styles.divider]} accessibilityRole="button" accessibilityState={{ expanded }}>
                <View style={styles.faqRow}>
                  <Text variant="bodyStrong" style={styles.flex}>
                    {t(f.q)}
                  </Text>
                  <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
                </View>
                {expanded && (
                  <Text variant="caption" color={colors.textSecondary} style={styles.answer}>
                    {t(f.a)}
                  </Text>
                )}
              </Pressable>
            );
          })
        ) : (
          <Text variant="body" color={colors.textSecondary} style={styles.faq}>
            {t('help.noAnswers', { q: query })}
          </Text>
        )}
      </Card>

      <View style={styles.sos}>
        <IconTile name="alert-triangle" tone="danger" round />
        <View style={styles.flex}>
          <Text variant="bodyStrong" color="#991B1B">
            {t('help.emergency')}
          </Text>
          <Text variant="caption" color="#B45353">
            {t('help.emergencySub')}
          </Text>
        </View>
        <Pressable onPress={() => void Linking.openURL('tel:112')} style={styles.call} accessibilityRole="button">
          <Text variant="captionStrong" color="#FFFFFF">
            {t('help.call')}
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
