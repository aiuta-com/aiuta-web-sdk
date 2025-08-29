import { createSlice } from "@reduxjs/toolkit";

// types
import { ImagesTypes } from "./types";

const recentlyPhotosFromStorage: Array<ImagesTypes> =
  typeof window !== "undefined" &&
  JSON.parse(localStorage.getItem("tryon-recent-photos") || "[]");

const generatedImagesFromStorage: Array<ImagesTypes> =
  typeof window !== "undefined" &&
  JSON.parse(localStorage.getItem("generated-images-history") || "[]");

interface fileSliceState {
  isStartGeneration: boolean;
  selectedImages: Array<string>;
  recentlyPhotos: Array<ImagesTypes>;
  generatedImages: Array<ImagesTypes>;
}

const initialState: fileSliceState = {
  selectedImages: [],
  isStartGeneration: false,
  recentlyPhotos: recentlyPhotosFromStorage,
  generatedImages: generatedImagesFromStorage,
};

export const generateSlice = createSlice({
  name: "generate",
  initialState,
  reducers: {
    setIsStartGeneration: (state, { payload }) => {
      state.isStartGeneration = payload;
    },
    setSelectedImage: (state, { payload }) => {
      if (Array.isArray(payload)) {
        state.selectedImages = payload;
      } else {
        if (state.selectedImages.length > 0) {
          if (state.selectedImages.includes(payload)) {
            const removeExistingImageId = state.selectedImages.filter(
              (id) => id !== payload
            );

            state.selectedImages = removeExistingImageId;
          } else {
            state.selectedImages.push(payload);
          }
        } else {
          state.selectedImages.push(payload);
        }
      }
    },
    setRecentlyPhotos: (state, { payload }) => {
      let recentlyPhotosFromStorage = JSON.parse(
        localStorage.getItem("tryon-recent-photos") || "[]"
      );

      if (Array.isArray(payload)) {
        state.recentlyPhotos = payload;
        recentlyPhotosFromStorage = payload;
      } else {
        recentlyPhotosFromStorage.unshift(payload);
        state.recentlyPhotos = recentlyPhotosFromStorage;

        if (recentlyPhotosFromStorage.length >= 20) {
          recentlyPhotosFromStorage.pop();
        }
      }

      localStorage.setItem(
        "tryon-recent-photos",
        JSON.stringify(recentlyPhotosFromStorage)
      );
    },
    setGeneratedImage: (state, { payload }) => {
      let generatedImagesFromStorage = JSON.parse(
        localStorage.getItem("generated-images-history") || "[]"
      );

      if (Array.isArray(payload)) {
        state.generatedImages = payload;
        generatedImagesFromStorage = payload;
      } else {
        generatedImagesFromStorage.unshift(payload);
        state.generatedImages = generatedImagesFromStorage;
      }

      if (generatedImagesFromStorage.length >= 20) {
        generatedImagesFromStorage.pop();
      }

      localStorage.setItem(
        "generated-images-history",
        JSON.stringify(generatedImagesFromStorage)
      );
    },
  },
});
