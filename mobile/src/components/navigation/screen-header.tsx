import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { colors, spacing } from '@/constants/theme';

type HeaderAction = { icon: IconName; label: string; onPress: () => void };

type ScreenHeaderProps = {
  title: string;
  /** Small green line above the title, e.g. "LINE-UP". */
  eyebrow?: string;
  /** Shows the round back button. Defaults to going back in the stack. */
  back?: boolean | (() => void);
  right?: HeaderAction | ReactNode;
};

export function HeaderIconButton({ icon, label, onPress }: HeaderAction) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      <Icon name={icon} size={20} />
    </Pressable>
  );
}

function isAction(value: unknown): value is HeaderAction {
  return typeof value === 'object' && value !== null && 'icon' in value && 'onPress' in value;
}

/** Centered title with round icon buttons on either side, as in most designs. */
export function ScreenHeader({ title, eyebrow, back = false, right }: ScreenHeaderProps) {
  const onBack = typeof back === 'function' ? back : () => router.back();

  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {back && <HeaderIconButton icon="chevron-left" label="Go back" onPress={onBack} />}
      </View>
      <View style={styles.titleBlock}>
        <Text variant="title" align="center" accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        {eyebrow && (
          <Text variant="label" color={colors.emerald} align="center">
            {eyebrow}
          </Text>
        )}
      </View>
      <View style={[styles.side, styles.sideRight]}>
        {isAction(right) ? <HeaderIconButton {...right} /> : right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
  },
  side: { width: 44 },
  sideRight: { alignItems: 'flex-end' },
  titleBlock: { flex: 1 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
});
