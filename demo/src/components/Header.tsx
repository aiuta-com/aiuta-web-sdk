import React from 'react'
import AiutaLogo from './icons/AiutaLogo'
import ChannelIcon from './icons/ChannelIcon'
import { getVersionInfo } from '../utils/versionInfo'

export default function Header() {
  const { version, channel, env } = getVersionInfo()

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <span className="app-header__brand">
          <AiutaLogo className="app-header__logo" />
          <span className="app-header__label">WEB SDK Test Page</span>
        </span>

        <div className="app-header__badges">
          <span className="badge">{version}</span>
          {channel ? (
            <span className="badge badge--channel">
              <ChannelIcon channel={channel} className="badge__icon" />
              {channel}
            </span>
          ) : null}
          {env !== 'prod' ? <span className={`badge badge--${env}`}>{env}</span> : null}
        </div>
      </div>
    </header>
  )
}
