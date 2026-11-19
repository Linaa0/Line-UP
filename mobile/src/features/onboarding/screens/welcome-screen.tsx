import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BusMark } from '@/components/shared/logo';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { colors, fonts } from '@/constants/theme';

/** Design 01-02. */
export default function WelcomeScreen() {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#17784C', colors.forest600, colors.forest950]}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0.15 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.glow} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.brand}>
          <BusMark size={120} cutout="#0F6340" />
          <Text style={styles.word}>
            LINE-<Text style={[styles.word, { color: colors.mint }]}>UP</Text>
          </Text>
          <Text style={styles.tagline}>Smarter Transport. A Better Kigali.</Text>
        </View>
        <View style={styles.actions}>
          <Button label="Get Started" variant="accent" iconRight="arrow-right" onPress={() => router.push('/intro')} />
          <Pressable onPress={() => router.push('/login')} accessibilityRole="link" style={styles.loginRow}>
            <Text style={styles.muted}>Already have an account? </Text>
            <Text style={styles.login}>Log In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.forest950 },
  glow: {
    position: 'absolute',
    top: '18%',
    alignSelf: 'center',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(112, 251, 190, 0.07)',
  },
  safe: { flex: 1, paddingHorizontal: 24 },
  brand: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  word: { fontFamily: fonts.display, fontSize: 36, color: '#FFFFFF', letterSpacing: 1 },
  tagline: { fontFamily: fonts.medium, fontSize: 15.5, color: '#A7F3D0' },
  actions: { gap: 18, paddingBottom: 24 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 6 },
  muted: { fontFamily: fonts.body, fontSize: 14, color: 'rgba(209, 250, 229, 0.75)' },
  login: { fontFamily: fonts.semibold, fontSize: 14, color: '#FFFFFF' },
});
