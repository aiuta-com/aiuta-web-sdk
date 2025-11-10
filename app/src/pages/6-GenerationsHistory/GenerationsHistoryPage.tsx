import React, { useEffect } from 'react'
import { ImageGallery, SelectionSnackbar } from '@/components'
import { useGenerationsGallery } from '@/hooks'
import { useRpc } from '@/contexts'
import { useAppSelector } from '@/store/store'
import { productIdsSelector } from '@/store/slices/tryOnSlice'
import styles from './GenerationsHistory.module.scss'

/**
 * GenerationsHistoryPage - gallery of generated try-on images
 *
 * Features:
 * - View generated try-on results
 * - Select multiple images for deletion
 * - Full-screen image viewing
 * - Bulk image management
 */
export default function GenerationsHistoryPage() {
  const rpc = useRpc()
  const productIds = useAppSelector(productIdsSelector)
  const gallery = useGenerationsGallery()

  // Track page view on mount
  useEffect(() => {
    rpc.sdk.trackEvent({
      type: 'page',
      pageId: 'history',
      productIds,
    })
  }, [rpc, productIds])

  return (
    <main className={styles.generationsHistory}>
      <ImageGallery
        images={gallery.images}
        onImageClick={gallery.handleImageClick}
        galleryType="generations"
      />

      <SelectionSnackbar
        isVisible={gallery.isSelecting}
        selectedCount={gallery.selectedCount}
        totalCount={gallery.totalCount}
        onCancel={gallery.onCancel}
        onSelectAll={gallery.onSelectAll}
        onDelete={gallery.deleteSelectedImages}
        onDownload={gallery.onDownload}
      />
    </main>
  )
}
