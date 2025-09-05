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
