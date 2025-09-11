import React from 'react'

// redux
import { useAppSelector } from '@lib/redux/store'

// selectors
import { isMobileSelector } from '@lib/redux/slices/configSlice/selectors'

// components
import TryOnDesktop from './TryOnDesktop'
import TryOnMobile from './TryOnMobile'

/**
 * TryOnPage - photo selection and try-on process page
 *
 * Features:
 * - Image selection (file upload or from gallery)
 * - Try-on process initiation
 * - Generation results viewing
 * - Recent photos gallery management
 */
export default function TryOnPage() {
  const isMobile = useAppSelector(isMobileSelector)

  return isMobile ? <TryOnMobile /> : <TryOnDesktop />
}
