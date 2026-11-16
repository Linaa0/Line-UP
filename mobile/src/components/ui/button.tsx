import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { colors, radius } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'accent' | 'danger';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  /** primary: dark green · secondary: white outline · accent: mint (on dark screens) · danger: red outline */
  variant?: Variant;
  iconLeft?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.forest900, fg: '#FFFFFF', border: colors.forest900 },
  secondary: { bg: colors.card, fg: colors.forest900, border: colors.border },
  accent: { bg: colors.mint, fg: colors.forest900, border: colors.mint },
  danger: { bg: colors.card, fg: colors.danger, border: '#F6D4D4' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  iconLeft,
  iconRight,
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const p = palette[variant];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: p.bg, borderColor: p.border },
        variant === 'primary' && styles.shadow,
        pressed && styles.pressed,
        inactive && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.content}>
          {iconLeft && <Icon name={iconLeft} size={18} color={p.fg} />}
          <Text variant="button" color={p.fg}>
            {label}
          </Text>
          {iconRight && <Icon name={iconRight} size={18} color={p.fg} />}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shadow: {
    shadowColor: colors.forest900,
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
