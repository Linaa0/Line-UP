import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { colors } from '@/constants/theme';
import { useT } from '@/i18n';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Session } from '@/lib/types';

import { AuthFrame, AuthTitle } from '../components/auth-parts';

export default function ResetPasswordScreen() {
  const t = useT();
  const { phone, code } = useLocalSearchParams<{ phone: string; code: string }>();
  const { signIn } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (password !== confirm) {
      setError(t('auth.mismatch'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const session = await api<Session>('/auth/reset-password', { method: 'POST', body: { phone, code, password } });
      await signIn(session);
      router.replace('/home');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('auth.couldNotReset'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame>
      <AuthTitle title={t('auth.newPasswordTitle')} subtitle={t('auth.newPasswordSubtitle')} />
      <TextField label={t('auth.newPassword')} value={password} onChangeText={setPassword} password autoComplete="new-password" placeholder={t('auth.newPassword')} />
      <TextField label={t('auth.confirmPassword')} value={confirm} onChangeText={setConfirm} password autoComplete="new-password" placeholder={t('auth.typeAgain')} />
      {error && (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      )}
      <Button label={t('auth.saveAndLogin')} onPress={submit} loading={busy} disabled={!password || !confirm} />
    </AuthFrame>
  );
}
