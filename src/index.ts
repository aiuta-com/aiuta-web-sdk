import "./webSdkButtonAction";
import "./webSdkButtonStyles";

import { WebSdkButtonAction } from "./webSdkButtonAction";
import { WebSdkButtonStyles } from "./webSdkButtonStyles";
import {
  MESSENGER,
  WHATS_APP,
  CLOSE_ICON,
  COPY_BUTTON,
  SHARE_WITH_TEXT,
} from "./constants/socialIcons";

declare global {
  interface Window {
    MySDK: {
      closeModal: () => void;
      openModal: () => void;
      createIframe: () => void;
    };
    ShowSdkModal: {
      openShareModal: (imageUrl: string) => void;
      closeShareModal: () => void;
    };
    AiutaWebSdkButtonStyles: typeof WebSdkButtonStyles;
    AiutaWebSdkButtonAction: typeof WebSdkButtonAction;
  }
}

(() => {
  (function () {
    if (window.MySDK) return;
    let isShowTryOnButton = false;

    async function handleCheckProductStatus(
      apiKey: string,
      skuId: string,
      skuCatalogName: string
    ) {
      if (!skuId || !skuCatalogName) return;

      try {
        const response = await fetch(
          "https://api.aiuta.com/sku_items/${skuCatalogName}/${skuId}",
          {
            headers: { "x-api-key": apiKey },
          }
        );
        const data = await response.json();

        if (data && "is_ready" in data) {
          isShowTryOnButton = data.is_ready;
        }
      } catch (error) {
        console.error("Check product status Error: ", error);
      }
    }

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

    window.ShowSdkModal = {
      closeShareModal: () => {
        const shareModal = document.getElementById("sdk-share-modal");
        if (shareModal) {
          shareModal.style.display = "none";
        }
      },
      openShareModal: (imageUrl: string) => {
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
      },
    };

    window.AiutaWebSdkButtonStyles = WebSdkButtonStyles;
    window.AiutaWebSdkButtonAction = WebSdkButtonAction;

    window.MySDK = {
      closeModal: () => {
        const iframe = document.getElementById("sdk-frame");
        if (iframe) {
          iframe.style.right = "-1000%";
        }
      },
      openModal: () => {
        const iframe = document.getElementById("sdk-frame");
        if (iframe) {
          iframe.style.right = "0%";
        }
      },
      createIframe: () => {
        const iframe: any = document.createElement("iframe");
        iframe.id = "sdk-frame";
        iframe.allow = "fullscreen";
        iframe.src = "https://web-sdk.aiuta.com";
        iframe.style.transition = "all ease-in-out 0.5s";
        iframe.style.position = "fixed";
        iframe.style.top = "12px";
        iframe.style.right = "-1000%";
        iframe.style.width = "394px";
        iframe.style.height = "632px";
        iframe.style.borderRadius = "24px";
        iframe.style.zIndex = "9999";
        iframe.style.border = "1px solid #0000001A";
        iframe.style.boxShadow = "0px 8px 28px -6px #0000001F";

        document.body.appendChild(iframe);

        iframe.onload = () => {
          window.parent.postMessage({ action: "GET_AIUTA_API_KEYS" }, "*");

          const handleListenWindowMessages = async (event: any) => {
            if (
              event.data &&
              typeof event.data === "object" &&
              "action" in event.data
            ) {
              const action = event.data.action;

              if (action === "close_modal") {
                window.MySDK.closeModal();
              } else if (action === "open_share_modal") {
                window.ShowSdkModal.openShareModal(event.data.imageUrl);
              } else if (action === "close_share_modal") {
                window.ShowSdkModal.closeShareModal();
              } else if (action === "get_window_sizes") {
                iframe.contentWindow.postMessage(
                  {
                    type: "resize",
                    width: window.innerWidth,
                    height: window.innerHeight,
                  },
                  "*"
                );
              } else if (action === "SHARE_IMAGE") {
                navigator.share({
                  url: event.data.payload.url,
                  title: "Check out this image",
                  text: "Here's an image I generated!",
                });
              } else if (action === "GET_AIUTA_API_KEYS") {
                const trynOnElm: any = document.querySelector(".aiuta-web-sdk");
                const script = document.getElementById("aiuta-web-sdk-base");

                let skuId = "";
                let apiKey = "";
                let skuCatalogName = "";

                if (!script) {
                  console.error("Script is missing for Aiuta Web SDK");
                } else {
                  const aiutAapiKey = script.getAttribute("api-key");
                  if (aiutAapiKey) {
                    apiKey = aiutAapiKey;
                  } else {
                    console.error(
                      "api-key is missing in script for Aiuta Web SDK"
                    );
                  }
                }

                if (!trynOnElm) {
                  console.error("Aiuta Web SDK button is missing");
                } else {
                  const tryOnElmDataSet = trynOnElm.dataset;

                  if (!("skuId" in tryOnElmDataSet)) {
                    console.error("Aiuta Web SDK skuId is missing");
                  } else {
                    skuId = tryOnElmDataSet.skuId;
                  }

                  if (!("skuCatalogName" in tryOnElmDataSet)) {
                    console.error("Aiuta Web SDK skuCatalogName is missing");
                  } else {
                    skuCatalogName = tryOnElmDataSet.skuCatalogName;
                  }

                  handleCheckProductStatus(apiKey, skuId, skuCatalogName);
                }

                if (
                  skuId.length > 0 &&
                  apiKey.length > 0 &&
                  skuCatalogName.length > 0
                ) {
                  iframe.contentWindow.postMessage(
                    {
                      status: 200,
                      skuId,
                      apiKey,
                      type: "baseKeys",
                      skuCatalogName,
                    },
                    "*"
                  );
                } else {
                  iframe.contentWindow.postMessage(
                    {
                      status: 500,
                      type: "baseKeys",
                    },
                    "*"
                  );
                }
              }

              if (window.innerWidth <= 992) {
                iframe.style.top = "0px";
                iframe.style.width = "100%";
                iframe.style.height = "100%";
                iframe.style.borderRadius = "0px";
                iframe.style.border = "1px solid #ffffff";
              }
            }
          };

          if (window.innerWidth <= 992) {
            iframe.style.top = "0px";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.borderRadius = "0px";
            iframe.style.border = "1px solid #ffffff";

            iframe.contentWindow.postMessage(
              {
                type: "resize",
                width: window.innerWidth,
                height: window.innerHeight,
              },
              "*"
            );
          }

          window.addEventListener("message", handleListenWindowMessages);

          window.addEventListener("resize", () => {
            iframe.contentWindow.postMessage(
              {
                type: "resize",
                width: window.innerWidth,
                height: window.innerHeight,
              },
              "*"
            );
          });
        };
      },
    };

    window.MySDK.createIframe();

    let callButtonInterval: any;
    let callTryOnButtonCount = 0;

    callButtonInterval = setInterval(() => {
      callTryOnButtonCount++;
      if (callTryOnButtonCount >= 10) clearInterval(callButtonInterval);

      if (!isShowTryOnButton) return;

      const bt_bg_color = localStorage.getItem("bt_bg_color");
      const bt_tx_color = localStorage.getItem("bt_tx_color");
      const bt_fontFamily = localStorage.getItem("bt_fontFamily");
      const bt_borderRadius = localStorage.getItem("bt_borderRadius");

      const productDom: any = document.querySelectorAll(".aiuta-web-sdk");
      if (productDom && productDom.length > 0) {
        for (const aiutaElm of productDom) {
          const button = document.createElement("button");
          button.className = "aiuta-try-on-button";
          button.innerText = "Try on you";
          button.style.cursor = "pointer";
          button.style.width = "147px";
          button.style.height = "40px";
          button.style.background = bt_bg_color ?? "#4000FF";
          button.style.color = bt_tx_color ?? "#fff";
          button.style.borderRadius = bt_borderRadius ?? "0px";
          button.style.border = "none";
          button.style.fontFamily = bt_fontFamily ?? "sans-serif";

          button.onclick = function () {
            const sdkIframe: any = document.getElementById("sdk-frame");
            if (window.innerWidth <= 992) {
              sdkIframe.style.right = "0";
            } else {
              sdkIframe.style.right = "12px";
            }
          };

          aiutaElm.append(button);
          clearInterval(callButtonInterval);
        }
      }
    }, 1000);
  })();
})();
