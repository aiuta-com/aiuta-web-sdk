import React from 'react'
import { useAppSelector, useAppDispatch } from '@/store/store'
import { generationsSlice } from '@/store/slices/generationsSlice'
import { selectedImagesSelector, generatedImagesSelector } from '@/store/slices/generationsSlice'
import { productIdSelector } from '@/store/slices/tryOnSlice'
import { SecondaryButton } from '@/components'
import styles from './removeHistoryBanner.module.scss'
import { useRpcProxy } from '@/contexts'

interface RemoveHistoryBannerProps {
  onShowModal: () => void
}

export const RemoveHistoryBanner = ({ onShowModal }: RemoveHistoryBannerProps) => {
  const dispatch = useAppDispatch()
  const rpc = useRpcProxy()

  const selectedImages = useAppSelector(selectedImagesSelector)
  const generatedImages = useAppSelector(generatedImagesSelector)
  const productId = useAppSelector(productIdSelector)

  const handleSelectAll = () => {
    const generatedImagesId = generatedImages.map(({ id }) => id)

    dispatch(generationsSlice.actions.setSelectedImages(generatedImagesId))
  }

  const handleClose = () => {
    dispatch(generationsSlice.actions.clearSelectedImages())
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
        productIds: [productId],
      },
    }

    rpc.sdk.trackEvent(analytic)
  }

  return (
    <div className={`${styles.removeHistoryBanner} `}>
      <div className={styles.buttonLine}>
        <SecondaryButton text="Cancel" onClick={handleClose} classNames={styles.cancelBtn} />
        <p className={styles.text} onClick={handleSelectAll}>
          Select All
        </p>
      </div>
      <div className={styles.iconsLine}>
        <img src={'./icons/trash.svg'} alt="Trash icon" onClick={onShowModal} />
        <img
          src={'./icons/download.svg'}
          alt="Download icon"
          onClick={handleDowloadSelectedImages}
        />
      </div>
    </div>
  )
}
