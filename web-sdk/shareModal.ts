import {
  MESSENGER,
  WHATS_APP,
  CLOSE_ICON,
  COPY_BUTTON,
  SHARE_WITH_TEXT,
} from './constants/socialIcons'

type ShareMethod = 'whatsApp' | 'messenger' | 'copy' | 'share_close'

interface ShareButton {
  id: string
  href?: string
  icon: string
  shareMethod: ShareMethod
}

export class ShareModal {
  private imageUrl: string
  private modalWrapper: HTMLElement | null = null
  private readonly modalId = 'aiuta-sdk-share-modal'
  private hasShared: boolean = false

  private get shareButtons(): ShareButton[] {
    return [
      {
        id: 'whatsapp-share',
        href: `https://wa.me/?text=${this.imageUrl}`,
        icon: WHATS_APP,
        shareMethod: 'whatsApp',
      },
      {
        id: 'messenger-share',
        href: `https://www.messenger.com/new?text=${this.imageUrl}`,
        icon: MESSENGER,
        shareMethod: 'messenger',
      },
    ]
  }

  constructor(imageUrl: string) {
    this.imageUrl = imageUrl
  }

  showModal(): void {
    this.hasShared = false
    this.createOrUpdateModal()
    this.setupEventListeners()
  }

  closeModal(): void {
    if (this.modalWrapper) {
      this.modalWrapper.remove()
      this.modalWrapper = null
    }
  }

  private createOrUpdateModal(): void {
    this.modalWrapper = this.findExistingModal()

    if (this.modalWrapper) {
      this.modalWrapper.style.display = 'flex'
      this.modalWrapper.innerHTML = this.createModalContentHTML()
    } else {
      this.modalWrapper = this.createModalWrapper()
      document.body.appendChild(this.modalWrapper)
    }
  }

  private findExistingModal(): HTMLElement | null {
    return document.getElementById(this.modalId)
  }

  private createModalWrapper(): HTMLElement {
    const wrapper = document.createElement('div')
    wrapper.id = this.modalId
    Object.assign(wrapper.style, this.getModalWrapperStyles())
    wrapper.innerHTML = this.createModalContentHTML()
    return wrapper
  }

  private createModalContentHTML(): string {
    // TODO: Replace SVGs with text elements

    const container = document.createElement('div')
    Object.assign(container.style, this.getModalContentStyles())

    const title = document.createElement('p')
    Object.assign(title.style, this.getModalTitleStyles())
    title.innerHTML = SHARE_WITH_TEXT

    const closeBtn = document.createElement('div')
    Object.assign(closeBtn.style, this.getCloseButtonStyles())
    closeBtn.id = 'share-modal-close'
    closeBtn.innerHTML = CLOSE_ICON

    const shareContainer = document.createElement('div')
    Object.assign(shareContainer.style, this.getShareButtonsContainerStyles())
    shareContainer.innerHTML = this.createShareButtonsHTML()

    const copySection = document.createElement('div')
    copySection.innerHTML = this.createCopySectionHTML()

    container.append(title, closeBtn, shareContainer, copySection)
    return container.outerHTML
  }

  private createShareButtonsHTML(): string {
    return this.shareButtons.map((button) => this.createShareButtonHTML(button)).join('')
  }

  private createShareButtonHTML(button: ShareButton): string {
    const link = document.createElement('a')
    link.target = '_blank'
    link.id = button.id
    if (button.href) {
      link.href = button.href
    }
    Object.assign(link.style, this.getShareButtonStyles())
    link.innerHTML = button.icon
    return link.outerHTML
  }

  private createCopySectionHTML(): string {
    const container = document.createElement('div')
    Object.assign(container.style, this.getCopySectionStyles())

    const text = document.createElement('p')
    Object.assign(text.style, this.getCopyTextStyles())
    text.textContent = this.imageUrl

    const copyBtn = document.createElement('div')
    Object.assign(copyBtn.style, this.getCopyButtonStyles())
    copyBtn.id = 'copy-share'
    copyBtn.innerHTML = COPY_BUTTON

    container.append(text, copyBtn)
    return container.outerHTML
  }

  private getModalWrapperStyles(): Partial<CSSStyleDeclaration> {
    return {
      minWidth: '100vw',
      minHeight: '100vh',
      position: 'fixed',
      zIndex: '99999',
      top: '0px',
      left: '0px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#7b797980',
    }
  }

  private getModalContentStyles(): Partial<CSSStyleDeclaration> {
    return {
      position: 'relative',
      width: '467px',
      height: '248px',
      padding: '20px',
      background: '#fff',
      borderRadius: '24px',
    }
  }

  private getModalTitleStyles(): Partial<CSSStyleDeclaration> {
    return {
      textAlign: 'left',
      margin: '0',
    }
  }

  private getCloseButtonStyles(): Partial<CSSStyleDeclaration> {
    return {
      cursor: 'pointer',
      position: 'absolute',
      right: '20px',
      top: '12px',
    }
  }

  private getShareButtonsContainerStyles(): Partial<CSSStyleDeclaration> {
    return {
      display: 'flex',
      columnGap: '24px',
      alignItems: 'center',
      margin: '25px 0px 30px 0px',
    }
  }

  private getShareButtonStyles(): Partial<CSSStyleDeclaration> {
    return {
      cursor: 'pointer',
      maxHeight: '74px',
    }
  }

  private getCopySectionStyles(): Partial<CSSStyleDeclaration> {
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '16px',
      padding: '8px 12px 8px 16px',
      background: '#F2F2F7',
    }
  }

  private getCopyTextStyles(): Partial<CSSStyleDeclaration> {
    return {
      maxWidth: '300px',
      margin: '0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontFamily: "'GT Maru', sans-serif",
      whiteSpace: 'nowrap',
      fontSize: '14px',
      fontWeight: '500',
      letterSpacing: '-0.49px',
    }
  }

  private getCopyButtonStyles(): Partial<CSSStyleDeclaration> {
    return {
      width: '70px',
      height: '36px',
      cursor: 'pointer',
    }
  }

  private setupEventListeners(): void {
    this.setupShareButtonListeners()
    this.setupCopyButtonListener()
    this.setupCloseButtonListener()
  }

  private setupShareButtonListeners(): void {
    this.shareButtons.forEach((button) => {
      const element = document.getElementById(button.id)
      element?.addEventListener('click', () => this.handleShareButtonClick(button.shareMethod))
    })
  }

  private setupCopyButtonListener(): void {
    const copyButton = document.getElementById('copy-share')
    copyButton?.addEventListener('click', () => {
      navigator.clipboard.writeText(this.imageUrl)
      this.handleShareButtonClick('copy')
    })
  }

  private setupCloseButtonListener(): void {
    const closeButton = document.getElementById('share-modal-close')
    closeButton?.addEventListener('click', () => this.handleCloseButtonClick())
  }

  private handleShareButtonClick(shareMethod: ShareMethod): void {
    this.sendAnalytics(shareMethod)
    this.hasShared = true
  }

  private handleCloseButtonClick(): void {
    if (!this.hasShared) {
      this.sendAnalytics('share_close')
    }
    this.closeModal()
  }

  private sendAnalytics(shareMethod: ShareMethod): void {
    const aiutaIframe = this.getAiutaIframe()
    if (aiutaIframe?.contentWindow) {
      aiutaIframe.contentWindow.postMessage({ action: 'ANALYTIC_SOCIAL_MEDIA', shareMethod }, '*')
    }
  }

  private getAiutaIframe(): HTMLIFrameElement | null {
    return document.getElementById('aiuta-iframe') as HTMLIFrameElement
  }
}
