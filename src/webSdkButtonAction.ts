export class WebSdkButtonAction {
  set tryOnButtonAction(action: { onTryOnButtonClick: () => void }) {
    if ("onTryOnButtonClick" in action) {
      const aiutaButtons = document.querySelectorAll(".aiuta-try-on-button");

      if (aiutaButtons && aiutaButtons.length > 0) {
        for (const button of aiutaButtons) {
          button.addEventListener("click", action.onTryOnButtonClick);
        }
      }
    }
  }
}
