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

// A `filter` query param outranks the stored preferences. It's a bitmask:
//   0 — both filters off (the admin panel's test link)
//   1 — single items only          2 — outfits only          3 — both
const FILTER_BIT_SINGLE = 1
const FILTER_BIT_OUTFITS = 2

const filterParam = new URLSearchParams(window.location.search).get('filter')
const filterMask = filterParam !== null && /^[0-3]$/.test(filterParam) ? Number(filterParam) : null

const initial = (key: string, bit: number): boolean => {
  if (filterMask !== null) return (filterMask & bit) !== 0
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

// Every toggle stamps the current combined state into the address, so the
// URL always shares/reloads into exactly what's on screen (and a stale
// override from the original navigation can't win again).
const syncAddress = (): void => {
  const mask =
    (filterEnabled ? FILTER_BIT_SINGLE : 0) | (outfitsFilterEnabled ? FILTER_BIT_OUTFITS : 0)
  const url = new URL(window.location.href)
  url.searchParams.set('filter', String(mask))
  window.history.replaceState(null, '', url.toString())
}

let filterEnabled = initial(FILTER_KEY, FILTER_BIT_SINGLE)
let outfitsFilterEnabled = initial(OUTFITS_FILTER_KEY, FILTER_BIT_OUTFITS)

export const isTryOnFilterEnabled = (): boolean => filterEnabled

export const setTryOnFilterEnabled = (value: boolean): void => {
  filterEnabled = value
  persist(FILTER_KEY, value)
  syncAddress()
  notify()
}

export const isOutfitsFilterEnabled = (): boolean => outfitsFilterEnabled

export const setOutfitsFilterEnabled = (value: boolean): void => {
  outfitsFilterEnabled = value
  persist(OUTFITS_FILTER_KEY, value)
  syncAddress()
  notify()
}

// One listener set serves both toggles — a subscriber just re-reads its
// snapshot on any settings change.
export const subscribeTryOnFilter = (listener: Listener): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
