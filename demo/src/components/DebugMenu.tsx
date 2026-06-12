import React, { useEffect, useRef, useState } from 'react'
import GearIcon from './icons/GearIcon'
import { getAiuta } from '../sdk'

type ClearState = 'idle' | 'clearing' | 'done' | 'error'

// How long the "Cleared" confirmation stays before the menu closes
const DONE_CLOSE_DELAY_MS = 800

/**
 * Debug menu for the test page (gear button next to the version badges).
 *
 * The SDK app keeps its storage on its own origin, so the demo can't touch
 * it directly — actions go through the SDK API (sdk.clearStorage()).
 */
export default function DebugMenu() {
  const [open, setOpen] = useState(false)
  // Which panel edge is anchored to the gear: with the badges wrapping (the
  // gear can land near the left viewport edge on mobile), the panel opens
  // towards whichever side has the room.
  const [panelAlign, setPanelAlign] = useState<'left' | 'right'>('right')
  const [clearState, setClearState] = useState<ClearState>('idle')
  const rootRef = useRef<HTMLDivElement | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toggleOpen = () => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (rect) {
      setPanelAlign(rect.left + rect.width / 2 < window.innerWidth / 2 ? 'left' : 'right')
    }
    setOpen((current) => !current)
  }

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Reset transient action state whenever the menu is reopened
  useEffect(() => {
    if (open) setClearState('idle')
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [open])

  const clearStorage = async () => {
    if (clearState === 'clearing') return

    setClearState('clearing')
    try {
      const sdk = await getAiuta()
      await sdk.clearStorage()
      setClearState('done')
      closeTimer.current = setTimeout(() => setOpen(false), DONE_CLOSE_DELAY_MS)
    } catch (error) {
      console.error('Failed to clear SDK storage', error)
      setClearState('error')
    }
  }

  const clearLabel = {
    idle: 'Clear SDK storage',
    clearing: 'Clearing…',
    done: 'Cleared ✓',
    error: 'Failed — see console',
  }[clearState]

  return (
    <div className="debug-menu" ref={rootRef}>
      <button
        type="button"
        className="debug-menu__toggle"
        aria-label="Debug menu"
        aria-expanded={open}
        onClick={toggleOpen}
      >
        <GearIcon />
      </button>

      {open ? (
        <div className={'debug-menu__panel debug-menu__panel--' + panelAlign} role="menu">
          <button
            type="button"
            role="menuitem"
            className={
              'debug-menu__item' + (clearState === 'error' ? ' debug-menu__item--error' : '')
            }
            disabled={clearState === 'clearing'}
            onClick={() => void clearStorage()}
          >
            {clearLabel}
          </button>
        </div>
      ) : null}
    </div>
  )
}
