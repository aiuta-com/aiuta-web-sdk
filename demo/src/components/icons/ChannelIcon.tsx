import React from 'react'

interface Props {
  channel: string
  className?: string
}

// Small leading icon for the channel badge: monitor for local, link for the
// moving aliases (latest / vMAJOR), git-branch for main / any branch name.
export default function ChannelIcon({ channel, className }: Props) {
  const svgProps = {
    className,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (channel === 'local') {
    return (
      <svg {...svgProps}>
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
      </svg>
    )
  }

  // latest and vMAJOR (v5) are both moving aliases → link icon.
  if (channel === 'latest' || /^v\d+$/.test(channel)) {
    return (
      <svg {...svgProps}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    )
  }

  // main / branch
  return (
    <svg {...svgProps}>
      <line x1="6" x2="6" y1="3" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  )
}
