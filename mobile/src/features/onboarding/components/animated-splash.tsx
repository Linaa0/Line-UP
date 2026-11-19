import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Easing, StyleSheet, View } from 'react-native';

import { BusMark } from '@/components/shared/logo';
import { Text } from '@/components/ui/text';
import { NATIVE_DRIVER } from '@/constants/motion';
import { colors, fonts } from '@/constants/theme';

const skyline = require('@/assets/images/illustrations/kigali-skyline.png');

/** Design 01-01: branded splash shown briefly at launch, then fades into the app. */
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [rise] = useState(() => new Animated.Value(16));

  useEffect(() => {
    Animated.timing(rise, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE_DRIVER }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 380, useNativeDriver: NATIVE_DRIVER }).start(() => onFinish());
    }, 1500);
    return () => clearTimeout(timer);
  }, [opacity, rise, onFinish]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]} pointerEvents="none">
      <LinearGradient colors={['#14744A', colors.forest600, colors.forest950]} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
      <Animated.View style={[styles.center, { transform: [{ translateY: rise }] }]}>
        <BusMark size={112} cutout={colors.forest600} />
        <Text style={styles.word}>
          LINE-<Text style={[styles.word, { color: colors.mint }]}>UP</Text>
        </Text>
        <Text style={styles.tagline}>Smarter Transport. A Better Kigali.</Text>
      </Animated.View>
      <View style={styles.bottom}>
        <ActivityIndicator color="rgba(255,255,255,0.85)" />
        <Text style={styles.loading}>Line-Up is on its way</Text>
        <Image source={skyline} style={styles.skyline} contentFit="cover" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingBottom: 120 },
  word: { fontFamily: fonts.display, fontSize: 34, color: '#FFFFFF', letterSpacing: 1 },
  tagline: { fontFamily: fonts.medium, fontSize: 15, color: '#A7F3D0' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center', gap: 10 },
  loading: { fontFamily: fonts.semibold, fontSize: 14, color: '#FFFFFF' },
  skyline: { width: '100%', aspectRatio: 382 / 172, marginTop: 8 },
});
