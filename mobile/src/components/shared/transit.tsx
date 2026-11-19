import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius } from '@/constants/theme';

/** Dark route code chip: "A024". */
export function RouteBadge({ code, size = 'md', style }: { code: string; size?: 'sm' | 'md' | 'lg'; style?: ViewStyle }) {
  const s = { sm: [5, 8, 12], md: [7, 10, 14], lg: [9, 14, 22] }[size];
  return (
    <View style={[styles.badge, { paddingVertical: s[0], paddingHorizontal: s[1] }, style]}>
      <Text style={{ fontFamily: fonts.display, fontSize: s[2], color: '#FFFFFF', letterSpacing: 0.3 }}>{code}</Text>
    </View>
  );
}

/** "Nyabugogo → Kicukiro" with a green arrow. */
export function RouteLine({ from, to, size = 16, color = colors.text }: { from: string; to: string; size?: number; color?: string }) {
  return (
    <View style={styles.line}>
      <Text style={{ fontFamily: fonts.heading, fontSize: size, color, flexShrink: 1 }} numberOfLines={1}>
        {shortName(from)}
      </Text>
      <Icon name="arrow-right" size={size} color={colors.emerald} />
      <Text style={{ fontFamily: fonts.heading, fontSize: size, color, flexShrink: 1 }} numberOfLines={1}>
        {shortName(to)}
      </Text>
    </View>
  );
}

/** Drops "Bus Park" / "Centre" so long stop names fit on route lines. */
export function shortName(name: string): string {
  return name.replace(/ (Bus Park|Centre)$/, '').replace(/ \(.*\)$/, '');
}

/** Bus load bar: real share of seats sold for that trip. */
export function LoadBar({ percent }: { percent: number }) {
  const color = percent >= 85 ? colors.danger : percent >= 60 ? colors.warning : colors.emerald;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(4, percent)}%`, backgroundColor: color }]} />
    </View>
  );
}

type TimelineStop = { id: string; name: string; time: string; subtitle?: string; state?: 'done' | 'current' | 'upcoming' };

/** Vertical list of stops with a connecting line (route details, confirm journey, trip). */
export function StopTimeline({ stops, timeFormatter }: { stops: TimelineStop[]; timeFormatter: (iso: string) => string }) {
  return (
    <View>
      {stops.map((stop, i) => {
        const first = i === 0;
        const last = i === stops.length - 1;
        const strong = first || last;
        const done = stop.state === 'done';
        const current = stop.state === 'current';
        return (
          <View key={stop.id} style={styles.tlRow}>
            <View style={styles.tlRail}>
              {!first && <View style={[styles.tlLine, styles.tlTop, done && styles.tlLineDone]} />}
              <View
                style={[
                  styles.tlDot,
                  strong && styles.tlDotStrong,
                  (done || (first && !stop.state)) && styles.tlDotDone,
                  current && styles.tlDotCurrent,
                  last && !done && styles.tlDotEnd,
                ]}
              >
                {(strong || current) && <View style={styles.tlDotInner} />}
              </View>
              {!last && <View style={[styles.tlLine, styles.tlBottom, done && styles.tlLineDone]} />}
            </View>
            <View style={styles.tlBody}>
              <View style={styles.tlText}>
                <Text variant={strong || current ? 'bodyStrong' : 'body'} color={done ? colors.muted : colors.text}>
                  {stop.name}
                </Text>
                {stop.subtitle && (
                  <Text variant="caption" color={colors.textSecondary}>
                    {stop.subtitle}
                  </Text>
                )}
              </View>
              <Text variant={strong ? 'captionStrong' : 'caption'} color={strong ? colors.text : colors.textSecondary}>
                {timeFormatter(stop.time)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { backgroundColor: colors.forest900, borderRadius: radius.sm, alignSelf: 'flex-start' },
  line: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  track: { height: 7, borderRadius: 4, backgroundColor: '#E2ECE6', overflow: 'hidden' },
  fill: { height: 7, borderRadius: 4 },

  tlRow: { flexDirection: 'row', minHeight: 46 },
  tlRail: { width: 24, alignItems: 'center' },
  tlLine: { width: 2, flex: 1, backgroundColor: '#D7E3DC' },
  tlLineDone: { backgroundColor: colors.emerald },
  tlTop: { marginBottom: 2 },
  tlBottom: { marginTop: 2 },
  tlDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#B9CBC1', backgroundColor: colors.card },
  tlDotStrong: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tlDotDone: { borderColor: colors.emerald, backgroundColor: colors.emerald },
  tlDotCurrent: { width: 18, height: 18, borderRadius: 9, borderColor: colors.emerald, backgroundColor: colors.emerald50, alignItems: 'center', justifyContent: 'center' },
  tlDotEnd: { borderColor: colors.forest900, backgroundColor: colors.forest900 },
  tlDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  tlBody: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 10, paddingVertical: 6, gap: 8 },
  tlText: { flex: 1, gap: 1 },
});
