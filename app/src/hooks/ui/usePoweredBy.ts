import { useState, useEffect } from 'react'
import { useAppSelector } from '@/store/store'
import { isMobileSelector, hasFooterSelector } from '@/store/slices/appSlice'

interface UsePoweredByReturn {
  isVisible: boolean
  text: string
  url?: string
}

export const usePoweredBy = (): UsePoweredByReturn => {
  const [currentPath, setCurrentPath] = useState('')
  const isMobile = useAppSelector(isMobileSelector)
  const showFooterGlobally = useAppSelector(hasFooterSelector)

  useEffect(() => {
    setCurrentPath(window.location.pathname)
  }, [])

  // Routes where powered by should be hidden
  const desktopHiddenRoutes = ['/view', '/generations-history', '/uploads-history', '/results']
  const mobileHiddenRoutes = ['/generations-history', '/uploads-history']

  const hiddenRoutes = isMobile ? mobileHiddenRoutes : desktopHiddenRoutes
  const isHiddenByRoute = hiddenRoutes.includes(currentPath)

  // Current logic - will be extended with subscription data
  const isVisibleByRoute = isMobile ? showFooterGlobally && !isHiddenByRoute : !isHiddenByRoute

  // Future: subscription-based visibility and custom branding
  // const { isVisibleBySubscription, customText, customUrl } = useSubscriptionBranding()

  return {
    isVisible: isVisibleByRoute,
    text: 'Powered by Aiuta', // Future: customText || 'Powered by Aiuta'
    url: 'https://www.aiuta.com/', // Future: customUrl
  }
}
