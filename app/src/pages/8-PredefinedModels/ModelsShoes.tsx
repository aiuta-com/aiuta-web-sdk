import React, { useEffect } from 'react'
import { Spinner, PrimaryButton, Tabs, ModelsGroups } from '@/components'
import {
  usePredefinedModelsSelection,
  usePredefinedModelsStrings,
  usePredefinedModelsAnalytics,
} from '@/hooks'
import { groupModelsByView } from '@/utils/models/groupModelsByView'
import styles from './Models.module.scss'

/**
 * Shoes mode model picker: a Women/Men gender toggle over a grouped list of
 * models (by camera view), each group a horizontally-scrolling row. Tapping a
 * card starts the try-on directly — no preview or Try On button (Figma).
 */
export default function ModelsShoes() {
  const {
    categories,
    currentCategory,
    selectedCategoryId,
    isLoading,
    isError,
    handleCategoryChange,
    handleModelSelect,
    handleRetry,
  } = usePredefinedModelsSelection()

  const { predefinedModelsEmptyListError, getCategoryName, getViewLabel } =
    usePredefinedModelsStrings()

  const { trackModelsPageView } = usePredefinedModelsAnalytics()

  // Track page view on mount
  useEffect(() => {
    trackModelsPageView()
  }, [trackModelsPageView])

  // Loading state
  if (isLoading) {
    return (
      <main className={styles.models}>
        <Spinner isVisible={true} />
      </main>
    )
  }

  // Error state
  if (isError) {
    return (
      <main className={styles.models}>
        <div className={styles.errorState}>
          <p className="aiuta-label-regular">{predefinedModelsEmptyListError}</p>
          <PrimaryButton onClick={handleRetry} shape="S">
            Try again
          </PrimaryButton>
        </div>
      </main>
    )
  }

  // Empty state
  if (categories.length === 0 || !currentCategory) {
    return (
      <main className={styles.models}>
        <div className={styles.emptyState}>
          <p className="aiuta-label-regular">{predefinedModelsEmptyListError}</p>
        </div>
      </main>
    )
  }

  const tabs = categories.map((cat) => ({
    id: cat.category,
    label: getCategoryName(cat.category),
  }))

  const groups = groupModelsByView(currentCategory.models).map((group) => ({
    view: group.view,
    label: getViewLabel(group.view),
    models: group.models,
  }))

  return (
    <main className={styles.models}>
      <Tabs
        tabs={tabs}
        activeTabId={selectedCategoryId || categories[0].category}
        onTabChange={handleCategoryChange}
        className={styles.tabs}
      />

      {groups.length > 0 ? (
        <ModelsGroups groups={groups} onModelSelect={handleModelSelect} />
      ) : (
        <div className={styles.emptyState}>
          <p className="aiuta-label-regular">{predefinedModelsEmptyListError}</p>
        </div>
      )}
    </main>
  )
}
