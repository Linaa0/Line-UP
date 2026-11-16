import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/constants/theme';

type ScreenProps = {
  children: ReactNode;
  /** Fixed content above the body (usually <ScreenHeader>). */
  header?: ReactNode;
  /** Fixed content pinned to the bottom (primary action buttons). */
  footer?: ReactNode;
  scroll?: boolean;
  /** Horizontal padding for the body. Defaults to the 18dp screen gutter. */
  padded?: boolean;
  backgroundColor?: string;
  /** Tab screens skip the bottom edge — the tab bar already handles it. */
  edges?: Edge[];
  contentStyle?: ViewStyle;
};

/** Safe-area screen container with optional header, scrolling body and pinned footer. */
export function Screen({
  children,
  header,
  footer,
  scroll = false,
  padded = true,
  backgroundColor = colors.background,
  edges = ['top', 'bottom'],
  contentStyle,
}: ScreenProps) {
  const bodyStyle = [padded && styles.padded, contentStyle];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor }]} edges={edges}>
      {header}
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, ...bodyStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, ...bodyStyle]}>{children}</View>
      )}
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  padded: { paddingHorizontal: spacing.screen },
  scrollContent: { paddingBottom: spacing.xxl },
  footer: { paddingHorizontal: spacing.screen, paddingTop: spacing.md, paddingBottom: spacing.sm, gap: 10 },
});
