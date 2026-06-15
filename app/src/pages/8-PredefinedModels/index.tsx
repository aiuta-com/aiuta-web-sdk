import React from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector } from '@/store/slices/appSlice'
import { tryOnModeSelector } from '@/store/slices/tryOnSlice'
import ModelsDesktop from './ModelsDesktop'
import ModelsMobile from './ModelsMobile'
import ModelsShoes from './ModelsShoes'

/**
 * PredefinedModelsPage - displays predefined models for selection
 *
 * - Shoes mode: a grouped picker (gender toggle + view groups), same on both
 *   breakpoints
 * - General mode: category tabs with a gallery (desktop) or a horizontal list
 *   with a preview (mobile)
 */
export default function PredefinedModelsPage() {
  const isMobile = useAppSelector(isMobileSelector)
  const mode = useAppSelector(tryOnModeSelector)

  if (mode === 'shoes') {
    return <ModelsShoes />
  }

  return isMobile ? <ModelsMobile /> : <ModelsDesktop />
}
