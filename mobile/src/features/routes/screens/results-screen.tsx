import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { BusMark } from '@/components/shared/logo';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { RouteBadge, RouteLine, shortName } from '@/components/shared/transit';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { Pill } from '@/components/ui/pill';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useNow } from '@/hooks/use-now';
import { type MessageKey, useFormat, useT } from '@/i18n';
import type { SearchResult } from '@/lib/types';
import { formatRwf, formatTime, payLabel } from '@/utils/format';

type Filter = 'all' | 'express' | 'direct' | 'fastest';
const FILTERS: { id: Filter; label: MessageKey }[] = [
  { id: 'all', label: 'results.all' },
  { id: 'express', label: 'results.express' },
  { id: 'direct', label: 'results.direct' },
  { id: 'fastest', label: 'results.fastest' },
];

/** Design 04-02. */
export default function ResultsScreen() {
  const t = useT();
  const { from, to, fromName, toName, at } = useLocalSearchParams<{ from: string; to: string; fromName: string; toName: string; at?: string }>();
  const path = `/routes/search?from=${from}&to=${to}${at ? `&at=${encodeURIComponent(at)}` : ''}`;
  const { data, error, loading, refresh } = useApi<{ results: SearchResult[] }>(path, { pollMs: 60_000 });
  const [filter, setFilter] = useState<Filter>('all');
  const now = useNow();

  const results = useMemo(() => {
    const list = data?.results ?? [];
    if (filter === 'express') return list.filter((r) => r.route.kind === 'EXPRESS');
    if (filter === 'direct') return list.filter((r) => r.route.kind === 'DIRECT');
    if (filter === 'fastest') return [...list].sort((a, b) => a.durationMin - b.durationMin);
    return list;
  }, [data, filter]);

  const later = at && new Date(at).getTime() - now > 5 * 60_000;

  return (
    <Screen padded={false} header={<ScreenHeader title={t('results.title')} back right={{ icon: 'refresh-cw', label: t('common.refresh'), onPress: refresh }} />}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.trip}>
          <RouteLine from={fromName ?? ''} to={toName ?? ''} size={17} color={colors.forest900} />
          <Pill label={later ? formatTime(at!) : t('time.now')} tone="outline" />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((f) => (
            <Chip key={f.id} label={t(f.label)} selected={filter === f.id} onPress={() => setFilter(f.id)} />
          ))}
        </ScrollView>

        {loading ? (
          <LoadingState label={t('results.finding')} style={styles.state} />
        ) : error ? (
          <ErrorState message={error} onRetry={refresh} style={styles.state} />
        ) : !results.length ? (
          <EmptyState
            icon="git-branch"
            title={t('results.noBusTitle')}
            message={
              filter !== 'all'
                ? t('results.noBusFiltered')
                : t('results.noBusBody', { from: shortName(fromName ?? ''), to: shortName(toName ?? '') })
            }
            style={styles.state}
          />
        ) : (
          <>
            <View style={styles.dispatch}>
              <View style={styles.flex}>
                <Text variant="label" color={colors.emerald}>
                  {t('results.timetableLive')}
                </Text>
                <Text variant="h2">{t('results.running', { count: results.length })}</Text>
                <Text variant="caption" color={colors.textSecondary}>
                  {t('results.tapCard')}
                </Text>
              </View>
              <View style={styles.dispatchIcon}>
                <BusMark size={30} color={colors.forest900} cutout={colors.mint200} />
              </View>
            </View>
            {results.map((r) => (
              <ResultCard key={r.route.id} r={r} from={from} to={to} />
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function ResultCard({ r, from, to }: { r: SearchResult; from: string; to: string }) {
  const t = useT();
  const f = useFormat();
  const soon = r.minutesAway <= 5;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/routes/[id]', params: { id: r.route.id, from, to } })}
      style={({ pressed }) => [pressed && { opacity: 0.85 }]}
    >
      <Card padding={0} style={styles.card}>
        <View style={styles.cardTop}>
          <RouteBadge code={r.route.code} size="lg" />
          <View style={styles.flex}>
            <Text variant="label" color={colors.emerald}>
              {f.kind(r.route.kind)}
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              {payLabel(r.route)}
            </Text>
          </View>
          {r.best ? (
            <Pill label={t('results.best')} dot />
          ) : soon ? (
            <Pill label={t('results.boardingSoon')} />
          ) : (
            <Pill label={t('results.onTime')} tone="outline" />
          )}
        </View>
        <View style={styles.cardMid}>
          <RouteLine from={r.from.name} to={r.to.name} size={18} />
          <Text variant="caption" color={colors.textSecondary}>
            {t('transit.via', { via: r.route.via })}
          </Text>
        </View>
        <View style={styles.cardFoot}>
          <Icon name="clock" size={16} color={colors.forest900} />
          <Text variant="captionStrong">{f.formatMinutes(r.durationMin)}</Text>
          <Text variant="caption" color={colors.muted}>
            •
          </Text>
          <Icon name="dollar-sign" size={15} color={colors.forest900} />
          <Text variant="captionStrong">{formatRwf(r.fare)}</Text>
          <View style={styles.flex} />
          {soon ? (
            <View style={styles.inPill}>
              <Icon name="truck" size={13} color={colors.forest900} />
              <Text variant="captionStrong">{r.minutesAway <= 0 ? t('transit.nowShort') : t('transit.inMinutes', { count: r.minutesAway })}</Text>
            </View>
          ) : (
            <Text variant="caption" color={colors.textSecondary}>
              {t('results.arrival')} <Text style={styles.arrival}>{formatTime(r.arrivalAt)}</Text>
            </Text>
          )}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 18, paddingBottom: 30, gap: 14 },
  trip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, backgroundColor: colors.mint100, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 12 },
  filters: { gap: 8 },
  state: { paddingVertical: 50 },
  dispatch: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.card, borderRadius: radius.xl, padding: 16, ...shadow.card },
  dispatchIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.mint200, alignItems: 'center', justifyContent: 'center' },
  card: { ...shadow.card },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingBottom: 8 },
  cardMid: { paddingHorizontal: 14, paddingBottom: 12, gap: 3 },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.emerald50, paddingHorizontal: 14, paddingVertical: 11 },
  inPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.card, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  arrival: { fontFamily: fonts.semibold, color: colors.text },
});
