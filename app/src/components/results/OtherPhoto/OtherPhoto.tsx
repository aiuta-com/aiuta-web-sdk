import React from 'react'
import { IconButton } from '@/components'
import { useTryOnWithOtherPhoto } from '@/hooks'
import type { OtherPhotoProps } from './types'
import { icons } from './icons'

/**
 * OtherPhoto component - allows user to try on with a different photo
 * All logic is handled by useTryOnWithOtherPhoto hook
 */
export const OtherPhoto = ({ className }: OtherPhotoProps) => {
  const { icon, handleClick } = useTryOnWithOtherPhoto()

  const iconToUse = icon || icons.changePhoto

  return (
    <IconButton icon={iconToUse} label="Change photo" onClick={handleClick} className={className} />
  )
}
