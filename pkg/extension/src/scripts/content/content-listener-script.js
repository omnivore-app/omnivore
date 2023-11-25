/* global
  browserApi
  showToolbar
  showConsentError
  prepareContent
  getPageInfo
  ACTIONS
*/

'use strict'
;(function () {
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
  if (darkModeQuery) {
    darkModeQuery.onchange = function (ev) {
      browserApi.runtime.sendMessage({
        action: ACTIONS.RefreshDarkMode,
        payload: {
          value: ev.matches,
        },
      })
    }
  }

  browserApi.runtime.onMessage.addListener(
    ({ action, payload }, sender, sendResponse) => {
      if (action === ACTIONS.GetContent) {
        const createHighlight = payload && payload.createHighlight
        prepareContent(createHighlight).then((pageContent) => {
          sendResponse({
            type: pageContent.type,
            doc: pageContent.content || '',
            uploadContentObjUrl: pageContent.uploadContentObjUrl,
            pageInfo: getPageInfo(),
          })
        })

        return true
      }

      console.log('handling ', action, payload)
      if (action === ACTIONS.Ping) {
        sendResponse({ pong: true })
      } else if (action === ACTIONS.ShowToolbar) {
        showToolbar(payload)
      } else if (action === ACTIONS.ShowConsentError) {
        showConsentError()
      } else if (action === ACTIONS.UpdateStatus) {
        updateStatus(payload)
      } else if (action === ACTIONS.LabelCacheUpdated) {
        updateLabelsFromCache(payload)
      } else if (action === ACTIONS.AddIframeContent) {
        // do nothing, handled by prepare-content.js
      } else {
        console.warn('Unknown message has been taken')
      }
    }
  )
})()
