import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { colors } from '@/constants/theme';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Session } from '@/lib/types';

import { AuthFrame, AuthTitle, FooterLink, PhoneField, setPendingDemoCode, toE164 } from '../components/auth-parts';

/** Design 02-03. */
export default function LoginScreen() {
  const { signIn } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (phone.replace(/\D/g, '').length < 9 || !password) {
      setError('Enter your phone number and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const session = await api<Session>('/auth/login', { method: 'POST', body: { phone: toE164(phone), password } });
      await signIn(session);
      router.replace('/home');
    } catch (e) {
      if (e instanceof ApiError && e.code === 'PHONE_NOT_VERIFIED') {
        setPendingDemoCode(typeof e.data?.demoCode === 'string' ? e.data.demoCode : undefined);
        router.push({
          pathname: '/verify',
          params: { phone: String(e.data?.phone ?? toE164(phone)), purpose: 'register' },
        });
      } else {
        setError(e instanceof ApiError ? e.message : 'Could not log in.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame centerLogo footer={<FooterLink prompt="Don't have an account?" action="Sign up" onPress={() => router.replace('/register')} />}>
      <AuthTitle title="Welcome Back" subtitle="Log in to your account" />
      <PhoneField value={phone} onChangeText={setPhone} />
      <TextField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" password autoComplete="current-password" onSubmitEditing={submit} />
      <Pressable onPress={() => router.push('/forgot-password')} style={styles.forgot} accessibilityRole="link">
        <Text variant="captionStrong" color={colors.forest700}>
          Forgot password?
        </Text>
      </Pressable>
      {error && (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      )}
      <Button label="Log In" onPress={submit} loading={busy} />
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  forgot: { alignSelf: 'flex-end', marginTop: -4 },
});
