import { v4 as uuidv4 } from 'uuid'
import { SavePageInput, ToolbarMessage } from '../types'
import {
  showLoggedOutToolbar,
  showToolbar,
  startToolbarDismiss,
} from './toolbar'

const collectPageContent = async (): Promise<string> => {
  const mainContent = document.documentElement.outerHTML
  console.log('[omnivore] captured mainContent')
  return mainContent
}

const sendContentToServiceWorker = async (content: string) => {
  try {
    await chrome.runtime.sendMessage({ action: 'savePage', data: content })
  } catch (err) {
    console.log('error sending content: ', err)
  }
}

const setupToolbar = async (clientRequestId: string) => {
  // toolbar message listener
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      console.log(
        '[omnivore] content script message:',
        clientRequestId,
        request
      )

      switch (request.message) {
        case 'showToolbar':
          await showToolbar(clientRequestId)
          sendResponse({ success: true })
          return
        case 'showLoggedOutToolbar':
          showLoggedOutToolbar()
          sendResponse({ success: true })
          break
        case 'startToolbarDismiss':
          startToolbarDismiss(request as ToolbarMessage)
          sendResponse({ success: true })
          return
        default:
          sendResponse({ success: false })
          return
      }
    }
  )
  await showToolbar(clientRequestId)
}

const savePage = async () => {
  const clientRequestId = uuidv4()
  console.log('[omnivore] v3 extension triggered')

  await setupToolbar(clientRequestId)

  const content = await collectPageContent()
  console.log('[omnivore] collected page content: ', content)

  try {
    const page: SavePageInput = {
      clientRequestId,
      title: document.title,
      url: document.location.href,
      originalContent: content,
    }
    await chrome.runtime.sendMessage({
      action: 'savePage',
      ...page,
    })
  } catch (err) {
    console.log('error sending content: ', err)
  }
}

// toolbar message listener
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  switch (request.message) {
    case 'savePage':
      await savePage()
      sendResponse({ success: true })
      return
  }
})
