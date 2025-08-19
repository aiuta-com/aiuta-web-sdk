export type EndpointDataTypes = {
  type: string;
  skuId: string;
  userId: string;
  apiKey: string;
  status: number;
  jwtToken: string;
};

export enum AnalyticEventsEnum {
  "tryOn" = "tryOn", // success
  "share" = "share", // success
  "results" = "results", // success
  "history" = "history", // success
  "onboarding" = "onboarding", // success
  "newPhotoTaken" = "newPhotoTaken", // success
  "uploadedPhotoDeleted" = "uploadedPhotoDeleted", //
  "uploadedPhotoSelected" = "uploadedPhotoSelected", //
  "generatedImageDeleted" = "generatedImageDeleted", //
}
