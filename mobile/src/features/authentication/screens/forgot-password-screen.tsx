import { router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { colors } from '@/constants/theme';
import { api, ApiError } from '@/lib/api';
import type { OtpIssued } from '@/lib/types';

import { AuthFrame, AuthTitle, PhoneField, setPendingDemoCode, toE164 } from '../components/auth-parts';

export default function ForgotPasswordScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const otp = await api<OtpIssued>('/auth/forgot-password', { method: 'POST', body: { phone: toE164(phone) } });
      setPendingDemoCode(otp.demoCode);
      router.push({ pathname: '/verify', params: { phone: otp.phone, purpose: 'reset' } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not send a code.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame>
      <AuthTitle title="Forgot Password" subtitle="We'll send a code to your phone so you can choose a new password." />
      <PhoneField value={phone} onChangeText={setPhone} />
      {error && (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      )}
      <Button label="Send Code" onPress={submit} loading={busy} disabled={phone.replace(/\D/g, '').length < 9} />
    </AuthFrame>
  );
}
