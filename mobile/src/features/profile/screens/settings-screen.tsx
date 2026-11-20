import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { LanguageList } from '@/components/shared/language-picker';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ListRow } from '@/components/ui/list-row';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { Toggle } from '@/components/ui/toggle';
import { colors } from '@/constants/theme';
import { useT } from '@/i18n';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

type Prefs = User['preferences'];

/** Design 12-03. Preferences are saved to the account straight away. */
export default function SettingsScreen() {
  const t = useT();
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
      setError(e instanceof ApiError ? e.message : t('settings.couldNotSave'));
    }
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      await api('/users/me', { method: 'DELETE' });
      await signOut();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('settings.couldNotDelete'));
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const toggle = (key: keyof Omit<Prefs, 'language'>, label: string) => (
    <Toggle value={prefs[key]} onValueChange={(v) => update({ [key]: v })} accessibilityLabel={label} />
  );

  return (
    <Screen scroll header={<ScreenHeader title={t('settings.title')} back />}>
      {error && (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      )}
      <SectionLabel label={t('language.label')} />
      <LanguageList />

      <SectionLabel label={t('settings.notifications')} />
      <Card padding={0}>
        <ListRow divider={false} icon="truck" title={t('settings.arrivals')} subtitle={t('settings.arrivalsSub')} right={toggle('notifyArrivals', t('settings.arrivals'))} />
        <ListRow icon="users" title={t('settings.queueUpdates')} subtitle={t('settings.queueSub')} right={toggle('notifyQueue', t('settings.queueUpdates'))} />
        <ListRow icon="file-text" title={t('settings.receipts')} right={toggle('notifyReceipts', t('settings.receipts'))} />
        <ListRow icon="gift" title={t('settings.offers')} right={toggle('notifyOffers', t('settings.offers'))} />
      </Card>

      <SectionLabel label={t('settings.privacy')} />
      <Card padding={0}>
        <ListRow divider={false} icon="trash-2" title={t('settings.deleteAccount')} destructive onPress={() => setConfirmDelete(true)} />
      </Card>
      <Text variant="caption" color={colors.muted} align="center" style={styles.version}>
        LINE-UP v1.0.0
      </Text>

      <BottomSheet visible={confirmDelete} onClose={() => !deleting && setConfirmDelete(false)}>
        <Text variant="title" align="center">
          {t('settings.deleteTitle')}
        </Text>
        <Text variant="body" color={colors.textSecondary} align="center">
          {t('settings.deleteBody')}
        </Text>
        <Button label={t('settings.deleteConfirm')} variant="danger" iconLeft="trash-2" onPress={deleteAccount} loading={deleting} />
        <Button label={t('settings.keep')} variant="secondary" onPress={() => setConfirmDelete(false)} disabled={deleting} />
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  version: { marginTop: 16 },
});
