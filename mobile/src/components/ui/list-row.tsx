import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { Text } from '@/components/ui/text';
import { colors } from '@/constants/theme';

type ListRowProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  /** Red title and icon, for "Log out" / "Delete account". */
  destructive?: boolean;
  /** Custom right-side content (e.g. a Switch). Defaults to a chevron when onPress is set. */
  right?: ReactNode;
  onPress?: () => void;
  /** Draws a divider above the row; set false for the first row in a card. */
  divider?: boolean;
};

/** Settings-style row used on Profile, Settings and Help Center. Place inside <Card padding={0}>. */
export function ListRow({
  title,
  subtitle,
  icon,
  destructive = false,
  right,
  onPress,
  divider = true,
}: ListRowProps) {
  const trailing =
    right ?? (onPress && !destructive ? <Icon name="chevron-right" size={18} color="#B6C2BC" /> : null);

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, divider && styles.divider, pressed && styles.pressed]}
    >
      {icon && <IconTile name={icon} tone={destructive ? 'danger' : 'mint'} />}
      <View style={styles.text}>
        <Text variant="bodyStrong" color={destructive ? colors.danger : colors.text}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="caption" color={colors.textSecondary}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: '#EEF3F0' },
  pressed: { backgroundColor: '#F7FBF9' },
  text: { flex: 1, gap: 2 },
});
