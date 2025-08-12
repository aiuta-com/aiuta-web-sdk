// Redux
import { combineReducers } from "@reduxjs/toolkit";

// Reducers
import { fileSlice } from "./slices/fileSlice";
import { alertSlice } from "./slices/alertSlice";
import { modalSlice } from "./slices/modalSlice";
import { configSlice } from "./slices/configSlice";
import { generateSlice } from "./slices/generateSlice";

const reducers = combineReducers({
  [fileSlice.name]: fileSlice.reducer,
  [modalSlice.name]: modalSlice.reducer,
  [alertSlice.name]: alertSlice.reducer,
  [configSlice.name]: configSlice.reducer,
  [generateSlice.name]: generateSlice.reducer,
});

export default reducers;
