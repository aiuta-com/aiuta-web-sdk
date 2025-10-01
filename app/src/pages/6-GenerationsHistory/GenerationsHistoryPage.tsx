import React from 'react'
import { ImageGallery, SelectionSnackbar } from '@/components'
import { useGenerationsGallery } from '@/hooks'
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
  const gallery = useGenerationsGallery()

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
