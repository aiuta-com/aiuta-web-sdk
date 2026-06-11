import React from 'react'

interface SpinnerProps {
  size?: number
}

// Visual match for the QA Tool spinner: a ring with only a bottom border that spins.
export default function Spinner({ size = 32 }: SpinnerProps) {
  return (
    <span
      className="spinner"
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size }}
    />
  )
}
