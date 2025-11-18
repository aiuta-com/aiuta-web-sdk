import React, { createContext, useContext, ReactNode, useEffect } from 'react'
import { useDragAndDrop, useGlobalFileDrop, type DragAndDropEvent } from '@/hooks'

interface DragAndDropContextValue {
  isDragging: boolean
}

const DragAndDropContext = createContext<DragAndDropContextValue | undefined>(undefined)

interface DragAndDropProviderProps {
  onFileDrop?: (event: DragAndDropEvent) => void | Promise<void>
  children: ReactNode
}

export function DragAndDropProvider({ onFileDrop, children }: DragAndDropProviderProps) {
  const defaultFileDrop = useGlobalFileDrop()
  const { isDragging, ...dragHandlers } = useDragAndDrop(onFileDrop || defaultFileDrop)

  // Attach drag handlers to #aiuta-root
  useEffect(() => {
    const rootElement = document.getElementById('aiuta-root')
    if (!rootElement) return

    // Wrap React handlers for native events
    const handleDragEnter = (e: DragEvent) =>
      dragHandlers.onDragEnter(e as unknown as React.DragEvent)
    const handleDragOver = (e: DragEvent) =>
      dragHandlers.onDragOver(e as unknown as React.DragEvent)
    const handleDragLeave = (e: DragEvent) =>
      dragHandlers.onDragLeave(e as unknown as React.DragEvent)
    const handleDrop = (e: DragEvent) => dragHandlers.onDrop(e as unknown as React.DragEvent)

    // Add event listeners
    rootElement.addEventListener('dragenter', handleDragEnter)
    rootElement.addEventListener('dragover', handleDragOver)
    rootElement.addEventListener('dragleave', handleDragLeave)
    rootElement.addEventListener('drop', handleDrop)

    // Cleanup
    return () => {
      rootElement.removeEventListener('dragenter', handleDragEnter)
      rootElement.removeEventListener('dragover', handleDragOver)
      rootElement.removeEventListener('dragleave', handleDragLeave)
      rootElement.removeEventListener('drop', handleDrop)
    }
  }, [dragHandlers])

  return (
    <DragAndDropContext.Provider value={{ isDragging }}>{children}</DragAndDropContext.Provider>
  )
}

export function useDragAndDropContext(): DragAndDropContextValue {
  const context = useContext(DragAndDropContext)
  if (context === undefined) {
    throw new Error('useDragAndDropContext must be used within a DragAndDropProvider')
  }
  return context
}
