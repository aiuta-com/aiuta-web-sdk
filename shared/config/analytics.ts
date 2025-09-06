export interface AiutaAnalytics {
  handler: {
    onAnalyticsEvent: AiutaAnalyticsCallback
  }
}

export type AiutaAnalyticsCallback = (event: Record<string, any>) => void
