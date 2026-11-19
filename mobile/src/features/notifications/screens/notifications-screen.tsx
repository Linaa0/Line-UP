import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import type { IconName } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import type { AppNotification } from '@/lib/types';
import { formatDay, relativeTime } from '@/utils/format';

const FILTERS = [
  { label: 'All', types: null },
  { label: 'Trips', types: ['TRIP', 'QUEUE'] },
  { label: 'Payments', types: ['PAYMENT'] },
  { label: 'Alerts', types: ['ALERT', 'ACCOUNT'] },
] as const;

const ICON: Record<AppNotification['type'], { icon: IconName; tone: 'mint' | 'dark' | 'warning' }> = {
  TRIP: { icon: 'truck', tone: 'dark' },
  QUEUE: { icon: 'users', tone: 'mint' },
  PAYMENT: { icon: 'check', tone: 'mint' },
  ALERT: { icon: 'alert-triangle', tone: 'warning' },
  ACCOUNT: { icon: 'gift', tone: 'mint' },
};

/** Designs 11-01 and 11-02. */
export default function NotificationsScreen() {
  const { data, error, loading, refresh, refreshing, setData } = useApi<{ unread: number; items: AppNotification[] }>('/notifications');
  const [filter, setFilter] = useState(0);

  const groups = useMemo(() => {
    const types = FILTERS[filter].types as readonly string[] | null;
    const items = (data?.items ?? []).filter((n) => !types || types.includes(n.type));
    const map = new Map<string, AppNotification[]>();
    items.forEach((n) => {
      const day = formatDay(n.createdAt);
      map.set(day, [...(map.get(day) ?? []), n]);
    });
    return [...map.entries()];
  }, [data, filter]);

  const markAll = async () => {
    if (!data) return;
    setData({ unread: 0, items: data.items.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) });
    await api('/notifications/read-all', { method: 'POST' }).catch(() => undefined);
  };

  const header = <ScreenHeader title="Notifications" back />;
  if (loading) return <Screen header={header}><LoadingState /></Screen>;
  if (error || !data) return <Screen header={header}><ErrorState message={error ?? ''} onRetry={refresh} /></Screen>;

  return (
    <Screen header={header} padded={false}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} style={styles.chipBar}>
        {FILTERS.map((f, i) => (
          <Chip key={f.label} label={f.label} selected={i === filter} onPress={() => setFilter(i)} />
        ))}
      </ScrollView>
      {!groups.length ? (
        <EmptyState icon="bell" title="You're all caught up" message="Bus arrivals, queue updates and payment receipts will show up here as they happen." />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.emerald} />}>
          {groups.map(([day, items], gi) => (
            <View key={day}>
              <SectionLabel
                label={day}
                action={
                  gi === 0 && data.unread > 0 ? (
                    <Pressable onPress={markAll} hitSlop={8}>
                      <Text variant="captionStrong" color={colors.emerald}>
                        Mark all as read
                      </Text>
                    </Pressable>
                  ) : undefined
                }
              />
              <Card padding={0}>
                {items.map((n, i) => {
                  const look = ICON[n.type];
                  const unread = !n.readAt;
                  return (
                    <View key={n.id} style={[styles.item, i > 0 && styles.divider, unread && styles.unread]}>
                      <IconTile name={look.icon} tone={look.tone} round size={42} />
                      <View style={styles.flex}>
                        <View style={styles.titleRow}>
                          <Text variant="bodyStrong" style={styles.flex}>
                            {n.title}
                          </Text>
                          <Text variant="caption" color={colors.muted}>
                            {relativeTime(n.createdAt)}
                          </Text>
                        </View>
                        <Text variant="caption" color={colors.textSecondary}>
                          {n.body}
                        </Text>
                      </View>
                      {unread && <View style={styles.dot} />}
                    </View>
                  );
                })}
              </Card>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  chipBar: { flexGrow: 0 },
  chips: { gap: 8, paddingHorizontal: 18, paddingBottom: 6 },
  scroll: { paddingHorizontal: 18, paddingBottom: 30 },
  item: { flexDirection: 'row', gap: 12, padding: 14 },
  divider: { borderTopWidth: 1, borderTopColor: colors.divider },
  unread: { backgroundColor: '#F1FAF5' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.emerald, marginTop: 6 },
});
