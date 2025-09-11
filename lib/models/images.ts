/**
 * Base image interface for all image types in the Aiuta system.
 * This is the foundation for InputImage, GeneratedImage, and future image types.
 */
export interface Image {
  id: string
  url: string
}

/**
 * Input image represents user-uploaded images used for try-on generation.
 * These are images provided by the user as input to the AI generation process.
 * Future extensions may include:
 * - uploadTime: Date when the image was uploaded
 * - source: Source of the image (camera, gallery, etc.)
 * - metadata: Technical metadata like dimensions, format, etc.
 * - userProfile: Associated user profile information
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputImage extends Image {
  // Future fields will be added here for user history management
}

/**
 * Generated image represents AI-generated try-on results.
 * These are output images created by the AI generation process.
 * Future extensions may include:
 * - generationTime: Date when the image was generated
 * - parameters: Generation parameters used (model version, settings, etc.)
 * - inputImageId: Reference to the input image used for generation
 * - quality: Quality metrics or scores
 * - variants: Different variations of the same generation
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface GeneratedImage extends Image {
  // Future fields will be added here for generation metadata
}
