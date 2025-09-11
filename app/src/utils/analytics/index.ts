// Analytics services
export { BaseAnalyticsService, type AnalyticsEvent, type RpcProxy } from './baseAnalyticsService'
export { TryOnAnalyticsService } from './tryOnAnalyticsService'
export { GalleryAnalyticsService } from './galleryAnalyticsService'

// Re-export legacy name for backward compatibility
export { TryOnAnalyticsService as AnalyticsService } from './tryOnAnalyticsService'
