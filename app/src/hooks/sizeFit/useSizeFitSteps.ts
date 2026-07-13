import { useAppSelector } from '@/store/store'
import { sizeFitStepSelector, sizeFitSurveySelector } from '@/store/slices/sizeFitSlice'
import type { SizeFitStep } from '@/store/slices/sizeFitSlice'

/**
 * The survey step sequence — shared by the survey page, the PageBar progress
 * bar and the PageBar back navigation so they always agree. The bra step only
 * exists for the female survey.
 */
export const useSizeFitSteps = () => {
  const step = useAppSelector(sizeFitStepSelector)
  const survey = useAppSelector(sizeFitSurveySelector)

  const steps: SizeFitStep[] =
    survey.gender === 'Female' ? ['main', 'shapes', 'bra'] : ['main', 'shapes']
  const stepIndex = Math.max(0, steps.indexOf(step))

  return {
    steps,
    step,
    stepIndex,
    isLastStep: stepIndex === steps.length - 1,
    progress: (stepIndex + 1) / steps.length,
  }
}
