import {
  MESSENGER,
  WHATS_APP,
  CLOSE_ICON,
  COPY_BUTTON,
  SHARE_WITH_TEXT,
} from "./constants/socialIcons";

function shareModal(imageUrl: string) {
  return `
    <div style="position: relative; width: 467px; height: 248px; padding: 20px; background: #fff; border-radius: 24px;">
      <p style="text-align: left; margin: 0">${SHARE_WITH_TEXT}</p>
      <div style="cursor: pointer; position: absolute; right: 20px; top: 12px" onclick='window.parent.postMessage({ action: "close_share_modal", imageUrl: "${imageUrl}" }, "*");'>
        ${CLOSE_ICON}
      </div>
      <div style="display: flex; column-gap: 24px; align-items: center; margin: 25px 0px 30px 0px">
        <a target="_blank" href="https://wa.me/?text=${imageUrl}" style="cursor: pointer; max-height: 74px;">${WHATS_APP}</a>
        <a target="_blank" href="https://www.messenger.com/new?text=${imageUrl}" style="cursor: pointer; max-height: 74px;">${MESSENGER}</a>
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between; border-radius: 16px; padding: 8px 12px 8px 16px; background: #F2F2F7;">
        <p style="max-width: 300px; margin: 0; overflow: hidden; text-overflow: ellipsis; font-family: 'GT Maru', sans-serif; white-space: nowrap; font-size: 14px; font-weight: 500; letter-spacing: -0.49px;">${imageUrl}</p>
        <div style="width: 70px; height: 36px; cursor: pointer" onclick="navigator.clipboard.writeText('${imageUrl}')">
          ${COPY_BUTTON}
        </div>
      </div>
    </div>
  `;
}

type GetJwtCallback = (
  params: Record<string, string>
) => string | Promise<string>;

// Define JwtAuth type
interface JwtAuth {
  subscriptionId: string;
  getJwt: GetJwtCallback;
}

const closeShareModal = () => {
  const shareModal = document.getElementById("sdk-share-modal");
  if (shareModal) {
    shareModal.style.display = "none";
  }
};

const openShareModal = (imageUrl: string) => {
  let modalWrapper = document.getElementById("sdk-share-modal");
  if (modalWrapper) {
    modalWrapper.style.display = "flex";
    modalWrapper.innerHTML = shareModal(imageUrl);
  } else {
    modalWrapper = document.createElement("div");

    modalWrapper.id = "sdk-share-modal";
    modalWrapper.style.minWidth = "100vw";
    modalWrapper.style.minHeight = "100vh";
    modalWrapper.style.position = "fixed";
    modalWrapper.style.zIndex = "99999";
    modalWrapper.style.top = "0px";
    modalWrapper.style.left = "0px";
    modalWrapper.style.display = "flex";
    modalWrapper.style.alignItems = "center";
    modalWrapper.style.justifyContent = "center";
    modalWrapper.style.background = "#7b797980";
    modalWrapper.innerHTML = shareModal(imageUrl);

    document.body.appendChild(modalWrapper);
  }
};

export default class Aiuta {
  private getJwt!: GetJwtCallback;

  private apiKey!: string;
  private userId!: string;
  private iframe: HTMLIFrameElement | null = null;
  readonly iframeOrigin = "http://localhost:5173"; // Replace with your production origin

  // init methods
  initWithApiKey(apiKey: string) {
    if (this.apiKey || (this.getJwt as keyof typeof this.getJwt))
      throw new Error("Aiuta is already initialized");
    this.apiKey = apiKey;
  }

  initWithJwt({ subscriptionId, getJwt }: JwtAuth) {
    if (this.apiKey || (this.getJwt as keyof typeof this.getJwt))
      throw new Error("Aiuta is already initialized");
    this.userId = subscriptionId;
    this.getJwt = getJwt;
  }

  private async getToken(productId: string) {
    if (this.apiKey) return this.apiKey;
    if (this.getJwt)
      return await this.getJwt({ subscriptionId: this.userId, productId });
    throw new Error("Aiuta SDK is not initialized with API key or JWT");
  }

  private createIframe(apiKey: string, productId: string) {
    const aiutaIframe: any = document.createElement("iframe");
    aiutaIframe.id = "aiuta-iframe";
    aiutaIframe.allow = "fullscreen";
    aiutaIframe.src = this.iframeOrigin;
    aiutaIframe.style.transition = "all ease-in-out 0.5s";
    aiutaIframe.style.position = "fixed";
    aiutaIframe.style.top = "12px";
    aiutaIframe.style.right = "-1000%";
    aiutaIframe.style.width = "394px";
    aiutaIframe.style.height = "632px";
    aiutaIframe.style.borderRadius = "24px";
    aiutaIframe.style.zIndex = "9999";
    aiutaIframe.style.border = "1px solid #0000001A";
    aiutaIframe.style.boxShadow = "0px 8px 28px -6px #0000001F";

    document.body.append(aiutaIframe);

    this.iframe = aiutaIframe;

    aiutaIframe.onload = () => {
      aiutaIframe.contentWindow.postMessage(
        {
          status: 200,
          skuId: productId,
          apiKey: apiKey,
          type: "baseKeys",
        },
        "*"
      );
    };

    setTimeout(() => {
      if (window.innerWidth <= 992) {
        aiutaIframe.style.right = "0px";
      } else {
        aiutaIframe.style.right = "12px";
      }
    }, 1000);

    window.addEventListener("resize", () => this.adjustIframeForViewport());
  }

  private postMessageToIframe(message: any) {
    if (!this.iframe?.contentWindow) return;

    this.iframe.contentWindow.postMessage(message, "*");
  }

  private handleMessage(productId: string) {
    const aiutaIframe = document.getElementById(
      "aiuta-iframe"
    ) as HTMLIFrameElement;
    if (!aiutaIframe) return;

    if (aiutaIframe && aiutaIframe.contentWindow) {
      this.postMessageToIframe({
        status: 200,
        skuId: productId,
        apiKey: this.apiKey,
        type: "baseKeys",
      });
    }

    aiutaIframe.onload = () => {
      const messages = async (event: any) => {
        const data = event.data;
        console.log("event data", data);

        switch (data.action) {
          case "close_modal":
            if (aiutaIframe) {
              aiutaIframe.style.right = "-1000%";
            }
            break;

          case "open_share_modal":
            if (data.imageUrl) {
              openShareModal(data.imageUrl);
            }
            break;

          case "close_share_modal":
            closeShareModal();
            break;

          case "SHARE_IMAGE":
            if (navigator.share && data.payload?.url) {
              navigator.share({
                url: data.payload.url,
                title: "Check out this image",
                text: "Here's an image I generated!",
              });
            }
            break;

          case "GET_AIUTA_API_KEYS":
            if (aiutaIframe.contentWindow) {
              if (data.isGetJwtToken) {
                const token = await this.getToken(productId);

                this.postMessageToIframe({
                  status: 200,
                  skuId: productId,
                  apiKey: this.apiKey,
                  jwtToken: token,
                  userId: this.userId,
                  type: "baseKeys",
                });
              } else {
                this.postMessageToIframe({
                  status: 200,
                  skuId: productId,
                  apiKey: this.apiKey,
                  userId: this.userId,
                  type: "baseKeys",
                });
              }
            }
            break;
        }
      };

      if (window.innerWidth <= 992) {
        aiutaIframe.style.top = "0px";
        aiutaIframe.style.width = "100%";
        aiutaIframe.style.right = "0px";
        aiutaIframe.style.height = "100%";
        aiutaIframe.style.borderRadius = "0px";
        aiutaIframe.style.border = "1px solid #ffffff";

        if (aiutaIframe && aiutaIframe.contentWindow) {
          aiutaIframe.contentWindow.postMessage(
            {
              type: "resize",
              width: window.innerWidth,
              height: window.innerHeight,
            },
            "*"
          );
        }
      }

      window.addEventListener("message", messages);

      window.addEventListener("resize", () => {
        if (aiutaIframe && aiutaIframe.contentWindow) {
          aiutaIframe.contentWindow.postMessage(
            {
              type: "resize",
              width: window.innerWidth,
              height: window.innerHeight,
            },
            "*"
          );
        }
      });
    };
  }

  private adjustIframeForViewport() {
    if (!this.iframe) return;

    if (window.innerWidth <= 992) {
      this.iframe.style.top = "0px";
      this.iframe.style.right = "0px";
      this.iframe.style.width = "100%";
      this.iframe.style.height = "100%";
      this.iframe.style.borderRadius = "0px";
      this.iframe.style.border = "1px solid #ffffff";
    } else {
      this.iframe.style.top = "12px";
      this.iframe.style.width = "394px";
      this.iframe.style.height = "632px";
      this.iframe.style.borderRadius = "24px";
      this.iframe.style.border = "1px solid #0000001A";
    }
  }

  startGeneration(productId: string) {
    if (!productId || !productId.length) {
      console.error("Product id is not provided for Aiuta.");
      return;
    }

    const aiutaIframe = document.getElementById("aiuta-iframe");

    if (aiutaIframe) {
      if (window.innerWidth <= 992) {
        aiutaIframe.style.right = "0px";
      } else {
        aiutaIframe.style.right = "12px";
      }

      this.handleMessage(productId);
    } else {
      this.createIframe(this.apiKey, productId);
      this.handleMessage(productId);
    }
  }
}
