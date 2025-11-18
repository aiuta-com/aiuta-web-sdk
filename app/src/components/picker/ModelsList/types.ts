import type { InputImage } from '@/utils/api'

export interface ModelsListProps {
  models: InputImage[]
  selectedModelId: string | null
  onModelSelect: (model: InputImage) => void
  className?: string
}
