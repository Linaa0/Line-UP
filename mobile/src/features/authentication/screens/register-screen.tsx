import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { colors } from '@/constants/theme';
import { api, ApiError } from '@/lib/api';
import type { OtpIssued } from '@/lib/types';

import { AuthFrame, AuthTitle, FooterLink, PhoneField, setPendingDemoCode, toE164 } from '../components/auth-parts';

/** Design 02-01. */
export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const next: typeof errors = {};
    if (fullName.trim().length < 2) next.fullName = 'Enter your full name';
    if (phone.replace(/\D/g, '').length < 9) next.phone = 'Enter your mobile number';
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      next.password = 'Use at least 8 characters with a letter and a number';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const otp = await api<OtpIssued>('/auth/register', {
        method: 'POST',
        body: { fullName: fullName.trim(), phone: toE164(phone), password },
      });
      setPendingDemoCode(otp.demoCode);
      router.push({ pathname: '/verify', params: { phone: otp.phone, purpose: 'register' } });
    } catch (e) {
      setErrors({ form: e instanceof ApiError ? e.message : 'Could not create your account.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthFrame footer={<FooterLink prompt="Already have an account?" action="Log In" onPress={() => router.replace('/login')} />}>
      <AuthTitle title="Create Account" subtitle="Use your phone number to get started." />
      <TextField
        label="Full Name"
        value={fullName}
        onChangeText={setFullName}
        placeholder="e.g. Keza Aline"
        autoCapitalize="words"
        autoComplete="name"
        error={errors.fullName}
      />
      <PhoneField value={phone} onChangeText={setPhone} error={errors.phone} />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Create a strong password"
        password
        autoComplete="new-password"
        error={errors.password}
      />
      {errors.form && (
        <Text variant="caption" color={colors.danger}>
          {errors.form}
        </Text>
      )}
      <Button label="Continue" onPress={submit} loading={busy} style={styles.cta} />
      <View>
        <Text variant="caption" color={colors.muted} align="center">
          By continuing, you agree to our Terms and Privacy Policy.
        </Text>
      </View>
    </AuthFrame>
  );
}

const styles = StyleSheet.create({
  cta: { marginTop: 6 },
});
