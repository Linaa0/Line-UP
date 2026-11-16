import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { colors } from '@/constants/theme';

type SectionLabelProps = {
  label: string;
  /** Optional right-side action, e.g. "Clear" or "Mark all as read". */
  action?: ReactNode;
};

/** Uppercase grey section heading ("RECENT SEARCHES", "ROUTE STOPS"…). */
export function SectionLabel({ label, action }: SectionLabelProps) {
  return (
    <View style={styles.row}>
      <Text variant="label" color={colors.muted}>
        {label}
      </Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
    marginHorizontal: 4,
  },
});
