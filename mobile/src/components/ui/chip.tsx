import { Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors, radius } from '@/constants/theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

/** Selectable filter chip (All / Direct / Fastest, notification filters, issue types). */
export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text style={styles.label} color={selected ? '#FFFFFF' : colors.textSecondary}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  selected: { backgroundColor: colors.forest900, borderColor: colors.forest900 },
  label: { fontSize: 13, fontWeight: '600' },
});
