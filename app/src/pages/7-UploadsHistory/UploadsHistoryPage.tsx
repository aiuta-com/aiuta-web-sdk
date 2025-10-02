import React, { useEffect } from 'react'
import { PrimaryButton } from '@/components'
import { ImageGallery, SelectionSnackbar } from '@/components'
import { useUploadsGallery, useImagePickerStrings } from '@/hooks'
import { useRpc } from '@/contexts'
import { useAppSelector } from '@/store/store'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import styles from './UploadsHistory.module.scss'

/**
 * UploadsHistoryPage - gallery of user uploaded photos
 *
 * Features:
 * - View recently uploaded photos
 * - Select photos for try-on
 * - Delete photos from history
 * - Upload new photos
 * - Full-screen photo viewing
 */
export default function UploadsHistoryPage() {
  const rpc = useRpc()
  const productId = useAppSelector(productIdSelector)
  const gallery = useUploadsGallery()
  const { uploadsHistoryButtonNewPhoto } = useImagePickerStrings()

  // Track page view on mount
  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'imagePicker',
      productIds: [productId],
    })
  }, [rpc, productId])

  return (
    <main className={styles.uploadsHistory}>
      <ImageGallery
        images={gallery.images}
        onImageClick={gallery.handleImageClick}
        galleryType="uploads"
        className={styles.imageGallery}
      />

      <SelectionSnackbar
        isVisible={gallery.isSelecting}
        selectedCount={gallery.selectedCount}
        totalCount={gallery.totalCount}
        onCancel={gallery.onCancel}
        onSelectAll={gallery.onSelectAll}
        onDelete={gallery.deleteSelectedImages}
      />

      <PrimaryButton onClick={gallery.navigateToUpload} className={styles.uploadButton}>
        {uploadsHistoryButtonNewPhoto}
      </PrimaryButton>
    </main>
  )
}
