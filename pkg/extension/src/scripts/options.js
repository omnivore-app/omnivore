function saveAPIKey() {
  var apiKey = document.getElementById('api-key').value
  if (!apiKey) {
    alert(
      'No api-key specified, please create an API key at https://omnivore.app/settings/api'
    )
    return
  }

  setStorage({
    apiKey: apiKey,
  }).then(() => {
    alert('API key saved!')
  })
}

function loadAPIKey() {
  getStorageItem('apiKey').then((apiKey) => {
    if (apiKey) {
      document.getElementById('api-key').value = apiKey
    } else {
      alert('No API key found in storage.')
    }
  })
}

function clearAPIKey() {
  document.getElementById('api-key').value = ''

  setStorage({
    apiKey: undefined,
  }).then(() => {
    alert('API key cleared!')
  })
}

;(() => {
  document
    .getElementById('save-api-key-btn')
    .addEventListener('click', saveAPIKey)
  document
    .getElementById('load-api-key-btn')
    .addEventListener('click', loadAPIKey)
  document
    .getElementById('clear-api-key-btn')
    .addEventListener('click', clearAPIKey)
})()
