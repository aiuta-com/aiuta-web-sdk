import React, { useEffect } from 'react'
import { Spinner, ImageGallery, PrimaryButton, Tabs } from '@/components'
import {
  usePredefinedModelsSelection,
  usePredefinedModelsStrings,
  usePredefinedModelsAnalytics,
} from '@/hooks'
import styles from './Models.module.scss'

export default function ModelsDesktop() {
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

  const { predefinedModelsEmptyListError, getCategoryName } = usePredefinedModelsStrings()

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

  // Prepare tabs
  const tabs = categories.map((cat) => ({
    id: cat.category,
    label: getCategoryName(cat.category),
  }))

  return (
    <main className={styles.models}>
      <Tabs
        tabs={tabs}
        activeTabId={selectedCategoryId || categories[0].category}
        onTabChange={handleCategoryChange}
        className={styles.tabs}
      />

      <ImageGallery
        images={currentCategory.models}
        onImageClick={handleModelSelect}
        className={styles.gallery}
      />
    </main>
  )
}
