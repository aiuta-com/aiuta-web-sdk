import React, { useEffect, ChangeEvent } from 'react'
import { motion } from 'framer-motion'
import { ErrorSnackbar, QrCode } from '@/components'
import { useQrUpload, useTryOnAnalytics } from '@/hooks'
import styles from './photoUpload.module.scss'

export default function PhotoUploadDesktop() {
  const { qrUrl, uploadFromDevice, startPolling } = useQrUpload()
  const { trackTryOnInitiated } = useTryOnAnalytics()

  // Start QR polling on mount
  useEffect(() => {
    if (qrUrl) {
      startPolling()
      trackTryOnInitiated()
    }
  }, [qrUrl, startPolling, trackTryOnInitiated])

  const handleChoosePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target?.files?.[0]) {
      await uploadFromDevice(event.target.files[0])
    }
  }

  return (
    <motion.div
      className={styles.qrContainer}
      key="photo-upload-desktop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <ErrorSnackbar />
      {qrUrl ? <QrCode onFileUpload={handleChoosePhoto} url={qrUrl} /> : null}
    </motion.div>
  )
}
