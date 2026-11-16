import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { Card } from '@/components/ui/card';
import { IconTile } from '@/components/ui/icon-tile';
import type { IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { colors } from '@/constants/theme';

type ScreenPendingProps = {
  title: string;
  icon: IconName;
  /** File name of the design reference this screen will be built from. */
  design: string;
};

/**
 * Stand-in for a tab whose screen has not been implemented yet.
 * Delete it once every tab renders its real feature screen.
 */
export function ScreenPending({ title, icon, design }: ScreenPendingProps) {
  return (
    <Screen header={<ScreenHeader title={title} />} edges={['top']}>
      <Card style={styles.card}>
        <IconTile name={icon} size={56} round />
        <Text variant="title" align="center">
          {title} screen comes next
        </Text>
        <Text variant="caption" color={colors.textSecondary} align="center">
          Design reference: {design}
        </Text>
      </Card>
      {__DEV__ && (
        <View style={styles.devLink}>
          <Link href="/dev/ui-kit">
            <Text variant="bodyStrong" color={colors.emerald}>
              Open UI kit (dev only)
            </Text>
          </Link>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: 10, paddingVertical: 28, marginTop: 8 },
  devLink: { alignItems: 'center', marginTop: 20 },
});
