import React from 'react'
import ChannelIcon from './icons/ChannelIcon'
import { getVersionInfo } from '../utils/versionInfo'

export default function VersionBadges({ className }: { className?: string }) {
  const { version, channel, env } = getVersionInfo()

  return (
    <div className={className}>
      <span className="badge">{version}</span>
      {channel ? (
        <span className="badge badge--channel">
          <ChannelIcon channel={channel} className="badge__icon" />
          {channel}
        </span>
      ) : null}
      {env !== 'prod' ? <span className={`badge badge--${env}`}>{env}</span> : null}
    </div>
  )
}
