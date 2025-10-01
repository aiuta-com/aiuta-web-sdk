import { combineReducers } from '@reduxjs/toolkit'
import { apiSlice } from './slices/apiSlice'
import { appSlice } from './slices/appSlice'
import { errorSnackbarSlice } from './slices/errorSnackbarSlice'
import { generationsSlice } from './slices/generationsSlice'
import { onboardingSlice } from './slices/onboardingSlice'
import { qrSlice } from './slices/qrSlice'
import { tryOnSlice } from './slices/tryOnSlice'
import { uploadsSlice } from './slices/uploadsSlice'

const rootReducer = combineReducers({
  [apiSlice.name]: apiSlice.reducer,
  [appSlice.name]: appSlice.reducer,
  [errorSnackbarSlice.name]: errorSnackbarSlice.reducer,
  [generationsSlice.name]: generationsSlice.reducer,
  [onboardingSlice.name]: onboardingSlice.reducer,
  [qrSlice.name]: qrSlice.reducer,
  [tryOnSlice.name]: tryOnSlice.reducer,
  [uploadsSlice.name]: uploadsSlice.reducer,
})

export default rootReducer
