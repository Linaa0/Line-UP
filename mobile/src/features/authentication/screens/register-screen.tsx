import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { colors } from '@/constants/theme';
import { useI18n } from '@/i18n';
import { api, ApiError } from '@/lib/api';
import type { OtpIssued } from '@/lib/types';

import { AuthFrame, AuthTitle, FooterLink, PhoneField, setPendingDemoCode, toE164 } from '../components/auth-parts';

/** Design 02-01. */
export default function RegisterScreen() {
  const { t, lang } = useI18n();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const next: typeof errors = {};
    if (fullName.trim().length < 2) next.fullName = t('auth.errName');
    if (phone.replace(/\D/g, '').length < 9) next.phone = t('auth.errPhone');
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) next.password = t('auth.errPassword');
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const otp = await api<OtpIssued>('/auth/register', {
        method: 'POST',
        // The language chosen so far becomes the account's language.
        body: { fullName: fullName.trim(), phone: toE164(phone), password, language: lang },
      });
      setPendingDemoCode(otp.demoCode);
      router.push({ pathname: '/verify', params: { phone: otp.phone, purpose: 'register' } });
    } catch (e) {
      setErrors({ form: e instanceof ApiError ? e.message : t('auth.couldNotCreate') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame footer={<FooterLink prompt={t('auth.haveAccount')} action={t('auth.logIn')} onPress={() => router.replace('/login')} />}>
      <AuthTitle title={t('auth.createTitle')} subtitle={t('auth.createSubtitle')} />
      <TextField
        label={t('auth.fullName')}
        value={fullName}
        onChangeText={setFullName}
        placeholder={t('auth.fullNamePlaceholder')}
        autoCapitalize="words"
        autoComplete="name"
        error={errors.fullName}
      />
      <PhoneField value={phone} onChangeText={setPhone} error={errors.phone} />
      <TextField
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.passwordPlaceholder')}
        password
        autoComplete="new-password"
        error={errors.password}
      />
      {errors.form && (
        <Text variant="caption" color={colors.danger}>
          {errors.form}
        </Text>
      )}
      <Button label={t('auth.continue')} onPress={submit} loading={busy} style={styles.cta} />
      <View>
        <Text variant="caption" color={colors.muted} align="center">
          {t('auth.terms')}
        </Text>
      </View>
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  cta: { marginTop: 6 },
});
