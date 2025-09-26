import { useLocation } from 'react-router-dom'
import { useAppSelector } from '@/store/store'
import { isMobileSelector, hasFooterSelector } from '@/store/slices/appSlice'

interface UsePoweredByReturn {
  isVisible: boolean
  text: string
  url?: string
}

export const usePoweredBy = (): UsePoweredByReturn => {
  const location = useLocation()
  const isMobile = useAppSelector(isMobileSelector)
  const showFooterGlobally = useAppSelector(hasFooterSelector)

  // Routes where powered by should be hidden
  const desktopHiddenRoutes = ['/tryon', '/generations-history', '/uploads-history', '/results']
  const mobileHiddenRoutes = ['/onboarding', '/generations-history', '/uploads-history']

  const hiddenRoutes = isMobile ? mobileHiddenRoutes : desktopHiddenRoutes
  const isHiddenByRoute = hiddenRoutes.includes(location.pathname)

  // Hide on specific routes first, then check global footer setting
  if (isHiddenByRoute) {
    // Always hide on specific routes regardless of device
    return { isVisible: false, text: 'Powered by Aiuta', url: 'https://www.aiuta.com/' }
  }

  // Show based on global footer setting (mobile only) or always show (desktop)
  const isVisibleByRoute = isMobile ? showFooterGlobally : true

  // Future: subscription-based visibility and custom branding
  // const { isVisibleBySubscription, customText, customUrl } = useSubscriptionBranding()

  return {
    isVisible: isVisibleByRoute,
    text: 'Powered by Aiuta', // Future: customText || 'Powered by Aiuta'
    url: 'https://www.aiuta.com/', // Future: customUrl
  }
}
