import React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { CountDownProps } from './types'
import styles from './CountDown.module.scss'

const RADIUS = 16

export const CountDown = (props: CountDownProps) => {
  const { duration, onComplete } = props

  const [remainingMs, setRemainingMs] = useState(duration * 1000)

  useEffect(() => {
    const startTime = Date.now()
    const totalMs = duration * 1000

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, totalMs - elapsed)

      setRemainingMs(remaining)

      if (remaining <= 0) {
        onComplete()
      }
    }, 16) // 60 FPS (1000ms / 60fps ≈ 16ms)

    return () => clearInterval(interval)
  }, [duration, onComplete])

  const circumference = useMemo(() => 2 * Math.PI * RADIUS, [])
  const displaySeconds = Math.ceil(remainingMs / 1000)
  const progress = useMemo(() => {
    const totalMs = duration * 1000
    const elapsedMs = totalMs - remainingMs
    return (elapsedMs / totalMs) * circumference
  }, [remainingMs, duration, circumference])

  return (
    <svg viewBox="0 0 36 36" className={styles.countDown}>
      <path
        className={styles.background}
        fill="none"
        strokeWidth="3"
        d=" M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        className={styles.progress}
        fill="none"
        strokeWidth="3"
        strokeDashoffset={progress}
        strokeDasharray={`${circumference}`}
        d=" M18 2.0845 a 15.9155 15.9155 0 0 0 0 31.831 a 15.9155 15.9155 0 0 0 0 -31.831"
      />
      <text x="18" y="20.5" textAnchor="middle" fontSize="4" fill="#333" className={styles.text}>
        {displaySeconds}
      </text>
    </svg>
  )
}
