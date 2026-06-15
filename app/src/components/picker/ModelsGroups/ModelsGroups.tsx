import React, { useRef } from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { RemoteImage } from '@/components'
import { combineClassNames } from '@/utils'
import type { TryOnModel } from '@/utils/api'
import styles from './ModelsGroups.module.scss'

export interface ModelGroup {
  view: string
  label: string
  models: TryOnModel[]
}

interface ModelsGroupsProps {
  groups: ModelGroup[]
  onModelSelect: (model: TryOnModel) => void
}

// ~ one card (153px) + gap (8px)
const SCROLL_STEP = 161

const Chevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d={dir === 'left' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const GroupRow = ({
  group,
  showArrows,
  onModelSelect,
}: {
  group: ModelGroup
  showArrows: boolean
  onModelSelect: (model: TryOnModel) => void
}) => {
  const rowRef = useRef<HTMLDivElement>(null)

  const scrollBy = (delta: number) => rowRef.current?.scrollBy({ left: delta, behavior: 'smooth' })

  return (
    <section className={styles.group}>
      <p className={combineClassNames('aiuta-label-subtle', styles.groupLabel)}>{group.label}</p>

      <div className={styles.rowWrap}>
        {showArrows && (
          <button
            type="button"
            aria-label="Scroll left"
            className={combineClassNames(styles.arrow, styles.arrow_left)}
            onClick={() => scrollBy(-SCROLL_STEP)}
          >
            <Chevron dir="left" />
          </button>
        )}

        <div ref={rowRef} className={styles.row} data-scrollable>
          {group.models.map((model) => (
            <div
              key={model.id}
              className={combineClassNames(
                styles.card,
                // Mobile only: full-height cards are larger than the other views
                group.view === 'full-height' && styles.card_large,
              )}
              onClick={() => onModelSelect(model)}
            >
              <RemoteImage src={model.url} alt="Model" shape="M" fit="smart" />
            </div>
          ))}
        </div>

        {showArrows && (
          <button
            type="button"
            aria-label="Scroll right"
            className={combineClassNames(styles.arrow, styles.arrow_right)}
            onClick={() => scrollBy(SCROLL_STEP)}
          >
            <Chevron dir="right" />
          </button>
        )}
      </div>
    </section>
  )
}

/**
 * Shoes model picker body: a vertically-scrolling list of view groups, each a
 * horizontally-scrolling row of model cards (Figma). Desktop adds per-row
 * arrow buttons; mobile is touch-scroll only.
 */
export const ModelsGroups = ({ groups, onModelSelect }: ModelsGroupsProps) => {
  const isMobile = useAppSelector(isMobileSelector)

  return (
    <div className={styles.groups} data-scrollable>
      {groups.map((group) => (
        <GroupRow
          key={group.view}
          group={group}
          showArrows={!isMobile}
          onModelSelect={onModelSelect}
        />
      ))}
    </div>
  )
}
