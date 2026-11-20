import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius } from '@/constants/theme';
import { useT } from '@/i18n';

type TextFieldProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: IconName;
  /** Content before the input, e.g. the +250 country prefix. */
  prefix?: ReactNode;
  /** Adds a show/hide toggle and hides the text. */
  password?: boolean;
};

export function TextField({
  label,
  hint,
  error,
  iconLeft,
  prefix,
  password = false,
  multiline,
  style,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const t = useT();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(password);

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text variant="bodyStrong" style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.box,
          multiline && styles.multiline,
          focused && styles.focused,
          !!error && styles.errored,
        ]}
      >
        {prefix && <View style={styles.prefix}>{prefix}</View>}
        {iconLeft && <Icon name={iconLeft} size={18} color={colors.muted} />}
        <TextInput
          placeholderTextColor={colors.muted}
          secureTextEntry={hidden}
          multiline={multiline}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? t('auth.showPassword') : t('auth.hidePassword')}
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
          >
            <Icon name={hidden ? 'eye' : 'eye-off'} size={18} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {(error || hint) && (
        <Text variant="caption" color={error ? colors.danger : colors.muted} style={styles.hint}>
          {error ?? hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  label: { fontSize: 13.5, color: '#1F2937' },
  box: {
    minHeight: 50,
    borderRadius: radius.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  multiline: { minHeight: 110, alignItems: 'flex-start', paddingVertical: 12 },
  focused: { borderColor: colors.emerald },
  errored: { borderColor: colors.danger },
  prefix: {
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  // outlineWidth: the field draws its own focus ring, so hide the browser's in the web preview.
  input: { flex: 1, fontSize: 15, fontFamily: fonts.body, color: colors.text, paddingVertical: 12, outlineWidth: 0 },
  inputMultiline: { paddingVertical: 0, textAlignVertical: 'top' },
  hint: { marginTop: -1 },
});
