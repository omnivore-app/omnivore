/* global
  ACTIONS
  CREATE_ARTICLE_QUERY
  CREATE_ARTICLE_SAVING_REQUEST_QUERY
  ENV_IS_FIREFOX
  ENV_IS_EDGE
  browserApi
  browserActionApi
  browserScriptingApi
  fetch
  XMLHttpRequest
*/

'use strict';

let authToken = undefined;
const omnivoreURL = process.env.OMNIVORE_URL;
const omnivoreGraphqlURL = process.env.OMNIVORE_GRAPHQL_URL;

/* storage helper functions */
function getStorage (keyOrKeys) {
  return new Promise((resolve) => {
    browserApi.storage.local.get(keyOrKeys || null, (result) => {
      resolve(result || {});
    });
  });
}

function getStorageItem (singleKey) {
  return new Promise((resolve) => {
    browserApi.storage.local.get(singleKey, (result) => {
      const finalResult = (result && result[singleKey]) || null;
      resolve(finalResult);
    });
  });
}

function setStorage (itemsToSet) {
  return new Promise((resolve) => {
    browserApi.storage.local.set(itemsToSet, resolve);
  });
}

function removeStorage (itemsToRemove) {
  return new Promise((resolve) => {
    browserApi.storage.local.remove(itemsToRemove, resolve);
  });
}

function setupConnection(xhr) {
  xhr.setRequestHeader('Content-Type', 'application/json');
  if (authToken) {
    xhr.setRequestHeader('Authorization', authToken);
  }
}

/* other code */
function uploadFile ({ id, uploadSignedUrl }, contentType, contentObjUrl) {
  return fetch(contentObjUrl)
    .then((r) => r.blob())
    .then((blob) => {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadSignedUrl, true);
        xhr.setRequestHeader('Content-Type', contentType);

        xhr.onerror = () => {
          resolve(null);
        };
        xhr.onload = () => {
          // Uploaded.
          resolve({ id });
        };
        xhr.send(blob);
      });
    })
    .catch((err) => {
      console.error('error uploading file', err)
      return undefined
    });
}

function savePdfFile (tab, url, contentType, contentObjUrl) {
  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = async function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const { data } = JSON.parse(xhr.response);

          if ('errorCodes' in data.uploadFileRequest) {
            if (data.uploadFileRequest.errorCodes[0] === 'UNAUTHORIZED') {
              clearClickCompleteState();
              browserApi.tabs.sendMessage(tab.id, {
                action: ACTIONS.ShowMessage,
                payload: {
                  text: 'Unable to save page',
                  type: 'error',
                  errorCode: 401,
                  url: omnivoreURL
                }
              });
            }
          }

          if (!data.uploadFileRequest || !data.uploadFileRequest.id || 'errorCodes' in data.uploadFileRequest) {
            browserApi.tabs.sendMessage(tab.id, {
              action: ACTIONS.ShowMessage,
              payload: {
                text: 'Unable to save page',
                type: 'error'
              }
            });
          } else {
            const uploadFileId = await uploadFile(data.uploadFileRequest, contentType, contentObjUrl);
            URL.revokeObjectURL(contentObjUrl);
            return resolve(uploadFileId);
          }
        } else if (xhr.status === 400) {
          browserApi.tabs.sendMessage(tab.id, {
            action: ACTIONS.ShowMessage,
            payload: {
              text: 'Unable to save page',
              type: 'error'
            }
          });
        }
        resolve(false);
      }
    };

    const data = JSON.stringify({
      query: `mutation UploadFileRequest($input: UploadFileRequestInput!) {
        uploadFileRequest(input:$input) {
          ... on UploadFileRequestError {
            errorCodes
          }
          ... on UploadFileRequestSuccess {
            id
            uploadSignedUrl
          }
        }
      }`,
      variables: {
        input: {
          url,
          contentType
        }
      }
    });

    xhr.open('POST', omnivoreGraphqlURL + 'graphql', true);
    setupConnection(xhr);

    xhr.send(data);
  });
}

function clearClickCompleteState () {
  getStorageItem('postInstallClickComplete').then((postInstallClickComplete) => {
    if (postInstallClickComplete) {
      removeStorage('postInstallClickComplete');
    }
  });
}

function saveArticle (tab) {
  browserApi.tabs.sendMessage(tab.id, {
    action: ACTIONS.ShowMessage,
    payload: {
      type: 'loading',
      text: 'Saving...'
    }
  });

  const xhr = new XMLHttpRequest();
  const descriptions = {
    BAD_DATA: 'Unable to save page',
    NOT_ALLOWED_TO_PARSE: 'Not allowed to parse this article',
    UNAUTHORIZED: 'Please login to Omnivore to authorize this action',
    UNABLE_TO_FETCH: 'Unable to fetch page',
    PAYLOAD_TOO_LARGE: 'This article is too large'
  };
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const { data } = JSON.parse(xhr.response);
        if ('createArticle' in data) {
          if ('errorCodes' in data.createArticle) {
            const messagePayload = {
              text: descriptions[data.createArticle.errorCodes[0]] || 'Unable to save page',
              type: 'error'
            };

            if (data.createArticle.errorCodes[0] === 'UNAUTHORIZED') {
              messagePayload.errorCode = 401;
              messagePayload.url = omnivoreURL;

              clearClickCompleteState();
            }

            browserApi.tabs.sendMessage(tab.id, {
              action: ACTIONS.ShowMessage,
              payload: messagePayload
            });
          } else {
            const article = data.createArticle.createdArticle;
            const user = data.createArticle.user;
            const link = omnivoreURL + (article.hasContent ? (`/${user.profile.username}/` + article.slug) : '/home');
            browserApi.tabs.sendMessage(tab.id, {
              action: ACTIONS.ShowMessage,
              payload: {
                text: 'Page saved!',
                link: link,
                linkText: 'View',
                type: 'success'
              }
            });
          }
        } else {
          if ('errorCodes' in data.createArticleSavingRequest) {
            browserApi.tabs.sendMessage(tab.id, {
              action: ACTIONS.ShowMessage,
              payload: {
                text: descriptions[data.createArticleSavingRequest.errorCodes[0]] || 'Unable to save page',
                type: 'error'
              }
            });
          } else {
            const articleSavingRequest = data.createArticleSavingRequest.articleSavingRequest;
            const link = omnivoreURL + '/article/sr/' + articleSavingRequest.id;
            browserApi.tabs.sendMessage(tab.id, {
              action: ACTIONS.ShowMessage,
              payload: {
                text: 'Page saved!',
                link: link,
                linkText: 'View',
                type: 'success'
              }
            });
          }
        }
      } else if (xhr.status === 400) {
        browserApi.tabs.sendMessage(tab.id, {
          action: ACTIONS.ShowMessage,
          payload: {
            text: 'Unable to save page',
            type: 'error'
          }
        });
      }
    }
  };

  browserApi.tabs.sendMessage(tab.id, {
    action: ACTIONS.GetContent
  }, async (response) => {
    if (!response || typeof response !== 'object') {
      // invalid response
      return;
    }

    const { type, pageInfo, doc, uploadContentObjUrl } = response;

    let uploadResult = null;

    switch(type) {
      case 'pdf': {
        // For PDFs, we first upload the PDF file before passing the upload file ID in createArticle
        uploadResult = await savePdfFile(tab, encodeURI(tab.url), pageInfo.contentType, uploadContentObjUrl);
        if (!uploadResult || !uploadResult.id) {
          browserApi.tabs.sendMessage(tab.id, {
            action: ACTIONS.ShowMessage,
            payload: {
              text: 'Unable to save page',
              type: 'error'
            }
          });
          return;
        }
      }
      case 'url': {
        // We don't have to special case URL, it will fall through
        // and be handled when isContentAvailable returns false
      }
    }

    const isContentAvailable = (doc && doc.length) || uploadResult;
    const query = isContentAvailable ? CREATE_ARTICLE_QUERY : CREATE_ARTICLE_SAVING_REQUEST_QUERY;
    const input = {
      url: encodeURI(tab.url)
    };

    if (isContentAvailable) {
      input.preparedDocument = {
        document: doc,
        pageInfo
      };
      input.uploadFileId = (uploadResult && uploadResult.id) || null;
    }

    const data = JSON.stringify({
      query,
      variables: {
        input
      }
    });

    xhr.open('POST', omnivoreGraphqlURL + 'graphql', true);
    setupConnection(xhr);

    xhr.send(data);
  });
}

// credit: https://stackoverflow.com/questions/21535233/injecting-multiple-scripts-through-executescript-in-google-chrome
function executeScripts (tabId, scriptsArray, onCompleteCallback) {
  function createCallback (tabId, injectDetails, innerCallback) {
    return function () {
      browserScriptingApi.executeScript(tabId, injectDetails, innerCallback);
    };
  }

  // any callback passed by caller is called upon all scripts execute completion
  let callback = onCompleteCallback;
  for (let i = scriptsArray.length - 1; i >= 0; --i) {
    callback = createCallback(tabId, { file: scriptsArray[i] }, callback);
  }
  if (callback !== null) {
    callback(); // execute outermost function
  }
}

function cleanupTabState (tabId) {
  getStorage().then(function (result) {
    const itemsToRemove = [];
    const keys = Object.keys(result);
    const keyPrefix = tabId + '_saveInProgress';
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (key.startsWith(keyPrefix)) {
        itemsToRemove.push(key);
      }
    }
    if (itemsToRemove.length === 0) return;
    removeStorage(itemsToRemove);
  });
}

/* setup an interval timer and a timeout timer (failsave) to clear interval timer after a timeout */
function setupTimedInterval (timerCallback, timeoutCallback, callback, delay = 1000, timeout = 10500) {
  const intervalId = setInterval(timerCallback, delay);
  const timeoutId = setTimeout(() => {
    clearInterval(intervalId);
    timeoutCallback();
  }, timeout);

  if (callback && typeof callback === 'function') {
    callback(intervalId, timeoutId);
  }
}

async function clearPreviousIntervalTimer (tabId) {
  const prevIntervalId = await getStorageItem(tabId + '_saveInProgress');
  if (!prevIntervalId) return;

  clearInterval(prevIntervalId);

  const intervalTimeoutId = await getStorageItem(tabId + '_saveInProgressTimeoutId_' + prevIntervalId);
  if (!intervalTimeoutId) return;

  clearTimeout(intervalTimeoutId);
}

function onExtensionClick (tabId) {
  /* clear any previous timers on each click */
  clearPreviousIntervalTimer(tabId);

  /* Method to check tab loading state prior to save */
  function checkTabLoadingState (onSuccess, onPending) {
    browserApi.tabs.get(tabId, (tab) => {
      if (tab.status !== 'complete') {
        // show message to user on page yet to complete load
        browserApi.tabs.sendMessage(tab.id, {
          action: ACTIONS.ShowMessage,
          payload: {
            type: 'loading',
            text: 'Page loading...'
          }
        });
        if (onPending && typeof onPending === 'function') {
          onPending();
        }
      } else {
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
        saveArticle(tab);
      }
    });
  }

  /* call above method immediately, and if tab in loading state then setup timer */
  checkTabLoadingState(null, () => {
    setupTimedInterval(() => {
      /* interval timer to check tab/page loading state and save */
      checkTabLoadingState(() => {
        clearPreviousIntervalTimer(tabId);
      });
    }, () => {
      /* timeout handling, clear timer and show timeout msg */
      clearPreviousIntervalTimer(tabId);

      browserApi.tabs.get(tabId, (tab) => {
        /*
         * post timeout, we proceed to save as some sites (people.com) take a
         * long time to reach complete state and remain in interactive state.
         */
        saveArticle(tab);
      });
    }, (intervalId, timeoutId) => {
      /* Track interval timer and timeout timer in browser storage keyed by tabId */
      const itemsToSet = {};
      itemsToSet[tabId + '_saveInProgress'] = intervalId;
      itemsToSet[tabId + '_saveInProgressTimeoutId_' + intervalId] = timeoutId;
      setStorage(itemsToSet);
    });
  });
}

/* After installing extension, if user hasn’t logged into Omnivore, then we show the splash popup */
function checkAuthOnFirstClickPostInstall (tabId) {
  return getStorageItem('postInstallClickComplete').then(async (postInstallClickComplete) => {
    if (postInstallClickComplete) return true;

    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendNativeMessage) {
      const response = await browser.runtime.sendNativeMessage("omnivore", {message: ACTIONS.GetAuthToken})
      if (response.authToken) {
        authToken = response.authToken;
      }
    }

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
          const { data } = JSON.parse(xhr.response);
          if (!data.me) {
            browserApi.tabs.sendMessage(tabId, {
              action: ACTIONS.ShowMessage,
              payload: {
                type: 'loading',
                text: 'Loading...'
              }
            });
            browserApi.tabs.sendMessage(tabId, {
              action: ACTIONS.ShowMessage,
              payload: {
                text: '',
                type: 'error',
                errorCode: 401,
                url: omnivoreURL
              }
            });
            resolve(null);
          } else {
            setStorage({
              postInstallClickComplete: true
            });
            resolve(true);
          }
        }
      };

      const query = '{me{id}}';
      const data = JSON.stringify({
        query
      });
      xhr.open('POST', omnivoreGraphqlURL + 'graphql', true);
      setupConnection(xhr);

      xhr.send(data);
    });
  });
}

function getCurrentTab () {
  return new Promise((resolve) => {
    browserApi.tabs.query({
      active: true,
      currentWindow: true
    }, function (tabs) {
      resolve(tabs[0] || null);
    });
  });
}

function handleActionClick () {
  getCurrentTab().then((currentTab) => {
    browserApi.tabs.sendMessage(currentTab.id, {
      action: ACTIONS.Ping
    }, async function (response) {
      if (response && response.pong) {
        // Content script ready
        const isSignedUp = await checkAuthOnFirstClickPostInstall(currentTab.id);
        if (isSignedUp) {
          onExtensionClick(currentTab.id);
        }
      } else {
        const extensionManifest = browserApi.runtime.getManifest();
        const contentScripts = extensionManifest.content_scripts;

        // No listener on the other end, inject content scripts
        const scriptFiles = [
          ...contentScripts[0].js,
          ...contentScripts[1].js
        ];
        executeScripts(currentTab.id, scriptFiles, async function () {
          const isSignedUp = await checkAuthOnFirstClickPostInstall(currentTab.id);
          if (isSignedUp) {
            onExtensionClick(currentTab.id);
          }
        });
      }
    });
  });
}

function getIconPath (active, dark) {
  let iconPath = '/images/toolbar/icon';
  if (ENV_IS_FIREFOX) {
    iconPath += '_firefox';
  } else if (ENV_IS_EDGE) {
    iconPath += '_edge';
  }
  if (!active) {
    iconPath += '_inactive';
  }
  /* we have to evaluate this every time as the onchange is not
   * fired inside background pages, due to https://crbug.com/968651 */
  const useDarkIcon = typeof dark === 'boolean'
    ? dark
    : window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (useDarkIcon) {
    iconPath += '_dark';
  }
  if (ENV_IS_FIREFOX) {
    return iconPath + '.svg';
  }

  const iconSizes = ['16', '24', '32', '48'];
  if (!ENV_IS_EDGE) {
    iconSizes.push('19', '38');
  }
  const iconPaths = {};
  for (let i = 0; i < iconSizes.length; i++) {
    const iconSize = iconSizes[i];
    iconPaths[iconSize] = iconPath + '-' + iconSize + '.png';
  }
  return iconPaths;
}

function updateActionIcon (tabId, active, dark) {
  browserActionApi.setIcon({
    path: getIconPath(active, dark),
    tabId: tabId
  });
}

function getActionableState (tab) {
  if (tab.status !== 'complete') return false;

  const tabUrl = tab.pendingUrl || tab.url;
  if (!tabUrl) return false;

  if (
    !tabUrl.startsWith('https://') &&
    !tabUrl.startsWith('http://')
  ) return false;

  if (
    tabUrl.startsWith('https://omnivore.app/') &&
    tabUrl.startsWith('https://dev.omnivore.app/')
  ) return false;

  return true;
}

function reflectIconState (tab) {
  const tabId = tab && tab.id;
  if (!tabId) return;

  const active = getActionableState(tab);

  updateActionIcon(tabId, active);
}

function init () {
  /* Extension icon switcher on page/tab load status */
  browserApi.tabs.onActivated.addListener(({ tabId }) => {
    // Due to a chrome bug, chrome.tabs.* may run into an error because onActivated is triggered too fast.
    function checkCurrentTab () {
      browserApi.tabs.get(tabId, function (tab) {
        if (browserApi.runtime.lastError) {
          setTimeout(checkCurrentTab, 150);
        }
        reflectIconState(tab);
      });
    }

    checkCurrentTab();
  });

  /* Extension icon switcher on page/tab load status */
  browserApi.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    /* Not an update while this tab is active so we skip updating icon */
    if (!changeInfo.status || !tab || !tab.active) return;

    reflectIconState(tab);
  });

  browserApi.tabs.onRemoved.addListener((tabId) => {
    /* cleanup any previous saveInProgress state for the tab */
    cleanupTabState(tabId);
  });

  browserActionApi.onClicked.addListener(handleActionClick);

  // forward messages from grab-iframe-content.js script to tabs
  browserApi.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.forwardToTab) {
      delete request.forwardToTab;
      browserApi.tabs.sendRequest(sender.tab.id, request);
      return;
    }

    if (request.action === ACTIONS.RefreshDarkMode) {
      updateActionIcon(sender.tab.id, request.payload.value);
    }
  });

  // set initial extension icon
  browserActionApi.setIcon({
    path: getIconPath(true)
  });
}

init();
