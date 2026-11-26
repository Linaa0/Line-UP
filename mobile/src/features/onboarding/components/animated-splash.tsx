import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { BusMark } from '@/components/shared/logo';
import { Text } from '@/components/ui/text';
import { NATIVE_DRIVER } from '@/constants/motion';
import { fonts } from '@/constants/theme';
import { useT } from '@/i18n';

import { KigaliScene, SCENE_RATIO, sceneY } from './kigali-scene';

/** Design 01-01: branded splash shown briefly at launch, then fades into the app. */
export function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const t = useT();
  const { width, height } = useWindowDimensions();
  const [opacity] = useState(() => new Animated.Value(1));
  const [enter] = useState(() => new Animated.Value(0));
  const [spin] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE_DRIVER }).start();
    const loop = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: NATIVE_DRIVER }));
    loop.start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 380, useNativeDriver: NATIVE_DRIVER }).start(() => onFinish());
    }, 1900);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [opacity, enter, spin, onFinish]);

  // The Kigali scene fills the lower half; on short or wide screens it is cropped, never stretched.
  const sceneHeight = Math.min(width * SCENE_RATIO, height * 0.56);
  const sceneTop = height - sceneHeight;
  const statusTop = sceneTop + sceneY(98, width, sceneHeight);

  const rise = {
    opacity: enter,
    transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  };
  const rotate = { transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] };

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity }]} pointerEvents="none">
      <LinearGradient colors={['#0A5C36', '#0E7543', '#0B6239', '#0A5A33']} locations={[0, 0.35, 0.6, 1]} style={StyleSheet.absoluteFill} />

      {/* Soft glow behind the logo and the curved band in the top corner */}
      <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
        <Defs>
          <RadialGradient id="splashGlow" cx="50%" cy="38%" rx="70%" ry="42%">
            <Stop offset="0" stopColor="#2BB56E" stopOpacity={0.55} />
            <Stop offset="1" stopColor="#0A5C36" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#splashGlow)" />
        <Path d={`M0 0 H${width * 0.62} C ${width * 0.46} ${height * 0.05}, ${width * 0.22} ${height * 0.08}, 0 ${height * 0.14} Z`} fill="#3CC07D" opacity={0.28} />
        <Path d={`M0 0 H${width * 0.42} C ${width * 0.3} ${height * 0.035}, ${width * 0.14} ${height * 0.05}, 0 ${height * 0.09} Z`} fill="#5BD796" opacity={0.25} />
      </Svg>

      <View style={[styles.scene, { top: sceneTop }]}>
        <KigaliScene width={width} height={sceneHeight} />
      </View>

      {/* Logo, name and tagline */}
      <Animated.View style={[styles.brand, { top: sceneTop * 0.42 }, rise]}>
        <BusMark size={124} color="#FFFFFF" cutout="transparent" />
        <Text style={styles.word}>
          LINE-<Text style={[styles.word, styles.accent]}>UP</Text>
        </Text>
        <Text style={styles.tagline}>{t('splash.tagline')}</Text>
      </Animated.View>

      {/* Loading ring and message, over the hills */}
      <View style={[styles.status, { top: statusTop }]}>
        <Animated.View style={rotate}>
          <Svg width={44} height={44} viewBox="0 0 44 44">
            <Circle cx={22} cy={22} r={18} stroke="rgba(255,255,255,0.3)" strokeWidth={3} fill="none" />
            <Path d="M22 4 A18 18 0 0 1 40 22" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" />
          </Svg>
        </Animated.View>
        <Text style={styles.loading}>{t('splash.loading')}</Text>
      </View>
    </Animated.View>
  );
}

const shadow = { textShadowColor: 'rgba(0, 40, 20, 0.45)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 };

const styles = StyleSheet.create({
  root: { backgroundColor: '#0A5A33', zIndex: 10, overflow: 'hidden' },
  scene: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  brand: { position: 'absolute', left: 24, right: 24, alignItems: 'center' },
  word: { fontFamily: fonts.heading, fontSize: 34, lineHeight: 42, color: '#FFFFFF', letterSpacing: 1, marginTop: 18 },
  accent: { color: '#9CF5C8', marginTop: 0 },
  tagline: { fontFamily: fonts.medium, fontSize: 15, color: '#BFF3D6', letterSpacing: 0.5, marginTop: 10, textAlign: 'center' },
  status: { position: 'absolute', left: 24, right: 24, alignItems: 'center', gap: 18 },
  loading: { fontFamily: fonts.bold, fontSize: 17, color: '#FFFFFF', ...shadow },
});
