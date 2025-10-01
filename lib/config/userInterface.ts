export interface AiutaUserInterface {
  presentationStyle?: 'mobile' | 'desktop'
  theme?: {
    customCssUrl?: string
    selectionSnackbar?: SelectionSnackbar
    errorSnackbar?: ErrorSnackbar
  }
}

export interface SelectionSnackbar {
  strings?: {
    select?: string
    cancel?: string
    selectAll?: string
    unselectAll?: string
  }
}

export interface ErrorSnackbar {
  strings?: {
    defaultErrorMessage?: string
    tryAgainButton?: string
  }
}
