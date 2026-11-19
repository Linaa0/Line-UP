import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { RwandaFlag } from '@/features/authentication/components/auth-parts';
import { setPickerTarget } from '@/features/routes/search-store';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { StopRef, User } from '@/lib/types';
import { formatPhone, initials } from '@/utils/format';

/** Design 12-02. */
export default function EditProfileScreen() {
  const { user, setUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [homeStop, setHomeStop] = useState<StopRef | null>(user?.homeStop ?? null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const pickStop = () => {
    setPickerTarget(setHomeStop);
    router.push({ pathname: '/routes/pick-stop', params: { title: 'Home stop' } });
  };

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const updated = await api<User>('/users/me', {
        method: 'PATCH',
        body: { fullName: fullName.trim(), email: email.trim(), homeStopId: homeStop?.id ?? null },
      });
      setUser(updated);
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not save your profile.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll header={<ScreenHeader title="Edit Profile" back />} footer={<Button label="Save Changes" onPress={save} loading={busy} />}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(fullName || user.fullName)}</Text>
        </View>
      </View>
      <View style={styles.form}>
        <TextField label="Full Name" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
        <TextField
          label="Phone Number"
          value={formatPhone(user.phone).replace('+250 ', '')}
          editable={false}
          hint="Your phone number is your login and can't be changed here."
          prefix={
            <View style={styles.prefix}>
              <RwandaFlag />
              <Text variant="bodyStrong">+250</Text>
            </View>
          }
        />
        <TextField
          label="Email (optional)"
          value={email}
          onChangeText={setEmail}
          iconLeft="mail"
          placeholder="For receipts, e.g. you@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.field}>
          <Text variant="bodyStrong" style={styles.label}>
            Home Stop
          </Text>
          <Pressable onPress={pickStop} style={styles.select} accessibilityRole="button">
            <Icon name="map-pin" size={18} color={colors.muted} />
            <Text variant="body" color={homeStop ? colors.text : colors.muted} style={styles.flex}>
              {homeStop?.name ?? 'Choose your usual stop'}
            </Text>
            <Icon name="chevron-down" size={18} color={colors.muted} />
          </Pressable>
          <Text variant="caption" color={colors.muted}>
            Used to show nearby buses on Home.
          </Text>
        </View>
        {error && (
          <Text variant="caption" color={colors.danger}>
            {error}
          </Text>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  avatarWrap: { alignItems: 'center', marginVertical: 10 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.forest900, alignItems: 'center', justifyContent: 'center', ...shadow.raised },
  avatarText: { fontFamily: fonts.display, fontSize: 32, color: colors.mint },
  form: { gap: 14, marginTop: 10 },
  prefix: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  field: { gap: 7 },
  label: { fontSize: 13.5, color: '#1F2937' },
  select: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 50, borderRadius: radius.md + 2, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 14 },
});
