import { SavePageInput, ToolbarMessage } from '../types'
import {
  showLoggedOutToolbar,
  showToolbar,
  startToolbarDismiss,
  updateToolbarStatus
} from './toolbar'
import { editLabels } from './labels'

const collectPageContent = async (): Promise<string> => {
  const mainContent = document.documentElement.outerHTML
  console.log('[omnivore] captured mainContent')
  return mainContent
}

const handleToolbarMessage = async (
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  console.log('[omnivore] content script message:', request)

  switch (request.message) {
    case 'showLoggedOutToolbar':
      showLoggedOutToolbar()
      sendResponse({ success: true })
      break
    case 'updateToolbar':
      updateToolbarStatus(request.status, request.task)

      sendResponse({ success: true })
      break
    case 'startToolbarDismiss':
      startToolbarDismiss(request as ToolbarMessage)
      sendResponse({ success: true })
      return
    case 'updateLabelCache':
      editLabels()
      break
    default:
      sendResponse({ success: false })
      return
  }
}

const setupToolbar = async (clientRequestId: string) => {
  // toolbar message listener
  if (!chrome.runtime.onMessage.hasListener(handleToolbarMessage)) {
    chrome.runtime.onMessage.addListener(handleToolbarMessage)
  }

  await showToolbar(clientRequestId)
}

const savePage = async (clientRequestId: string) => {
  console.log('[omnivore] v3 extension triggered: ', clientRequestId)

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
      await savePage(request.clientRequestId)
      sendResponse({ success: true })
      return
  }
})
