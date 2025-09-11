import { createSlice } from '@reduxjs/toolkit'
import { ReactNode } from 'react'

interface ErrorSnackbarSliceState {
  showErrorSnackbarStates: {
    type: string
    isShow: boolean
    buttonText: string
    content: string | ReactNode
  }
}

const initialState: ErrorSnackbarSliceState = {
  showErrorSnackbarStates: {
    type: '',
    content: '',
    isShow: false,
    buttonText: '',
  },
}

export const errorSnackbarSlice = createSlice({
  name: 'errorSnackbar',
  initialState,
  reducers: {
    setShowErrorSnackbar: (state, { payload }) => {
      state.showErrorSnackbarStates = payload
    },
  },
})
