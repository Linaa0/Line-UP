import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { colors } from '@/constants/theme';
import { AnimatedSplash } from '@/features/onboarding/components/animated-splash';
import { I18nProvider } from '@/i18n';
import { AuthProvider, useAuth } from '@/lib/auth';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  return (
    <I18nProvider>
      <AuthProvider>
        <RootNavigator ready={fontsLoaded || !!fontError} />
      </AuthProvider>
    </I18nProvider>
  );
}

function RootNavigator({ ready: fontsReady }: { ready: boolean }) {
  const { loading, user } = useAuth();
  const ready = fontsReady && !loading;
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  const signedIn = !!user;
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />

        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(onboarding)" options={{ animation: 'fade' }} />
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="routes/results" />
          <Stack.Screen name="routes/[id]" />
          <Stack.Screen name="routes/pick-stop" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="checkout/confirm" />
          <Stack.Screen name="checkout/pay" />
          <Stack.Screen name="checkout/success" options={{ animation: 'fade', gestureEnabled: false }} />
          <Stack.Screen name="tickets/[id]" />
          <Stack.Screen name="queue/[id]" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="profile/edit" />
          <Stack.Screen name="settings" />
          <Stack.Screen name="support/index" />
          <Stack.Screen name="support/report" />
          <Stack.Screen name="dev/ui-kit" />
        </Stack.Protected>
      </Stack>
      {showSplash && <AnimatedSplash onFinish={() => setShowSplash(false)} />}
    </>
  );
}
