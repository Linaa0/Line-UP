import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { BusMark } from '@/components/shared/logo';
import { Text } from '@/components/ui/text';
import { NATIVE_DRIVER } from '@/constants/motion';
import { colors, fonts } from '@/constants/theme';
import { useT } from '@/i18n';

const city = require('@/assets/images/photos/kigali-city.png');

/** Design 01-01: branded splash shown briefly at launch, then fades into the app. */
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const t = useT();
  const [opacity] = useState(() => new Animated.Value(1));
  const [enter] = useState(() => new Animated.Value(0));
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 700, easing: Easing.out(Easing.back(1.4)), useNativeDriver: NATIVE_DRIVER }).start();
    Animated.timing(progress, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 380, useNativeDriver: NATIVE_DRIVER }).start(() => onFinish());
    }, 1600);
    return () => clearTimeout(timer);
  }, [opacity, enter, progress, onFinish]);

  const pop = {
    opacity: enter,
    transform: [{ scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }],
  };
  const rise = {
    opacity: enter,
    transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
  };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity }]} pointerEvents="none">
      <Image source={city} style={StyleSheet.absoluteFill} contentFit="cover" />
      <LinearGradient
        colors={['rgba(11,85,54,0.93)', 'rgba(11,85,54,0.86)', 'rgba(0,37,19,0.97)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.center}>
        <Animated.View style={[styles.halo, pop]}>
          <View style={styles.tile}>
            <BusMark size={72} color={colors.forest900} cutout={colors.mint} />
          </View>
        </Animated.View>
        <Animated.View style={[styles.copy, rise]}>
          <Text style={styles.word}>
            LINE-<Text style={[styles.word, { color: colors.mint }]}>UP</Text>
          </Text>
          <Text style={styles.tagline}>{t('splash.tagline')}</Text>
        </Animated.View>
      </View>

      <View style={styles.bottom}>
        <View style={styles.track}>
          <Animated.View
            style={[styles.bar, { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
          />
        </View>
        <Text style={styles.loading}>{t('splash.loading')}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.forest950, zIndex: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 },
  halo: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: 'rgba(112, 251, 190, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(112, 251, 190, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    width: 112,
    height: 112,
    borderRadius: 32,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.mint,
    shadowOpacity: 0.5,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  copy: { alignItems: 'center', gap: 8 },
  word: { fontFamily: fonts.display, fontSize: 38, color: '#FFFFFF', letterSpacing: 1.5 },
  tagline: { fontFamily: fonts.medium, fontSize: 15, color: '#A7F3D0' },
  bottom: { position: 'absolute', left: 48, right: 48, bottom: 64, alignItems: 'center', gap: 12 },
  track: { width: '100%', height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  bar: { height: 4, borderRadius: 2, backgroundColor: colors.mint },
  loading: { fontFamily: fonts.semibold, fontSize: 13, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.4 },
});
