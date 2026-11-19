import { useSyncExternalStore } from 'react';

import { storage } from '@/lib/storage';
import type { StopRef } from '@/lib/types';

/**
 * The From/To selection on "Find a Route", shared with the stop picker
 * screen (which opens as a modal and writes its choice back here).
 */
type State = { from: StopRef | null; to: StopRef | null };

let state: State = { from: null, to: null };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const searchStore = {
  get: () => state,
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    emit();
  },
  swap() {
    state = { from: state.to, to: state.from };
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useSearchSelection() {
  return useSyncExternalStore(searchStore.subscribe, searchStore.get, searchStore.get);
}

/** Recent searches, kept on the device. */
const RECENT_KEY = 'lineup.recentSearches';
export type RecentSearch = { from: StopRef; to: StopRef };

export async function loadRecent(): Promise<RecentSearch[]> {
  try {
    return JSON.parse((await storage.get(RECENT_KEY)) ?? '[]') as RecentSearch[];
  } catch {
    return [];
  }
}

export async function pushRecent(search: RecentSearch) {
  const list = (await loadRecent()).filter((r) => !(r.from.id === search.from.id && r.to.id === search.to.id));
  await storage.set(RECENT_KEY, JSON.stringify([search, ...list].slice(0, 5)));
}

export async function clearRecent() {
  await storage.remove(RECENT_KEY);
}

/** Who opened the stop picker, so it knows where to write the chosen stop. */
let pickerTarget: ((stop: StopRef) => void) | null = null;
export function setPickerTarget(target: (stop: StopRef) => void) {
  pickerTarget = target;
}
export function choosePickedStop(stop: StopRef) {
  pickerTarget?.(stop);
  pickerTarget = null;
}
