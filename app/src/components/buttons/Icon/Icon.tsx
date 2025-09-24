import React from 'react'
import type { IconProps } from './types'
import styles from './Icon.module.scss'

const isUrl = (str: string): boolean => {
  return (
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.startsWith('./') ||
    str.startsWith('../') ||
    str.startsWith('/') ||
    (str.includes('.') &&
      (str.endsWith('.svg') ||
        str.endsWith('.png') ||
        str.endsWith('.jpg') ||
        str.endsWith('.jpeg')))
  )
}

const isFullSvg = (str: string): boolean => {
  return str.trim().startsWith('<svg')
}

const isSvgContent = (str: string): boolean => {
  return (
    str.includes('<path') ||
    str.includes('<rect') ||
    str.includes('<circle') ||
    str.includes('<g') ||
    str.includes('<polygon') ||
    str.includes('<line')
  )
}

const sanitizeSvgContent = (content: string): string => {
  // Basic sanitization - remove dangerous elements
  return content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<foreignObject[^>]*>[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
    .replace(/javascript:/gi, '') // Remove javascript: urls
}

export const Icon = ({
  icon,
  className,
  alt = '',
  size = 24,
  viewBox = '0 0 24 24',
}: IconProps) => {
  const iconClassName = [styles.icon, className || ''].filter(Boolean).join(' ')

  // External file (URL) - use img tag
  if (isUrl(icon)) {
    return <img className={iconClassName} src={icon} alt={alt} width={size} height={size} />
  }

  // Full SVG - render as is (with sanitization only)
  if (isFullSvg(icon)) {
    const sanitizedContent = sanitizeSvgContent(icon)
    return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
  }

  // SVG content (elements like <path>, <rect>, etc.) - wrap in our SVG
  if (isSvgContent(icon)) {
    const sanitizedContent = sanitizeSvgContent(icon)
    return (
      <svg
        className={iconClassName}
        width={size}
        height={size}
        viewBox={viewBox}
        fill="currentColor"
      >
        <g dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
      </svg>
    )
  }

  // Simple SVG path
  return (
    <svg className={iconClassName} width={size} height={size} viewBox={viewBox} fill="currentColor">
      <path d={icon} />
    </svg>
  )
}
