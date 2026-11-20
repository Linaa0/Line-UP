import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { RouteBadge, shortName } from '@/components/shared/transit';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { colors, radius, shadow } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { useNow } from '@/hooks/use-now';
import { type MessageKey, useFormat, useT } from '@/i18n';
import type { RouteSummary, StopRef } from '@/lib/types';
import { formatTime } from '@/utils/format';

import { clearRecent, loadRecent, pushRecent, type RecentSearch, searchStore, setPickerTarget, useSearchSelection } from '../search-store';

const WHEN: { label: MessageKey; offset: number }[] = [
  { label: 'find.leaveNow', offset: 0 },
  { label: 'find.in30', offset: 30 },
  { label: 'find.in60', offset: 60 },
  { label: 'find.in120', offset: 120 },
];

/** Design 04-01. */
export default function FindRouteScreen() {
  const t = useT();
  const f = useFormat();
  const { from, to } = useSearchSelection();
  const [when, setWhen] = useState(0);
  const now = useNow();
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const saved = useApi<RouteSummary[]>('/users/me/saved-routes', { refreshOnFocus: true });

  useFocusEffect(
    useCallback(() => {
      void loadRecent().then(setRecent);
    }, []),
  );

  const pick = (field: 'from' | 'to') => {
    setPickerTarget((stop) => searchStore.set({ [field]: stop }));
    router.push({ pathname: '/routes/pick-stop', params: { title: field === 'from' ? t('find.leavingFrom') : t('find.goingTo') } });
  };

  const search = async (a: StopRef | null = from, b: StopRef | null = to) => {
    if (!a || !b) return;
    await pushRecent({ from: a, to: b });
    const at = new Date(Date.now() + WHEN[when].offset * 60_000).toISOString();
    router.push({ pathname: '/routes/results', params: { from: a.id, to: b.id, fromName: a.name, toName: b.name, at } });
  };

  return (
    <Screen scroll edges={['top']} header={<ScreenHeader title={t('find.title')} eyebrow="LINE-UP" />}>
      <Card style={styles.form}>
        <StopField label={t('find.from')} placeholder={t('find.chooseStop')} stop={from} dot={colors.forest900} onPress={() => pick('from')} />
        <Pressable onPress={() => searchStore.swap()} style={styles.swap} accessibilityLabel={t('find.swap')} hitSlop={6}>
          <Icon name="repeat" size={16} color={colors.forest900} />
        </Pressable>
        <StopField label={t('find.to')} placeholder={t('find.chooseStop')} stop={to} dot={colors.danger} icon="map-pin" onPress={() => pick('to')} />
        <View style={styles.when}>
          {WHEN.map((w, i) => (
            <Chip key={w.label} label={t(w.label)} selected={i === when} onPress={() => setWhen(i)} />
          ))}
        </View>
        {when > 0 && (
          <Text variant="caption" color={colors.textSecondary}>
            {t('find.showingFrom', { time: formatTime(new Date(now + WHEN[when].offset * 60_000)) })}
          </Text>
        )}
        <Button label={t('find.search')} iconLeft="search" onPress={() => search()} disabled={!from || !to || from.id === to.id} />
      </Card>

      {!!saved.data?.length && (
        <>
          <SectionLabel label={t('find.saved')} />
          <Card padding={0}>
            {saved.data.map((r, i) => (
              <Pressable
                key={r.id}
                onPress={() => router.push({ pathname: '/routes/[id]', params: { id: r.id } })}
                style={[styles.recentRow, i > 0 && styles.divider]}
              >
                <RouteBadge code={r.code} size="sm" />
                <View style={styles.flex}>
                  <Text variant="bodyStrong" numberOfLines={1}>
                    {shortName(r.origin.name)} → {shortName(r.terminus.name)}
                  </Text>
                  <Text variant="caption" color={colors.textSecondary}>
                    {f.kind(r.kind)} · {t('find.every', { count: r.frequencyMin })}
                  </Text>
                </View>
                <Icon name="chevron-right" size={18} color="#B6C2BC" />
              </Pressable>
            ))}
          </Card>
        </>
      )}

      <SectionLabel
        label={t('find.recent')}
        action={
          recent.length ? (
            <Pressable onPress={() => clearRecent().then(() => setRecent([]))} hitSlop={8}>
              <Text variant="captionStrong" color={colors.forest700}>
                {t('find.clear')}
              </Text>
            </Pressable>
          ) : undefined
        }
      />
      {recent.length ? (
        <Card padding={0}>
          {recent.map((r, i) => (
            <Pressable
              key={`${r.from.id}-${r.to.id}`}
              onPress={() => {
                searchStore.set({ from: r.from, to: r.to });
                void search(r.from, r.to);
              }}
              style={[styles.recentRow, i > 0 && styles.divider]}
            >
              <IconTile name="clock" round size={36} />
              <View style={styles.flex}>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {shortName(r.from.name)} → {shortName(r.to.name)}
                </Text>
              </View>
              <Icon name="chevron-right" size={18} color="#B6C2BC" />
            </Pressable>
          ))}
        </Card>
      ) : (
        <Text variant="caption" color={colors.textSecondary} style={styles.hint}>
          {t('find.recentEmpty')}
        </Text>
      )}
    </Screen>
  );
}

function StopField({
  label,
  placeholder,
  stop,
  dot,
  icon,
  onPress,
}: {
  label: string;
  placeholder: string;
  stop: StopRef | null;
  dot: string;
  icon?: 'map-pin';
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.field, pressed && { backgroundColor: '#F1F7F4' }]} accessibilityRole="button">
      {icon ? <Icon name={icon} size={16} color={dot} /> : <View style={[styles.fieldDot, { backgroundColor: dot }]} />}
      <View style={styles.flex}>
        <Text variant="label" color={colors.muted}>
          {label}
        </Text>
        <Text variant="bodyStrong" color={stop ? colors.text : colors.muted} numberOfLines={1}>
          {stop?.name ?? placeholder}
        </Text>
      </View>
      <Icon name="chevron-right" size={18} color="#B6C2BC" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  form: { gap: 10, ...shadow.card },
  field: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 11, backgroundColor: '#F9FCFA' },
  fieldDot: { width: 10, height: 10, borderRadius: 5 },
  swap: { position: 'absolute', right: 52, top: 56, zIndex: 2, width: 34, height: 34, borderRadius: 17, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  when: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.divider },
  hint: { marginHorizontal: 4 },
});
