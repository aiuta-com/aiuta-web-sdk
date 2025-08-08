import React from "react";
import { useState, useEffect } from "react";

// types
import { CountDownAnimationTypes } from "./types";

// styles
import styles from "./countDownAnimation.module.scss";

const RADIUS = 16;

export const CountDownAnimation = (props: CountDownAnimationTypes) => {
  const { timer, onClick } = props;

  const [seconds, setSeconds] = useState(timer);

  const handleCountDown = () => setSeconds((prev) => prev - 1);

  useEffect(() => {
    if (seconds === 0) {
      setTimeout(onClick, 1000);
      return;
    }

    const timerInterval = setInterval(handleCountDown, 1000);

    return () => clearInterval(timerInterval);
  }, [seconds, onClick]);

  const circumference = 2 * Math.PI * RADIUS;
  const progress = ((timer + seconds) / timer) * circumference;

  return (
    <svg viewBox="0 0 36 36" className={styles.circularChart}>
      <path
        className={styles.circleBg}
        fill="none"
        strokeWidth="3"
        d=" M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        className={styles.circle}
        fill="none"
        strokeWidth="3"
        strokeDashoffset={progress}
        strokeDasharray={`${circumference}`}
        d=" M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <text
        x="18"
        y="20.5"
        textAnchor="middle"
        fontSize="4"
        fill="#333"
        className={styles.countsText}
      >
        {seconds}s
      </text>
    </svg>
  );
};
