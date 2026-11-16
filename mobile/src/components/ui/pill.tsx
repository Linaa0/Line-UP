import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors, radius } from '@/constants/theme';

type Tone = 'mint' | 'outline' | 'dark' | 'warning' | 'danger';

type PillProps = {
  label: string;
  tone?: Tone;
  /** Shows the green "live" dot before the label. */
  dot?: boolean;
};

const tones: Record<Tone, { bg: string; fg: string; border: string }> = {
  mint: { bg: colors.mint100, fg: colors.forest900, border: colors.mint100 },
  outline: { bg: colors.card, fg: colors.textSecondary, border: colors.border },
  dark: { bg: colors.forest900, fg: '#FFFFFF', border: colors.forest900 },
  warning: { bg: colors.warning50, fg: colors.warning, border: colors.warning50 },
  danger: { bg: colors.danger50, fg: colors.danger, border: colors.danger50 },
};

/** Small status badge: "Best", "On Time", "Live", "Paid", "Bay 3"… */
export function Pill({ label, tone = 'mint', dot = false }: PillProps) {
  const t = tones[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg, borderColor: t.border }]}>
      {dot && <View style={styles.dot} />}
      <Text style={styles.label} color={t.fg}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.emerald },
  label: { fontSize: 11.5, fontWeight: '600' },
});
