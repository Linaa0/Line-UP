import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { DemoNotice, ErrorState, LoadingState } from '@/components/shared/states';
import { RouteBadge, shortName } from '@/components/shared/transit';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { PhoneField, toE164 } from '@/features/authentication/components/auth-parts';
import { useApi } from '@/hooks/use-api';
import { useT } from '@/i18n';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Ticket } from '@/lib/types';
import { formatPhone, formatRwf } from '@/utils/format';

type Method = 'MTN_MOMO' | 'AIRTEL_MONEY';

/** Brand names stay the same in every language. */
const METHODS: { id: Method; name: string; tag: string; color: string; fg: string }[] = [
  { id: 'MTN_MOMO', name: 'MTN Mobile Money', tag: 'MoMo', color: colors.momo, fg: '#1F2937' },
  { id: 'AIRTEL_MONEY', name: 'Airtel Money', tag: 'airtel', color: colors.airtel, fg: '#FFFFFF' },
];

/**
 * Design 07-01. No payment provider is connected yet, so the payment is a
 * DEMO: the confirmation sheet says so, and no PIN is ever collected
 * (real MoMo payments are approved on the payer's phone, not in this app).
 */
export default function PaymentScreen() {
  const t = useT();
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const { user } = useAuth();
  const { data: ticket, error, loading, refresh } = useApi<Ticket>(`/tickets/${ticketId}`);
  const [method, setMethod] = useState<Method>('MTN_MOMO');
  const [phone, setPhone] = useState((user?.phone ?? '').replace(/^\+250/, ''));
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const header = <ScreenHeader title={t('pay.title')} back />;
  if (loading) return <Screen header={header}><LoadingState /></Screen>;
  if (error || !ticket) return <Screen header={header}><ErrorState message={error ?? ''} onRetry={refresh} /></Screen>;

  const pay = async () => {
    setBusy(true);
    setPayError(null);
    try {
      await api('/payments', { method: 'POST', body: { ticketId, method, phone: toE164(phone) } });
      setSheet(false);
      router.dismissTo('/home');
      router.push({ pathname: '/checkout/success', params: { ticketId } });
    } catch (e) {
      setPayError(e instanceof ApiError ? e.message : t('pay.failed'));
    } finally {
      setBusy(false);
    }
  };

  const chosen = METHODS.find((m) => m.id === method)!;
  const amount = formatRwf(ticket.fare);

  return (
    <Screen
      scroll
      header={header}
      footer={<Button label={t('pay.pay', { amount })} iconRight="lock" onPress={() => setSheet(true)} disabled={phone.replace(/\D/g, '').length < 9} />}
    >
      <Card style={styles.summary}>
        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <RouteBadge code={ticket.route.code} size="sm" />
            <Text variant="captionStrong" numberOfLines={1} style={styles.flex}>
              {shortName(ticket.from.name)} → {shortName(ticket.to.name)}
            </Text>
          </View>
          <Pill label={t('pay.standard')} tone="outline" />
        </View>
        <View style={styles.divider} />
        <View style={styles.rowBetween}>
          <Text variant="caption" color={colors.textSecondary}>
            {t('pay.totalFare')}
          </Text>
          <Text style={styles.amount}>
            <Text variant="captionStrong" color={colors.forest900}>
              RWF{' '}
            </Text>
            {ticket.fare}
          </Text>
        </View>
      </Card>

      <SectionLabel label={t('pay.selectMethod')} />
      <View style={styles.methods}>
        {METHODS.map((m) => {
          const on = m.id === method;
          return (
            <Pressable key={m.id} onPress={() => setMethod(m.id)} style={[styles.method, on && styles.methodOn]} accessibilityRole="radio" accessibilityState={{ checked: on }}>
              <View style={[styles.logo, { backgroundColor: m.color }]}>
                <Text style={[styles.logoText, { color: m.fg }]}>{m.tag}</Text>
              </View>
              <View style={styles.flex}>
                <Text variant="bodyStrong">{m.name}</Text>
                <Text variant="caption" color={colors.textSecondary}>
                  {on ? formatPhone(toE164(phone)) : t('pay.rwandaAccount')}
                </Text>
              </View>
              <View style={[styles.radio, on && styles.radioOn]}>{on && <View style={styles.radioDot} />}</View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.phone}>
        <PhoneField label={t('pay.numberLabel', { method: chosen.name })} value={phone} onChangeText={setPhone} />
      </View>

      <BottomSheet visible={sheet} onClose={() => !busy && setSheet(false)}>
        <Text variant="title" align="center">
          {t('pay.confirmTitle')}
        </Text>
        <Text variant="body" color={colors.textSecondary} align="center">
          {t('pay.confirmBody', { amount, phone: formatPhone(toE164(phone)), method: chosen.name })}
        </Text>
        <DemoNotice title={t('demo.paymentTitle')} message={t('demo.paymentBody')} />
        {payError && (
          <Text variant="caption" color={colors.danger} align="center">
            {payError}
          </Text>
        )}
        <Button label={t('pay.confirm')} iconRight="check" onPress={pay} loading={busy} />
        <Pressable onPress={() => setSheet(false)} disabled={busy} style={styles.cancel}>
          <Text variant="captionStrong" color={colors.muted}>
            {t('common.cancel')}
          </Text>
        </Pressable>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  summary: { gap: 12, ...shadow.card },
  divider: { height: 1, backgroundColor: colors.divider },
  amount: { fontFamily: fonts.display, fontSize: 24, color: colors.forest900 },
  methods: { gap: 10 },
  method: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.xl, backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.border },
  methodOn: { borderColor: colors.forest700, ...shadow.card },
  logo: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: fonts.display, fontSize: 13 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#C9D3CE', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.forest700 },
  radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.forest700 },
  phone: { marginTop: 16 },
  cancel: { alignItems: 'center', paddingVertical: 4 },
});
