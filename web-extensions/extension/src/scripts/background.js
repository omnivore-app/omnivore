/* global
  ACTIONS
  ENV_IS_FIREFOX
  ENV_IS_EDGE
  browserApi
  browserActionApi
  browserScriptingApi
  fetch
  XMLHttpRequest
*/

'use strict'

import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'

class TaskQueue {
  constructor() {
    this.queue = []
    this.isRunning = false
    this.isReady = false
  }

  enqueue(task) {
    this.queue.push(task)

    // Only run the next task if the queue is ready
    if (this.isReady) {
      this.runNext()
    }
  }

  async runNext() {
    if (this.isRunning || this.queue.length === 0 || !this.isReady) return

    this.isRunning = true
    const task = this.queue.shift()

    try {
      await task()
    } catch (err) {
      console.error('Task failed:', err)
    } finally {
      this.isRunning = false
      if (this.isReady) {
        this.runNext()
      }
    }
  }

  setReady() {
    this.isReady = true
    this.runNext()
  }
}

let authToken = undefined
const queue = new TaskQueue()
const omnivoreURL = process.env.OMNIVORE_URL
const omnivoreGraphqlURL = process.env.OMNIVORE_GRAPHQL_URL

let completedRequests = {}

function getCurrentTab() {
  return new Promise((resolve) => {
    browserApi.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      function (tabs) {
        resolve(tabs[0] || null)
      }
    )
  })
}

function uploadFile({ id, uploadSignedUrl }, contentType, contentObjUrl) {
  return fetch(contentObjUrl)
    .then((r) => r.blob())
    .then((blob) => {
      return fetch(uploadSignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: blob,
      })
    })
    .catch((err) => {
      console.error('error uploading file', err)
      return undefined
    })
}

async function uploadFileRequest(url, contentType) {
  const data = JSON.stringify({
    query: `mutation UploadFileRequest($input: UploadFileRequestInput!) {
      uploadFileRequest(input:$input) {
        ... on UploadFileRequestError {
          errorCodes
        }
        ... on UploadFileRequestSuccess {
          id
          createdPageId
          uploadSignedUrl
        }
      }
    }`,
    variables: {
      input: {
        url,
        contentType,
        createPageEntry: true,
      },
    },
  })

  const field = 'uploadFileRequest'
  const result = await gqlRequest(omnivoreGraphqlURL + 'graphql', data)

  if (result[field]['errorCodes']) {
    if (result[field]['errorCodes'][0] === 'UNAUTHORIZED') {
      browserApi.tabs.sendMessage(currentTab.id, {
        action: ACTIONS.UpdateStatus,
        payload: {
          target: 'logged_out',
          status: 'logged_out',
          message: 'You are not logged in.',
          ctx: toolbarCtx,
        },
      })
      clearClickCompleteState()
    } else {
      browserApi.tabs.sendMessage(currentTab.id, {
        action: ACTIONS.UpdateStatus,
        payload: {
          status: 'failure',
          message: 'Unable to save page.',
          ctx: toolbarCtx,
        },
      })
    }
    return undefined
  }

  return result.uploadFileRequest
}

async function savePdfFile(
  currentTab,
  url,
  requestId,
  contentType,
  contentObjUrl
) {
  const toolbarCtx = {
    omnivoreURL,
    originalURL: url,
    requestId: requestId,
  }
  completedRequests[toolbarCtx.requestId] = undefined

  browserApi.tabs.sendMessage(currentTab.id, {
    action: ACTIONS.ShowToolbar,
    payload: {
      type: 'loading',
      ctx: toolbarCtx,
    },
  })
  const uploadRequestResult = await uploadFileRequest(url, contentType)
  console.log('done uploading pdf', uploadRequestResult)
  const uploadFileResult = await uploadFile(
    uploadRequestResult,
    contentType,
    contentObjUrl
  )
  URL.revokeObjectURL(contentObjUrl)

  if (uploadFileResult && uploadRequestResult.createdPageId) {
    completedRequests[toolbarCtx.requestId] = {
      requestId: toolbarCtx.requestId,
      responseId: uploadRequestResult.createdPageId,
    }

    browserApi.tabs.sendMessage(currentTab.id, {
      action: ACTIONS.UpdateStatus,
      payload: {
        status: 'success',
        target: 'page',
        ctx: {
          requestId: toolbarCtx.requestId,
          responseId: uploadRequestResult.createdPageId,
        },
      },
    })
  }

  return uploadFileResult
}

function clearClickCompleteState() {
  getStorageItem('postInstallClickComplete').then(
    (postInstallClickComplete) => {
      if (postInstallClickComplete) {
        removeStorage('postInstallClickComplete')
      }
    }
  )
}

async function saveUrl(currentTab, url) {
  const requestId = uuidv4()
  await saveApiRequest(currentTab, SAVE_URL_QUERY, 'saveUrl', {
    source: 'extension',
    clientRequestId: requestId,
    url: encodeURI(url),
  })
}

async function saveApiRequest(currentTab, query, field, input) {
  const toolbarCtx = {
    omnivoreURL,
    originalURL: input.url,
    requestId: input.clientRequestId,
  }
  completedRequests[toolbarCtx.requestId] = undefined

  const requestBody = JSON.stringify({
    query,
    variables: {
      input,
    },
  })

  browserApi.tabs.sendMessage(currentTab.id, {
    action: ACTIONS.ShowToolbar,
    payload: {
      type: 'loading',
      ctx: toolbarCtx,
    },
  })

  try {
    const result = await gqlRequest(omnivoreGraphqlURL + 'graphql', requestBody)
    if (result[field]['errorCodes']) {
      if (result[field]['errorCodes'][0] === 'UNAUTHORIZED') {
        browserApi.tabs.sendMessage(currentTab.id, {
          action: ACTIONS.UpdateStatus,
          payload: {
            target: 'logged_out',
            status: 'logged_out',
            message: 'You are not logged in.',
            ctx: toolbarCtx,
          },
        })
        clearClickCompleteState()
      } else {
        browserApi.tabs.sendMessage(currentTab.id, {
          action: ACTIONS.UpdateStatus,
          payload: {
            status: 'failure',
            message: 'Unable to save page.',
            ctx: toolbarCtx,
          },
        })
      }
      return
    }

    const url = result[field] ? result[field]['url'] : undefined
    const requestId = result[field]
      ? result[field]['clientRequestId']
      : undefined
    browserApi.tabs.sendMessage(currentTab.id, {
      action: ACTIONS.UpdateStatus,
      payload: {
        status: 'success',
        target: 'page',
        ctx: {
          readerURL: url,
          responseId: requestId,
          requestId: toolbarCtx.requestId,
        },
      },
    })

    completedRequests[toolbarCtx.requestId] = {
      readerURL: url,
      responseId: requestId,
      requestId: toolbarCtx.requestId,
    }
  } catch (err) {
    console.log('error saving: ', err)
  }

  queue.setReady()
}

function updateClientStatus(tabId, target, status, message) {
  browserApi.tabs.sendMessage(tabId, {
    action: ACTIONS.UpdateStatus,
    payload: {
      target,
      status,
      message,
    },
  })
}

async function editTitleRequest(tabId, request, completedResponse) {
  return updatePageTitle(
    omnivoreGraphqlURL + 'graphql',
    completedResponse.responseId,
    request.title
  )
    .then(() => {
      updateClientStatus(tabId, 'title', 'success', 'Title updated.')
      return true
    })
    .catch((err) => {
      console.log('caught error updating title: ', err)
      updateClientStatus(tabId, 'title', 'failure', 'Error updating title.')
      return true
    })
}

async function addNoteRequest(tabId, request, completedResponse) {
  const noteId = uuidv4()
  const shortId = nanoid(8)

  return addNote(
    omnivoreGraphqlURL + 'graphql',
    completedResponse.responseId,
    noteId,
    shortId,
    request.note
  )
    .then(() => {
      updateClientStatus(tabId, 'note', 'success', 'Note updated.')
      return true
    })
    .catch((err) => {
      console.log('caught error updating title: ', err)
      updateClientStatus(tabId, 'note', 'failure', 'Error adding note.')
      return true
    })
}

async function setLabelsRequest(tabId, request, completedResponse) {
  return setLabels(
    omnivoreGraphqlURL + 'graphql',
    completedResponse.responseId,
    request.labels
  )
    .then(() => {
      updateClientStatus(tabId, 'labels', 'success', 'Labels updated.')
      return true
    })
    .then(() => {
      browserApi.tabs.sendMessage(tabId, {
        action: ACTIONS.LabelCacheUpdated,
        payload: {},
      })
    })
    .catch(() => {
      updateClientStatus(tabId, 'labels', 'failure', 'Error updating labels.')
      return true
    })
}

async function archiveRequest(tabId, request, completedResponse) {
  return archive(omnivoreGraphqlURL + 'graphql', completedResponse.responseId)
    .then(() => {
      updateClientStatus(tabId, 'extra', 'success', 'Archived')
      return true
    })
    .catch(() => {
      updateClientStatus(tabId, 'extra', 'failure', 'Error archiving')
      return true
    })
}

async function deleteRequest(tabId, request, completedResponse) {
  return deleteItem(
    omnivoreGraphqlURL + 'graphql',
    completedResponse.responseId
  )
    .then(() => {
      updateClientStatus(tabId, 'extra', 'success', 'Deleted')
      return true
    })
    .catch(() => {
      updateClientStatus(tabId, 'extra', 'failure', 'Error deleting')
      return true
    })
}

async function processEditTitleRequest(tabId, pr) {
  const completed = completedRequests[pr.clientRequestId]
  handled = await editTitleRequest(tabId, pr, completed)
  console.log('processEditTitleRequest: ', handled)
  return handled
}

async function processAddNoteRequest(tabId, pr) {
  const completed = completedRequests[pr.clientRequestId]
  const handled = await addNoteRequest(tabId, pr, completed)
  console.log('processAddNoteRequest: ', handled)
  return handled
}

async function processSetLabelsRequest(tabId, pr) {
  const completed = completedRequests[pr.clientRequestId]
  const handled = await setLabelsRequest(tabId, pr, completed)
  console.log('processSetLabelsRequest: ', handled)
  return handled
}

async function processArchiveRequest(tabId, pr) {
  const completed = completedRequests[pr.clientRequestId]
  const handled = await archiveRequest(tabId, pr, completed)
  console.log('processArchiveRequest: ', handled)
  return handled
}

async function processDeleteRequest(tabId, pr) {
  const completed = completedRequests[pr.clientRequestId]
  const handled = await deleteRequest(tabId, pr, completed)
  console.log('processDeleteRequest: ', handled)
  return handled
}

async function saveArticle(tab, createHighlight) {
  browserApi.tabs.sendMessage(
    tab.id,
    {
      action: ACTIONS.GetContent,
      payload: {
        createHighlight: createHighlight,
      },
    },
    async (response) => {
      if (!response || typeof response !== 'object') {
        // In the case of an invalid response, we attempt
        // to just save the URL. This can happen in Firefox
        // with PDF URLs
        await saveUrl(tab, tab.url)
        return
      }

      const requestId = uuidv4()
      var { type } = response
      const { pageInfo, doc, uploadContentObjUrl } = response

      if (type == 'html' && handleBackendUrl(tab.url)) {
        type = 'url'
      }

      switch (type) {
        case 'html': {
          await saveApiRequest(tab, SAVE_PAGE_QUERY, 'savePage', {
            source: 'extension',
            clientRequestId: requestId,
            originalContent: doc,
            title: pageInfo.title,
            url: encodeURI(tab.url),
          })
          break
        }
        case 'url': {
          await saveApiRequest(tab, SAVE_URL_QUERY, 'saveUrl', {
            source: 'extension',
            clientRequestId: requestId,
            url: encodeURI(tab.url),
          })
          break
        }
        case 'pdf': {
          const uploadResult = await savePdfFile(
            tab,
            encodeURI(tab.url),
            requestId,
            pageInfo.contentType,
            uploadContentObjUrl
          )
          if (!uploadResult || !uploadResult.id) {
            // If the upload failed for any reason, try to save the PDF URL instead
            await saveApiRequest(tab, SAVE_URL_QUERY, 'saveUrl', {
              source: 'extension',
              clientRequestId: requestId,
              url: encodeURI(tab.url),
            })
            return
          }
          break
        }
      }
    }
  )
}

// credit: https://stackoverflow.com/questions/21535233/injecting-multiple-scripts-through-executescript-in-google-chrome
function executeScripts(tabId, scriptsArray, onCompleteCallback) {
  function createCallback(tabId, injectDetails, innerCallback) {
    return function () {
      browserScriptingApi.executeScript(tabId, injectDetails, innerCallback)
    }
  }

  // any callback passed by caller is called upon all scripts execute completion
  let callback = onCompleteCallback
  for (let i = scriptsArray.length - 1; i >= 0; --i) {
    callback = createCallback(tabId, { file: scriptsArray[i] }, callback)
  }
  if (callback !== null) {
    callback() // execute outermost function
  }
}

function cleanupTabState(tabId) {
  getStorage().then(function (result) {
    const itemsToRemove = []
    const keys = Object.keys(result)
    const keyPrefix = tabId + '_saveInProgress'
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (key.startsWith(keyPrefix)) {
        itemsToRemove.push(key)
      }
    }
    if (itemsToRemove.length === 0) return
    removeStorage(itemsToRemove)
  })
}

/* setup an interval timer and a timeout timer (failsave) to clear interval timer after a timeout */
function setupTimedInterval(
  timerCallback,
  timeoutCallback,
  callback,
  delay = 1000,
  timeout = 10500
) {
  const intervalId = setInterval(timerCallback, delay)
  const timeoutId = setTimeout(() => {
    clearInterval(intervalId)
    timeoutCallback()
  }, timeout)

  if (callback && typeof callback === 'function') {
    callback(intervalId, timeoutId)
  }
}

async function clearPreviousIntervalTimer(tabId) {
  const prevIntervalId = await getStorageItem(tabId + '_saveInProgress')
  if (!prevIntervalId) return

  clearInterval(prevIntervalId)

  const intervalTimeoutId = await getStorageItem(
    tabId + '_saveInProgressTimeoutId_' + prevIntervalId
  )
  if (!intervalTimeoutId) return

  clearTimeout(intervalTimeoutId)
}

function extensionSaveCurrentPage(tabId, createHighlight) {
  createHighlight = createHighlight ? true : false
  /* clear any previous timers on each click */
  clearPreviousIntervalTimer(tabId)

  /* Method to check tab loading state prior to save */
  function checkTabLoadingState(onSuccess, onPending) {
    browserApi.tabs.get(tabId, async (tab) => {
      if (tab.status !== 'complete') {
        // show message to user on page yet to complete load
        browserApi.tabs.sendMessage(tab.id, {
          action: ACTIONS.ShowMessage,
          payload: {
            type: 'loading',
            text: 'Page loading...',
          },
        })
        if (onPending && typeof onPending === 'function') {
          onPending()
        }
      } else {
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess()
        }
        await saveArticle(tab, createHighlight)
        try {
          await updateLabelsCache(omnivoreGraphqlURL + 'graphql', tab)
          browserApi.tabs.sendMessage(tab.id, {
            action: ACTIONS.LabelCacheUpdated,
            payload: {},
          })
        } catch (err) {
          console.error('error fetching labels', err, omnivoreGraphqlURL)
          return undefined
        }
      }
    })
  }

  /* call above method immediately, and if tab in loading state then setup timer */
  checkTabLoadingState(null, () => {
    setupTimedInterval(
      () => {
        /* interval timer to check tab/page loading state and save */
        checkTabLoadingState(() => {
          clearPreviousIntervalTimer(tabId)
        })
      },
      () => {
        /* timeout handling, clear timer and show timeout msg */
        clearPreviousIntervalTimer(tabId)

        browserApi.tabs.get(tabId, async (tab) => {
          /*
           * post timeout, we proceed to save as some sites (people.com) take a
           * long time to reach complete state and remain in interactive state.
           */
          await saveArticle(tab, createHighlight)
        })
      },
      (intervalId, timeoutId) => {
        /* Track interval timer and timeout timer in browser storage keyed by tabId */
        const itemsToSet = {}
        itemsToSet[tabId + '_saveInProgress'] = intervalId
        itemsToSet[tabId + '_saveInProgressTimeoutId_' + intervalId] = timeoutId
        setStorage(itemsToSet)
      }
    )
  })
}

function checkAuthOnFirstClickPostInstall(tabId) {
  return Promise.resolve(true)
}

function getConsentGranted() {
  if (!process.env.CONSENT_REQUIRED) {
    return new Promise((resolve) => {
      resolve(true)
    })
  } else {
    return getStorageItem('consentGranted').then((consentGrantedStr) => {
      return consentGrantedStr == 'true'
    })
  }
}

function handleActionClick() {
  console.log('process.env.CONSENT_REQUIRED', process.env.CONSENT_REQUIRED)
  getConsentGranted()
    .then((consentGranted) => {
      if (consentGranted) {
        executeAction(function (currentTab) {
          extensionSaveCurrentPage(currentTab.id)
        })
      } else {
        getCurrentTab().then((currentTab) => {
          browserApi.tabs.sendMessage(currentTab.id, {
            action: ACTIONS.ShowConsentError,
          })
        })
      }
    })
    .catch(() => {
      console.log('extension consent not granted')
      getCurrentTab().then((currentTab) => {
        browserApi.tabs.sendMessage(currentTab.id, {
          action: ACTIONS.ShowConsentError,
        })
      })
    })
  // } else {
  //   executeAction(function (currentTab) {
  //     extensionSaveCurrentPage(currentTab.id)
  //   })
  // }
}

function executeAction(action) {
  getCurrentTab().then((currentTab) => {
    browserApi.tabs.sendMessage(
      currentTab.id,
      {
        action: ACTIONS.Ping,
      },
      async function (response) {
        if (response && response.pong) {
          // Content script ready
          const isSignedUp = await checkAuthOnFirstClickPostInstall(
            currentTab.id
          )
          if (isSignedUp) {
            action(currentTab)
          }
        } else {
          const extensionManifest = browserApi.runtime.getManifest()
          const contentScripts = extensionManifest.content_scripts

          // No listener on the other end, inject content scripts
          const scriptFiles = [...contentScripts[0].js, ...contentScripts[1].js]
          executeScripts(currentTab.id, scriptFiles, async function () {
            const isSignedUp = await checkAuthOnFirstClickPostInstall(
              currentTab.id
            )
            if (isSignedUp) {
              action(currentTab)
            }
          })
        }
      }
    )
  })
}

function init() {
  browserApi.tabs.onActivated.addListener(({ tabId }) => {
    // Due to a chrome bug, chrome.tabs.* may run into an error because onActivated is triggered too fast.
    function checkCurrentTab() {
      browserApi.tabs.get(tabId, function (tab) {
        if (browserApi.runtime.lastError) {
          setTimeout(checkCurrentTab, 150)
        }
      })
    }
    checkCurrentTab()
  })

  browserApi.tabs.onRemoved.addListener((tabId) => {
    /* cleanup any previous saveInProgress state for the tab */
    cleanupTabState(tabId)
  })

  browserActionApi.onClicked.addListener(handleActionClick)

  // forward messages from grab-iframe-content.js script to tabs
  browserApi.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.forwardToTab) {
      delete request.forwardToTab
      browserApi.tabs.sendRequest(sender.tab.id, request)
      return
    }

    if (request.action === ACTIONS.EditTitle) {
      queue.enqueue(() =>
        processEditTitleRequest(sender.tab.id, {
          id: uuidv4(),
          type: 'EDIT_TITLE',
          tabId: sender.tab.id,
          title: request.payload.title,
          clientRequestId: request.payload.ctx.requestId,
        })
      )
    }

    if (request.action === ACTIONS.Archive) {
      queue.enqueue(() =>
        processArchiveRequest(sender.tab.id, {
          id: uuidv4(),
          type: 'ARCHIVE',
          tabId: sender.tab.id,
          clientRequestId: request.payload.ctx.requestId,
        })
      )
    }

    if (request.action === ACTIONS.Delete) {
      queue.enqueue(() =>
        processDeleteRequest(sender.tab.id, {
          type: 'DELETE',
          tabId: sender.tab.id,
          clientRequestId: request.payload.ctx.requestId,
        })
      )
    }

    if (request.action === ACTIONS.AddNote) {
      queue.enqueue(() =>
        processAddNoteRequest(sender.tab.id, {
          id: uuidv4(),
          type: 'ADD_NOTE',
          tabId: sender.tab.id,
          note: request.payload.note,
          clientRequestId: request.payload.ctx.requestId,
        })
      )
    }

    if (request.action === ACTIONS.SetLabels) {
      queue.enqueue(() =>
        processSetLabelsRequest(sender.tab.id, {
          id: uuidv4(),
          type: 'SET_LABELS',
          tabId: sender.tab.id,
          labels: request.payload.labels,
          clientRequestId: request.payload.ctx.requestId,
        })
      )
    }
  })

  browserApi.contextMenus.create({
    id: 'save-link-selection',
    title: 'Save this link to Omnivore',
    contexts: ['link'],
    onclick: async function (obj) {
      executeAction(async function (currentTab) {
        await saveUrl(currentTab, obj.linkUrl)
      })
    },
  })

  browserApi.contextMenus.create({
    id: 'save-page-selection',
    title: 'Save this page to Omnivore',
    contexts: ['page'],
    onclick: async function (obj) {
      executeAction(function (currentTab) {
        extensionSaveCurrentPage(currentTab.id)
      })
    },
  })

  browserApi.contextMenus.create({
    id: 'save-text-selection',
    title: 'Create Highlight and Save to Omnivore',
    contexts: ['selection'],
    onclick: async function (obj) {
      executeAction(function (currentTab) {
        extensionSaveCurrentPage(currentTab.id, true)
      })
    },
  })

  browser.runtime.onInstalled.addListener(async ({ reason, temporary }) => {
    // if (temporary) return // skip during development
    console.log('onInstalled: ', reason, temporary)
    switch (reason) {
      case 'update':
        getConsentGranted().then((consentGranted) => {
          if (!consentGranted) {
            const url = browser.runtime.getURL('views/installed.html')
            return browser.tabs.create({ url })
          } else {
            console.log('consent already granted, not showing installer.')
          }
        })
        break
      case 'install':
        {
          const url = browser.runtime.getURL('views/installed.html')
          await browser.tabs.create({ url })
        }
        break
      // see below
    }
  })
}

init()
