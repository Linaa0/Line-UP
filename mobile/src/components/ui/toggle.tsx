import { Switch } from 'react-native';

import { colors } from '@/constants/theme';

type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
};

/** Native switch in Line-Up colors (Settings screen). */
export function Toggle({ value, onValueChange, accessibilityLabel }: ToggleProps) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ true: colors.emerald, false: '#D6DFDA' }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#D6DFDA"
    />
  );
}
