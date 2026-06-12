import { useRpc } from '@/contexts'
import { useAppSelector } from '@/store/store'
import { tryOnModeSelector } from '@/store/slices/tryOnSlice'

/**
 * Capitalizes the first letter of a string
 * @param str String to capitalize
 * @returns Capitalized string
 */
const capitalize = (str: string): string => {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Hook for getting localized Predefined Models feature strings with fallbacks
 */
export const usePredefinedModelsStrings = () => {
  const rpc = useRpc()
  const mode = useAppSelector(tryOnModeSelector)

  const predefinedModelsConfig = rpc.config.features?.imagePicker?.predefinedModels
  const strings = predefinedModelsConfig?.strings
  const shoesStrings = rpc.config.modes?.shoes?.imagePicker?.predefinedModels?.strings
  const categoryMap = strings?.predefinedModelCategories || {}
  const shoesCategoryMap = shoesStrings?.predefinedModelShoesCategories || {}

  const isShoes = mode === 'shoes'

  /**
   * Get localized category name or fallback to capitalized categoryId
   * @param categoryId Category identifier (e.g., "woman", "man")
   * @returns Localized category name or capitalized categoryId
   */
  const getCategoryName = (categoryId: string): string => {
    if (isShoes && shoesCategoryMap[categoryId]) {
      return shoesCategoryMap[categoryId]
    }
    return categoryMap[categoryId] || capitalize(categoryId)
  }

  return {
    // In shoes mode the user picks an example photo rather than a model;
    // the same string labels the picker buttons and the /models page title
    predefinedModelsTitle: isShoes
      ? (shoesStrings?.predefinedModelShoesPageTitle ?? 'Select example')
      : (strings?.predefinedModelsTitle ?? 'Select a model'),
    predefinedModelsOr: strings?.predefinedModelsOr ?? 'Or',
    predefinedModelsEmptyListError:
      strings?.predefinedModelsEmptyListError ?? 'The models list is empty',
    getCategoryName,
  }
}
