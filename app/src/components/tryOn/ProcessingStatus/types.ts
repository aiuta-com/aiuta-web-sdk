export interface ProcessingStatusProps {
  isVisible: boolean
  stage: 'scanning' | 'generating'
  className?: string
}
