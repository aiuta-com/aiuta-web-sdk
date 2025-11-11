import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { PredefinedModelCategory } from '@/utils/api'
import { PredefinedModelsStorage } from '@/utils'

export interface PredefinedModelsState {
  categories: PredefinedModelCategory[]
  isLoading: boolean
  isLoaded: boolean
  error: string | null
  etag: string | null
}

const cachedData = PredefinedModelsStorage.load()

const initialState: PredefinedModelsState = {
  categories: cachedData?.categories || [],
  isLoading: false,
  isLoaded: false,
  error: null,
  etag: cachedData?.etag || null,
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
      state.error = null

      // Save to localStorage
      PredefinedModelsStorage.save(action.payload.categories, action.payload.etag)
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
      if (action.payload) {
        state.error = null
      }
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
    },

    clearError: (state) => {
      state.error = null
    },

    resetPredefinedModels: (state) => {
      state.categories = []
      state.isLoading = false
      state.isLoaded = false
      state.error = null
      state.etag = null
      PredefinedModelsStorage.clear()
    },
  },
})
