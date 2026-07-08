/**
 * Demo page settings shared between components (the gear menu renders in two
 * places — header and pinned badges) and persisted across reloads. Exposed
 * as a tiny external store for React's useSyncExternalStore.
 */

const FILTER_KEY = 'aiuta-demo-filter-single-item-try-on'
const OUTFITS_FILTER_KEY = 'aiuta-demo-filter-outfits'

type Listener = () => void
const listeners = new Set<Listener>()
const notify = () => listeners.forEach((listener) => listener())

// A `filter` query param (0/1) takes precedence over the stored preferences
// and forces BOTH filters — the admin panel's test link opens with `filter=0`
// to show the full catalog and every outfit.
const filterParam = new URLSearchParams(window.location.search).get('filter')

const initial = (key: string): boolean => {
  if (filterParam === '0' || filterParam === '1') return filterParam === '1'
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    // Storage can be unavailable (private mode etc.) — default to off
    return false
  }
}

const persist = (key: string, value: boolean): void => {
  try {
    localStorage.setItem(key, value ? '1' : '0')
  } catch {
    // In-memory state still works for the session
  }
}

let filterEnabled = initial(FILTER_KEY)
let outfitsFilterEnabled = initial(OUTFITS_FILTER_KEY)

export const isTryOnFilterEnabled = (): boolean => filterEnabled

export const setTryOnFilterEnabled = (value: boolean): void => {
  filterEnabled = value
  persist(FILTER_KEY, value)
  notify()
}

export const isOutfitsFilterEnabled = (): boolean => outfitsFilterEnabled

export const setOutfitsFilterEnabled = (value: boolean): void => {
  outfitsFilterEnabled = value
  persist(OUTFITS_FILTER_KEY, value)
  notify()
}

// One listener set serves both toggles — a subscriber just re-reads its
// snapshot on any settings change.
export const subscribeTryOnFilter = (listener: Listener): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
