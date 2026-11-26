import Svg, { ClipPath, Defs, Ellipse, G, Line, Polygon, Rect } from 'react-native-svg';

/**
 * Design 01-02 illustration: a green city bus at a stop on a round plaza,
 * two school children waiting, white towers behind. Isometric, drawn as vectors.
 */
type P = [number, number];

const pts = (list: P[]) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const lerp = (a: P, b: P, u: number): P => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
const up = (p: P, h: number): P => [p[0], p[1] - h];

/** Corners of an isometric box from its front (lowest) corner. */
function box(front: P, wx: number, wy: number) {
  const right: P = [front[0] + wx, front[1] - wx / 2];
  const left: P = [front[0] - wy, front[1] - wy / 2];
  const back: P = [front[0] + wx - wy, front[1] - wx / 2 - wy / 2];
  return { front, right, left, back };
}

/** White towers behind the plaza: front corner, widths, height. */
const TOWERS: { f: P; wx: number; wy: number; h: number }[] = [
  { f: [152, 140], wx: 24, wy: 24, h: 111 },
  { f: [110, 144], wx: 26, wy: 20, h: 107 },
  { f: [196, 144], wx: 22, wy: 26, h: 97 },
  { f: [230, 158], wx: 26, wy: 22, h: 116 },
  { f: [72, 162], wx: 22, wy: 22, h: 112 },
  { f: [258, 168], wx: 18, wy: 18, h: 88 },
];

// The bus: long side runs front → left, the windscreen faces front → right.
const BUS = box([215, 200], 44, 150);
const BUS_H = 62;
const side = (u: number, v: number): P => up(lerp(BUS.front, BUS.left, u), v * BUS_H);
const nose = (u: number, v: number): P => up(lerp(BUS.front, BUS.right, u), v * BUS_H);
const sideQuad = (u0: number, u1: number, v0: number, v1: number) => pts([side(u0, v0), side(u1, v0), side(u1, v1), side(u0, v1)]);
const noseQuad = (u0: number, u1: number, v0: number, v1: number) => pts([nose(u0, v0), nose(u1, v0), nose(u1, v1), nose(u0, v1)]);

// Road and pavement bands along the bus, clipped to the plaza.
const C: P = [162, 151.5];
const D: P = [0.894, 0.447];
const N: P = [0.447, -0.894];
const band = (from: number, to: number): string => {
  const at = (t: number, o: number): P => [C[0] + D[0] * t + N[0] * o, C[1] + D[1] * t + N[1] * o];
  return pts([at(-220, from), at(220, from), at(220, to), at(-220, to)]);
};
const onPavement = (t: number): P => [C[0] + D[0] * t - N[0] * 57, C[1] + D[1] * t - N[1] * 57];

function Child({ at, scale = 1, skirt = false, wave = false }: { at: P; scale?: number; skirt?: boolean; wave?: boolean }) {
  const [x, y] = at;
  const skin = '#8B5A3C';
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <Ellipse cx={0} cy={1} rx={9} ry={3} fill="rgba(0,0,0,0.13)" />
      <Rect x={-5} y={-13} width={3.6} height={12} rx={1.5} fill={skin} />
      <Rect x={1.4} y={-13} width={3.6} height={12} rx={1.5} fill={skin} />
      <Rect x={-6} y={-2} width={5} height={3} rx={1.2} fill="#1E2B24" />
      <Rect x={1} y={-2} width={5} height={3} rx={1.2} fill="#1E2B24" />
      {skirt ? (
        <Polygon points="-7,-20 7,-20 9,-11 -9,-11" fill="#2F6E4E" />
      ) : (
        <Rect x={-6.5} y={-20} width={13} height={8} rx={1.5} fill="#2F6E4E" />
      )}
      <Rect x={-11} y={-31} width={5} height={11} rx={2} fill="#2F6E4E" />
      <Rect x={-7} y={-33} width={14} height={15} rx={4} fill="#FFFFFF" stroke="#DCE4DF" strokeWidth={0.8} />
      <Rect x={-9.5} y={-31} width={3} height={11} rx={1.5} fill={skin} />
      {wave ? (
        <G>
          <Polygon points="6.5,-31 9.5,-31 13,-44 10,-45" fill={skin} />
          <Ellipse cx={11.8} cy={-46} rx={2.2} ry={2.2} fill={skin} />
        </G>
      ) : (
        <Rect x={6.5} y={-31} width={3} height={11} rx={1.5} fill={skin} />
      )}
      <Ellipse cx={0} cy={-39} rx={6} ry={6.3} fill={skin} />
      <Ellipse cx={0} cy={-42.5} rx={6.4} ry={3.8} fill="#231A15" />
      {skirt && <Ellipse cx={5.6} cy={-40} rx={2.2} ry={2.8} fill="#231A15" />}
    </G>
  );
}

export function BusStopIllustration({ width }: { width: number }) {
  const sideColor = '#5E8E6F';
  const noseColor = '#79A988';
  const dark = '#2E4A3C';
  const wheel = (u: number) => {
    const [x, y] = side(u, 0.06);
    return (
      <G key={u} transform={`rotate(-27 ${x} ${y})`}>
        <Ellipse cx={x} cy={y} rx={8.5} ry={9.5} fill="#1F2A24" />
        <Ellipse cx={x} cy={y} rx={3.4} ry={3.8} fill="#A3AEA8" />
      </G>
    );
  };

  return (
    <Svg width={width} height={width * (250 / 320)} viewBox="0 0 320 250">
      <Defs>
        <ClipPath id="plazaClip">
          <Ellipse cx={160} cy={185} rx={132} ry={62} />
        </ClipPath>
      </Defs>

      {/* Towers */}
      {TOWERS.map(({ f, wx, wy, h }) => {
        const b = box(f, wx, wy);
        return (
          <G key={`${f[0]}-${f[1]}`}>
            <Polygon points={pts([b.front, b.left, up(b.left, h), up(b.front, h)])} fill="#F4F7F5" />
            <Polygon points={pts([b.front, b.right, up(b.right, h), up(b.front, h)])} fill="#DCE3DF" />
            <Polygon points={pts([up(b.front, h), up(b.right, h), up(b.back, h), up(b.left, h)])} fill="#FFFFFF" />
            {[0.25, 0.5, 0.75].map((u) => {
              const a = lerp(b.front, b.left, u);
              return <Line key={u} x1={a[0]} y1={a[1] - 6} x2={a[0]} y2={a[1] - h + 8} stroke="#E4EAE6" strokeWidth={1} />;
            })}
          </G>
        );
      })}

      {/* Plaza */}
      <Ellipse cx={160} cy={197} rx={132} ry={62} fill="#2F6E4E" />
      <Rect x={28} y={185} width={264} height={12} fill="#2F6E4E" />
      <Ellipse cx={160} cy={185} rx={132} ry={62} fill="#4F8B67" />
      <G clipPath="url(#plazaClip)">
        <Polygon points={band(40, -40)} fill="#DDE3E0" />
        <Polygon points={band(-40, -76)} fill="#F6F8F7" />
        <Polygon points={band(-40, -43)} fill="#C3CDC8" />
        <Polygon points={band(46, 40)} fill="#C3CDC8" />
      </G>

      {/* Shrubs on the far side */}
      <Ellipse cx={272} cy={186} rx={11} ry={8} fill="#3E7A57" />
      <Ellipse cx={286} cy={179} rx={8} ry={6} fill="#2F6E4E" />
      <Ellipse cx={258} cy={194} rx={7} ry={5} fill="#3E7A57" />

      {/* Bus */}
      <Polygon points={pts([BUS.front, BUS.right, BUS.back, BUS.left].map(([x, y]) => [x + 5, y + 5] as P))} fill="rgba(0,0,0,0.14)" />
      <Polygon points={sideQuad(0, 1, 0, 1)} fill={sideColor} />
      <Polygon points={noseQuad(0, 1, 0, 1)} fill={noseColor} />
      <Polygon points={pts([up(BUS.front, BUS_H), up(BUS.right, BUS_H), up(BUS.back, BUS_H), up(BUS.left, BUS_H)])} fill="#93BFA1" />
      <Polygon
        points={pts([
          up(lerp(BUS.front, BUS.back, 0.12), BUS_H),
          up(lerp(BUS.right, BUS.left, 0.06), BUS_H),
          up(lerp(BUS.back, BUS.front, 0.12), BUS_H),
          up(lerp(BUS.left, BUS.right, 0.06), BUS_H),
        ])}
        fill="#A9CDB4"
      />
      <Polygon points={sideQuad(0, 1, 0, 0.2)} fill="#4C7A5C" />
      <Polygon points={sideQuad(0, 1, 0.4, 0.44)} fill="#EAF2ED" />
      <Polygon points={sideQuad(0.03, 0.1, 0.06, 0.86)} fill={dark} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const u0 = 0.14 + i * 0.118;
        return (
          <G key={i}>
            <Polygon points={sideQuad(u0, u0 + 0.094, 0.52, 0.86)} fill={dark} />
            <Polygon points={sideQuad(u0 + 0.01, u0 + 0.035, 0.6, 0.82)} fill="#5B7A6A" opacity={0.6} />
          </G>
        );
      })}
      <Polygon points={noseQuad(0.08, 0.92, 0.5, 0.88)} fill={dark} />
      <Polygon points={noseQuad(0.14, 0.3, 0.58, 0.84)} fill="#5B7A6A" opacity={0.5} />
      <Polygon points={noseQuad(0.2, 0.8, 0.9, 0.97)} fill={dark} />
      <Polygon points={noseQuad(0.3, 0.7, 0.92, 0.955)} fill="#F4D35E" />
      <Polygon points={noseQuad(0.08, 0.22, 0.2, 0.28)} fill="#F6F8F7" />
      <Polygon points={noseQuad(0.78, 0.92, 0.2, 0.28)} fill="#F6F8F7" />
      <Polygon points={noseQuad(0.3, 0.7, 0.18, 0.3)} fill="#4C7A5C" />
      <Polygon points={noseQuad(0, 1, 0, 0.09)} fill="#3B5F48" />
      {wheel(0.2)}
      {wheel(0.78)}

      {/* Bus-stop sign */}
      {(() => {
        const [x, y] = onPavement(-92);
        return (
          <G>
            <Ellipse cx={x} cy={y + 1} rx={5} ry={2} fill="rgba(0,0,0,0.13)" />
            <Rect x={x - 1.2} y={y - 74} width={2.4} height={74} fill="#5D6B64" />
            <Rect x={x - 10} y={y - 92} width={20} height={24} rx={3} fill="#2F6E4E" />
            <Rect x={x - 5} y={y - 88} width={10} height={12} rx={2.5} fill="#FFFFFF" />
            <Rect x={x - 3.5} y={y - 85.5} width={7} height={4} rx={1} fill="#2F6E4E" />
            <Rect x={x - 4} y={y - 76} width={2.5} height={3} rx={1} fill="#FFFFFF" />
            <Rect x={x + 1.5} y={y - 76} width={2.5} height={3} rx={1} fill="#FFFFFF" />
          </G>
        );
      })()}

      {/* Children waiting on the pavement */}
      <Child at={onPavement(-46)} wave />
      <Child at={onPavement(-14)} scale={0.9} skirt />
    </Svg>
  );
}
