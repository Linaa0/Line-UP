import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';

import { colors } from '@/constants/theme';

/** Outline icon set matching the designs (Feather, 2px stroke). */
export type IconName = ComponentProps<typeof Feather>['name'];

type IconProps = {
  name: IconName;
  size?: number;
  color?: ComponentProps<typeof Feather>['color'];
};

export function Icon({ name, size = 20, color = colors.text }: IconProps) {
  return <Feather name={name} size={size} color={color} />;
}
