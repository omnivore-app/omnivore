'use strict'

window.browserApi =
  (typeof chrome === 'object' && chrome && chrome.runtime && chrome) ||
  (typeof browser === 'object' && browser) ||
  {} // eslint-disable-line no-undef
window.browserActionApi =
  browserApi.action || browserApi.browserAction || browserApi.pageAction
window.browserScriptingApi = browserApi.scripting || browserApi.tabs

window.ENV_EXTENSION_ORIGIN = browserApi.runtime
  .getURL('PATH/')
  .replace('/PATH/', '')
window.ENV_IS_FIREFOX = ENV_EXTENSION_ORIGIN.startsWith('moz-extension://')
window.ENV_IS_EDGE = navigator.userAgent.toLowerCase().indexOf('edg') > -1
window.ENV_DOES_NOT_SUPPORT_BLOB_URL_ACCESS =
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

window.SELECTORS = {
  CANONICAL_URL: ["head > link[rel='canonical']"],
  TITLE: ["head > meta[property='og:title']"],
}

window.ACTIONS = {
  Ping: 'PING',

  ShowMessage: 'SHOW_MESSAGE',
  GetContent: 'GET_CONTENT',

  AddIframeContent: 'ADD_IFRAME_CONTENT',
  RefreshDarkMode: 'REFRESH_DARK_MODE',
  GetAuthToken: 'GET_AUTH_TOKEN',
  LabelCacheUpdated: 'LABEL_CACHE_UPDATED',

  ShowToolbar: 'SHOW_TOOLBAR',
  UpdateStatus: 'UPDATE_STATUS',

  AddNote: 'ADD_NOTE',
  EditTitle: 'EDIT_TITLE',
  SetLabels: 'SET_LABELS',

  Archive: 'ARCHIVE',
  Delete: 'DELETE',
}

window.SAVE_URL_QUERY = `mutation SaveUrl ($input: SaveUrlInput!) {
  saveUrl(input:$input){
    ... on SaveSuccess {
      url
      clientRequestId
    }
    ... on SaveError {
      errorCodes
    }
  }
}`

window.SAVE_FILE_QUERY = `mutation SaveFile ($input: SaveFileInput!) {
  saveFile(input:$input){
    ... on SaveSuccess {
      url
      clientRequestId
    }
    ... on SaveError {
      errorCodes
    }
  }
}`

window.SAVE_PAGE_QUERY = `mutation SavePage ($input: SavePageInput!) {
  savePage(input:$input){
    ... on SaveSuccess {
      url
      clientRequestId
    }
    ... on SaveError {
      errorCodes
    }
  }
}`

function handleBackendUrl(url) {
  try {
    const FORCE_CONTENT_FETCH_URLS = [
      // twitter status url regex
      /twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)(?:\/.*)?/,
      /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu\.be|piped\.video))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/,
    ]
    return FORCE_CONTENT_FETCH_URLS.some((regex) => regex.test(url))
  } catch (error) {
    console.log('error checking url', url)
  }
  return false
}

/* storage helper functions */
function getStorage(keyOrKeys) {
  return new Promise((resolve) => {
    browserApi.storage.local.get(keyOrKeys || null, (result) => {
      resolve(result || {})
    })
  })
}

function getStorageItem(singleKey) {
  return new Promise((resolve) => {
    browserApi.storage.local.get(singleKey, (result) => {
      const finalResult = (result && result[singleKey]) || null
      resolve(finalResult)
    })
  })
}

function setStorage(itemsToSet) {
  return new Promise((resolve) => {
    browserApi.storage.local.set(itemsToSet, resolve)
  })
}

function removeStorage(itemsToRemove) {
  return new Promise((resolve) => {
    browserApi.storage.local.remove(itemsToRemove, resolve)
  })
}
