import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { api, ApiError } from '@/lib/api';

type Options = {
  /** Reload whenever the screen comes back into focus. */
  refreshOnFocus?: boolean;
  /** Reload every N milliseconds while the screen is focused (live data). */
  pollMs?: number;
};

/** Loads `path` from the API. Pass `null` to skip loading (e.g. while params are missing). */
export function useApi<T>(path: string | null, { refreshOnFocus = false, pollMs }: Options = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** The path the current data/error belongs to; `loading` until it matches. */
  const [settledPath, setSettledPath] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const latest = useRef(0);

  /** Starts a request; results are applied only if it is still the latest one. */
  const request = useCallback((p: string) => {
    const id = ++latest.current;
    return api<T>(p).then(
      (result) => {
        if (id !== latest.current) return;
        setData(result);
        setError(null);
        setSettledPath(p);
        setRefreshing(false);
      },
      (e: unknown) => {
        if (id !== latest.current) return;
        setError(e instanceof ApiError ? e.message : String(e));
        setSettledPath(p);
        setRefreshing(false);
      },
    );
  }, []);

  const fetchNow = useCallback(async () => {
    if (path) await request(path);
  }, [path, request]);

  useEffect(() => {
    if (path) void request(path);
  }, [path, request]);

  const first = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (refreshOnFocus && !first.current) void fetchNow();
      first.current = false;
      if (!pollMs) return undefined;
      const timer = setInterval(() => void fetchNow(), pollMs);
      return () => clearInterval(timer);
    }, [fetchNow, refreshOnFocus, pollMs]),
  );

  const refresh = useCallback(() => {
    setRefreshing(true);
    return fetchNow();
  }, [fetchNow]);

  return {
    data,
    error,
    loading: !!path && settledPath !== path,
    refreshing,
    refresh,
    reload: fetchNow,
    setData,
  };
}
