import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { PredefinedModelCategory } from '@/utils/api'

export interface PredefinedModelsState {
  categories: PredefinedModelCategory[]
  isLoading: boolean
  isLoaded: boolean
  error: string | null
  etag: string | null
  retryRequested: boolean // Flag to prevent duplicate retry requests
}

// Initial state - will be loaded via usePredefinedModelsCache
const initialState: PredefinedModelsState = {
  categories: [],
  isLoading: false,
  isLoaded: false,
  error: null,
  etag: null,
  retryRequested: false,
}

export const predefinedModelsSlice = createSlice({
  name: 'predefinedModels',
  initialState,
  reducers: {
    setCategories: (
      state,
      action: PayloadAction<{ categories: PredefinedModelCategory[]; etag: string | null }>,
    ) => {
      state.categories = action.payload.categories
      state.etag = action.payload.etag
      state.isLoaded = true
      state.isLoading = false // Also reset loading state
      state.error = null

      // Storage is handled by React Query mutations
    },

    initializeFromCache: (
      state,
      action: PayloadAction<{ categories: PredefinedModelCategory[]; etag: string | null }>,
    ) => {
      // Load cached data WITHOUT marking as loaded
      // This allows the fetch to still happen with the cached etag
      state.categories = action.payload.categories
      state.etag = action.payload.etag
      state.isLoaded = false // Don't mark as loaded - we still need to check with server
      state.error = null
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
      if (action.payload) {
        state.error = null
        state.retryRequested = false // Clear retry flag when starting
      }
    },

    markAsLoaded: (state) => {
      state.isLoaded = true
      state.isLoading = false
      state.error = null
      state.retryRequested = false
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
      state.retryRequested = false
    },

    clearError: (state) => {
      state.error = null
    },

    retryLoading: (state) => {
      state.error = null
      state.isLoading = false
      state.isLoaded = false
      state.retryRequested = true // Set flag to indicate retry was requested
    },

    resetPredefinedModels: (state) => {
      state.categories = []
      state.isLoading = false
      state.isLoaded = false
      state.error = null
      state.etag = null
      state.retryRequested = false
      // Storage is handled by React Query mutations
    },
  },
})
