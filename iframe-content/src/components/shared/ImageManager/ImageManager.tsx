import React from 'react'
import { ViewImage } from '@/components/feature'
import { EmptyViewImage } from '@/components/shared'
import { UploadedImage } from '../../../utils/apiService'

interface ImageManagerProps {
  uploadedImage?: {
    id: string
    url: string
    localUrl: string
  }
  recentImage?: UploadedImage
  isStartGeneration: boolean
  generatedImageUrl: string
  onImageClick?: (image: UploadedImage) => void
  onChangeImage?: () => void
  onUploadClick?: () => void
  showFullScreenOnClick?: boolean
}

export const ImageManager: React.FC<ImageManagerProps> = ({
  uploadedImage,
  recentImage,
  isStartGeneration,
  generatedImageUrl,
  onImageClick,
  onChangeImage,
  onUploadClick,
  showFullScreenOnClick = false,
}) => {
  const hasUploadedImage = uploadedImage && uploadedImage.localUrl.length > 0
  const hasRecentImage = recentImage && recentImage.url.length > 0
  const showChangeButton = !isStartGeneration

  // If there is an uploaded image
  if (hasUploadedImage) {
    return (
      <ViewImage
        url={uploadedImage.localUrl}
        isStartGeneration={isStartGeneration}
        generatedImageUrl={generatedImageUrl}
        isShowChangeImageBtn={showChangeButton}
        onChange={onChangeImage}
        onClick={
          showFullScreenOnClick
            ? () =>
                onImageClick?.({
                  id: uploadedImage.id,
                  url: uploadedImage.url,
                })
            : undefined
        }
      />
    )
  }

  // If there is a recent image
  if (hasRecentImage) {
    return (
      <ViewImage
        url={recentImage.url}
        isStartGeneration={isStartGeneration}
        generatedImageUrl={generatedImageUrl}
        isShowChangeImageBtn={showChangeButton}
        onChange={onChangeImage}
        onClick={showFullScreenOnClick ? () => onImageClick?.(recentImage) : undefined}
      />
    )
  }

  // Empty state (mobile version only)
  if (onUploadClick) {
    return <EmptyViewImage onClick={onUploadClick} />
  }

  return null
}
