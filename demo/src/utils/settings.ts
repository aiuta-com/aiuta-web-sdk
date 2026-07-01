/**
 * Demo page settings shared between components (the gear menu renders in two
 * places — header and pinned badges) and persisted across reloads. Exposed
 * as a tiny external store for React's useSyncExternalStore.
 */

const FILTER_KEY = 'aiuta-demo-filter-single-item-try-on'

type Listener = () => void
const listeners = new Set<Listener>()

// A `filter` query param (0/1) takes precedence over the stored preference —
// the admin panel's test link opens with `filter=0` to show the full catalog.
const filterParam = new URLSearchParams(window.location.search).get('filter')

let filterEnabled = false
if (filterParam === '0' || filterParam === '1') {
  filterEnabled = filterParam === '1'
} else {
  try {
    filterEnabled = localStorage.getItem(FILTER_KEY) === '1'
  } catch {
    // Storage can be unavailable (private mode etc.) — default to off
  }
}

export const isTryOnFilterEnabled = (): boolean => filterEnabled

export const setTryOnFilterEnabled = (value: boolean): void => {
  filterEnabled = value
  try {
    localStorage.setItem(FILTER_KEY, value ? '1' : '0')
  } catch {
    // In-memory state still works for the session
  }
  listeners.forEach((listener) => listener())
}

export const subscribeTryOnFilter = (listener: Listener): (() => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
