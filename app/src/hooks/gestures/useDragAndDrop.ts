import { useState, useCallback, useRef } from 'react'

export interface DragAndDropEvent {
  file: File
  files: File[]
}

export interface DragAndDropConfig {
  /** Accept only specific file types (e.g., 'image/*', 'image/png') */
  accept?: string
  /** Allow multiple files */
  multiple?: boolean
}

export interface DragAndDropHandlers {
  onDragEnter: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  isDragging: boolean
}

export const useDragAndDrop = (
  onFileDrop: (event: DragAndDropEvent) => void,
  config: DragAndDropConfig = {},
): DragAndDropHandlers => {
  const { accept = 'image/*', multiple = false } = config

  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    // Check if drag contains files using items API (more reliable)
    const hasFiles =
      e.dataTransfer.types.includes('Files') ||
      (e.dataTransfer.items &&
        Array.from(e.dataTransfer.items).some((item) => item.kind === 'file'))

    if (!hasFiles) {
      // Don't prevent default for non-file drags to avoid breaking Safari
      return
    }

    // Only prevent default for file drags
    e.preventDefault()
    e.stopPropagation()

    dragCounterRef.current++
    setIsDragging(true)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    // ALWAYS prevent default in dragover to:
    // 1. Indicate this is a valid drop zone
    // 2. Prevent browser from opening files
    e.preventDefault()
    e.stopPropagation()

    // Check if drag contains files using items API (more reliable)
    const hasFiles =
      e.dataTransfer.types.includes('Files') ||
      (e.dataTransfer.items &&
        Array.from(e.dataTransfer.items).some((item) => item.kind === 'file'))

    if (hasFiles) {
      // Set dropEffect only for file drags
      e.dataTransfer.dropEffect = 'copy'
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Check if this was a file drag using items API (to match dragenter behavior)
    const hasFiles =
      e.dataTransfer.types.includes('Files') ||
      (e.dataTransfer.items &&
        Array.from(e.dataTransfer.items).some((item) => item.kind === 'file'))
    if (!hasFiles) {
      // Don't prevent default for non-file drags to avoid breaking Safari
      return
    }

    // Only prevent default for file drags
    e.preventDefault()
    e.stopPropagation()

    dragCounterRef.current--

    // Only set dragging to false when all nested elements have been left
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      // ALWAYS prevent default to stop browser from opening the file
      e.preventDefault()
      e.stopPropagation()

      // Reset counter and dragging state
      dragCounterRef.current = 0
      setIsDragging(false)

      // Try to get files from both APIs
      let droppedFiles = Array.from(e.dataTransfer.files)

      // If files is empty, try items API
      if (droppedFiles.length === 0 && e.dataTransfer.items) {
        droppedFiles = Array.from(e.dataTransfer.items)
          .filter((item) => item.kind === 'file')
          .map((item) => item.getAsFile())
          .filter((file): file is File => file !== null)
      }

      // Early return if no files (prevents callback execution)
      if (droppedFiles.length === 0) {
        return
      }

      // Filter files based on accept pattern
      const filteredFiles = droppedFiles.filter((file) => {
        if (accept === '*') return true
        if (accept.endsWith('/*')) {
          const type = accept.split('/')[0]
          return file.type.startsWith(`${type}/`)
        }
        return file.type === accept
      })

      if (filteredFiles.length === 0) {
        return
      }

      // Return first file or all files based on multiple config
      const files = multiple ? filteredFiles : [filteredFiles[0]]
      const dropEvent: DragAndDropEvent = {
        file: files[0],
        files,
      }

      onFileDrop(dropEvent)
    },
    [onFileDrop, accept, multiple],
  )

  return {
    onDragEnter: handleDragEnter,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    isDragging,
  }
}
