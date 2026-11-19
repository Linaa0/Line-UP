import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ComponentRef, useRef, useState } from 'react';
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { IconName } from '@/components/ui/icon';
import { Icon } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius, shadow, spacing } from '@/constants/theme';
import { useAuth } from '@/lib/auth';

const hills = require('@/assets/images/illustrations/kigali-hills.png');

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: 'map', title: 'Find Routes', body: 'See all available routes and stops' },
  { icon: 'credit-card', title: 'Buy Tickets', body: 'Pay securely using Mobile Money' },
  { icon: 'map-pin', title: 'Track Bus', body: 'Get arrival times for your stop' },
  { icon: 'grid', title: 'Easy Boarding', body: 'Show your QR ticket when you board' },
];

const STEPS = [
  { title: 'Search for your route', body: 'Choose your departure and destination' },
  { title: 'View available routes', body: 'Compare times, fares and how full the bus is' },
  { title: 'Buy your ticket', body: 'Pay with MTN MoMo or Airtel Money' },
  { title: 'Board your bus', body: 'Show your QR ticket at the boarding point' },
];

/** Designs 01-03, 01-04 and 01-05 as one swipeable pager. */
export default function IntroScreen() {
  const { width } = useWindowDimensions();
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const [page, setPage] = useState(0);
  const { completeOnboarding } = useAuth();
  const pageWidth = Math.min(width, 520);

  const finish = async (to: '/register' | '/login') => {
    await completeOnboarding();
    router.replace(to);
  };

  const goTo = (index: number) => {
    scroller.current?.scrollTo({ x: index * pageWidth, animated: true });
    setPage(index);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / pageWidth);
    if (index !== page) setPage(index);
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.top}>
        <Pressable onPress={() => (page === 0 ? router.back() : goTo(page - 1))} hitSlop={12} accessibilityLabel="Back">
          <Icon name="arrow-left" size={22} />
        </Pressable>
        <Logo size={18} />
        <Pressable onPress={() => finish('/register')} hitSlop={12} style={styles.skip} accessibilityRole="button">
          <Text variant="captionStrong" color={colors.forest700}>
            Skip
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        onScroll={onScroll}
        scrollEventThrottle={64}
        style={{ width: pageWidth, alignSelf: 'center' }}
      >
        {/* 01-03 */}
        <View style={[styles.page, { width: pageWidth }]}>
          <Text variant="display">Smarter Transport{'\n'}A Better Kigali</Text>
          <Text variant="body" color={colors.textSecondary} style={styles.lede}>
            Find routes, buy digital tickets, and track city buses in one trusted place.
          </Text>
          <View style={styles.art}>
            <Image source={hills} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View style={[styles.artChip, { top: 14, left: 14 }]}>
              <View style={styles.dot} />
              <Text variant="captionStrong">Nyabugogo • Kimironko</Text>
            </View>
            <View style={[styles.artChip, styles.artChipDark, { bottom: 14, right: 14 }]}>
              <Icon name="feather" size={13} color="#FFFFFF" />
              <Text variant="captionStrong" color="#FFFFFF">
                Clean City Transit
              </Text>
            </View>
          </View>
        </View>

        {/* 01-04 */}
        <View style={[styles.page, { width: pageWidth }]}>
          <Text variant="display" align="center">
            Why LINE-UP?
          </Text>
          <Text style={styles.kicker} align="center">
            Simple. Fast. Reliable.
          </Text>
          <View style={styles.grid}>
            {FEATURES.map((f) => (
              <Card key={f.title} style={styles.feature}>
                <IconTile name={f.icon} size={42} />
                <Text variant="title">{f.title}</Text>
                <Text variant="caption" color={colors.textSecondary}>
                  {f.body}
                </Text>
              </Card>
            ))}
          </View>
        </View>

        {/* 01-05 */}
        <View style={[styles.page, { width: pageWidth }]}>
          <Text variant="display">How It Works</Text>
          <Text variant="captionStrong" color={colors.emerald} style={styles.lede}>
            Fast & predictable urban commuting
          </Text>
          <View style={styles.steps}>
            {STEPS.map((s, i) => (
              <View key={s.title} style={styles.stepRow}>
                <View style={styles.stepRail}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  {i < STEPS.length - 1 && <View style={styles.stepLine} />}
                </View>
                <Card style={styles.stepCard}>
                  <Text variant="bodyStrong">{s.title}</Text>
                  <Text variant="caption" color={colors.textSecondary}>
                    {s.body}
                  </Text>
                </Card>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.pageDot, i === page && styles.pageDotActive]} />
          ))}
        </View>
        <Button
          label={page === 2 ? 'Get Started' : 'Next'}
          iconRight="arrow-right"
          onPress={() => (page === 2 ? finish('/register') : goTo(page + 1))}
        />
        <Pressable onPress={() => finish('/login')} style={styles.loginRow} accessibilityRole="link">
          <Text variant="caption" color={colors.textSecondary}>
            Already have an account?{' '}
          </Text>
          <Text variant="captionStrong" color={colors.forest700}>
            Log in
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  skip: { backgroundColor: colors.mint100, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.full },
  page: { paddingHorizontal: 22, paddingTop: 22 },
  lede: { marginTop: 10 },
  kicker: { fontFamily: fonts.heading, fontSize: 15, color: colors.emerald, marginTop: 6 },
  art: { marginTop: 22, flex: 1, maxHeight: 340, minHeight: 230, borderRadius: radius.xxl, overflow: 'hidden', backgroundColor: colors.mint200 },
  artChip: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 6, ...shadow.card },
  artChipDark: { backgroundColor: colors.forest900 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.emerald },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 26 },
  feature: { width: '47.5%', gap: 8, minHeight: 150, ...shadow.card },
  steps: { marginTop: 22 },
  stepRow: { flexDirection: 'row', gap: 12 },
  stepRail: { alignItems: 'center', width: 40 },
  stepNum: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.forest900, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontFamily: fonts.heading, color: '#FFFFFF', fontSize: 15 },
  stepLine: { width: 2, flex: 1, backgroundColor: colors.mint200, marginVertical: 2 },
  stepCard: { flex: 1, marginBottom: 12, gap: 3, ...shadow.card },
  footer: { paddingHorizontal: spacing.xxl, paddingBottom: 12, gap: 12 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 6 },
  pageDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C9D8D0' },
  pageDotActive: { width: 26, backgroundColor: colors.forest900 },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
});
