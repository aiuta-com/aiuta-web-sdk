import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { PredefinedModelCategory } from '@/utils/api'
import { PredefinedModelsStorage } from '@/utils'

export interface PredefinedModelsState {
  categories: PredefinedModelCategory[]
  isLoading: boolean
  isLoaded: boolean
  error: string | null
  etag: string | null
  retryRequested: boolean // Flag to prevent duplicate retry requests
}

const cachedData = PredefinedModelsStorage.load()

const initialState: PredefinedModelsState = {
  categories: cachedData?.categories || [],
  isLoading: false,
  isLoaded: false,
  error: null,
  etag: cachedData?.etag || null,
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

      // Save to localStorage
      PredefinedModelsStorage.save(action.payload.categories, action.payload.etag)
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
      PredefinedModelsStorage.clear()
    },
  },
})
