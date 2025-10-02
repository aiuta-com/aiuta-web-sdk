import type { AiutaAnalytics, AiutaAnalyticsCallback } from '@lib/config'
import type { Logger } from '@lib/logger'
import { v4 as uuidv4 } from 'uuid'
import Bowser from 'bowser'
import dayjs from 'dayjs'

declare const __ANALYTICS_URL__: string
declare const __SDK_VERSION__: string

interface AnalyticsEnv {
  platform: string
  hostId: string
  sdkVersion: string
  iframeVersion: string | null
  browserType: string
  browserVersion: string
  os: string
  installationId: string
}

export default class AnalyticsTracker {
  private readonly PLATFORM = 'web'
  private readonly UNKNOWN = 'Unknown'
  private readonly INSTALLATION_KEY = 'aiutaInstallationId'

  private handler?: AiutaAnalyticsCallback
  private analyticsUrl: string
  private env: AnalyticsEnv

  constructor(
    analytics?: AiutaAnalytics,
    private readonly logger?: Logger,
  ) {
    this.analyticsUrl = __ANALYTICS_URL__
    this.env = this.buildEnv()

    if (analytics?.handler?.onAnalyticsEvent) {
      this.handler = analytics.handler.onAnalyticsEvent
    }
  }

  setIframeVersion(version: string) {
    this.env.iframeVersion = version
  }

  track(data: Record<string, any>) {
    if (this.handler) {
      this.handler(data)
    }

    const body = {
      data,
      env: this.env,
      localDateTime: dayjs().format(),
    }

    fetch(this.analyticsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch((error) => {
      this.logger?.error('Track event failed', error)
    })
  }

  private buildEnv(): AnalyticsEnv {
    const bowser = Bowser.parse(navigator.userAgent)

    return {
      platform: this.PLATFORM,
      hostId: window.origin,
      sdkVersion: __SDK_VERSION__,
      iframeVersion: null,
      browserType: bowser.browser.name || this.UNKNOWN,
      browserVersion: bowser.browser.version || this.UNKNOWN,
      os: bowser.os.name || this.UNKNOWN,
      installationId: this.getInstallationId(),
    }
  }

  private getInstallationId() {
    const existing = localStorage.getItem(this.INSTALLATION_KEY)
    if (existing) return existing

    const id = uuidv4()
    localStorage.setItem(this.INSTALLATION_KEY, id)
    return id
  }
}
