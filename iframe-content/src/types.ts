export type EndpointDataTypes = {
  type: string
  skuId: string
  userId: string
  apiKey: string
  status: number
  jwtToken: string
}

export enum AnalyticEventsEnum {
  'tryOn' = 'tryOn',
  'share' = 'share',
  'loading' = 'loading',
  'results' = 'results',
  'history' = 'history',
  'onboarding' = 'onboarding',
  'tryOnError' = 'tryOnError',
  'closeModal' = 'closeModal',
  'tryOnAborted' = 'tryOnAborted',
  'newPhotoTaken' = 'newPhotoTaken',
  'uploadedPhotoDeleted' = 'uploadedPhotoDeleted',
  'uploadsHistoryOpened' = 'uploadsHistoryOpened',
  'uploadedPhotoSelected' = 'uploadedPhotoSelected',
  'generatedImageDeleted' = 'generatedImageDeleted',
}
