import React, { useState, useEffect } from 'react'
import { Spinner, ModelsList, PrimaryButton, Tabs } from '@/components'
import {
  usePredefinedModelsSelection,
  usePredefinedModelsStrings,
  usePredefinedModelsAnalytics,
} from '@/hooks'
import styles from './Models.module.scss'

export default function ModelsMobile() {
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

  const { predefinedModelsTitle, predefinedModelsEmptyListError, getCategoryName } =
    usePredefinedModelsStrings()

  const { trackModelsPageView } = usePredefinedModelsAnalytics()

  // Track page view on mount
  useEffect(() => {
    trackModelsPageView()
  }, [trackModelsPageView])

  // Track selected model in list for visual feedback
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null)

  const handleModelClick = (model: any) => {
    setSelectedModelId(model.id)
    handleModelSelect(model)
  }

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
      <h2 className="aiuta-h2">{predefinedModelsTitle}</h2>

      <Tabs
        tabs={tabs}
        activeTabId={selectedCategoryId || categories[0].category}
        onTabChange={handleCategoryChange}
        className={styles.tabs}
      />

      <ModelsList
        models={currentCategory.models}
        selectedModelId={selectedModelId}
        onModelSelect={handleModelClick}
        className={styles.modelsList}
      />
    </main>
  )
}
