import { combineReducers } from '@reduxjs/toolkit'

import { uploadsSlice } from './slices/uploadsSlice'
import { generationsSlice } from './slices/generationsSlice'
import { errorSnackbarSlice } from './slices/errorSnackbarSlice'
import { configSlice } from './slices/configSlice'

const reducers = combineReducers({
  [uploadsSlice.name]: uploadsSlice.reducer,
  [generationsSlice.name]: generationsSlice.reducer,
  [errorSnackbarSlice.name]: errorSnackbarSlice.reducer,
  [configSlice.name]: configSlice.reducer,
})

export default reducers
