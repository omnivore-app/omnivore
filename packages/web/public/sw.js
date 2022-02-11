/* global
  globalThis
  self
  Response
*/

'use strict';

(function () {
  const globalApi = (typeof globalThis !== 'undefined' && globalThis) || self;
  const naviApi = globalApi.navigator;

  const mainOrigin = 'https://omnivore.app';
  const devOrigin = 'https://dev.omnivore.app';
  const demoOrigin = 'https://demo.omnivore.app';
  const webProdOrigin = 'https://web-prod.omnivore.app';
  const webDemoOrigin = 'https://web-demo.omnivore.app';

  const currentOrigin = (globalApi.location && globalApi.location.origin) || mainOrigin;

  if (
    currentOrigin !== mainOrigin &&
    currentOrigin !== devOrigin &&
    currentOrigin !== demoOrigin &&
    currentOrigin !== webProdOrigin &&
    currentOrigin !== webDemoOrigin
  ) return;

  const cacheVersion = 'v1.0.0';

  const homeCache = '/?cid=' + cacheVersion;

  const initialCacheItems = [
    homeCache,
    '/manifest.webmanifest',
    '/favicon.ico',
    '/favicon-32.png',
    '/pwa-36.png',
    '/pwa-48.png',
    '/pwa-72.png',
    '/pwa-96.png',
    '/pwa-144.png',
    '/pwa-192.png',
    '/pwa-256.png',
    '/pwa-384.png',
    '/pwa-512.png'
  ];

  function fetchWithCacheBackup (request) {
    return globalApi.fetch(request).then((freshResult) => {
      if (freshResult.status > 199 && freshResult.status < 400) return freshResult;

      return globalApi.caches.match(request, {
        ignoreSearch: true,
        ignoreMethod: true,
        ignoreVary: true
      }).then((cachedResult) => {
        return cachedResult || freshResult;
      });
    });
  }

  function findShareUrlInText (formData) {
    const url = formData.get('url') || '';
    const text = formData.get('text') || '';
    const title = formData.get('title') || '';

    const allParts = [url, text, title].join(' ');
    const snippets = allParts.split(/\s+/);

    for (let i = 0; i < snippets.length; i++) {
      try {
        const shareUrl = new URL(snippets[i]);
        return shareUrl;
      } catch (e) {}
    }
  }

  function saveArticleUrl (url) {
    if (!url) {
      return Promise.reject(new Error('No URL'));
    }

    const requestUrl = currentOrigin + '/api/article/save';

    return globalApi.fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        url: url,
        v: '0.2.18'
      })
    }).then(function (response) {
      if (response.status === 200) {
        return response.json().then((responseJson) => {
          const savingRequestId = responseJson.articleSavingRequestId;
          return currentOrigin + '/article/sr/' + savingRequestId;
        });
      }

      if (response.status === 400) {
        return response.json().then((responseJson) => {
          if (responseJson.errorCode === 'UNAUTHORIZED') {
            return currentOrigin + '/login';
          }
        });
      }
    });
  }

  function handleShareTarget (request) {
    return request.formData().then((formData) => {
      const shareUrl = findShareUrlInText(formData);

      return saveArticleUrl(shareUrl).catch(() => {
        // generic error redirect
        return currentOrigin + '/';
      });
    }).then((responseUrl) => {
      return Response.redirect(responseUrl, 303);
    });
  }

  function handleFetchRequest (ev) {
    const request = ev.request;

    if (request.method === 'POST') {
      const requestUrl = new URL(request.url);
      if (requestUrl.pathname === '/share-target') {
        const shareRequest = handleShareTarget(request);
        ev.respondWith(shareRequest);
      }
    }

    if (naviApi.onLine) {
      return globalApi.fetch(request);
    }

    return fetchWithCacheBackup(request);
  }

  function handleOutdatedCache () {
    return globalApi.caches.keys().then((cacheNames) => {
      return Promise.all(cacheNames.map((cacheName) => {
        if (cacheName !== cacheVersion) {
          return globalApi.caches.delete(cacheName);
        }
      }));
    });
  }

  function initCache () {
    return globalApi.caches.open(cacheVersion).then((cache) => {
      if (!cache.addAll || !naviApi.onLine) return;
      return cache.addAll(initialCacheItems);
    });
  }

  globalApi.addEventListener('install', (ev) => {
    globalApi.skipWaiting();

    const handler = initCache();
    ev.waitUntil(handler);
  });

  globalApi.addEventListener('activate', (ev) => {
    const handler = handleOutdatedCache();
    ev.waitUntil(handler);
  });

  globalApi.addEventListener('fetch', (ev) => {
    const handler = handleFetchRequest(ev);
    ev.respondWith(handler);
  });
})();
