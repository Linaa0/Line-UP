import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { colors, radius } from '@/constants/theme';

type Tone = 'mint' | 'dark' | 'warning' | 'danger';

type IconTileProps = {
  name: IconName;
  tone?: Tone;
  size?: number;
  round?: boolean;
};

const tones: Record<Tone, { bg: string; fg: string }> = {
  mint: { bg: colors.emerald50, fg: colors.forest700 },
  dark: { bg: colors.forest900, fg: '#FFFFFF' },
  warning: { bg: colors.warning50, fg: colors.warning },
  danger: { bg: colors.danger50, fg: colors.danger },
};

/** Icon on a soft rounded square, as on "Why LINE-UP?" cards and list rows. */
export function IconTile({ name, tone = 'mint', size = 38, round = false }: IconTileProps) {
  const t = tones[tone];
  return (
    <View
      style={[
        styles.tile,
        { width: size, height: size, backgroundColor: t.bg },
        { borderRadius: round ? size / 2 : radius.md },
      ]}
    >
      <Icon name={name} size={Math.round(size / 2)} color={t.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center' },
});
