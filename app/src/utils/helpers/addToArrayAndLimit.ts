/**
 * Adds item to the beginning of array and limits to maxItems
 * If item with same id already exists, removes it first (deduplication)
 */
export function addToArrayAndLimit<T extends { id: string }>(
  currentArray: T[],
  newItem: T,
  maxItems: number = 20,
): T[] {
  // Remove existing item with same id to avoid duplicates
  const arrayWithoutDuplicate = currentArray.filter((item) => item.id !== newItem.id)

  // Add new item to the beginning
  const updatedArray = [newItem, ...arrayWithoutDuplicate]

  // Limit to maxItems
  if (updatedArray.length > maxItems) {
    updatedArray.splice(maxItems)
  }

  return updatedArray
}
