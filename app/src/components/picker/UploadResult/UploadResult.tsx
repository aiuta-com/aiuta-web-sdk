import React from 'react'
import { RemoteImage, Icon } from '@/components'
import { UploadResultProps } from './types'
import { icons } from './icons'
import styles from './UploadResult.module.scss'

export const UploadResult = ({ uploadedUrl }: UploadResultProps) => {
  return (
    <div className={styles.uploadResult}>
      <div className={styles.imageBox}>
        <RemoteImage src={uploadedUrl} alt="Uploaded photo" shape="M" />
        <Icon icon={icons.success} size={40} viewBox="0 0 40 40" className={styles.successIcon} />
      </div>
      <div className={styles.info}>
        <h3 className="aiuta-title-m">Your photo has been uploaded</h3>
        <h4 className="aiuta-label-regular">It will appear within a few seconds</h4>
      </div>
    </div>
  )
}
