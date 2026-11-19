import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { ErrorState, LoadingState } from '@/components/shared/states';
import { Icon } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { colors } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import type { Stop } from '@/lib/types';

import { choosePickedStop } from '../search-store';

/** Stop search, opened from Find a Route and Edit Profile. */
export default function PickStopScreen() {
  const { title } = useLocalSearchParams<{ title?: string }>();
  const { data, error, loading, refresh } = useApi<Stop[]>('/stops');
  const [query, setQuery] = useState('');

  const stops = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((s) => !q || s.name.toLowerCase().includes(q) || s.area.toLowerCase().includes(q));
  }, [data, query]);

  return (
    <Screen header={<ScreenHeader title={title ?? 'Choose a stop'} back />}>
      <TextField iconLeft="search" placeholder="Search stops or areas" value={query} onChangeText={setQuery} autoFocus autoCorrect={false} />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <FlatList
          data={stops}
          keyExtractor={(s) => s.id}
          style={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <Text variant="body" color={colors.textSecondary} align="center" style={styles.empty}>
              No stops match “{query}”.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                choosePickedStop({ id: item.id, name: item.name });
                router.back();
              }}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <IconTile name="map-pin" size={36} round />
              <View style={styles.flex}>
                <Text variant="bodyStrong">{item.name}</Text>
                <Text variant="caption" color={colors.textSecondary}>
                  {item.area} · {item.routeCount} route{item.routeCount === 1 ? '' : 's'}
                </Text>
              </View>
              <Icon name="chevron-right" size={18} color="#B6C2BC" />
            </Pressable>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { marginTop: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.divider },
  pressed: { opacity: 0.7 },
  empty: { marginTop: 30 },
});
