import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import ModelsDesktop from './ModelsDesktop'
import ModelsMobile from './ModelsMobile'

/**
 * PredefinedModelsPage - displays predefined models for selection
 *
 * Features:
 * - Category tabs
 * - Model gallery (desktop) or horizontal list (mobile)
 * - Loading/Error/Empty states
 */
export default function PredefinedModelsPage() {
  const isMobile = useAppSelector(isMobileSelector)

  return isMobile ? <ModelsMobile /> : <ModelsDesktop />
}
