import { Platform } from 'react-native';

/** The native animation driver doesn't exist in the web preview; use it everywhere else. */
export const NATIVE_DRIVER = Platform.OS !== 'web';
