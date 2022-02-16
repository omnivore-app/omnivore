'use strict';

window.browserApi = (typeof chrome === 'object' && chrome && chrome.runtime && chrome) || (typeof browser === 'object' && browser) || {}; // eslint-disable-line no-undef
window.browserActionApi = browserApi.action || browserApi.browserAction || browserApi.pageAction;
window.browserScriptingApi = browserApi.scripting || browserApi.tabs;

window.ENV_EXTENSION_ORIGIN = browserApi.runtime.getURL('PATH/').replace('/PATH/', '');
window.ENV_IS_FIREFOX = ENV_EXTENSION_ORIGIN.startsWith('moz-extension://');
window.ENV_IS_EDGE = navigator.userAgent.toLowerCase().indexOf('edg') > -1;
window.ENV_DOES_NOT_SUPPORT_BLOB_URL_ACCESS = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

window.SELECTORS = {
  CANONICAL_URL: ["head > link[rel='canonical']"],
  TITLE: ["head > meta[property='og:title']"]
};

window.ACTIONS = {
  ShowMessage: 'SHOW_MESSAGE',
  GetContent: 'GET_CONTENT',
  GetPageInfo: 'GET_PAGE_INFO',
  Ping: 'PING',
  AddIframeContent: 'ADD_IFRAME_CONTENT',
  RefreshDarkMode: 'REFRESH_DARK_MODE',
  GetAuthToken: 'GET_AUTH_TOKEN',
};

window.DONT_REMOVE_ELEMENTS = [
  'meta',
  'script',
  'title'
];

window.CREATE_ARTICLE_QUERY = `mutation CreateArticle ($input: CreateArticleInput!){
  createArticle(input:$input){
    ... on CreateArticleSuccess{
      createdArticle{
        id
        title
        slug
        hasContent
      }
      user {
        id
        profile {
          id
          username
        }
      }
}
  ... on CreateArticleError{
      errorCodes
  }
}
}`;

window.CREATE_ARTICLE_SAVING_REQUEST_QUERY = `mutation CreateArticleSavingRequest ($input: CreateArticleSavingRequestInput!){
  createArticleSavingRequest(input:$input){
    ... on CreateArticleSavingRequestSuccess{
      articleSavingRequest{
        id
      }
    }
    ... on CreateArticleSavingRequestError{
      errorCodes
    }
  }
}`;
