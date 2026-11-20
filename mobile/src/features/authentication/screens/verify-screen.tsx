import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DemoNotice } from '@/components/shared/states';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { colors, spacing } from '@/constants/theme';
import { useT } from '@/i18n';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { OtpIssued, Session } from '@/lib/types';
import { formatPhone } from '@/utils/format';

import { takePendingDemoCode } from '../components/auth-parts';
import { NumberPad, OtpBoxes } from '../components/otp-input';

/** Design 02-02. Also used for the password reset code (purpose=reset). */
export default function VerifyScreen() {
  const t = useT();
  const params = useLocalSearchParams<{ phone: string; purpose?: 'register' | 'reset' }>();
  const purpose = params.purpose === 'reset' ? 'reset' : 'register';
  const { signIn } = useAuth();
  const [code, setCode] = useState('');
  const [demoCode, setDemoCode] = useState(takePendingDemoCode);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(45);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const submit = async (value = code) => {
    if (value.length !== 6) return;
    if (purpose === 'reset') {
      router.replace({ pathname: '/reset-password', params: { phone: params.phone, code: value } });
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const session = await api<Session>('/auth/verify', { method: 'POST', body: { phone: params.phone, code: value } });
      await signIn(session);
      router.replace('/home');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('auth.couldNotVerify'));
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const onKey = (d: string) => {
    if (code.length >= 6) return;
    const next = code + d;
    setCode(next);
    setError(null);
    if (next.length === 6) void submit(next);
  };

  const resend = async () => {
    try {
      const otp = await api<OtpIssued>(purpose === 'reset' ? '/auth/forgot-password' : '/auth/resend-code', {
        method: 'POST',
        body: { phone: params.phone },
      });
      setDemoCode(otp.demoCode ?? '');
      setWait(otp.resendAfterSeconds);
      setCode('');
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : t('auth.couldNotSend'));
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.top}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t('common.back')}>
          <Icon name="chevron-left" size={26} />
        </Pressable>
        {purpose === 'register' && (
          <Text variant="label" color={colors.muted}>
            {t('auth.step')}
          </Text>
        )}
      </View>
      <View style={styles.body}>
        <Text variant="h1">{purpose === 'reset' ? t('auth.resetTitle') : t('auth.verifyTitle')}</Text>
        <Text variant="body" color={colors.textSecondary}>
          {t('auth.codeSentTo')} <Text variant="bodyStrong">{formatPhone(params.phone ?? '')}</Text>
        </Text>
        <View style={styles.boxes}>
          <OtpBoxes value={code} error={!!error} />
        </View>
        {error ? (
          <Text variant="caption" color={colors.danger} align="center">
            {error}
          </Text>
        ) : (
          <View style={styles.resendRow}>
            <Text variant="caption" color={colors.textSecondary}>
              {t('auth.noCode')}{' '}
            </Text>
            <Pressable onPress={resend} disabled={wait > 0} accessibilityRole="button">
              <Text variant="captionStrong" color={wait > 0 ? colors.muted : colors.emerald}>
                {wait > 0 ? t('auth.resendIn', { s: wait }) : t('auth.resend')}
              </Text>
            </Pressable>
          </View>
        )}
        <Button
          label={purpose === 'reset' ? t('auth.continue') : t('auth.verify')}
          onPress={() => submit()}
          loading={busy}
          disabled={code.length !== 6}
        />
        {!!demoCode && <DemoNotice title={t('demo.codeTitle', { code: demoCode })} message={t('demo.codeBody')} />}
      </View>
      <View style={styles.padWrap}>
        <NumberPad onKey={onKey} onDelete={() => setCode((c) => c.slice(0, -1))} deleteLabel={t('auth.delete')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  body: { flex: 1, paddingHorizontal: spacing.xxl, gap: 14 },
  boxes: { marginVertical: 10 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  padWrap: { paddingBottom: 18, backgroundColor: '#ECF2EF' },
});
