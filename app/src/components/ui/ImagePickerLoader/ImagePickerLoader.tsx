import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import { isProcessingImageSelector } from '@/store/slices/tryOnSlice'
import { Loader } from '@/components/ui/Loader'

// Delay before showing the loader, so a fast image doesn't flash it (matches
// TryOnView)
const LOADER_DELAY_MS = 500

/**
 * Loader shown while a picked file is being prepared (resize / HEIC decode,
 * which lazy-loads a wasm decoder and can take a moment) on pages that don't
 * have their own preview-area loader. The try-on preview (`/tryon`) shows its
 * own in-area loader, so skip it there.
 */
export const ImagePickerLoader = () => {
  const isProcessing = useAppSelector(isProcessingImageSelector)
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isProcessing) {
      setVisible(false)
      return
    }
    const timer = setTimeout(() => setVisible(true), LOADER_DELAY_MS)
    return () => clearTimeout(timer)
  }, [isProcessing])

  if (!visible || pathname === '/tryon') return null

  return <Loader />
}
