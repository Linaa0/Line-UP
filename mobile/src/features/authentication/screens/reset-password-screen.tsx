import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { colors } from '@/constants/theme';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Session } from '@/lib/types';

import { AuthFrame, AuthTitle } from '../components/auth-parts';

export default function ResetPasswordScreen() {
  const { phone, code } = useLocalSearchParams<{ phone: string; code: string }>();
  const { signIn } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const session = await api<Session>('/auth/reset-password', { method: 'POST', body: { phone, code, password } });
      await signIn(session);
      router.replace('/home');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not reset your password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame>
      <AuthTitle title="New Password" subtitle="Choose a password with at least 8 characters, including a letter and a number." />
      <TextField label="New password" value={password} onChangeText={setPassword} password autoComplete="new-password" placeholder="New password" />
      <TextField label="Confirm password" value={confirm} onChangeText={setConfirm} password autoComplete="new-password" placeholder="Type it again" />
      {error && (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      )}
      <Button label="Save and Log In" onPress={submit} loading={busy} disabled={!password || !confirm} />
    </AuthFrame>
  );
}
