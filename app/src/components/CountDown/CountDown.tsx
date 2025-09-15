import React from 'react'
import { useState, useEffect, useMemo, useRef } from 'react'
import { CountDownProps } from './types'
import styles from './CountDown.module.scss'

const RADIUS = 16

export const CountDown = (props: CountDownProps) => {
  const { duration, onComplete } = props

  const [seconds, setSeconds] = useState(duration)
  const [startTime] = useState(() => Date.now())
  const isCompletedRef = useRef(false)

  useEffect(() => {
    if (isCompletedRef.current) return

    const updateTimer = () => {
      if (isCompletedRef.current) return

      const elapsed = (Date.now() - startTime) / 1000
      const remaining = Math.max(0, duration - elapsed)
      const remainingSeconds = Math.ceil(remaining)

      setSeconds(remainingSeconds)

      if (remaining <= 0 && !isCompletedRef.current) {
        isCompletedRef.current = true
        onComplete()
      }
    }

    // Update immediately
    updateTimer()

    // Don't set interval if already completed
    if (isCompletedRef.current) return

    // Then update every second
    const timerInterval = setInterval(updateTimer, 1000)

    return () => clearInterval(timerInterval)
  }, [startTime, duration, onComplete])

  const circumference = useMemo(() => 2 * Math.PI * RADIUS, [])
  const progress = useMemo(
    () => ((duration - seconds) / duration) * circumference,
    [seconds, duration, circumference],
  )

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
        {seconds}
      </text>
    </svg>
  )
}
