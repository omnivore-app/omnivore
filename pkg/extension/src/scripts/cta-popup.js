'use strict';

(function () {
  const urlSearch = window.location.search;

  const urlMatch = urlSearch.match(/[?&]url=([^&]+)/);
  if (!urlMatch) return;

  const encodedUrl = urlMatch[1];
  if (!encodedUrl) return;

  const url = decodeURIComponent(encodedUrl);

  const linkEl = document.getElementById('get-omnivore-link');
  const loginLinkEl = document.getElementById('omnivore-login');

  linkEl.href = url;
  loginLinkEl.href = url;
})();
