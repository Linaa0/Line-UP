import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius } from '@/constants/theme';

type CardProps = ViewProps & {
  /** Inner padding. Use 0 for cards that hold full-width list rows. */
  padding?: number;
};

/** White rounded surface with a soft green border, used across all screens. */
export function Card({ padding = 16, style, ...rest }: CardProps) {
  return <View style={[styles.card, { padding }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
});
