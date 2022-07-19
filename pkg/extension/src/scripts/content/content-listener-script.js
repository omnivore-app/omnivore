/* global
  browserApi
  showMessage
  prepareContent
  getPageInfo
  ACTIONS
*/

'use strict';

(function () {
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (darkModeQuery) {
    darkModeQuery.onchange = function (ev) {
      browserApi.runtime.sendMessage({
        action: ACTIONS.RefreshDarkMode,
        payload: {
          value: ev.matches
        }
      });
    };
  }

  browserApi.runtime.onMessage.addListener(({ action, payload }, sender, sendResponse) => {
    if (action === ACTIONS.GetContent) {
      prepareContent().then((pageContent) => {
        sendResponse({
          type: pageContent.type,
          doc: pageContent.content || '',
          uploadContentObjUrl: pageContent.uploadContentObjUrl,
          pageInfo: getPageInfo()
        });
      });

      /* return true to signify handlers above can asynchronously invoke the response callback  */
      return true;
    }

    /* other actions */
    if (action === ACTIONS.Ping) {
      sendResponse({ pong: true });
    } else if (action === ACTIONS.ShowMessage) {
      showMessage(payload);
    } else if (action === ACTIONS.GetPageInfo) {
      const pageInfo = getPageInfo();
      sendResponse(pageInfo);
    } else if (action === ACTIONS.AddIframeContent) {
      // do nothing, handled by prepare-content.js
    } else {
      console.warn('Unknown message has been taken');
    }
  });
})();
