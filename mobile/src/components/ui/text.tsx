import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography } from '@/constants/theme';

type Variant = keyof typeof typography;

type TextProps = RNTextProps & {
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
};

/** Text with the Line-Up type scale applied. */
export function Text({ variant = 'body', color = colors.text, align, style, ...rest }: TextProps) {
  return <RNText style={[typography[variant], { color, textAlign: align }, style]} {...rest} />;
}
