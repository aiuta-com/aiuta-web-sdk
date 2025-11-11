import { useRpc } from '@/contexts'

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

  const predefinedModelsConfig = rpc.config.features?.imagePicker?.predefinedModels
  const strings = predefinedModelsConfig?.strings
  const categoryMap = strings?.predefinedModelCategories || {}

  /**
   * Get localized category name or fallback to capitalized categoryId
   * @param categoryId Category identifier (e.g., "woman", "man")
   * @returns Localized category name or capitalized categoryId
   */
  const getCategoryName = (categoryId: string): string => {
    return categoryMap[categoryId] || capitalize(categoryId)
  }

  return {
    predefinedModelsTitle: strings?.predefinedModelsTitle ?? 'Select your model',
    predefinedModelsOr: strings?.predefinedModelsOr ?? 'Or',
    predefinedModelsEmptyListError:
      strings?.predefinedModelsEmptyListError ?? 'The models list is empty',
    getCategoryName,
  }
}
