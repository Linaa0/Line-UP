import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { type LayoutChangeEvent, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { HeaderIconButton } from '@/components/navigation/screen-header';
import { ErrorState, LoadingState } from '@/components/shared/states';
import { LoadBar, shortName } from '@/components/shared/transit';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Icon } from '@/components/ui/icon';
import { IconTile } from '@/components/ui/icon-tile';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius, shadow } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import type { LiveBus, LiveData } from '@/lib/types';

const PAD = 26;
/** Space taken by the title/chips at the top and the bus card at the bottom. */
const TOP = 150;
const BOTTOM = 290;

/** Design 09-01. A schematic city map; buses are placed from the timetable. */
export default function LiveMapScreen() {
  const { data, error, loading, refresh } = useApi<LiveData>('/live/buses', { pollMs: 20_000, refreshOnFocus: true });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [line, setLine] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const onLayout = (e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });

  const codes = useMemo(() => [...new Set((data?.lines ?? []).map((l) => l.code))].sort(), [data]);
  const lines = useMemo(() => (data?.lines ?? []).filter((l) => l.direction === 'OUTBOUND'), [data]);
  const buses = useMemo(() => (data?.buses ?? []).filter((b) => !line || b.code === line), [data, line]);

  const project = useMemo(() => {
    const pts = lines.flatMap((l) => l.path);
    if (!pts.length || !size.w) return null;
    const lats = pts.map((p) => p.lat);
    const lngs = pts.map((p) => p.lng);
    const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
    const usableH = Math.max(160, size.h - TOP - BOTTOM);
    const scale = Math.min((size.w - PAD * 2) / (maxLng - minLng), usableH / (maxLat - minLat));
    const offX = (size.w - (maxLng - minLng) * scale) / 2;
    const offY = TOP + (usableH - (maxLat - minLat) * scale) / 2;
    return (lat: number, lng: number) => ({ x: offX + (lng - minLng) * scale, y: offY + (maxLat - lat) * scale });
  }, [lines, size]);

  const stops = useMemo(() => {
    const map = new Map<string, { id: string; name: string; lat: number; lng: number; count: number }>();
    lines.forEach((l) =>
      l.path.forEach((p) => {
        const s = map.get(p.id) ?? { ...p, count: 0 };
        s.count += 1;
        map.set(p.id, s);
      }),
    );
    return [...map.values()];
  }, [lines]);

  const focus: LiveBus | undefined = buses.find((b) => `${b.routeId}-${b.lat}` === selected) ?? [...buses].sort((a, b) => a.minutesToNextStop - b.minutesToNextStop)[0];
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  const highlighted = new Set(lines.filter((l) => (line ? l.code === line : focus && l.code === focus.code)).map((l) => l.routeId));

  return (
    <View style={styles.root} onLayout={onLayout}>
      {loading ? (
        <LoadingState label="Loading the map…" />
      ) : error || !data ? (
        <ErrorState message={error ?? ''} onRetry={refresh} />
      ) : (
        project && (
          <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill}>
            <Rect x={0} y={0} width={size.w} height={size.h} fill="#E9F2EC" />
            {/* Soft "blocks" for texture */}
            {Array.from({ length: 9 }, (_, i) => (
              <Line key={i} x1={0} y1={(i + 1) * (size.h / 10)} x2={size.w} y2={(i + 1) * (size.h / 10) - 60} stroke="#F4F8F5" strokeWidth={10} />
            ))}
            {lines.map((l) => {
              const on = highlighted.has(l.routeId);
              const pts = l.path.map((p) => project(p.lat, p.lng)).map((p) => `${p.x},${p.y}`).join(' ');
              return (
                <G key={l.routeId}>
                  <Polyline points={pts} fill="none" stroke="#FFFFFF" strokeWidth={on ? 10 : 8} strokeLinecap="round" strokeLinejoin="round" />
                  <Polyline points={pts} fill="none" stroke={on ? colors.emerald : '#CBD8D0'} strokeWidth={on ? 5 : 3} strokeLinecap="round" strokeLinejoin="round" />
                </G>
              );
            })}
            {stops.map((s) => {
              const p = project(s.lat, s.lng);
              const label = shortName(s.name).toUpperCase();
              const box = { x: p.x + 8, y: p.y - 17, w: label.length * 6.4, h: 12 };
              const clash = placed.some((b) => box.x < b.x + b.w && box.x + box.w > b.x && box.y < b.y + b.h && box.y + box.h > b.y);
              const major = s.count >= 2 && !clash;
              if (major) placed.push(box);
              return (
                <G key={s.id}>
                  <Circle cx={p.x} cy={p.y} r={major ? 5.5 : 4} fill="#FFFFFF" stroke={colors.forest900} strokeWidth={major ? 2.5 : 1.5} />
                  {major && (
                    <SvgText x={p.x + 8} y={p.y - 7} fontSize={10} fontFamily={fonts.semibold} fill="#5B6B63">
                      {label}
                    </SvgText>
                  )}
                </G>
              );
            })}
            {[...buses].sort((a) => (focus && a === focus ? 1 : -1)).map((b) => {
              const p = project(b.lat, b.lng);
              const key = `${b.routeId}-${b.lat}`;
              const isFocus = focus && key === `${focus.routeId}-${focus.lat}`;
              return (
                <G key={key}>
                  {isFocus && <Circle cx={p.x} cy={p.y} r={20} fill={colors.emerald} opacity={0.18} />}
                  <Circle cx={p.x} cy={p.y} r={isFocus ? 13 : 10} fill={isFocus ? colors.emerald : colors.forest700} stroke="#FFFFFF" strokeWidth={2.5} />
                  <Rect x={p.x - 4.5} y={p.y - 5} width={9} height={8} rx={2} fill="#FFFFFF" />
                  <Rect x={p.x - 3} y={p.y - 3.5} width={6} height={3} rx={0.5} fill={isFocus ? colors.emerald : colors.forest700} />
                  {isFocus && (
                    <G>
                      <Rect x={p.x - 42} y={p.y - 44} width={84} height={22} rx={11} fill={colors.text} />
                      <SvgText x={p.x} y={p.y - 29} fontSize={11} fontFamily={fonts.semibold} fill="#FFFFFF" textAnchor="middle">
                        {`${b.code} (${b.minutesToNextStop} min)`}
                      </SvgText>
                    </G>
                  )}
                </G>
              );
            })}
          </Svg>
        )
      )}

      {/* Touch targets for the buses (react-native-svg press handlers don't work on web). */}
      {project &&
        buses.map((b) => {
          const p = project(b.lat, b.lng);
          const key = `${b.routeId}-${b.lat}`;
          return (
            <Pressable
              key={key}
              onPress={() => setSelected(key)}
              accessibilityLabel={`Bus ${b.code} to ${b.terminus}`}
              style={[styles.hit, { left: p.x - 18, top: p.y - 18 }]}
            />
          );
        })}

      <SafeAreaView edges={['top']} style={styles.overlayTop} pointerEvents="box-none">
        <View style={styles.titleRow} pointerEvents="box-none">
          <View style={styles.titlePill}>
            <Text variant="label" color={colors.muted}>
              LINE-UP Transit
            </Text>
            <View style={styles.row}>
              <Text variant="title">Live Kigali Map</Text>
              <View style={styles.estimated}>
                <View style={styles.dot} />
                <Text variant="captionStrong" color={colors.forest700}>
                  Estimated
                </Text>
              </View>
            </View>
          </View>
          <HeaderIconButton icon="bell" label="Notifications" onPress={() => router.push('/notifications')} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All lines" selected={!line} onPress={() => setLine(null)} />
          {codes.map((c) => (
            <Chip key={c} label={c} selected={line === c} onPress={() => { setLine(c); setSelected(null); }} />
          ))}
        </ScrollView>
      </SafeAreaView>

      {data && (
        <View style={styles.sheet}>
          {focus ? (
            <>
              <View style={styles.row}>
                <View style={styles.busTile}>
                  <Text style={styles.busCode}>{focus.code}</Text>
                </View>
                <View style={styles.flex}>
                  <Text variant="label" color={colors.muted}>
                    Next stop · <Text variant="label" color={colors.emerald}>On schedule</Text>
                  </Text>
                  <Text variant="title" numberOfLines={1}>
                    {focus.nextStop.name}
                  </Text>
                </View>
                <View style={styles.eta}>
                  <Text style={styles.etaText}>{focus.minutesToNextStop} min</Text>
                  <Text variant="caption" color={colors.muted}>
                    {focus.plate ?? ''}
                  </Text>
                </View>
              </View>
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <IconTile name="users" size={32} tone="warning" />
                  <View style={styles.flex}>
                    <Text variant="caption" color={colors.muted}>
                      Occupancy
                    </Text>
                    <Text variant="captionStrong">{focus.loadPercent}% booked</Text>
                    <LoadBar percent={focus.loadPercent} />
                  </View>
                </View>
                <View style={styles.stat}>
                  <IconTile name="navigation" size={32} />
                  <View style={styles.flex}>
                    <Text variant="caption" color={colors.muted}>
                      Towards
                    </Text>
                    <Text variant="captionStrong" numberOfLines={1}>
                      {shortName(focus.terminus)}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.row}>
                <Button
                  label="View Route"
                  iconRight="chevron-right"
                  style={styles.flex}
                  onPress={() => router.push({ pathname: '/routes/[id]', params: { id: focus.routeId, from: focus.nextStop.id } })}
                />
                <View style={styles.count}>
                  <Text variant="captionStrong" color={colors.forest700}>
                    {buses.length}
                  </Text>
                  <Text variant="caption" color={colors.muted}>
                    buses
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.row}>
              <Icon name="moon" size={20} color={colors.forest700} />
              <Text variant="body" color={colors.textSecondary} style={styles.flex}>
                No buses on the road right now. Service runs from about 05:00 to 22:30.
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E9F2EC' },
  hit: { position: 'absolute', width: 36, height: 36, borderRadius: 18 },
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  overlayTop: { position: 'absolute', top: 0, left: 0, right: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  titlePill: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: radius.xl, paddingHorizontal: 16, paddingVertical: 8, ...shadow.card },
  estimated: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.emerald50, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.emerald },
  chips: { gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  sheet: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: colors.card, borderRadius: radius.xxl, padding: 16, gap: 14, ...shadow.raised },
  busTile: { width: 50, height: 50, borderRadius: 14, backgroundColor: colors.emerald, alignItems: 'center', justifyContent: 'center' },
  busCode: { fontFamily: fonts.display, fontSize: 14, color: '#FFFFFF' },
  eta: { alignItems: 'flex-end' },
  etaText: { fontFamily: fonts.display, fontSize: 20, color: colors.emerald },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F7FAF8', borderRadius: radius.md, padding: 10, borderWidth: 1, borderColor: colors.divider },
  count: { width: 54, height: 54, borderRadius: radius.lg, backgroundColor: '#F1F5F3', alignItems: 'center', justifyContent: 'center' },
});
