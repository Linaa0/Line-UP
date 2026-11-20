import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';

import { Button } from '@/components/ui/button';
import type { IconName } from '@/components/ui/icon';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { colors, radius } from '@/constants/theme';
import { useT } from '@/i18n';

export function LoadingState({ label, style }: { label?: string; style?: ViewStyle }) {
  const t = useT();
  return (
    <View style={[styles.center, style]}>
      <ActivityIndicator color={colors.emerald} size="large" />
      <Text variant="caption" color={colors.textSecondary}>
        {label ?? t('common.loading')}
      </Text>
    </View>
  );
}

export function ErrorState({ message, onRetry, style }: { message: string; onRetry?: () => void; style?: ViewStyle }) {
  const t = useT();
  return (
    <View style={[styles.center, style]}>
      <View style={[styles.halo, { backgroundColor: colors.danger50 }]}>
        <Icon name="wifi-off" size={26} color={colors.danger} />
      </View>
      <Text variant="title" align="center">
        {t('common.couldNotLoad')}
      </Text>
      <Text variant="body" color={colors.textSecondary} align="center">
        {message}
      </Text>
      {onRetry && <Button label={t('common.tryAgain')} variant="secondary" iconLeft="refresh-cw" onPress={onRetry} style={styles.retry} />}
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  action,
  style,
}: {
  icon: IconName;
  title: string;
  message: string;
  action?: { label: string; onPress: () => void };
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.center, style]}>
      <View style={styles.halo}>
        <View style={styles.core}>
          <Icon name={icon} size={30} color={colors.mint} />
        </View>
      </View>
      <Text variant="h2" align="center">
        {title}
      </Text>
      <Text variant="body" color={colors.textSecondary} align="center" style={styles.message}>
        {message}
      </Text>
      {action && <Button label={action.label} onPress={action.onPress} style={styles.retry} />}
    </View>
  );
}

/** Marks demo-only behaviour (payments, OTP, estimated positions) so nothing looks real when it isn't. */
export function DemoNotice({ title, message, style }: { title: string; message: string; style?: ViewStyle }) {
  return (
    <View style={[styles.notice, style]}>
      <Icon name="info" size={18} color={colors.warning} />
      <View style={styles.noticeText}>
        <Text variant="captionStrong" color="#92400E">
          {title}
        </Text>
        <Text variant="caption" color="#92400E">
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 28 },
  halo: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E2F6EC', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  core: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.forest900, alignItems: 'center', justifyContent: 'center' },
  message: { maxWidth: 300 },
  retry: { marginTop: 8, alignSelf: 'stretch' },
  notice: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.warning50,
    borderWidth: 1,
    borderColor: '#F6DFB4',
  },
  noticeText: { flex: 1, gap: 2 },
});
