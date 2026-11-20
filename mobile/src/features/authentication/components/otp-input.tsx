import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius } from '@/constants/theme';

const KEYS = [
  ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
] as const;

/** Six code boxes (design 02-02). */
export function OtpBoxes({ value, length = 6, error }: { value: string; length?: number; error?: boolean }) {
  return (
    <View style={styles.boxes} accessibilityLabel={`Code: ${value.split('').join(' ')}`}>
      {Array.from({ length }, (_, i) => {
        const active = i === value.length;
        return (
          <View key={i} style={[styles.box, active && styles.boxActive, error && styles.boxError]}>
            <Text style={styles.digit}>{value[i] ?? (active ? '|' : '')}</Text>
          </View>
        );
      })}
    </View>
  );
}

/** On-screen number pad, as in the design, so the code can be typed without the system keyboard. */
export function NumberPad({ onKey, onDelete, deleteLabel }: { onKey: (digit: string) => void; onDelete: () => void; deleteLabel: string }) {
  return (
    <View style={styles.pad}>
      {KEYS.map(([digit, letters]) => (
        <Pressable key={digit} onPress={() => onKey(digit)} style={({ pressed }) => [styles.key, pressed && styles.keyPressed]} accessibilityLabel={digit}>
          <Text style={styles.keyDigit}>{digit}</Text>
          {!!letters && <Text style={styles.keyLetters}>{letters}</Text>}
        </Pressable>
      ))}
      <View style={styles.keyBlank} />
      <Pressable onPress={() => onKey('0')} style={({ pressed }) => [styles.key, pressed && styles.keyPressed]} accessibilityLabel="0">
        <Text style={styles.keyDigit}>0</Text>
      </Pressable>
      <Pressable onPress={onDelete} style={[styles.keyBlank, styles.del]} accessibilityLabel={deleteLabel}>
        <Icon name="delete" size={22} color={colors.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  boxes: { flexDirection: 'row', gap: 9, justifyContent: 'space-between' },
  box: {
    flex: 1,
    aspectRatio: 0.92,
    maxWidth: 56,
    borderRadius: radius.md + 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: { borderColor: colors.emerald, borderWidth: 2 },
  boxError: { borderColor: colors.danger },
  digit: { fontFamily: fonts.heading, fontSize: 22, color: colors.text },
  pad: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between', backgroundColor: '#ECF2EF', padding: 10, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  key: { width: '31.5%', height: 50, borderRadius: 10, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DFE7E3' },
  keyPressed: { backgroundColor: colors.emerald50 },
  keyBlank: { width: '31.5%', height: 50 },
  del: { alignItems: 'center', justifyContent: 'center' },
  keyDigit: { fontFamily: fonts.medium, fontSize: 20, color: colors.text, lineHeight: 24 },
  keyLetters: { fontFamily: fonts.medium, fontSize: 9, letterSpacing: 1.5, color: colors.muted },
});
