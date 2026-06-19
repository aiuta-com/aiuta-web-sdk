import type React from 'react'

export type ThumbnailVariant = 'default' | 'fullscreen'
export type ThumbnailDirection = 'horizontal' | 'vertical'

export interface ThumbnailData {
  id: string
  url: string
}

export interface ThumbnailListProps {
  /** Array of thumbnail data */
  items: ThumbnailData[]
  /** ID of currently active/selected thumbnail */
  activeId?: string
  /** Callback when thumbnail is clicked */
  onItemClick: (item: ThumbnailData, index: number) => void
  /** Visual variant */
  variant?: ThumbnailVariant
  /** Layout direction */
  direction?: ThumbnailDirection
  /** Custom className for the container */
  className?: string
  /** Whether to show the list when there's only one item */
  showSingleItem?: boolean
  /**
   * Populated with a wheel-forwarding API so a parent can route wheel/trackpad
   * gestures from elsewhere (e.g. the gallery's central image / backdrop) into
   * this strip, driving the same scroll + selection behaviour.
   */
  wheelApiRef?: React.MutableRefObject<ThumbnailWheelApi | null>
}

export interface ThumbnailWheelApi {
  scrollByWheel: (deltaY: number, deltaX: number, deltaMode: number) => void
}
