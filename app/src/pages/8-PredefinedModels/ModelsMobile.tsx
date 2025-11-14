import React, { useState, useEffect } from 'react'
import {
  Spinner,
  ModelsList,
  PrimaryButton,
  TryOnButton,
  Tabs,
  RemoteImage,
  Flex,
} from '@/components'
import {
  usePredefinedModelsSelection,
  usePredefinedModelsStrings,
  usePredefinedModelsAnalytics,
  useTryOnStrings,
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

  const { predefinedModelsEmptyListError, getCategoryName } = usePredefinedModelsStrings()

  const { tryOn } = useTryOnStrings()

  const { trackModelsPageView } = usePredefinedModelsAnalytics()

  // Track page view on mount
  useEffect(() => {
    trackModelsPageView()
  }, [trackModelsPageView])

  // Track selected model - initialize with first model
  const [selectedModel, setSelectedModel] = useState<any>(null)

  // Set initial selected model when category changes
  useEffect(() => {
    if (currentCategory && currentCategory.models.length > 0) {
      setSelectedModel(currentCategory.models[0])
    }
  }, [currentCategory])

  const handleModelClick = (model: any) => {
    setSelectedModel(model)
  }

  const handleTryOn = () => {
    if (selectedModel) {
      handleModelSelect(selectedModel)
    }
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
      {/* Large preview of selected model */}
      <Flex>
        {selectedModel && <RemoteImage src={selectedModel.url} alt="Selected Model" shape="L" />}
      </Flex>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTabId={selectedCategoryId || categories[0].category}
        onTabChange={handleCategoryChange}
        className={styles.tabs}
      />

      {/* Horizontal models list */}
      <ModelsList
        models={currentCategory.models}
        selectedModelId={selectedModel?.id || null}
        onModelSelect={handleModelClick}
        className={styles.modelsList}
      />

      <TryOnButton onClick={handleTryOn}>{tryOn}</TryOnButton>
    </main>
  )
}
