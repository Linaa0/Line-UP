import { router } from 'expo-router';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { colors } from '@/constants/theme';
import { useT } from '@/i18n';
import { api, ApiError } from '@/lib/api';
import type { OtpIssued } from '@/lib/types';

import { AuthFrame, AuthTitle, PhoneField, setPendingDemoCode, toE164 } from '../components/auth-parts';

export default function ForgotPasswordScreen() {
  const t = useT();
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
      setError(e instanceof ApiError ? e.message : t('auth.couldNotSend'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame>
      <AuthTitle title={t('auth.forgotTitle')} subtitle={t('auth.forgotSubtitle')} />
      <PhoneField value={phone} onChangeText={setPhone} />
      {error && (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      )}
      <Button label={t('auth.sendCode')} onPress={submit} loading={busy} disabled={phone.replace(/\D/g, '').length < 9} />
    </AuthFrame>
  );
}
