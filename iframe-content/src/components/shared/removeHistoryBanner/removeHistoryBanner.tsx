import React from 'react'
// redux
import { useAppSelector, useAppDispatch } from '@lib/redux/store'

// actions
import { modalSlice } from '@lib/redux/slices/modalSlice'
import { generateSlice } from '@lib/redux/slices/generateSlice'

// selectors
import {
  selectedImagesSelector,
  generatedImagesSelector,
} from '@lib/redux/slices/generateSlice/selectors'
import {
  aiutaEndpointDataSelector,
  stylesConfigurationSelector,
} from '@lib/redux/slices/configSlice/selectors'

// components
import { SecondaryButton } from '@/components/feature'

// styles
import styles from './removeHistoryBanner.module.scss'
import { AnalyticEventsEnum } from '@/types'

export const RemoveHistoryBanner = () => {
  const dispatch = useAppDispatch()

  const selectedImages = useAppSelector(selectedImagesSelector)
  const generatedImages = useAppSelector(generatedImagesSelector)
  const aiutaEndpointData = useAppSelector(aiutaEndpointDataSelector)
  const stylesConfiguration = useAppSelector(stylesConfigurationSelector)

  const handleSelectAll = () => {
    const generatedImagesId = generatedImages.map(({ id }) => id)

    dispatch(generateSlice.actions.setSelectedImage(generatedImagesId))
  }

  const handleClose = () => {
    dispatch(generateSlice.actions.setSelectedImage([]))
  }

  const handleShowHistoryImagesModal = () => {
    dispatch(modalSlice.actions.setShowHistoryImagesModal(true))
  }

  const handleDowloadSelectedImages = async () => {
    for (const image of generatedImages) {
      if (selectedImages.includes(image.id)) {
        const response = await fetch(image.url, { mode: 'cors' })
        const blob = await response.blob()

        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = blobUrl
        link.download = `try-on-${Date.now()}`
        document.body.appendChild(link)

        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      }
    }

    const analytic = {
      data: {
        type: 'share',
        event: 'downloaded',
        pageId: 'history',
        productIds: [aiutaEndpointData.skuId],
      },
    }

    window.parent.postMessage({ action: AnalyticEventsEnum.generatedImageDeleted, analytic }, '*')
  }

  return (
    <div
      className={`${styles.removeHistoryBanner} ${stylesConfiguration.components.historyBannerClassName}`}
    >
      <div className={styles.buttonLine}>
        <SecondaryButton text="Cancel" onClick={handleClose} classNames={styles.cancelBtn} />
        <p className={styles.text} onClick={handleSelectAll}>
          Select All
        </p>
      </div>
      <div className={styles.iconsLine}>
        <img src={'./icons/trash.svg'} alt="Trash icon" onClick={handleShowHistoryImagesModal} />
        <img
          src={'./icons/download.svg'}
          alt="Download icon"
          onClick={handleDowloadSelectedImages}
        />
      </div>
    </div>
  )
}
