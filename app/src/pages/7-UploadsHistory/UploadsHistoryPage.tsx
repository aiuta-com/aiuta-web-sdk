import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton } from '@/components'
import { ImageGallery, SelectionSnackbar, Confirmation } from '@/components'
import {
  useUploadsGallery,
  useImagePickerStrings,
  usePredefinedModels,
  useSelectionStrings,
} from '@/hooks'
import { useRpc } from '@/contexts'
import { useAppSelector } from '@/store/store'
import { productIdsSelector } from '@/store/slices/tryOnSlice'
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
  const navigate = useNavigate()
  const rpc = useRpc()
  const productIds = useAppSelector(productIdsSelector)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const gallery = useUploadsGallery({
    onShowDeleteModal: () => setConfirmDelete(true),
    onCloseModal: () => setConfirmDelete(false),
  })
  const { uploadsHistoryButtonNewPhoto, uploadsHistoryButtonAddNew } = useImagePickerStrings()
  const { deleteConfirmationTitle, deleteConfirmationKeep, deleteConfirmationDelete } =
    useSelectionStrings()
  const { isEnabled: isPredefinedModelsEnabled } = usePredefinedModels()

  // Use different button text if PredefinedModels feature is enabled
  const buttonText = isPredefinedModelsEnabled
    ? uploadsHistoryButtonAddNew
    : uploadsHistoryButtonNewPhoto

  // Track page view on mount
  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'imagePicker',
      productIds,
    })
  }, [rpc, productIds])

  // Navigate to home if all images are deleted
  useEffect(() => {
    if (gallery.recentlyPhotos.length === 0) {
      navigate('/')
    }
  }, [gallery.recentlyPhotos.length, navigate])

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
        onDelete={gallery.onDelete}
      />

      <Confirmation
        isVisible={confirmDelete}
        message={deleteConfirmationTitle}
        leftButtonText={deleteConfirmationKeep}
        rightButtonText={deleteConfirmationDelete}
        onLeftClick={() => setConfirmDelete(false)}
        onRightClick={gallery.deleteSelectedImages}
      />

      {/* Pinned over the gallery on a fade-to-background gradient (Figma) */}
      <div className={styles.uploadButtonContainer}>
        <PrimaryButton onClick={gallery.navigateToUpload} className={styles.uploadButton}>
          {buttonText}
        </PrimaryButton>
      </div>
    </main>
  )
}
