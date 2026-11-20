import { useState } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { colors, fonts, radius } from '@/constants/theme';
import { type Lang, LANGUAGES, useI18n } from '@/i18n';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { User } from '@/lib/types';

/** Changes the app language and, when logged in, saves it to the account. */
export function useChangeLanguage() {
  const { setLang } = useI18n();
  const { user, setUser } = useAuth();
  return async (lang: Lang) => {
    setLang(lang);
    if (!user) return;
    try {
      setUser(await api<User>('/users/me/preferences', { method: 'PATCH', body: { language: lang } }));
    } catch {
      // The app still switches language; the account keeps its previous choice until the next save.
    }
  };
}

/** The four languages as selectable rows, each shown in its own language. */
export function LanguageList({ onChosen }: { onChosen?: () => void }) {
  const { lang } = useI18n();
  const change = useChangeLanguage();
  return (
    <View style={styles.list}>
      {LANGUAGES.map((l) => {
        const on = l.code === lang;
        return (
          <Pressable
            key={l.code}
            onPress={async () => {
              await change(l.code);
              onChosen?.();
            }}
            style={({ pressed }) => [styles.row, on && styles.rowOn, pressed && styles.pressed]}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            accessibilityLabel={`${l.name} (${l.english})`}
          >
            <View style={[styles.code, on && styles.codeOn]}>
              <Text style={[styles.codeText, on && { color: colors.mint }]}>{l.code.toUpperCase()}</Text>
            </View>
            <View style={styles.flex}>
              <Text variant="bodyStrong">{l.name}</Text>
              {l.name !== l.english && (
                <Text variant="caption" color={colors.textSecondary}>
                  {l.english}
                </Text>
              )}
            </View>
            {on && <Icon name="check-circle" size={20} color={colors.emerald} />}
          </Pressable>
        );
      })}
    </View>
  );
}

/** Bottom sheet with the language list. */
export function LanguageSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text variant="title" align="center">
        {t('language.title')}
      </Text>
      <Text variant="caption" color={colors.textSecondary} align="center">
        {t('language.subtitle')}
      </Text>
      <LanguageList onChosen={onClose} />
    </BottomSheet>
  );
}

/** Small "globe + code" button that opens the language sheet (used on dark backgrounds). */
export function LanguageButton({ style, tone = 'light' }: { style?: ViewStyle; tone?: 'light' | 'dark' }) {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const fg = tone === 'light' ? '#FFFFFF' : colors.forest900;
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[styles.button, tone === 'light' ? styles.buttonLight : styles.buttonDark, style]}
        accessibilityRole="button"
        accessibilityLabel={t('language.title')}
      >
        <Icon name="globe" size={14} color={tone === 'light' ? colors.mint : colors.forest700} />
        <Text style={[styles.buttonText, { color: fg }]}>{lang.toUpperCase()}</Text>
        <Icon name="chevron-down" size={14} color={fg} />
      </Pressable>
      <LanguageSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { gap: 8, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.lg, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card },
  rowOn: { borderColor: colors.forest700, backgroundColor: '#F3FBF7' },
  pressed: { opacity: 0.8 },
  code: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.emerald50, alignItems: 'center', justifyContent: 'center' },
  codeOn: { backgroundColor: colors.forest900 },
  codeText: { fontFamily: fonts.heading, fontSize: 13, color: colors.forest700 },
  button: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radius.full, paddingHorizontal: 11, paddingVertical: 7, borderWidth: 1 },
  buttonLight: { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.22)' },
  buttonDark: { backgroundColor: colors.mint100, borderColor: colors.mint100 },
  buttonText: { fontFamily: fonts.semibold, fontSize: 12.5 },
});
