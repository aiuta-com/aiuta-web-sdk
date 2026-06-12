import React from 'react'
import { Icon } from '@/components'
import { combineClassNames } from '@/utils'
import { useFeedbackStrings, useFeedback } from '@/hooks'
import type { FeedbackProps } from './types'
import { icons } from './icons'
import styles from './Feedback.module.scss'

export const Feedback = ({ className, generatedImageUrl, variant = 'fab' }: FeedbackProps) => {
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

  const buttonClassName = variant === 'plain' ? styles.plainButton : styles.fabButton
  const iconSize = variant === 'plain' ? 20 : 24

  return (
    <>
      {shouldShowFeedback && (
        <div
          className={combineClassNames(
            styles.feedback,
            variant === 'plain' && styles.feedback_plain,
            styles[`feedback_${componentAnimationState}`],
            className,
          )}
        >
          <button
            className={buttonClassName}
            onClick={handleLike}
            disabled={isDisabled}
            aria-label="Like this result"
            type="button"
          >
            <Icon icon={icons.like} size={iconSize} viewBox="0 0 24 24" />
          </button>
          <button
            className={buttonClassName}
            onClick={handleDislike}
            disabled={isDisabled}
            aria-label="Dislike this result"
            type="button"
          >
            <Icon icon={icons.dislike} size={iconSize} viewBox="0 0 24 24" />
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
