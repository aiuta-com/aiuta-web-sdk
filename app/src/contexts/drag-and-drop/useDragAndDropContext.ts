import { useContext } from 'react'
import type { DragAndDropContextValue } from './DragAndDropTypes'
import { DragAndDropContext } from './DragAndDropContext'

export function useDragAndDropContext(): DragAndDropContextValue {
  const context = useContext(DragAndDropContext)
  if (context === undefined) {
    throw new Error('useDragAndDropContext must be used within a DragAndDropProvider')
  }
  return context
}
