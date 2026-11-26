import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageButton } from '@/components/shared/language-picker';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { NATIVE_DRIVER } from '@/constants/motion';
import { colors, fonts, radius } from '@/constants/theme';
import { useT } from '@/i18n';

import { BusStopIllustration } from '../components/bus-stop-illustration';

/** Design 01-02 (light): name, the bus-stop illustration, the promise and a clear call to action. */
export default function WelcomeScreen() {
  const t = useT();
  const { width } = useWindowDimensions();
  const [enter] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE_DRIVER }).start();
  }, [enter]);

  const rise = (from: number) => ({
    opacity: enter,
    transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }],
  });
  const art = Math.min(width - 32, 400);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} bounces={false}>
        <View style={styles.top}>
          <LanguageButton tone="dark" />
        </View>

        <View style={styles.flex} />

        <Animated.View style={rise(-10)}>
          <Text style={styles.word} accessibilityRole="header">
            LINE-<Text style={[styles.word, styles.wordAccent]}>UP</Text>
          </Text>
        </Animated.View>

        <Animated.View style={[styles.art, rise(18)]}>
          <BusStopIllustration width={art} />
        </Animated.View>

        <Animated.View style={[styles.copy, rise(24)]}>
          <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
          <Text style={styles.taglineAccent}>{t('welcome.taglineAccent')}</Text>
        </Animated.View>

        <View style={styles.flex} />

        <Animated.View style={[styles.actions, rise(32)]}>
          <Pressable
            onPress={() => router.push('/intro')}
            style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Text style={styles.ctaText}>{t('welcome.getStarted')}</Text>
            <Icon name="arrow-right" size={18} color="#FFFFFF" />
          </Pressable>
          <Pressable onPress={() => router.push('/login')} accessibilityRole="link" style={styles.loginRow}>
            <Text style={styles.muted}>{t('welcome.haveAccount')} </Text>
            <Text style={styles.login}>{t('welcome.logIn')}</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EEF8F3' },
  content: { flexGrow: 1, paddingHorizontal: 22, alignItems: 'stretch' },
  flex: { flex: 1, minHeight: 16 },
  top: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 8 },
  word: { fontFamily: fonts.display, fontSize: 30, lineHeight: 38, color: colors.text, letterSpacing: 0.8, textAlign: 'center' },
  wordAccent: { color: colors.forest700 },
  art: { alignItems: 'center', marginTop: 26, marginBottom: 30 },
  copy: { alignItems: 'center', gap: 2 },
  tagline: { fontFamily: fonts.heading, fontSize: 19, lineHeight: 26, color: colors.text, textAlign: 'center' },
  taglineAccent: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24, color: colors.forest900, textAlign: 'center' },
  actions: { gap: 16, paddingTop: 28, paddingBottom: 18 },
  cta: {
    height: 58,
    borderRadius: radius.full,
    backgroundColor: colors.forest700,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.forest900,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  pressed: { opacity: 0.88 },
  ctaText: { fontFamily: fonts.semibold, fontSize: 16, color: '#FFFFFF' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', paddingVertical: 4 },
  muted: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary },
  login: { fontFamily: fonts.bold, fontSize: 14, color: colors.forest900 },
});
