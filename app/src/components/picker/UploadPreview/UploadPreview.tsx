import React, { useState, useEffect, useCallback } from 'react'
import { Spinner, RemoteImage, Flex } from '@/components'
import { combineClassNames } from '@/utils'
import { UploadPreviewProps } from './types'
import styles from './UploadPreview.module.scss'

export const UploadPreview = ({ selectedFile, isUploading, onChangePhoto }: UploadPreviewProps) => {
  // Fix backdrop-filter refresh with minimal opacity change
  const [buttonOpacity, setButtonOpacity] = useState(1)

  // Force backdrop-filter refresh
  const refreshBackdropFilter = () => {
    setButtonOpacity(0.99)
    const timer = setTimeout(() => {
      setButtonOpacity(1)
    }, 16)
    return timer
  }

  // Refresh when URL changes
  useEffect(() => {
    const timer = refreshBackdropFilter()
    return () => clearTimeout(timer)
  }, [selectedFile.url])

  // Refresh when image actually loads
  const handleImageLoad = useCallback(() => {
    // Immediate refresh
    refreshBackdropFilter()

    // Delayed refresh to ensure image is fully rendered
    setTimeout(() => {
      refreshBackdropFilter()
    }, 100)

    // Extra delayed refresh as fallback
    setTimeout(() => {
      refreshBackdropFilter()
    }, 300)
  }, [])

  return (
    <Flex contentClassName={combineClassNames('aiuta-image-l')}>
      <RemoteImage
        src={selectedFile.url}
        alt="Selected photo preview"
        shape="L"
        onLoad={handleImageLoad}
      />

      {isUploading && <Spinner isVisible={isUploading} />}

      {!isUploading && (
        <button
          className={combineClassNames('aiuta-button-s', styles.changeButton)}
          style={{ opacity: buttonOpacity }}
          onClick={onChangePhoto}
        >
          Change photo
        </button>
      )}
    </Flex>
  )
}
