/* global browserApi, ACTIONS */

'use strict';

(function () {
  /* only run in iframe */
  if (window === window.top) return;

  const allowedURLs = /instagram\.com/ig;
  const currentUrl = window.location.href;
  const allowCurrentUrl = allowedURLs.test(currentUrl);
  if (!allowCurrentUrl) return;

  browserApi.runtime.sendMessage({
    forwardToTab: true,
    action: ACTIONS.AddIframeContent,
    payload: {
      url: currentUrl,
      content: document.body.innerHTML
    }
  });
})();
