import { createSlice } from '@reduxjs/toolkit'
import { ReactNode } from 'react'

interface alertSliceState {
  showAlertStates: {
    type: string
    isShow: boolean
    buttonText: string
    content: string | ReactNode
  }
}

const initialState: alertSliceState = {
  showAlertStates: {
    type: '',
    content: '',
    isShow: false,
    buttonText: '',
  },
}

export const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setShowAlert: (state, { payload }) => {
      state.showAlertStates = payload
    },
  },
})
