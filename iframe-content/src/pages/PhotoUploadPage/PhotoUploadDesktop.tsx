import React, { useEffect, ChangeEvent } from 'react'
import { motion } from 'framer-motion'

// components
import { Alert, QrCode } from '@/components/feature'

// hooks
import { useQrUpload, useTryOnAnalytics } from '../../hooks'

// styles
import styles from './photoUpload.module.scss'

export default function PhotoUploadDesktop() {
  const { qrUrl, endpointData, uploadFromDevice, startPolling } = useQrUpload()
  const { trackTryOnInitiated } = useTryOnAnalytics()

  // Start QR polling on mount
  useEffect(() => {
    if (qrUrl && endpointData) {
      startPolling()
      trackTryOnInitiated()
    }
  }, [qrUrl, endpointData, startPolling, trackTryOnInitiated])

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
      <Alert />
      {endpointData && qrUrl ? <QrCode onChange={handleChoosePhoto} url={qrUrl} /> : null}
    </motion.div>
  )
}
