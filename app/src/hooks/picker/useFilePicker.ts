import { useRef, useCallback, ChangeEvent } from 'react'

interface UseFilePickerOptions {
  /** MIME types to accept, e.g. 'image/*', 'image/png,image/jpeg' */
  accept?: string
  /** Callback when file is selected */
  onFileSelect: (file: File) => void | Promise<void>
}

/**
 * Hook for file picker functionality with hidden input
 * Provides clean API for file selection without dealing with input events
 */
export const useFilePicker = ({ accept = 'image/*', onFileSelect }: UseFilePickerOptions) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const openFilePicker = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        await onFileSelect(file)
        // Reset input to allow selecting the same file again
        event.target.value = ''
      }
    },
    [onFileSelect],
  )

  const inputProps = {
    ref: inputRef,
    type: 'file' as const,
    accept,
    onChange: handleChange,
    style: { display: 'none' } as const,
  }

  return {
    openFilePicker,
    inputProps,
  }
}
