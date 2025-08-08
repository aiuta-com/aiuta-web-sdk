import React from "react";
export const QrSpinner = () => (
  <svg
    className="spinner"
    width="24"
    height="24"
    viewBox="0 0 50 50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      className="path"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      strokeWidth="4"
    />
    <style>
      {`
          .spinner {
            animation: rotate 2s linear infinite;
          }
          .path {
            stroke: #4000ff;
            stroke-linecap: round;
            animation: dash 1.5s ease-in-out infinite;
          }
          @keyframes rotate {
            100% {
              transform: rotate(360deg);
            }
          }
          @keyframes dash {
            0% {
              stroke-dasharray: 1, 150;
              stroke-dashoffset: 0;
            }
            50% {
              stroke-dasharray: 90, 150;
              stroke-dashoffset: -35;
            }
            100% {
              stroke-dasharray: 90, 150;
              stroke-dashoffset: -124;
            }
          }
        `}
    </style>
  </svg>
);
