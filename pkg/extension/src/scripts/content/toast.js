/* global ENV_EXTENSION_ORIGIN */

'use strict';

(function () {
  let currentToastEl;
  let currentIconEl;
  let currentTextEl;
  let hideToastTimeout;

  const systemIcons = {
    spinner: '<path d="M8.25.004a8 8 0 0 1 0 15.992L8 16a.5.5 0 0 1-.09-.992L8 15a7 7 0 0 0 .24-13.996L8 1a.5.5 0 0 1-.09-.992L8 0l.25.004z"><animateTransform attributeName="transform" attributeType="XML" dur="800ms" from="0 8 8" repeatCount="indefinite" to="360 8 8" type="rotate"/></path>',
    success: '<path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm3.043 4.502.085.015.063.02.076.04.055.04.032.03.037.041.042.062.03.06.02.062.015.082.002.067-.008.068-.03.102-.05.093-.047.057-4.011 4.013a.5.5 0 0 1-.638.057l-.07-.057-2-2-.037-.042-.042-.062-.03-.06-.02-.062-.012-.06-.004-.053v-.057l.016-.086.02-.063.04-.076.04-.055.03-.032.041-.037.062-.042.06-.03.062-.02.059-.012.054-.004h.058l.085.016.063.02.093.052.057.046L7 9.293l3.646-3.647.042-.037.062-.042.06-.03.062-.02.059-.012.054-.004h.058z"/>',
    failed: '<path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zm0 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 10.5a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1zm0-8a.5.5 0 0 1 .5.5v6a.5.5 0 1 1-1 0V4a.5.5 0 0 1 .5-.5z"/>',
    close: '<path d="M3.646 3.646a.5.5 0 0 1 .708 0L8 7.293l3.646-3.647a.5.5 0 0 1 .708.708L8.707 8l3.647 3.646a.5.5 0 0 1-.708.708L8 8.707l-3.646 3.647a.5.5 0 0 1-.708-.708L7.293 8 3.646 4.354a.5.5 0 0 1 0-.708z"/>'
  };

  function createToastContainer () {
    const toastEl = document.createElement('div');
    toastEl.className = 'webext-omnivore-toast';
    toastEl.style.cssText = `all: initial !important;
      position: fixed !important;
      top: 20px !important;
      right: 45px !important;
      z-index: 9999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      overflow: hidden !important;
      width: 240px !important;
      height: 80px !important;
      border-radius: 10px !important;
      background: #fff !important;
      color: #3d3d3d !important;
      fill: currentColor !important;
      font: 700 13px Inter, sans-serif !important;
      box-shadow: 0 1px 89px rgba(57, 59, 67, 0.25) !important;
      user-select: none !important;
      transition: all 300ms ease !important;
  `;
    return toastEl;
  }

  function createToastCloseButton () {
    const buttonEl = document.createElement('button');
    buttonEl.style.cssText = `all: initial !important;
      position: absolute !important;
      top: 8px !important;
      right: 8px !important;
      border: none !important;
      background: none !important;
      color: inherit !important;
      fill: inherit !important;
      outline: none !important;
      cursor: pointer !important;
    `;

    const iconEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconEl.setAttribute('viewBox', '0 0 16 16');
    iconEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    iconEl.style.cssText = `all: initial !important;
      width: 16px !important;
      height: 16px !important;
      color: inherit !important;
      fill: inherit !important;
    `;
    iconEl.addEventListener('click', function () {
      currentToastEl.remove();
    });
    iconEl.innerHTML = systemIcons.close;
    buttonEl.appendChild(iconEl);

    return buttonEl;
  }

  function createCtaModal (url) {
    const fragment = document.createDocumentFragment();

    const closeButtonEl = createToastCloseButton();
    fragment.appendChild(closeButtonEl);

    const iframeEl = document.createElement('iframe');
    const iframePath = '/views/cta-popup.html?url=' + encodeURIComponent(url);
    const iframeUrl = ENV_EXTENSION_ORIGIN + iframePath;
    iframeEl.src = iframeUrl;
    iframeEl.style.cssText = `all: initial !important;
      width: 310px !important;
      height: 360px !important;
  `;
    fragment.appendChild(iframeEl);
    return fragment;
  }

  function updateToastText (payload) {
    if (!currentTextEl) return;

    if (!payload) {
      currentTextEl.textContent = '';
      return;
    }

    currentTextEl.textContent = payload.text || '';

    const potentialLink = payload.link;
    if (!potentialLink) return;

    const linkEl = document.createElement('a');
    if (potentialLink.startsWith('http')) {
      linkEl.href = potentialLink;
    }
    linkEl.target = '_blank';
    linkEl.rel = 'external nofollow noopener noreferrer';
    linkEl.textContent = payload.linkText || 'link';
    linkEl.style.cssText = `all: initial !important;
      margin-left: 1rem !important;
      color: #0645ad !important;
      font: inherit !important;
      cursor: pointer !important;
    `;
    currentTextEl.appendChild(linkEl);
  }

  function loadInitialToastContent () {
    currentToastEl.textContent = '';

    const iconEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconEl.setAttribute('viewBox', '0 0 16 16');
    iconEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    iconEl.style.cssText = `all: initial !important;
      height: 20px !important;
      width: 20px !important;
      margin-left: 24px !important;
      fill: inherit !important;
      color: inherit !important;
    `;
    currentIconEl = iconEl;
    currentToastEl.appendChild(iconEl);

    const textEl = document.createElement('div');
    textEl.style.cssText = `all: initial !important;
      flex: 1 !important;
      padding: 0 24px !important;
      color: inherit !important;
      font: inherit !important;
    `;
    currentTextEl = textEl;
    currentToastEl.appendChild(textEl);
  }

  function hideToastAfter (timeInMs) {
    if (hideToastTimeout) clearTimeout(hideToastTimeout);
    hideToastTimeout = setTimeout(function () {
      currentToastEl.remove();
    }, timeInMs);
  }

  function showMessageToast (payload) {
    const bodyEl = document.body;
    if (!bodyEl) return;

    let duration = 5e3;

    if (!currentToastEl) {
      currentToastEl = createToastContainer();
    }

    if (!currentIconEl || !currentTextEl) {
      loadInitialToastContent();
    }

    let styleAsError = false;
    if (payload.type === 'loading') {
      duration = 20e3;
      currentIconEl.innerHTML = systemIcons.spinner;
      updateToastText(payload);
    } else if (payload.type !== 'error') {
      currentIconEl.innerHTML = systemIcons.success;
      updateToastText(payload);
    } else if (payload.errorCode && payload.errorCode === 401) {
      currentToastEl.textContent = '';
      currentToastEl.style.setProperty('width', '310px', 'important');
      currentToastEl.style.setProperty('height', 'auto', 'important');
      currentIconEl = null;
      currentTextEl = null;
      const ctaModalEl = createCtaModal(payload.url);
      currentToastEl.appendChild(ctaModalEl);
      duration = 8e3;
    } else {
      styleAsError = true;
      currentIconEl.innerHTML = systemIcons.failed;
      updateToastText(payload);
    }

    const newBackgroundColor = styleAsError ? '#808080' : '#fff';
    const newTextColor = styleAsError ? '#fff' : '#3d3d3d';
    currentToastEl.style.setProperty('background', newBackgroundColor, 'important');
    currentToastEl.style.setProperty('color', newTextColor, 'important');

    if (currentToastEl.parentNode !== bodyEl) {
      bodyEl.appendChild(currentToastEl);
    }

    hideToastAfter(duration);

    // remove any existing toasts not created by current content script
    const presentToastsCol = document.querySelectorAll('.webext-omnivore-toast');
    for (let i = 0; i < presentToastsCol.length; i++) {
      const toastEl = presentToastsCol[i];
      if (toastEl !== currentToastEl) {
        toastEl.remove();
      }
    }
  }

  window.showMessage = showMessageToast;
})();
