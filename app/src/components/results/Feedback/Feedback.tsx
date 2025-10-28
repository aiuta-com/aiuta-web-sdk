import React from 'react'
import { Icon } from '@/components'
import { combineClassNames } from '@/utils'
import { useFeedbackStrings, useFeedback } from '@/hooks'
import type { FeedbackProps } from './types'
import { icons } from './icons'
import styles from './Feedback.module.scss'

export const Feedback = ({ className, generatedImageUrl }: FeedbackProps) => {
  const { feedbackGratitudeText } = useFeedbackStrings()
  const {
    isDisabled,
    animationState,
    showContent,
    isGratitudeVisible,
    componentAnimationState,
    shouldShowFeedback,
    handleLike,
    handleDislike,
  } = useFeedback(generatedImageUrl)

  // Don't render anything if feedback was given and animations are complete
  if (!shouldShowFeedback && !isGratitudeVisible) {
    return null
  }

  return (
    <>
      {shouldShowFeedback && (
        <div
          className={combineClassNames(
            styles.feedback,
            styles[`feedback_${componentAnimationState}`],
            className,
          )}
        >
          <button
            className={styles.fabButton}
            onClick={handleLike}
            disabled={isDisabled}
            aria-label="Like this result"
            type="button"
          >
            <Icon icon={icons.like} size={24} viewBox="0 0 24 24" />
          </button>
          <button
            className={styles.fabButton}
            onClick={handleDislike}
            disabled={isDisabled}
            aria-label="Dislike this result"
            type="button"
          >
            <Icon icon={icons.dislike} size={24} viewBox="0 0 24 24" />
          </button>
        </div>
      )}

      {isGratitudeVisible && showContent && (
        <div
          className={combineClassNames(
            'aiuta-modal',
            styles.gratitudeMessage,
            styles[`gratitudeMessage_${animationState}`],
          )}
        >
          <span className={styles.gratitudeEmoji}>🧡</span>
          <p className={combineClassNames('aiuta-label-regular', styles.gratitudeText)}>
            {feedbackGratitudeText}
          </p>
        </div>
      )}
    </>
  )
}
