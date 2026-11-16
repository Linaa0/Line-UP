// Development-only gallery of the UI primitives, for comparing against the
// designs. Redirects away in production builds.
import { Redirect } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { IconTile } from '@/components/ui/icon-tile';
import { ListRow } from '@/components/ui/list-row';
import { Pill } from '@/components/ui/pill';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { Toggle } from '@/components/ui/toggle';
import { colors } from '@/constants/theme';

const filters = ['All', 'Direct', '1+ transfers', 'Fastest'];

export default function UiKit() {
  const [filter, setFilter] = useState('All');
  const [alerts, setAlerts] = useState(true);

  if (!__DEV__) return <Redirect href="/" />;

  return (
    <Screen scroll header={<ScreenHeader title="UI Kit" eyebrow="Dev only" back />}>
      <SectionLabel label="Typography" />
      <Card style={styles.gap}>
        <Text variant="h1">Good morning, Roohi</Text>
        <Text variant="title">Route Details</Text>
        <Text variant="body" color={colors.textSecondary}>
          Find routes, buy digital tickets, and track city buses in one trusted place.
        </Text>
        <Text variant="label" color={colors.muted}>
          Recent searches
        </Text>
      </Card>

      <SectionLabel label="Buttons" />
      <View style={styles.gap}>
        <Button label="Next" iconRight="arrow-right" />
        <Button label="Back to Home" variant="secondary" />
        <View style={styles.dark}>
          <Button label="Get Started" variant="accent" iconRight="arrow-right" />
        </View>
        <Button label="Pay Now" loading />
        <Button label="Delete account" variant="danger" iconLeft="trash-2" />
      </View>

      <SectionLabel label="Inputs" />
      <View style={styles.gap}>
        <TextField label="Full Name" placeholder="e.g. Keza Aline" />
        <TextField
          label="Phone Number"
          placeholder="e.g. 788 123 456"
          keyboardType="phone-pad"
          prefix={<Text variant="bodyStrong">🇷🇼 +250</Text>}
        />
        <TextField label="Password" placeholder="Create a strong password" password />
        <TextField label="With error" defaultValue="0788" error="Enter a valid Rwandan number" />
      </View>

      <SectionLabel label="Pills & chips" action={<Text variant="caption" color={colors.emerald}>Clear</Text>} />
      <View style={styles.row}>
        <Pill label="Best" />
        <Pill label="Live" dot />
        <Pill label="A024" tone="dark" />
        <Pill label="Platform 3B" tone="outline" />
        <Pill label="Route change" tone="warning" />
      </View>
      <View style={[styles.row, styles.mt]}>
        {filters.map((f) => (
          <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>

      <SectionLabel label="Icon tiles" />
      <View style={styles.row}>
        <IconTile name="map" />
        <IconTile name="credit-card" />
        <IconTile name="navigation" tone="dark" round />
        <IconTile name="alert-triangle" tone="warning" round />
        <IconTile name="log-out" tone="danger" />
      </View>

      <SectionLabel label="List rows" />
      <Card padding={0}>
        <ListRow divider={false} icon="credit-card" title="Payment methods" subtitle="MTN MoMo •••456 · Default" onPress={() => {}} />
        <ListRow icon="bell" title="Bus arrival alerts" subtitle="When your bus is 5 min away" right={<Toggle value={alerts} onValueChange={setAlerts} accessibilityLabel="Bus arrival alerts" />} />
        <ListRow icon="log-out" title="Log out" destructive onPress={() => {}} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { gap: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mt: { marginTop: 10 },
  dark: { backgroundColor: colors.forest600, padding: 16, borderRadius: 18 },
});
