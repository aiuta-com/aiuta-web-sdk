import { createSlice } from "@reduxjs/toolkit";

interface configSliceState {
  showHistoryImagesModal: boolean;
}

const initialState: configSliceState = {
  showHistoryImagesModal: false,
};

export const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setShowHistoryImagesModal: (state, { payload }) => {
      state.showHistoryImagesModal = payload;
    },
  },
});
