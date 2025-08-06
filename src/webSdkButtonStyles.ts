export class WebSdkButtonStyles {
  set configs(config: {
    bt_bg_color: string;
    bt_tx_color: string;
    bt_fontFamily: string;
    bt_borderRadius: string;
  }) {
    const iframe: any = document.getElementById("sdk-frame");
    const aiutaButtons = document.querySelectorAll(".aiuta-try-on-button");

    localStorage.setItem("bt_bg_color", config.bt_bg_color);
    localStorage.setItem("bt_tx_color", config.bt_tx_color);
    localStorage.setItem("bt_fontFamily", config.bt_fontFamily);
    localStorage.setItem("bt_borderRadius", config.bt_borderRadius);

    const bt_bg_color = localStorage.getItem("bt_bg_color");
    const bt_tx_color = localStorage.getItem("bt_tx_color");
    const bt_fontFamily = localStorage.getItem("bt_fontFamily");
    const bt_borderRadius = localStorage.getItem("bt_borderRadius");

    if (iframe) {
      iframe.contentWindow.postMessage(
        {
          bt_tx_color: bt_tx_color,
          bt_bg_color: bt_bg_color,
          bt_fontFamily: bt_fontFamily,
          bt_borderRadius: bt_borderRadius,
          type: "ADD_GENERATION_BUTTON_CONFIGS",
        },
        "*"
      );
    }

    if (aiutaButtons && aiutaButtons.length > 0) {
      for (const button of aiutaButtons) {
        const currentButton: any = button;
        currentButton.style.background = bt_bg_color ?? "#4000FF";
        currentButton.style.color = bt_tx_color ?? "#fff";
        currentButton.style.fontFamily = bt_fontFamily ?? "GT Maru";
        currentButton.style.borderRadius = bt_borderRadius ?? "0px";
      }
    }
  }
}
