// Temporary entry screen for the foundation phase. It is replaced by the
// onboarding flow (design/figma-references/individual-screens/01-onboarding)
// when screen implementation starts.
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>LINE-UP</Text>
      <Text style={styles.subtitle}>Mobile foundation is running.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.forest600,
  },
  title: { ...typography.h1, color: '#FFFFFF', letterSpacing: 1 },
  subtitle: { ...typography.body, color: colors.mint },
});
