import type { TryOnModel } from '@/utils/api'

export type ModelView = 'full-height' | 'bird-view' | 'side-view'

export interface ModelViewGroup {
  view: ModelView
  models: TryOnModel[]
}

// Fixed render order of the shoes view groups (Figma)
const VIEW_ORDER: ModelView[] = ['full-height', 'bird-view', 'side-view']

/**
 * Group a gender category's models by their `view` tag, in the fixed Figma
 * order. Models without a recognized view are dropped, and empty groups are
 * omitted.
 */
export const groupModelsByView = (models: TryOnModel[]): ModelViewGroup[] =>
  VIEW_ORDER.map((view) => ({
    view,
    models: models.filter((model) => model.tags?.view === view),
  })).filter((group) => group.models.length > 0)
