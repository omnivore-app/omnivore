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

function saveAPIUrl() {
  var apiUrl = document.getElementById('api-url').value
  if (!apiUrl) {
    alert('No API URL specified.')
    return
  }

  setStorage({
    apiUrl: apiUrl,
  }).then(() => {
    alert('API URL saved!')
  })
}

function loadAPIUrl() {
  getStorageItem('apiUrl').then((apiUrl) => {
    if (apiUrl) {
      document.getElementById('api-url').value = apiUrl
    } else {
      alert('No API URL found in storage.')
    }
  })
}

function clearAPIUrl() {
  document.getElementById('api-url').value = ''

  setStorage({
    apiUrl: undefined,
  }).then(() => {
    alert('API URL cleared!')
  })
}

function autoDismissChanged(event) {
  const value = document.getElementById('disable-auto-dismiss').checked
  console.log(
    ' value: ',
    value,
    document.getElementById('disable-auto-dismiss')
  )

  setStorage({
    disableAutoDismiss: value ? 'true' : null,
  }).then(() => {
    console.log('disableAutoDismiss updated', value)
  })
}

function saveAutoDismissTime() {
  const value = document.getElementById('auto-dismiss-time').value

  if (value.length < 1 || Number.isNaN(Number(value))) {
    alert('Invalid value')
    return
  }

  setStorage({
    autoDismissTime: value,
  }).then(() => {
    console.log('autoDismissTime updated', value)
  })
}

function handleConsent() {
  var consentCheckbox = document.getElementById('consent-checkbox')
  setStorage({
    consentGranted: JSON.stringify(consentCheckbox.checked),
  })
    .then(() => {
      console.log('consent granted')
    })
    .catch((err) => {
      alert('Error setting consent: ' + err)
    })

  if (!consentCheckbox.checked) {
    alert('This extension can not function without data collection consent.')
  }
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
  document
    .getElementById('save-api-url-btn')
    .addEventListener('click', saveAPIUrl)
  document
    .getElementById('load-api-url-btn')
    .addEventListener('click', loadAPIUrl)
  document
    .getElementById('clear-api-url-btn')
    .addEventListener('click', clearAPIUrl)

  getStorageItem('disableAutoDismiss').then((value) => {
    document.getElementById('disable-auto-dismiss').checked = value
      ? true
      : false
  })

  getStorageItem('consentGranted').then((value) => {
    document.getElementById('consent-checkbox').checked =
      value == 'true' ? true : false
  })

  document
    .getElementById('disable-auto-dismiss')
    .addEventListener('change', autoDismissChanged)

  getStorageItem('autoDismissTime').then((value) => {
    document.getElementById('auto-dismiss-time').value = value ?? '2500'
  })
  document
    .getElementById('auto-dismiss-time-btn')
    .addEventListener('click', saveAutoDismissTime)
})()
