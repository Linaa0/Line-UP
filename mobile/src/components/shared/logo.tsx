import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { colors, fonts } from '@/constants/theme';

/** The LINE-UP bus mark (front of a bus), as on the splash and welcome screens. */
export function BusMark({ size = 24, color = '#FFFFFF', cutout = colors.forest600 }: { size?: number; color?: string; cutout?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x={20} y={8} width={60} height={72} rx={17} fill={color} />
      <Rect x={30} y={14} width={40} height={5} rx={2.5} fill={cutout} />
      <Rect x={28} y={25} width={44} height={23} rx={4} fill={cutout} />
      <Circle cx={36.5} cy={62} r={6.5} fill={cutout} />
      <Circle cx={63.5} cy={62} r={6.5} fill={cutout} />
      <Rect x={25} y={74} width={13} height={16} rx={4} fill={color} />
      <Rect x={62} y={74} width={13} height={16} rx={4} fill={color} />
    </Svg>
  );
}

type LogoProps = {
  /** "light" for dark backgrounds (white + mint), "dark" for light backgrounds. */
  tone?: 'light' | 'dark';
  size?: number;
  /** Show the mark in a rounded tile, as in screen headers. */
  tile?: boolean;
};

export function Logo({ tone = 'dark', size = 20, tile = true }: LogoProps) {
  const main = tone === 'light' ? '#FFFFFF' : colors.forest900;
  const accent = tone === 'light' ? colors.mint : colors.emerald;
  return (
    <View style={styles.row} accessibilityRole="image" accessibilityLabel="LINE-UP">
      {tile ? (
        <View style={[styles.tile, { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.42, backgroundColor: tone === 'light' ? 'rgba(255,255,255,0.14)' : colors.forest900 }]}>
          <BusMark size={size} cutout={tone === 'light' ? colors.forest600 : colors.forest900} />
        </View>
      ) : (
        <BusMark size={size * 1.4} color={main} cutout={tone === 'light' ? colors.forest600 : colors.background} />
      )}
      <Text style={[styles.word, { fontSize: size * 0.95, color: main }]}>
        LINE-<Text style={{ color: accent, fontFamily: fonts.display, fontSize: size * 0.95 }}>UP</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tile: { alignItems: 'center', justifyContent: 'center' },
  word: { fontFamily: fonts.display, letterSpacing: 0.4 },
});
