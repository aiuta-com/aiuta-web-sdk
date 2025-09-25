import React from 'react'
import { useQRCode } from 'next-qrcode'
import { Spinner } from '@/components'
import { useAppSelector } from '@/store/store'
import { qrIsLoadingSelector } from '@/store/slices/qrSlice'
import { QrCodeProps } from './types'
import styles from './QrCode.module.scss'

export const QrCode = ({ url }: Omit<QrCodeProps, 'onFileUpload'>) => {
  const { Canvas } = useQRCode()

  const isShowQrSpinner = useAppSelector(qrIsLoadingSelector)

  return (
    <div className={styles.qrBox}>
      {isShowQrSpinner ? (
        <div className={styles.spinnerOverlay}>
          <Spinner isVisible={true} />
        </div>
      ) : null}
      <Canvas
        text={url}
        logo={{
          options: { width: 40 },
          src: isShowQrSpinner ? '' : './icons/aiutaLogo.svg',
        }}
        options={{
          errorCorrectionLevel: 'M',
          width: 220,
          color: {
            dark: '#000000',
            light: '#F2F2F7',
          },
        }}
      />
    </div>
  )
}
