'use strict'
;(function () {
  // This gets the link of the iframe -> then it returns [key, values] -> fromEntries method will return the object
  const payload = Object.fromEntries([
    ...new URL(window.location.href).searchParams.entries(),
  ])

  const articleLinkEl = document.getElementById('get-article-link')
  const titleEl = document.getElementById('article-title')

  articleLinkEl.href = payload.linkReadNow
  titleEl.innerText = payload.title + 'sdfhsdf skljdfh ksdhf ;)';
})()
