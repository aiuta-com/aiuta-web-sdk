import { combineReducers } from '@reduxjs/toolkit'

import { uploadsSlice } from './slices/uploadsSlice'
import { generationsSlice } from './slices/generationsSlice'
import { errorSnackbarSlice } from './slices/errorSnackbarSlice'
import { configSlice } from './slices/configSlice'
import { tryOnSlice } from './slices/tryOnSlice'
import { qrSlice } from './slices/qrSlice'
import { onboardingSlice } from './slices/onboardingSlice'
import { appSlice } from './slices/appSlice'
import { apiSlice } from './slices/apiSlice'

const reducers = combineReducers({
  [uploadsSlice.name]: uploadsSlice.reducer,
  [generationsSlice.name]: generationsSlice.reducer,
  [errorSnackbarSlice.name]: errorSnackbarSlice.reducer,
  [configSlice.name]: configSlice.reducer,
  [tryOnSlice.name]: tryOnSlice.reducer,
  [qrSlice.name]: qrSlice.reducer,
  [onboardingSlice.name]: onboardingSlice.reducer,
  [appSlice.name]: appSlice.reducer,
  [apiSlice.name]: apiSlice.reducer,
})

export default reducers
