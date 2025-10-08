import React, { ReactNode } from 'react'
import { useFilePicker } from '@/hooks'

export interface FilePickerRenderProps {
  /** Function to open the file picker dialog */
  openFilePicker: () => void
}

export interface FilePickerProps {
  /** MIME types to accept, e.g. 'image/*', 'image/png,image/jpeg' */
  accept?: string
  /** Callback when file is selected */
  onFileSelect: (file: File) => void | Promise<void>
  /** Render function that receives openFilePicker handler */
  children: (props: FilePickerRenderProps) => ReactNode
}

/**
 * FilePicker component with render props pattern
 * Provides a clean API for file selection without manual input handling
 *
 * @example
 * <FilePicker onFileSelect={handleFile}>
 *   {({ openFilePicker }) => (
 *     <button onClick={openFilePicker}>Choose File</button>
 *   )}
 * </FilePicker>
 */
export const FilePicker = ({ accept = 'image/*', onFileSelect, children }: FilePickerProps) => {
  const { openFilePicker, inputProps } = useFilePicker({
    accept,
    onFileSelect,
  })

  return (
    <>
      {children({ openFilePicker })}
      <input {...inputProps} />
    </>
  )
}
