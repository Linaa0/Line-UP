import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Where the API runs during development, worked out automatically so it keeps
 * working when the computer's Wi-Fi address changes:
 * - web preview: the same host as the page (localhost or the LAN address);
 * - phone / emulator: the computer Expo is serving the app from (e.g. 10.100.21.17).
 */
function developmentApiUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `http://${window.location.hostname}:4000/api/v1`;
  }
  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${expoHost || 'localhost'}:4000/api/v1`;
}

/**
 * Base URL of the Line-Up API. Set EXPO_PUBLIC_API_URL only to point at a
 * fixed server (e.g. the hosted API); otherwise it is detected (see above).
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || developmentApiUrl()).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly data: Record<string, unknown> | null,
  ) {
    super(message);
  }

  /** The machine-readable error code, e.g. "PHONE_NOT_VERIFIED". */
  get code(): string | undefined {
    return typeof this.data?.error === 'string' ? this.data.error : undefined;
  }
}

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Set by the i18n provider: the language sent to the API and the app's own network messages. */
let language = 'en';
let messages = {
  cantReach: "Can't reach LINE-UP. Check your internet connection and try again.",
  serverError: 'Something went wrong on our side. Try again in a moment.',
  requestFailed: 'Request failed.',
};

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export function setApiLanguage(lang: string, translated: typeof messages) {
  language = lang;
  messages = translated;
}

function messageFrom(data: unknown, status: number): string {
  const message = (data as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) {
    // Validation errors arrive as "field: message"; show the message part.
    return message.map((m) => String(m).replace(/^[\w.]+: /, '')).join('\n');
  }
  if (typeof message === 'string') return message;
  return status >= 500 ? messages.serverError : messages.requestFailed;
}

export async function api<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'; body?: unknown } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        // The API answers errors and notifications in this language.
        'Accept-Language': language,
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(messages.cantReach, 0, null);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && authToken) onUnauthorized?.();
    throw new ApiError(messageFrom(data, response.status), response.status, data);
  }
  return data as T;
}
