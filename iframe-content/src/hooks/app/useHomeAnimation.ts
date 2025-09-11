import { easeInOut } from 'framer-motion'

/**
 * Animation configuration for Home page transitions
 */
export const useHomeAnimation = () => {
  const animationConfig = {
    initial: {
      opacity: 1,
      scale: 1,
      x: '0vw',
    },
    animate: {
      opacity: 1,
      scale: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      scale: 0,
      x: '0vw',
    },
    transition: {
      duration: 0.3,
      ease: easeInOut,
    },
  }

  return { animationConfig }
}
