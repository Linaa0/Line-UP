import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguageButton } from "@/components/shared/language-picker";
import { BusMark } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { NATIVE_DRIVER } from "@/constants/motion";
import { colors, fonts, radius } from "@/constants/theme";
import { type MessageKey, useT } from "@/i18n";

const city = require("@/assets/images/photos/kigali-city.png");
const bus = require("@/assets/images/photos/city-bus.png");

const FEATURES: { icon: IconName; label: MessageKey }[] = [
  { icon: "smartphone", label: "welcome.featureMomo" },
  { icon: "grid", label: "welcome.featureQr" },
  { icon: "users", label: "welcome.featureQueue" },
];

/** Design 01-02, reworked: Kigali skyline backdrop, the bus, a language choice and a clear call to action. */
export default function WelcomeScreen() {
  const t = useT();
  const [enter] = useState(() => new Animated.Value(0));
  const [drift] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVE_DRIVER,
    }).start();
    // Slow "breathing" zoom on the city photo.
    Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: NATIVE_DRIVER,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: NATIVE_DRIVER,
        }),
      ]),
    ).start();
  }, [enter, drift]);

  const rise = (from: number) => ({
    opacity: enter,
    transform: [
      {
        translateY: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [from, 0],
        }),
      },
    ],
  });
  const busIn = {
    opacity: enter,
    transform: [
      {
        translateX: enter.interpolate({
          inputRange: [0, 1],
          outputRange: [60, 0],
        }),
      },
      { rotate: "-2deg" },
    ],
  };
  const zoom = {
    transform: [
      {
        scale: drift.interpolate({
          inputRange: [0, 1],
          outputRange: [1.05, 1.13],
        }),
      },
    ],
  };
  // Kinyarwanda and French headlines are longer; keep them to about three lines.
  const longHeadline =
    t("welcome.headline").length + t("welcome.headlineAccent").length > 30;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Backdrop: Kigali, fading into brand green */}
      <Animated.View style={[StyleSheet.absoluteFill, zoom]}>
        <Image
          source={city}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={400}
        />
      </Animated.View>
      <LinearGradient
        colors={[
          "rgba(0,37,19,0.55)",
          "rgba(0,37,19,0.15)",
          "rgba(5,61,37,0.82)",
          colors.forest950,
        ]}
        locations={[0, 0.28, 0.55, 0.82]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.safe}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Top bar: logo and language */}
          <Animated.View style={[styles.top, rise(-12)]}>
            <View style={styles.brand}>
              <View style={styles.markTile}>
                <BusMark size={24} cutout={colors.forest600} />
              </View>
              <Text style={styles.word}>
                LINE-
                <Text style={[styles.word, { color: colors.mint }]}>UP</Text>
              </Text>
            </View>
            <LanguageButton />
          </Animated.View>

          <View style={styles.flex} />

          {/* The bus card */}
          <Animated.View style={[styles.busCard, busIn]}>
            <Image
              source={bus}
              style={styles.busImage}
              contentFit="cover"
              contentPosition="center"
            />
            <LinearGradient
              colors={["rgba(0,0,0,0)", "rgba(0,25,13,0.55)"]}
              style={styles.busShade}
            />
            <View style={[styles.chip, styles.chipTop]}>
              <View style={styles.liveDot} />
              <Text style={styles.chipText}>A024 · Nyabugogo → Kicukiro</Text>
            </View>
            <View style={[styles.chip, styles.chipMint]}>
              <Icon name="clock" size={13} color={colors.forest900} />
              <Text style={[styles.chipText, { color: colors.forest900 }]}>
                {t("welcome.every")}
              </Text>
            </View>
          </Animated.View>

          {/* Message */}
          <Animated.View style={[styles.copy, rise(24)]}>
            <Text
              style={[styles.headline, longHeadline && styles.headlineLong]}
            >
              {t("welcome.headline")}
              {"\n"}
              <Text
                style={[
                  styles.headline,
                  longHeadline && styles.headlineLong,
                  { color: colors.mint },
                ]}
              >
                {t("welcome.headlineAccent")}
              </Text>
            </Text>
            <Text style={styles.sub}>{t("welcome.body")}</Text>
            <View style={styles.features}>
              {FEATURES.map((f) => (
                <View key={f.label} style={styles.feature}>
                  <Icon name={f.icon} size={14} color={colors.mint} />
                  <Text style={styles.featureText} numberOfLines={1}>
                    {t(f.label)}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Actions */}
          <Animated.View style={[styles.actions, rise(36)]}>
            <Button
              label={t("welcome.getStarted")}
              variant="accent"
              iconRight="arrow-right"
              onPress={() => router.push("/intro")}
            />
            <Pressable
              onPress={() => router.push("/login")}
              accessibilityRole="link"
              style={styles.loginRow}
            >
              <Text style={styles.muted}>{t("welcome.haveAccount")} </Text>
              <Text style={styles.login}>{t("welcome.logIn")}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const glass = {
  backgroundColor: "rgba(255,255,255,0.12)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.22)",
} as const;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.forest950, overflow: "hidden" },
  safeArea: { flex: 1 },
  safe: { flexGrow: 1, paddingHorizontal: 22 },
  flex: { flex: 1, minHeight: 12 },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  markTile: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    ...glass,
  },
  word: {
    fontFamily: fonts.display,
    fontSize: 21,
    color: "#FFFFFF",
    letterSpacing: 0.8,
  },

  busCard: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 420,
    aspectRatio: 1.7,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
    marginBottom: 26,
  },
  busImage: { ...StyleSheet.absoluteFill },
  busShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
  },
  chip: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.full,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  chipTop: { top: 12, left: 12, backgroundColor: "rgba(6,30,19,0.78)" },
  chipMint: { bottom: 12, right: 12, backgroundColor: colors.mint },
  chipText: { fontFamily: fonts.semibold, fontSize: 12, color: "#FFFFFF" },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.mint,
  },

  copy: { gap: 12 },
  headline: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 42,
    color: "#FFFFFF",
    letterSpacing: -0.8,
  },
  headlineLong: { fontSize: 30, lineHeight: 36, letterSpacing: -0.5 },
  sub: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(225, 248, 237, 0.85)",
    maxWidth: 360,
  },
  features: { flexDirection: "row", gap: 6, marginTop: 2 },
  feature: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderRadius: radius.full,
    paddingHorizontal: 9,
    paddingVertical: 7,
    ...glass,
  },
  featureText: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: "#FFFFFF",
    flexShrink: 1,
  },

  actions: { gap: 14, paddingTop: 24, paddingBottom: 16 },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingVertical: 4,
  },
  muted: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: "rgba(209, 250, 229, 0.75)",
  },
  login: { fontFamily: fonts.semibold, fontSize: 14, color: "#FFFFFF" },
});
