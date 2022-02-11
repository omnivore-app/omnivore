/* global globalThis, self */

'use strict';

(function () {
  const globalApi = (typeof globalThis !== 'undefined' && globalThis) || self;
  const naviApi = globalApi.navigator;

  if (!naviApi.serviceWorker) return;

  naviApi.serviceWorker.register('/sw.js', {
    updateViaCache: 'none'
  }).then((registration) => {
    if (typeof registration.update !== 'function') return;
    registration.update();
  }, () => {
    // registration failed
  });
})();
