import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

/**
 * Design 01-01 (bottom half): Kigali in greens — Mount Kigali, the city
 * towers, the Convention Centre dome, trees, a winding road and the brand wave.
 * Drawn as vectors so it stays sharp on every screen. Anchored to the bottom.
 */
export const SCENE_RATIO = 420 / 390;

/** [x, top, width] of each tower; all stand on y = 262. */
const TOWERS: [number, number, number][] = [
  [6, 214, 15],
  [24, 202, 14],
  [41, 218, 17],
  [62, 206, 12],
  [78, 222, 15],
  [146, 206, 14],
  [163, 176, 19],
  [186, 156, 16],
  [205, 190, 18],
  [226, 124, 24],
  [254, 168, 18],
  [275, 146, 22],
  [300, 182, 15],
];
const TOWER_FILLS = ['#3FB174', '#2F9C63', '#4ABF80'];
const GROUND = 262;

/** Tree clumps along the city edge and the foreground (deterministic "random"). */
const TREES = Array.from({ length: 34 }, (_, i) => {
  const x = i * 12 - 6 + ((i * 37) % 7);
  const y = 258 + ((i * 53) % 13);
  const r = 7 + ((i * 29) % 6);
  return { x, y, r, fill: ['#13693A', '#1E8A4D', '#2A9C5A'][i % 3] };
});

/** Where a point of the drawing (viewBox units) lands, in px from the top of a width × height box. */
export function sceneY(y: number, width: number, height: number) {
  const scale = Math.max(width / 390, height / 420);
  return height - (420 - y) * scale;
}

export function KigaliScene({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 390 420" preserveAspectRatio="xMidYMax slice">
      <Defs>
        <LinearGradient id="kgWave" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#7BEFB4" />
          <Stop offset="0.55" stopColor="#4FD08F" />
          <Stop offset="1" stopColor="#2FB574" />
        </LinearGradient>
        <LinearGradient id="kgGround" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#1C7C47" />
          <Stop offset="1" stopColor="#0F5E35" />
        </LinearGradient>
      </Defs>

      {/* Clouds */}
      <G fill="#8DE0AE" opacity={0.26}>
        <Circle cx={22} cy={40} r={17} />
        <Circle cx={48} cy={30} r={22} />
        <Circle cx={76} cy={42} r={15} />
        <Rect x={6} y={40} width={86} height={17} rx={8.5} />
        <Circle cx={322} cy={22} r={15} />
        <Circle cx={347} cy={12} r={20} />
        <Circle cx={372} cy={24} r={14} />
        <Rect x={306} y={22} width={84} height={16} rx={8} />
        <Circle cx={296} cy={96} r={9} />
        <Circle cx={310} cy={90} r={12} />
        <Rect x={286} y={96} width={40} height={9} rx={4.5} />
      </G>

      {/* Mount Kigali with its mast */}
      <Path
        d="M-10 196 C 40 156, 82 100, 135 92 C 176 87, 214 124, 258 154 C 290 172, 330 180, 400 182 L400 270 L-10 270 Z"
        fill="#2A9A5E"
        opacity={0.6}
      />
      <Line x1={135} y1={62} x2={135} y2={92} stroke="#2A9A5E" strokeWidth={2} />
      <Line x1={130} y1={70} x2={140} y2={70} stroke="#2A9A5E" strokeWidth={1.5} />
      <Path d="M-10 222 C 30 192, 92 186, 152 212 L152 280 L-10 280 Z" fill="#23874F" />

      {/* Towers with lit windows */}
      {TOWERS.map(([x, top, w], i) => {
        const rows = Math.floor((GROUND - top - 8) / 8);
        const cols = Math.max(1, Math.floor((w - 4) / 5));
        return (
          <G key={x}>
            <Rect x={x} y={top} width={w} height={GROUND - top} fill={TOWER_FILLS[i % 3]} />
            <Rect x={x + w * 0.72} y={top} width={w * 0.28} height={GROUND - top} fill="#25875A" opacity={0.55} />
            {Array.from({ length: rows }, (_, r) =>
              Array.from({ length: cols }, (_, c) => (
                <Rect key={`${r}-${c}`} x={x + 2.5 + c * 5} y={top + 5 + r * 8} width={2.4} height={3.4} fill="#C8F5DA" opacity={0.6} />
              )),
            )}
          </G>
        );
      })}
      <Line x1={238} y1={104} x2={238} y2={124} stroke="#4ABF80" strokeWidth={2} />

      {/* Kigali Convention Centre dome */}
      <G>
        {[48, 46, 42, 36, 28, 17].map((rx, tier) => {
          const cy = 254 - tier * 10;
          return (
            <G key={tier}>
              <Rect x={350 - rx} y={cy - 8} width={rx * 2} height={9} fill={tier % 2 ? '#9AD9B3' : '#D8F4E2'} />
              <Ellipse cx={350} cy={cy - 8} rx={rx} ry={5.5} fill={tier % 2 ? '#B9E8CB' : '#EAFBF0'} />
            </G>
          );
        })}
        <Ellipse cx={350} cy={190} rx={8} ry={5} fill="#EAFBF0" />
        <Line x1={350} y1={176} x2={350} y2={186} stroke="#EAFBF0" strokeWidth={1.5} />
      </G>

      {/* Ground and trees */}
      <Rect x={-10} y={GROUND - 4} width={410} height={140} fill="url(#kgGround)" />
      {TREES.map((t) => (
        <Circle key={`${t.x}-${t.y}`} cx={t.x} cy={t.y} r={t.r} fill={t.fill} />
      ))}

      {/* Winding road */}
      <Path d="M -24 360 C 70 344, 140 312, 222 302 C 292 294, 352 296, 412 306" stroke="#0B4A2B" strokeWidth={30} fill="none" />
      <Path d="M -24 360 C 70 344, 140 312, 222 302 C 292 294, 352 296, 412 306" stroke="#BDEFCF" strokeWidth={1.5} strokeDasharray="9 9" fill="none" />
      <Circle cx={8} cy={328} r={20} fill="#0F6034" />
      <Circle cx={38} cy={334} r={15} fill="#13693A" />
      <Circle cx={372} cy={334} r={18} fill="#0F6034" />

      {/* Brand wave */}
      <Path d="M0 366 C 92 338, 192 352, 262 372 C 320 389, 360 384, 390 374 L390 420 L0 420 Z" fill="url(#kgWave)" />
      <Path d="M0 390 C 104 372, 226 396, 390 390 L390 420 L0 420 Z" fill="#0A5A33" />
    </Svg>
  );
}
