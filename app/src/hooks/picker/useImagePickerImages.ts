import { useRpc } from '@/contexts'
import { useAppSelector } from '@/store/store'
import { tryOnModeSelector } from '@/store/slices/tryOnSlice'

const GENERAL_EXAMPLES = [
  './images/image-picker-sample-1.png',
  './images/image-picker-sample-2.png',
]

const SHOES_EXAMPLES = [
  './images/image-picker-shoes-sample-1.png',
  './images/image-picker-shoes-sample-2.png',
]

/**
 * Good-photo examples shown in the image picker, mode-aware.
 * The picker layout renders exactly two of them.
 */
export const useImagePickerImages = () => {
  const rpc = useRpc()
  const mode = useAppSelector(tryOnModeSelector)

  const shoesExamples = rpc.config.modes?.shoes?.imagePicker?.images?.examples

  const examples =
    mode === 'shoes'
      ? shoesExamples?.length
        ? shoesExamples.slice(0, 2)
        : SHOES_EXAMPLES
      : GENERAL_EXAMPLES

  return { examples }
}
