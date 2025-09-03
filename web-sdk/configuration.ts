// ============================================================================
// AIUTA CONFIGURATION
// ============================================================================

export interface AiutaConfiguration {
  auth: AiutaAuth;
  userInterface?: AiutaUserInterface;
  features?: AiutaFeatures;
  analytics?: AiutaAnalytics;
  debugSettings?: AiutaDebugSettings;
}

// ============================================================================
// AUTHENTICATION CONFIGURATION
// ============================================================================

export type AiutaAuth = AiutaApiKeyAuth | AiutaJwtAuth;

export interface AiutaApiKeyAuth {
  apiKey: string;
}

export interface AiutaJwtAuth {
  subscriptionId: string;
  getJwt: AiutaJwtCallback;
}

export type AiutaJwtCallback = (
  params: Record<string, string>
) => string | Promise<string>;

// ============================================================================
// USER INTERFACE CONFIGURATION
// ============================================================================

export interface AiutaUserInterface {
  position?: AiutaIframePosition;
  stylesConfiguration?: AiutaStylesConfiguration;
  customCssUrl?: string;
}

// TODO: Remove / refactor
export type AiutaIframePosition = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

// TODO: Remove / refactor
export type AiutaStylesConfiguration = {
  stylesConfiguration: {
    pages: {
      qrPageClassName: string;
      historyClassName: string;
      viewPageClassName: string;
      resultPageClassName: string;
      onboardingPageClassName: string;
      previouselyPageClassName: string;
    };
    components: {
      swipClassName: string;
      footerClassName: string;
      headerClassName: string;
      tryOnButtonClassName: string;
      historyBannerClassName: string;
      secondaryButtonClassName: string;
      changePhotoButtonClassName: string;
      resultButonsContentClassName: string;
      historyImagesRemoveModalClassName: string;
    };
  };
};

// TODO: Remove / refactor
export const INITIALLY_STYLES_CONFIGURATION: AiutaStylesConfiguration = {
  stylesConfiguration: {
    pages: {
      qrPageClassName: "",
      historyClassName: "",
      viewPageClassName: "",
      resultPageClassName: "",
      onboardingPageClassName: "",
      previouselyPageClassName: "",
    },
    components: {
      swipClassName: "",
      footerClassName: "",
      headerClassName: "",
      tryOnButtonClassName: "",
      historyBannerClassName: "",
      secondaryButtonClassName: "",
      changePhotoButtonClassName: "",
      resultButonsContentClassName: "",
      historyImagesRemoveModalClassName: "",
    },
  },
};


// ============================================================================
// FEATURES CONFIGURATION
// ============================================================================

export interface AiutaFeatures {
  // Placeholder for future configuration
}

// ============================================================================
// ANALYTICS CONFIGURATION
// ============================================================================

export interface AiutaAnalytics {
  handler: {
    onAnalyticsEvent: AiutaAnalyticsCallback;
  };
}

export type AiutaAnalyticsCallback = (
  event: Record<string, any>
) => void;

// ============================================================================
// DEBUG SETTINGS
// ============================================================================

export interface AiutaDebugSettings {
  // Placeholder for debug settings
}
