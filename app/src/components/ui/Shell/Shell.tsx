import React from 'react'
import { combineClassNames } from '@/utils'
import styles from './Shell.module.scss'

interface ShellProps {
  children: React.ReactNode
  /**
   * Scale the whole shell (panel + overlays) down on small screens. Enable it
   * for fullscreen layouts (mobile, the QR upload page); leave it off for the
   * desktop floating panel, which clamps its own size instead.
   */
  scaled?: boolean
}

/**
 * Wraps the app UI so the panel and its fixed overlays scale together on small
 * screens (see Shell.module.scss).
 */
export const Shell = ({ children, scaled }: ShellProps) => (
  <div className={combineClassNames(scaled && styles.shell_scaled)}>{children}</div>
)
