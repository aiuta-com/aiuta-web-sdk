import { createSlice } from '@reduxjs/toolkit'

interface fileSliceState {
  uploadedViewFile: {
    id: string
    url: string
    localUrl: string
  }
  fullScreenModalImageUrl: string | null
}

const initialState: fileSliceState = {
  uploadedViewFile: {
    id: '',
    url: '',
    localUrl: '',
  },
  fullScreenModalImageUrl: null,
}

export const fileSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    setUploadViewFile: (state, { payload }) => {
      if (payload) {
        if ('file' in payload) {
          const url = URL.createObjectURL(payload.file)

          state.uploadedViewFile = {
            localUrl: url,
            ...payload,
          }
        } else {
          state.uploadedViewFile = {
            localUrl: payload.url,
            ...payload,
          }
        }
      } else {
        state.uploadedViewFile = initialState.uploadedViewFile
      }
    },
    setFullScreenImageUrl: (state, { payload }) => {
      state.fullScreenModalImageUrl = payload
    },
  },
})
