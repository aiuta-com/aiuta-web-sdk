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
          <div style="cursor: pointer; position: absolute; right: 20px; top: 12px" onclick='window.parent.postMessage({ action: "close_share_modal", imageUrl: "\${imageUrl}" }, "*");'>
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

const closeShareModal = () => {
  const shareModal = document.getElementById("sdk-share-modal");
  if (shareModal) {
    shareModal.style.display = "none";
  }
};

const openShareModal = (imageUrl: string) => {
  const existingShareModal = document.getElementById("sdk-share-modal");
  if (existingShareModal) {
    existingShareModal.style.display = "flex";
  } else {
    const modalWrapper = document.createElement("div");

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

const createAiutaIframe = (apiKey: string, skuId: string) => {
  const aiutaIframe: any = document.createElement("iframe");
  aiutaIframe.id = "aiuta-iframe";
  aiutaIframe.allow = "fullscreen";
  aiutaIframe.src = "https://static.aiuta.com/sdk/v0/index.html";
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

  setTimeout(() => {
    aiutaIframe.contentWindow.postMessage(
      {
        status: 200,
        skuId,
        apiKey: apiKey,
        type: "baseKeys",
      },
      "*"
    );
  }, 5000);

  setTimeout(() => {
    aiutaIframe.style.right = "12px";
  }, 1000);
};

const handleListenWindowMessages = (apiKey: string, productId: string) => {
  const aiutaIframe = document.getElementById(
    "aiuta-iframe"
  ) as HTMLIFrameElement;
  if (!aiutaIframe) return;

  aiutaIframe.onload = () => {
    const messages = async (event: any) => {
      if (
        event.data &&
        typeof event.data === "object" &&
        "action" in event.data
      ) {
        const action = event.data.action;

        if (action === "close_modal") {
          aiutaIframe.style.right = "-1000%";
        } else if (action === "open_share_modal") {
          openShareModal(event.data.imageUrl);
        } else if (action === "close_share_modal") {
          closeShareModal();
        } else if (action === "get_window_sizes") {
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
        } else if (action === "SHARE_IMAGE") {
          navigator.share({
            url: event.data.payload.url,
            title: "Check out this image",
            text: "Here's an image I generated!",
          });
        } else if (action === "GET_AIUTA_API_KEYS") {
          if (aiutaIframe && aiutaIframe.contentWindow) {
            aiutaIframe.contentWindow.postMessage(
              {
                status: 200,
                skuId: productId,
                apiKey: apiKey,
                type: "baseKeys",
              },
              "*"
            );
          }
        }

        if (window.innerWidth <= 992) {
          aiutaIframe.style.top = "0px";
          aiutaIframe.style.width = "100%";
          aiutaIframe.style.height = "100%";
          aiutaIframe.style.borderRadius = "0px";
          aiutaIframe.style.border = "1px solid #ffffff";
        }
      }
    };

    if (window.innerWidth <= 992) {
      aiutaIframe.style.top = "0px";
      aiutaIframe.style.width = "100%";
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
};

export default class Aiuta {
  apiKey: string = "";

  constructor(apiKey: string) {
    if (!apiKey || !apiKey.length) {
      console.error("Api key is not provided for Aiuta.");
      return;
    }

    this.apiKey = apiKey;
  }

  startGeneration(productId: string) {
    if (!this.apiKey.length) return;

    if (!productId || !productId.length) {
      console.error("Product id is not provided for Aiuta.");
      return;
    }

    const aiutaIframe = document.getElementById("aiuta-iframe");

    if (aiutaIframe) {
      aiutaIframe.style.right = "12px";
      handleListenWindowMessages(this.apiKey, productId);
    } else {
      createAiutaIframe(this.apiKey, productId);
      handleListenWindowMessages(this.apiKey, productId);
    }
  }
}
