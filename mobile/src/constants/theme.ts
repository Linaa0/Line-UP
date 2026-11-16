/**
 * Line-Up design tokens.
 *
 * Colors were sampled from the Figma exports in
 * design/figma-references/individual-screens/ and are documented in
 * design/design-system/colors.md. Update both places together.
 */
export const colors = {
  // Brand greens
  forest900: '#0E3924', // primary buttons, dark surfaces
  forest700: '#0D5C3A', // primary button (auth), active tab
  forest600: '#0B5536', // splash / welcome background
  forest950: '#002513', // gradient end on dark screens
  emerald: '#059669', // live status, success, map route
  emerald50: '#E7F8EF', // icon tiles
  mint: '#70FBBE', // bright CTA on dark backgrounds
  mint100: '#CBFFE8', // pills / badges
  mint200: '#C4F1DC', // hero cards (queue number)

  // Neutrals
  background: '#F4FAF6',
  card: '#FFFFFF',
  border: '#E3EEE8',
  text: '#111827',
  textSecondary: '#4B5563',
  muted: '#94A3B8',

  // Feedback
  danger: '#DC2626',
  danger50: '#FEF2F2',
  warning: '#D97706',
  warning50: '#FEF6E7',

  // Payment brands
  momo: '#FFCB05',
  airtel: '#E4312B',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  screen: 18, // horizontal screen padding used across the designs
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16, // buttons, inputs
  xl: 18, // cards
  full: 999,
} as const;

/** Type scale read from the designs (sizes in dp). Fonts: system until brand fonts are confirmed. */
export const typography = {
  display: { fontSize: 30, fontWeight: '800' },
  h1: { fontSize: 24, fontWeight: '800' },
  h2: { fontSize: 20, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyStrong: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 12.5, fontWeight: '400' },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.1, textTransform: 'uppercase' },
  button: { fontSize: 16, fontWeight: '600' },
} as const;
