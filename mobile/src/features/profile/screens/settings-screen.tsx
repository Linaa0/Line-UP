import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ListRow } from '@/components/ui/list-row';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { Toggle } from '@/components/ui/toggle';
import { colors, radius } from '@/constants/theme';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

type Prefs = User['preferences'];

const LANGUAGES: { id: Prefs['language']; label: string }[] = [
  { id: 'rw', label: 'Kinyarwanda' },
  { id: 'en', label: 'English' },
  { id: 'fr', label: 'Français' },
];

/** Design 12-03. Preferences are saved to the account straight away. */
export default function SettingsScreen() {
  const { user, setUser, signOut } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;
  const prefs = user.preferences;

  const update = async (patch: Partial<Prefs>) => {
    const previous = user;
    setUser({ ...user, preferences: { ...prefs, ...patch } });
    setError(null);
    try {
      setUser(await api<User>('/users/me/preferences', { method: 'PATCH', body: patch }));
    } catch (e) {
      setUser(previous);
      setError(e instanceof ApiError ? e.message : 'Could not save that setting.');
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api('/users/me', { method: 'DELETE' });
      await signOut();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not delete your account.');
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const toggle = (key: keyof Omit<Prefs, 'language'>, label: string) => (
    <Toggle value={prefs[key]} onValueChange={(v) => update({ [key]: v })} accessibilityLabel={label} />
  );

  return (
    <Screen scroll header={<ScreenHeader title="Settings" back />}>
      {error && (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      )}
      <SectionLabel label="Notifications" />
      <Card padding={0}>
        <ListRow divider={false} icon="truck" title="Bus arrival alerts" subtitle="When your bus is 5 min away" right={toggle('notifyArrivals', 'Bus arrival alerts')} />
        <ListRow icon="users" title="Queue updates" subtitle="Your position and boarding call" right={toggle('notifyQueue', 'Queue updates')} />
        <ListRow icon="file-text" title="Payment receipts" right={toggle('notifyReceipts', 'Payment receipts')} />
        <ListRow icon="gift" title="Offers & news" right={toggle('notifyOffers', 'Offers and news')} />
      </Card>

      <SectionLabel label="Language" />
      <Card style={styles.langCard}>
        <View style={styles.segmented}>
          {LANGUAGES.map((l) => {
            const on = prefs.language === l.id;
            return (
              <Pressable key={l.id} onPress={() => update({ language: l.id })} style={[styles.segment, on && styles.segmentOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                <Text variant="captionStrong" color={on ? colors.forest900 : colors.textSecondary}>
                  {l.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text variant="caption" color={colors.muted}>
          Your choice is saved. Kinyarwanda and French screens are being translated.
        </Text>
      </Card>

      <SectionLabel label="Privacy & data" />
      <Card padding={0}>
        <ListRow divider={false} icon="trash-2" title="Delete account" destructive onPress={() => setConfirmDelete(true)} />
      </Card>
      <Text variant="caption" color={colors.muted} align="center" style={styles.version}>
        LINE-UP v1.0.0
      </Text>

      <BottomSheet visible={confirmDelete} onClose={() => !deleting && setConfirmDelete(false)}>
        <Text variant="title" align="center">
          Delete your account?
        </Text>
        <Text variant="body" color={colors.textSecondary} align="center">
          This permanently deletes your account, tickets and trip history. It can&apos;t be undone.
        </Text>
        <Button label="Delete Permanently" variant="danger" iconLeft="trash-2" onPress={deleteAccount} loading={deleting} />
        <Button label="Keep My Account" variant="secondary" onPress={() => setConfirmDelete(false)} disabled={deleting} />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  langCard: { gap: 10 },
  segmented: { flexDirection: 'row', backgroundColor: '#E9F1EC', borderRadius: radius.md, padding: 4 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 9 },
  segmentOn: { backgroundColor: colors.card },
  version: { marginTop: 16 },
});
