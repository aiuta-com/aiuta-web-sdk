import React from 'react'
import AiutaLogo from './icons/AiutaLogo'
import VersionBadges from './VersionBadges'

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <span className="app-header__brand">
          <AiutaLogo className="app-header__logo" />
          <span className="app-header__label">WEB SDK Test Page</span>
        </span>

        <VersionBadges className="app-header__badges" />
      </div>
    </header>
  )
}
