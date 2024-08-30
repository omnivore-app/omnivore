import { savePageRequest } from './scripts/omnivore-api'
import { isSavePageInput } from './scripts/types'

const browserAPI = typeof browser !== 'undefined' ? browser : chrome

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('message: ', message, 'sender', sender.tab?.id)
  if (message.action === 'savePage' && isSavePageInput(message)) {
    try {
      const result = await savePageRequest({
        url: message.url,
        title: message.title,
        clientRequestId: message.clientRequestId,
        originalContent: message.originalContent,
      })
      if (sender.tab?.id) {
        switch (result) {
          case 'success':
            chrome.tabs.sendMessage(sender.tab?.id, {
              message: 'startToolbarDismiss',
              status: 'success',
            })
            break
          case 'failure':
            chrome.tabs.sendMessage(sender.tab?.id, {
              message: 'startToolbarDismiss',
              status: 'failure',
            })
            break
          case 'unauthorized':
            chrome.tabs.sendMessage(sender.tab?.id, {
              message: 'showLoggedOutToolbar',
            })
            break
        }
      }
    } catch (err) {}
  }
  return true
})

const scriptsAlreadyLoaded = async (tabId: number) => {
  try {
    const pingCheck = await chrome.tabs.sendMessage(tabId, {
      message: 'ping',
    })
    console.log('pingCheck: ', pingCheck)
    return true
  } catch {
    return false
  }
}

browserAPI.action.onClicked.addListener(async (tab) => {
  const tabId = tab.id
  if (tabId) {
    try {
      const scriptsLoaded = await scriptsAlreadyLoaded(tabId)
      if (!scriptsLoaded) {
        await browserAPI.scripting.executeScript({
          target: { tabId },
          files: ['content.js'],
        })
      }
    } catch (err) {
      console.log('[omnivore] error injecting content script: ', err)
    }
    chrome.tabs.sendMessage(tabId, { message: 'showToolbar' })
  }
})
