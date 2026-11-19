import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import { Screen } from '@/components/layout/screen';
import { HeaderIconButton, ScreenHeader } from '@/components/navigation/screen-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { RouteBadge, shortName, StopTimeline } from '@/components/shared/transit';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import type { IconName } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { Pill } from '@/components/ui/pill';
import { SectionLabel } from '@/components/ui/section-label';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius, shadow, spacing } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { api, ApiError } from '@/lib/api';
import type { QueueEntry } from '@/lib/types';
import { formatTime } from '@/utils/format';

/** Designs 10-01 (waiting), 10-02 (boarding) and 09-02 (on the bus), chosen by queue status. */
export default function QueueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, loading, refresh, setData } = useApi<QueueEntry>(`/queues/${id}`, { pollMs: 15_000, refreshOnFocus: true });
  const [boarding, setBoarding] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);

  const board = async () => {
    setBoarding(true);
    setBoardError(null);
    try {
      setData(await api<QueueEntry>(`/queues/${id}/board`, { method: 'POST' }));
    } catch (e) {
      setBoardError(e instanceof ApiError ? e.message : 'Could not update your trip.');
    } finally {
      setBoarding(false);
    }
  };

  const ticketButton = (variant: 'primary' | 'secondary' = 'primary') =>
    data && <Button label="Show Digital Ticket" iconLeft="maximize" variant={variant} onPress={() => router.push(`/tickets/${data.ticket.id}`)} />;

  if (loading) return <Screen header={<ScreenHeader title="Virtual Queue" back />}><LoadingState /></Screen>;
  if (error || !data) return <Screen header={<ScreenHeader title="Virtual Queue" back />}><ErrorState message={error ?? ''} onRetry={refresh} /></Screen>;

  if (data.status === 'ON_BUS' || data.status === 'COMPLETED') return <TripInProgress q={data} />;

  if (data.status === 'BOARDING') {
    return (
      <Screen
        scroll
        header={<ScreenHeader title="Boarding Ready" eyebrow="LINE-UP" back />}
        footer={
          <>
            {boardError && <Text variant="caption" color={colors.danger} align="center">{boardError}</Text>}
            {ticketButton()}
            <Button label="I'm on the bus" variant="secondary" iconLeft="check-circle" onPress={board} loading={boarding} />
          </>
        }
      >
        <Card style={styles.busCard}>
          <BusIllustration />
          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <View style={styles.liveDot} />
              <Text variant="bodyStrong" color={colors.forest700}>
                Vehicle approaching
              </Text>
            </View>
            <Pill label={data.minutesToDeparture <= 0 ? 'Departing now' : `Departs in ${data.minutesToDeparture} min`} />
          </View>
        </Card>
        <Card style={styles.arriving}>
          <View style={styles.flex}>
            <Text variant="h2">Your bus is arriving!</Text>
            <View style={styles.row}>
              <RouteBadge code={data.route.code} size="sm" />
              <Text variant="caption" color={colors.textSecondary}>
                {shortName(data.from.name)} → {shortName(data.to.name)}
              </Text>
            </View>
          </View>
          <View style={styles.bay}>
            <Text variant="label" color={colors.mint}>
              Platform
            </Text>
            <Text style={styles.bayText}>{data.from.bay ?? 'Main'}</Text>
          </View>
        </Card>
        <SectionLabel label="Boarding instructions" />
        <Card style={styles.steps}>
          <Step n={1} title={`Proceed to ${data.from.bay ?? 'the boarding point'}`} body={`Follow the signs at ${data.from.name}.`} />
          <Step n={2} title="Have your digital ticket ready" body="Increase screen brightness for faster scanning." />
          <Step n={3} title="Scan at the turnstile or show the conductor" body="Then tap “I'm on the bus” to start trip tracking." />
        </Card>
      </Screen>
    );
  }

  // WAITING
  const stage = 0;
  return (
    <Screen
      scroll
      header={<ScreenHeader title="Virtual Queue" back />}
      footer={
        <>
          {boardError && <Text variant="caption" color={colors.danger} align="center">{boardError}</Text>}
          {ticketButton()}
          <Pressable onPress={board} disabled={boarding} style={styles.link}>
            <Text variant="captionStrong" color={colors.forest700}>
              {boarding ? 'Updating…' : "Already on the bus? Tap here"}
            </Text>
          </Pressable>
        </>
      }
    >
      <View style={styles.routePill}>
        <View style={styles.liveDot} />
        <Text variant="captionStrong">
          {data.route.code} • {shortName(data.to.name)}
        </Text>
      </View>

      <LinearGradient colors={['#B8F0D5', '#DDF8EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <Text variant="label" color={colors.forest700}>
          Your queue number
        </Text>
        <Text style={styles.number}>#{data.position}</Text>
        <Text variant="caption" color={colors.forest700}>
          Bus {data.route.code} • {shortName(data.from.name)}
          {data.from.bay ? ` ${data.from.bay}` : ''}
        </Text>
        <View style={styles.wait}>
          <Icon name="clock" size={18} color={colors.forest700} />
          <View>
            <Text variant="label" color={colors.muted}>
              Estimated wait
            </Text>
            <Text variant="title">~ {Math.max(0, data.minutesToDeparture)} min</Text>
          </View>
        </View>
      </LinearGradient>

      <Card style={styles.stepper}>
        <Text variant="label" color={colors.muted}>
          Boarding status
        </Text>
        <View style={styles.stepperRow}>
          {['Waiting', 'Boarding', 'On Bus'].map((label, i) => (
            <View key={label} style={styles.stepperItem}>
              <View style={styles.stepperDotRow}>
                {i > 0 && <View style={[styles.stepperLine, i <= stage && styles.stepperLineOn]} />}
                <View style={[styles.stepperDot, i <= stage && styles.stepperDotOn]}>
                  {i < stage || i === stage ? <Icon name="check" size={14} color="#FFFFFF" /> : <Text variant="captionStrong" color={colors.muted}>{i + 1}</Text>}
                </View>
                {i < 2 && <View style={[styles.stepperLine, i < stage && styles.stepperLineOn]} />}
              </View>
              <Text variant="captionStrong" color={i <= stage ? colors.forest700 : colors.muted}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card padding={0}>
        <InfoRow icon="users" label="People ahead in line" value={`${data.peopleAhead} passenger${data.peopleAhead === 1 ? '' : 's'}`} first />
        <InfoRow icon="clock" label="Next bus departure" value={data.departureLabel} />
        <InfoRow icon="home" label="Boarding gate" value={data.from.bay ?? 'Main stop'} highlight />
      </Card>
    </Screen>
  );
}

function TripInProgress({ q }: { q: QueueEntry }) {
  const done = q.status === 'COMPLETED';
  const nextIdx = q.journey.findIndex((s) => !s.passed);
  if (done) {
    return (
      <Screen header={<ScreenHeader title="Trip Complete" back />}>
        <EmptyState
          icon="flag"
          title="You've arrived"
          message={`Thanks for riding ${q.route.code} to ${q.to.name}. Murakoze!`}
          action={{ label: 'Back to Home', onPress: () => router.dismissTo('/home') }}
        />
      </Screen>
    );
  }
  return (
    <Screen
      scroll
      padded={false}
      header={
        <LinearGradient colors={[colors.forest700, colors.forest900]} style={styles.tripHeader}>
          <HeaderIconButton icon="chevron-left" label="Go back" onPress={() => router.back()} />
          <View style={styles.flex}>
            <Text variant="title" color="#FFFFFF">
              Trip In Progress
            </Text>
            <Text variant="caption" color="rgba(255,255,255,0.75)">
              Estimated from the timetable
            </Text>
          </View>
          <View style={styles.codeChip}>
            <View style={styles.liveDot} />
            <Text variant="captionStrong">{q.route.code}</Text>
          </View>
        </LinearGradient>
      }
      footer={
        <>
          <Button label="View Route Map" iconLeft="map" onPress={() => router.push('/live-map')} />
          <Button label="Emergency Support / Help" variant="secondary" iconLeft="alert-circle" onPress={() => router.push('/support')} />
        </>
      }
      contentStyle={styles.tripBody}
    >
      <Card style={styles.onboard}>
        <View style={styles.bigCheck}>
          <Icon name="check" size={34} color={colors.emerald} />
        </View>
        <Text variant="h2">You&apos;re on board!</Text>
        <Pill label={`${q.route.code} • ${shortName(q.to.name)} ${q.route.kind === 'EXPRESS' ? 'Express' : ''}`.trim()} />
        <View style={styles.divider} />
        <View style={styles.row}>
          <Icon name="clock" size={14} color={colors.textSecondary} />
          <Text variant="caption" color={colors.textSecondary}>
            Boarded at <Text variant="captionStrong">{q.boardedAt ? formatTime(q.boardedAt) : formatTime(q.departureAt)}</Text>
          </Text>
        </View>
      </Card>

      <View style={styles.stats}>
        <Card style={styles.stat}>
          <IconTile name="clock" />
          <View>
            <Text variant="label" color={colors.muted}>
              Remaining
            </Text>
            <Text variant="title">{q.remainingMin} min</Text>
          </View>
        </Card>
        <Card style={styles.stat}>
          <IconTile name="map-pin" />
          <View>
            <Text variant="label" color={colors.muted}>
              Stops left
            </Text>
            <Text variant="title">{q.journey.filter((s) => !s.passed).length}</Text>
          </View>
        </Card>
      </View>

      <Card style={styles.progress}>
        <View style={styles.rowBetween}>
          <Text variant="label" color={colors.muted}>
            Journey progress
          </Text>
          <Pill label={`Stop ${Math.max(1, nextIdx === -1 ? q.journey.length : nextIdx)} of ${q.journey.length}`} />
        </View>
        <StopTimeline
          stops={q.journey.map((s, i) => ({
            id: s.id,
            name: s.name,
            time: s.time,
            subtitle: s.passed ? 'Passed' : i === nextIdx ? 'Next stop' : 'Approaching',
            state: s.passed ? 'done' : i === nextIdx ? 'current' : 'upcoming',
          }))}
          timeFormatter={formatTime}
        />
      </Card>
    </Screen>
  );
}

function InfoRow({ icon, label, value, first, highlight }: { icon: IconName; label: string; value: string; first?: boolean; highlight?: boolean }) {
  return (
    <View style={[styles.infoRow, !first && styles.dividerTop]}>
      <IconTile name={icon} size={34} />
      <Text variant="body" color={colors.textSecondary} style={styles.flex}>
        {label}
      </Text>
      {highlight ? (
        <View style={styles.gate}>
          <Text variant="bodyStrong" color={colors.forest700}>
            {value}
          </Text>
        </View>
      ) : (
        <Text variant="bodyStrong">{value}</Text>
      )}
    </View>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text variant="captionStrong" color={colors.forest700}>
          {n}
        </Text>
      </View>
      <View style={styles.flex}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="caption" color={colors.textSecondary}>
          {body}
        </Text>
      </View>
    </View>
  );
}

/** Simple side view of a green city bus (design 10-02). */
function BusIllustration() {
  return (
    <View style={styles.illus}>
      <Svg width="100%" height={120} viewBox="0 0 300 120">
        <Rect x="0" y="96" width="300" height="24" fill="#E3EAE6" />
        {[30, 100, 170, 240].map((x) => (
          <Rect key={x} x={x} y="104" width="30" height="5" rx="2" fill="#F5B92E" />
        ))}
        <Rect x="58" y="22" width="184" height="66" rx="12" fill={colors.forest900} />
        {[72, 104, 136].map((x) => (
          <Rect key={x} x={x} y="32" width="26" height="22" rx="3" fill="#CFEFE0" />
        ))}
        <Rect x="172" y="32" width="14" height="46" rx="2" fill="#CFEFE0" />
        <Rect x="192" y="32" width="38" height="22" rx="3" fill="#CFEFE0" />
        <Rect x="80" y="64" width="40" height="5" rx="2" fill={colors.emerald} />
        <Rect x="58" y="70" width="8" height="8" rx="2" fill="#F5B92E" />
        <Rect x="236" y="70" width="6" height="8" rx="2" fill="#E4312B" />
        <Circle cx="96" cy="90" r="12" fill="#1F2A24" />
        <Circle cx="96" cy="90" r="5" fill="#C9D3CE" />
        <Circle cx="206" cy="90" r="12" fill="#1F2A24" />
        <Circle cx="206" cy="90" r="5" fill="#C9D3CE" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.emerald },
  link: { alignItems: 'center', paddingVertical: 4 },
  routePill: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 14 },
  hero: { borderRadius: radius.xxl, alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16, gap: 4, borderWidth: 1, borderColor: '#B3E6CC' },
  number: { fontFamily: fonts.display, fontSize: 68, lineHeight: 76, color: colors.forest900, letterSpacing: -2 },
  wait: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 10, marginTop: 12, ...shadow.card },
  stepper: { marginTop: 14, gap: 14 },
  stepperRow: { flexDirection: 'row' },
  stepperItem: { flex: 1, alignItems: 'center', gap: 6 },
  stepperDotRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', justifyContent: 'center' },
  stepperLine: { flex: 1, height: 2, backgroundColor: '#D7E3DC' },
  stepperLineOn: { backgroundColor: colors.emerald },
  stepperDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#D7E3DC', backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  stepperDotOn: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  dividerTop: { borderTopWidth: 1, borderTopColor: colors.divider },
  gate: { backgroundColor: colors.emerald50, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4 },
  busCard: { gap: 12, ...shadow.card },
  illus: { backgroundColor: '#ECF8F1', borderRadius: radius.lg, overflow: 'hidden', paddingTop: 10 },
  arriving: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, ...shadow.card },
  bay: { backgroundColor: colors.forest900, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  bayText: { fontFamily: fonts.display, fontSize: 18, color: '#FFFFFF' },
  steps: { gap: 14 },
  step: { flexDirection: 'row', gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: colors.mint200, backgroundColor: colors.emerald50, alignItems: 'center', justifyContent: 'center' },
  tripHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: spacing.screen, paddingTop: 8, paddingBottom: 18 },
  codeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  tripBody: { paddingHorizontal: spacing.screen, paddingTop: 16, gap: 12 },
  onboard: { alignItems: 'center', gap: 10, ...shadow.raised },
  bigCheck: { width: 66, height: 66, borderRadius: 33, backgroundColor: colors.emerald50, borderWidth: 2, borderColor: colors.mint200, alignItems: 'center', justifyContent: 'center' },
  divider: { height: 1, alignSelf: 'stretch', backgroundColor: colors.divider },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  progress: { gap: 12 },
});
