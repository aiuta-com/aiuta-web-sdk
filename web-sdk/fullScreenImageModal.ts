import {
  CLOSE_ICON_LIGHT,
  DESKTOP_MODAL_SHARE,
  DESKTOP_MODAL_TRASH,
  DESKTOP_MODAL_DOWNLOAD,
} from "./constants/socialIcons";

type ImageType = {
  id: string;
  url: string;
};

type ModalTypes = "history" | "previously";

export class ShowFullScreenModal {
  private activeImage: ImageType;
  private images?: Array<ImageType>;
  private modalType: ModalTypes | undefined;

  constructor({
    images,
    modalType,
    activeImage,
  }: {
    activeImage: ImageType;
    modalType?: ModalTypes;
    images: Array<ImageType>;
  }) {
    this.activeImage = activeImage;
    this.modalType = modalType;

    if (!images) this.images = [];
    else this.images = images;
  }

  private handleDownloadImage = async () => {
    if (this.activeImage) {
      const response = await fetch(this.activeImage.url, { mode: "cors" });
      const blob = await response.blob();

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = `try-on-${Date.now()}`;
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }
  };

  private changeActiveImage(image: ImageType): void {
    const imageModalContent = document.getElementById(
      "aiuta-image-modal-content"
    );
    const generatedImages = document.getElementById(
      "aiuta-generated-images-view"
    );

    const hasGeneratedImages =
      generatedImages && typeof generatedImages === "object";

    const hasImageModalContent =
      imageModalContent && typeof imageModalContent === "object";

    if (hasGeneratedImages && hasImageModalContent) {
      const allImages = generatedImages.children;

      for (const item of allImages) {
        const currentImg: any = item;
        const currentSpan = currentImg.lastElementChild;

        if (currentImg.dataset.imageId === image.id) {
          const modalViewImg: any = imageModalContent.firstElementChild;

          modalViewImg.id = image.id;
          modalViewImg.src = image.url;

          Object.assign(currentImg.style, {
            width: "68px",
            minHeight: "120px",
          });

          Object.assign(currentSpan.style, {
            width: "62px",
            minHeight: "114px",
          });
        } else {
          Object.assign(currentImg.style, {
            width: "54px",
            minHeight: "96px",
          });

          Object.assign(currentSpan.style, {
            width: "48px",
            minHeight: "90px",
          });
        }
      }
    }
  }

  private calculateLeftContentScroll(): void {
    const generatedImagesView = document.getElementById(
      "aiuta-generated-images-view"
    );
    if (!generatedImagesView) return;

    if (this.images && this.images.length > 0) {
      const activeImageIndex = this.images.findIndex(
        (image) => image.id === this.activeImage.id
      );

      if (activeImageIndex > 5) {
        generatedImagesView.scrollTo({
          top: activeImageIndex * 54,
          left: 0,
          behavior: "smooth",
        });
      } else {
        generatedImagesView.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }
    }
  }

  private miniImageView(
    image: ImageType,
    onClick: (image: ImageType) => void
  ): any {
    const isActiveImage = image.id === this.activeImage.id;

    const div = document.createElement("div");
    const img = document.createElement("img");
    const span = document.createElement("span");

    img.src = image.id;
    img.src = image.url;

    Object.assign(div.style, {
      ...MINI_VIEW_IMAGE_BOX,
      width: isActiveImage ? "68px" : "54px",
      minHeight: isActiveImage ? "120px" : "96px",
    } as CSSStyleDeclaration);

    Object.assign(span.style, {
      ...MINI_VIEW_IMAGE_BORDER,
      width: isActiveImage ? "62px" : "48px",
      minHeight: isActiveImage ? "113px" : "90px",
    } as CSSStyleDeclaration);

    Object.assign(img.style, MINI_VIEW_IMAGE as CSSStyleDeclaration);

    div.dataset.imageId = image.id;
    if (isActiveImage) div.id = "selected-image";

    div.append(img);
    div.append(span);

    div.addEventListener("click", () => onClick(image));

    return div;
  }

  private handleShareImage(): void {
    if (this.activeImage) {
      const aiutaIframe = document.getElementById(
        "aiuta-iframe"
      ) as HTMLIFrameElement;
      if (!aiutaIframe) return;

      window.postMessage(
        { action: "open_share_modal", imageUrl: this.activeImage.url },
        "*"
      );

      this.closeModal();
    }
  }

  private handleDeleteImages(): void {
    if (this.activeImage && this.images) {
      const aiutaIframe = document.getElementById(
        "aiuta-iframe"
      ) as HTMLIFrameElement;

      if (!aiutaIframe) return;

      const activeImageIndex = this.images.findIndex(
        (image) => image.id === this.activeImage.id
      );

      const deleteActiveImage =
        this.images.filter((image) => image.id !== this.activeImage.id) || [];

      if (deleteActiveImage.length) {
        const deleteModal = document.getElementById(
          "aiuta-delete-active-modal"
        );
        const leftContent = document.getElementById(
          "aiuta-generated-images-view"
        );

        if (leftContent) {
          leftContent.children[activeImageIndex].remove();
        }

        if (deleteModal) {
          deleteModal?.remove();
        }

        this.images = deleteActiveImage;
        this.activeImage = deleteActiveImage[0];
        this.changeActiveImage(deleteActiveImage[0]);
      } else {
        setTimeout(() => {
          this.closeModal();
        }, 500);
      }

      if (aiutaIframe.contentWindow) {
        const type =
          this.modalType === "history"
            ? "REMOVE_HISTORY_IMAGES"
            : this.modalType === "previously"
            ? "REMOVE_PREVIOUSELY_IMAGES"
            : null;

        aiutaIframe.contentWindow.postMessage(
          {
            type: type,
            status: 200,
            images: deleteActiveImage,
          },
          "*"
        );
      }
    }
  }

  private makeDeleteImageModal(): void {
    const aiutaModal = document.getElementById("aiuta-fullscreen-modal");

    const hasAiutaModal = aiutaModal && typeof aiutaModal === "object";

    if (hasAiutaModal) {
      const paragraph = document.createElement("p");
      const modalDiv = document.createElement("div");
      const buttonLine = document.createElement("div");
      const keepButton = document.createElement("button");
      const deleteButton = document.createElement("button");

      modalDiv.id = "aiuta-delete-active-modal";

      keepButton.innerText = "Keep";
      deleteButton.innerText = "Delete";
      paragraph.innerText = "Are you sure that you want to delete this try-on?";

      Object.assign(
        paragraph.style,
        DELETE_IMAGE_MODAL_TEXT as CSSStyleDeclaration
      );

      Object.assign(
        modalDiv.style,
        DELETE_IMAGE_MODAL_BOX as CSSStyleDeclaration
      );

      Object.assign(
        buttonLine.style,
        DELETE_MODAL_BUTTON_CONTENT as CSSStyleDeclaration
      );

      Object.assign(keepButton.style, {
        ...DELETE_MODAL_BUTTON,
        color: "#fff",
        background: "#000",
      } as CSSStyleDeclaration);

      Object.assign(deleteButton.style, {
        ...DELETE_MODAL_BUTTON,
        color: "#EF5754",
        background: "#fff",
        border: "1px solid #E5E5EA",
        backdropFilter: "blur(5px)",
      } as CSSStyleDeclaration);

      buttonLine.append(keepButton);
      buttonLine.append(deleteButton);

      modalDiv.append(paragraph);
      modalDiv.append(buttonLine);

      aiutaModal.append(modalDiv);

      keepButton.addEventListener("click", () => {
        modalDiv.remove();
      });

      deleteButton.addEventListener(
        "click",
        this.handleDeleteImages.bind(this)
      );
    }
  }

  private makeLeftContent(): void {
    const leftContentDiv = document.createElement("div");
    const aiutaModal = document.getElementById("aiuta-fullscreen-modal");

    const hasAiutaModal = aiutaModal && typeof aiutaModal === "object";

    Object.assign(
      leftContentDiv.style,
      LEFT_CONTENT_STYLES as CSSStyleDeclaration
    );

    if (hasAiutaModal) {
      leftContentDiv.id = "aiuta-generated-images-view";

      if (this.images && this.images.length > 1) {
        for (const image of this.images) {
          const currentImage: ImageType = image;

          leftContentDiv.append(
            this.miniImageView(currentImage, (image) => {
              this.activeImage = image;
              this.changeActiveImage(image);

              if (this.images && this.images.length > 3) {
                this.calculateLeftContentScroll();
              }
            })
          );
        }
      }

      aiutaModal.append(leftContentDiv);

      if (this.images && this.images.length > 3) {
        this.calculateLeftContentScroll();
      }
    }
  }

  private makeMiddleContent(): void {
    const containerDiv = document.createElement("div");
    const aiutaModal = document.getElementById("aiuta-fullscreen-modal");

    const hasAiutaModal = aiutaModal && typeof aiutaModal === "object";

    Object.assign(containerDiv.style, MIDDLE_CONTENT_STYLES);

    if (hasAiutaModal) {
      const iconsDiv = document.createElement("div");
      const shareDiv = document.createElement("div");

      const activeImage = document.createElement("img");
      const downloadDiv = document.createElement("div");
      const iconsBoxDiv = document.createElement("div");

      if (this.modalType) {
        const trashDiv = document.createElement("div");
        trashDiv.innerHTML = DESKTOP_MODAL_TRASH;

        iconsBoxDiv.append(trashDiv);

        Object.assign(trashDiv.style, SOCIAL_ICONS_BOX as CSSStyleDeclaration);

        trashDiv.addEventListener(
          "click",
          this.makeDeleteImageModal.bind(this)
        );
      }

      Object.assign(iconsBoxDiv.style, ICONS_BOX as CSSStyleDeclaration);
      Object.assign(iconsDiv.style, ICONS_CONTENT as CSSStyleDeclaration);
      Object.assign(activeImage.style, ACTIVE_IMAGE as CSSStyleDeclaration);
      Object.assign(shareDiv.style, SOCIAL_ICONS_BOX as CSSStyleDeclaration);

      Object.assign(downloadDiv.style, SOCIAL_ICONS_BOX as CSSStyleDeclaration);

      shareDiv.innerHTML = DESKTOP_MODAL_SHARE;

      downloadDiv.innerHTML = DESKTOP_MODAL_DOWNLOAD;

      iconsBoxDiv.append(shareDiv);
      iconsBoxDiv.append(downloadDiv);

      iconsDiv.append(iconsBoxDiv);

      containerDiv.id = "aiuta-image-modal-content";

      activeImage.id = this.activeImage.id;
      activeImage.src = this.activeImage.url;

      containerDiv.append(activeImage);
      containerDiv.append(iconsDiv);
      aiutaModal.append(containerDiv);

      downloadDiv.addEventListener("click", this.handleDownloadImage);
      shareDiv.addEventListener("click", this.handleShareImage.bind(this));
    }
  }

  private makeRightContent(): void {
    const containerDiv = document.createElement("div");
    const aiutaModal = document.getElementById("aiuta-fullscreen-modal");

    const hasAiutaModal = aiutaModal && typeof aiutaModal === "object";

    Object.assign(containerDiv.style, CLOSE_ICON_BOX as CSSStyleDeclaration);

    if (hasAiutaModal) {
      containerDiv.innerHTML = CLOSE_ICON_LIGHT;

      containerDiv.addEventListener("click", this.closeModal);

      aiutaModal.append(containerDiv);
    }
  }

  showModal(): void {
    const divElm = document.createElement("div");

    divElm.id = "aiuta-fullscreen-modal";

    Object.assign(divElm.style, MODAL_STYLES as CSSStyleDeclaration);

    if (document && document.body && document.body.parentElement) {
      document.body.appendChild(divElm);
      document.body.parentElement.style.overflow = "hidden";

      this.makeLeftContent();
      this.makeMiddleContent();
      this.makeRightContent();
    }
  }

  closeModal(): void {
    const aiutaModal = document.getElementById("aiuta-fullscreen-modal");

    const hasAiutaModal = aiutaModal && typeof aiutaModal === "object";
    const hasModalAndBodyhasAiutaModal =
      hasAiutaModal && document && document.body;

    if (hasModalAndBodyhasAiutaModal && document.body.parentElement) {
      document.body.parentElement.style.overflow = "";
      aiutaModal.remove();
    }
  }
}

const MODAL_STYLES = {
  position: "fixed",
  top: "0px",
  left: "0px",
  zIndex: "10000",
  minWidth: "100vw",
  minHeight: "100vh",
  background: "#4d4d4db3",
  display: "flex",
  alignItems: "stretch",
  justifyContent: "space-between",
  padding: "16px 14px 0px 22px",
  boxSizing: "border-box",
  userSelect: "none",
};

const LEFT_CONTENT_STYLES = {
  marginTop: "4px",
  display: "flex",
  rowGap: "8px",
  minWidth: "100px",
  overflowY: "auto",
  maxHeight: "100vh",
  scrollbarWidth: "none",
  flexDirection: "column",
  boxSizing: "border-box",
  paddingBottom: "30px",
};

const CLOSE_ICON_BOX = {
  width: "36px",
  height: "36px",
  cursor: "pointer",
};

const ACTIVE_IMAGE = {
  width: "660px",
  objectFit: "cover",
  height: "calc(100vh - 40px)",
};

const MIDDLE_CONTENT_STYLES = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
};

const MINI_VIEW_IMAGE_BOX = {
  cursor: "pointer",
  position: "relative",
  transition: "all 0.2s ease-in-out",
};

const MINI_VIEW_IMAGE = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "16px",
};

const MINI_VIEW_IMAGE_BORDER = {
  position: "absolute",
  top: "0px",
  left: "0px",
  borderRadius: "16px",
  transition: "all 0.2s ease-in-out",
  border: "3px solid rgba(255, 255, 255, 0.20)",
};

const ICONS_CONTENT = {
  display: "flex",
  marginLeft: "20px",
  marginBottom: "36px",
  alignItems: "flex-end",
  height: "calc(100% - 40px)",
};

const ICONS_BOX = {
  display: "flex",
  rowGap: "11px",
  flexDirection: "column",
};

const SOCIAL_ICONS_BOX = {
  display: "flex",
  width: "52px",
  height: "52px",
  cursor: "pointer",
  borderRadius: "50%",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0, 0, 0, 0.30)",
};

const DELETE_MODAL_BUTTON_CONTENT = {
  marginTop: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const DELETE_IMAGE_MODAL_TEXT = {
  maxWidth: "200px",
  margin: "auto",
  textAlign: "center",
  marginTop: "16px",
  color: "#000",
  fontFamily: "Roboto",
  fontSize: "16px",
  fontWeight: "400",
  lineHeight: "20px",
};

const DELETE_IMAGE_MODAL_BOX = {
  position: "absolute",
  zIndex: "10001",
  top: "50%",
  left: "50%",
  width: "298px",
  height: "164px",
  padding: "16px",
  borderRadius: "24px",
  boxSizing: "border-box",
  backgroundColor: "#fff",
  transform: "translate(-50%, -50%)",
};

const DELETE_MODAL_BUTTON = {
  width: "130px",
  height: "44px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600",
  lineHeight: "18px",
  borderRadius: "8px",
  letterSpacing: "-0.13px",
};
