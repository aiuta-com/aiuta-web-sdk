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
}
