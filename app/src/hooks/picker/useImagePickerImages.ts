import { useAppSelector } from '@/store/store'
import { tryOnModeSelector } from '@/store/slices/tryOnSlice'

// Empty-state image picker artwork, mode-aware. The whole composition (the
// tilted example photos, shadows, rounding) lives inside the PNG — the picker
// just fits it into a reserved slot, the same way onboarding slides do.
const GENERAL_ZERO_STATE = './images/image-picker-zero-state.png'
const SHOES_ZERO_STATE = './images/image-picker-shoes-zero-state.png'

/**
 * Image shown in the empty state of the image picker, mode-aware.
 */
export const useImagePickerImages = () => {
  const mode = useAppSelector(tryOnModeSelector)

  const zeroStateImage = mode === 'shoes' ? SHOES_ZERO_STATE : GENERAL_ZERO_STATE

  return { zeroStateImage }
}
