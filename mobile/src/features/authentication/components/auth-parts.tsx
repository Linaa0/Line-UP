import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/shared/logo';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { colors, spacing } from '@/constants/theme';

/** Shared frame for the account screens: back button, logo, scrollable form, pinned footer. */
export function AuthFrame({
  children,
  footer,
  right,
  back = true,
  centerLogo = false,
}: {
  children: ReactNode;
  footer?: ReactNode;
  right?: ReactNode;
  back?: boolean;
  centerLogo?: boolean;
}) {
  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.top}>
          {back ? (
            <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/welcome'))} hitSlop={12} accessibilityLabel="Go back">
              <Icon name="chevron-left" size={26} />
            </Pressable>
          ) : (
            <View style={styles.side} />
          )}
          <View style={centerLogo ? styles.logoCenter : styles.logoLeft}>
            <Logo size={18} />
          </View>
          <View style={[styles.side, styles.right]}>{right}</View>
        </View>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        {footer && <View style={styles.footer}>{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function AuthTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.title}>
      <Text variant="h1">{title}</Text>
      <Text variant="body" color={colors.textSecondary}>
        {subtitle}
      </Text>
    </View>
  );
}

/** Small Rwanda flag (sky blue / yellow / green) for the +250 phone prefix. */
export function RwandaFlag() {
  return (
    <View style={styles.flag}>
      <View style={[styles.flagBand, { flex: 2, backgroundColor: '#20A0E3' }]}>
        <View style={styles.flagSun} />
      </View>
      <View style={[styles.flagBand, { backgroundColor: '#FAD201' }]} />
      <View style={[styles.flagBand, { backgroundColor: '#20603D' }]} />
    </View>
  );
}

export function PhoneField({
  value,
  onChangeText,
  error,
  label = 'Phone Number',
}: {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  label?: string;
}) {
  return (
    <TextField
      label={label}
      value={value}
      onChangeText={(t) => onChangeText(t.replace(/[^\d ]/g, '').slice(0, 13))}
      placeholder="e.g. 788 123 456"
      keyboardType="phone-pad"
      autoComplete="tel"
      textContentType="telephoneNumber"
      error={error}
      prefix={
        <View style={styles.prefix}>
          <RwandaFlag />
          <Text variant="bodyStrong">+250</Text>
        </View>
      }
    />
  );
}

/** "788 123 456" or "0788123456" → "+250788123456" (validated again by the API). */
export function toE164(local: string): string {
  const digits = local.replace(/\D/g, '');
  return `+250${digits.startsWith('0') ? digits.slice(1) : digits}`;
}

export function FooterLink({ prompt, action, onPress }: { prompt: string; action: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.footerLink} accessibilityRole="link">
      <Text variant="caption" color={colors.textSecondary}>
        {prompt}{' '}
      </Text>
      <Text variant="captionStrong" color={colors.forest700}>
        {action}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 8, gap: 12 },
  side: { minWidth: 26 },
  right: { flex: 1, alignItems: 'flex-end' },
  logoLeft: {},
  logoCenter: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  body: { paddingHorizontal: spacing.xxl, paddingTop: 14, paddingBottom: 24, gap: 16 },
  title: { gap: 6, marginBottom: 6 },
  footer: { borderTopWidth: 1, borderTopColor: colors.divider, paddingVertical: 14, paddingHorizontal: spacing.xxl },
  footerLink: { flexDirection: 'row', justifyContent: 'center' },
  prefix: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  flag: { width: 22, height: 15, borderRadius: 3, overflow: 'hidden' },
  flagBand: { flex: 1, alignItems: 'flex-end', paddingRight: 3, justifyContent: 'center' },
  flagSun: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FAD201' },
});

/**
 * Demo OTP handed from the screen that requested it to the Verify screen in
 * memory, so it never appears in the screen address (visible in the web preview).
 */
let pendingDemoCode = '';
export function setPendingDemoCode(code: string | undefined) {
  pendingDemoCode = code ?? '';
}
export function takePendingDemoCode(): string {
  const code = pendingDemoCode;
  pendingDemoCode = '';
  return code;
}
