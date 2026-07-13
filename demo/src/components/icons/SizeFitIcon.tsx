import React from 'react'

interface Props {
  className?: string
}

export default function SizeFitIcon({ className }: Props) {
  return (
    <svg
      className={className}
      width="18"
      height="12"
      viewBox="0 0 18 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16.917 0.583008V10.7246H4.375C2.28092 10.7246 0.583008 9.0267 0.583008 6.93262V0.583008H16.917Z"
        stroke="currentColor"
        strokeWidth="1.16667"
      />
    </svg>
  )
}
