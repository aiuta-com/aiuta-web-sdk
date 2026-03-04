import React from 'react'
import { Alert } from '@/components/popups/Alert/Alert'
import { useAlert, useAlertStateContext } from './useAlert'

/**
 * Component that renders the Alert UI
 * Should be placed inside AppContainer to ensure proper positioning
 */
export function AlertRenderer() {
  const { closeAlert } = useAlert()
  const alertState = useAlertStateContext()

  return (
    <Alert
      animationState={alertState.animationState}
      showContent={alertState.showContent}
      message={alertState.message}
      buttonText={alertState.buttonText}
      isVisible={alertState.isVisible}
      onClose={closeAlert}
    />
  )
}
