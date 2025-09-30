import { createSlice } from '@reduxjs/toolkit'

const initialState = false

export const errorSnackbarSlice = createSlice({
  name: 'errorSnackbar',
  initialState,
  reducers: {
    showErrorSnackbar: () => true,
    hideErrorSnackbar: () => false,
  },
})

export const { showErrorSnackbar, hideErrorSnackbar } = errorSnackbarSlice.actions
