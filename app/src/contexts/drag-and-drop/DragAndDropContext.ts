import { createContext } from 'react'
import type { DragAndDropContextValue } from './DragAndDropTypes'

export const DragAndDropContext = createContext<DragAndDropContextValue | undefined>(undefined)

