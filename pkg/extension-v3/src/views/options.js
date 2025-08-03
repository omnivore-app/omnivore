function addStorage(itemsToAdd) {
    return chrome.storage.local.set(itemsToAdd)
}

document.addEventListener('DOMContentLoaded', () => {
  const saveApiButton = document.getElementById('save-api-key-btn')
  const apiInput = document.getElementById('api-key')


  chrome.storage.local.get('omnivoreApiKey').then(
    apiKey => {
      apiInput.value = apiKey.omnivoreApiKey ?? ''
    }
  )

  saveApiButton.addEventListener('click', (e) => {
    addStorage({ "omnivoreApiKey": apiInput.value })
  })

  const saveUrlButton = document.getElementById('save-api-url-btn')
  const apiUrlInput = document.getElementById('api-url')

  chrome.storage.local.get('omnivoreApiUrl').then(
    url => {
      apiUrlInput.value = url.omnivoreApiUrl ?? ''
    }
  )

  saveUrlButton.addEventListener('click', (e) => {
    addStorage({ "omnivoreApiUrl": apiUrlInput.value })
  })


  const urlButton = document.getElementById('save-omnivore-url-btn')
  const urlInput = document.getElementById('omnivore-url')

  chrome.storage.local.get('omnivoreUrl').then(
    url => {
      urlInput.value = url.omnivoreUrl ?? ''
    }
  )

  urlButton.addEventListener('click', (e) => {
    addStorage({ "omnivoreUrl": urlInput.value })
  })
});
