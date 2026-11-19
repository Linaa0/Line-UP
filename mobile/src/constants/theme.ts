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
  forest700: '#0D5C3A', // active tab, links on light
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
  divider: '#EEF3F0',
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

/** Font families loaded in src/app/_layout.tsx. */
export const fonts = {
  display: 'PlusJakartaSans_800ExtraBold',
  heading: 'PlusJakartaSans_700Bold',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
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
  xxl: 24, // hero cards
  full: 999,
} as const;

/** Type scale read from the designs (sizes in dp). */
export const typography = {
  display: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, letterSpacing: -0.6 },
  h1: { fontFamily: fonts.display, fontSize: 25, lineHeight: 31, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
  title: { fontFamily: fonts.heading, fontSize: 17, lineHeight: 23 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21 },
  caption: { fontFamily: fonts.body, fontSize: 12.5, lineHeight: 17 },
  captionStrong: { fontFamily: fonts.semibold, fontSize: 12.5, lineHeight: 17 },
  label: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 1.1, textTransform: 'uppercase' },
  button: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 20 },
} as const;

export const shadow = {
  card: {
    shadowColor: '#0E3924',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#0E3924',
    shadowOpacity: 0.16,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
} as const;
