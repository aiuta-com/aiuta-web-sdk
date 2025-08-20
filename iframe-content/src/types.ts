export type EndpointDataTypes = {
  type: string;
  skuId: string;
  userId: string;
  apiKey: string;
  status: number;
  jwtToken: string;
};

export enum AnalyticEventsEnum {
  "tryOn" = "tryOn",
  "share" = "share",
  "results" = "results",
  "history" = "history",
  "onboarding" = "onboarding",
  "tryOnError" = "tryOnError",
  "tryOnAborted" = "tryOnAborted",
  "newPhotoTaken" = "newPhotoTaken",
  "uploadedPhotoDeleted" = "uploadedPhotoDeleted",
  "uploadedPhotoSelected" = "uploadedPhotoSelected",
  "generatedImageDeleted" = "generatedImageDeleted",
}
