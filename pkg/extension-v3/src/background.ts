import { v4 as uuidv4 } from 'uuid'
import { addNoteToLibraryItem, savePageRequest } from './scripts/omnivore-api'
import {
  isAddNoteInput,
  isEnqueueTaskMessage,
  isSavePageInput,
} from './scripts/types'
import { TaskQueue } from './task-queue'

const browserAPI = typeof browser !== 'undefined' ? browser : chrome

const taskQueues: Record<string, TaskQueue> = {}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('message: ', message, 'sender', sender.tab?.id)

  const tabId = sender.tab?.id
  if (message.action === 'savePage' && isSavePageInput(message)) {
    const { result, libraryItemId } = await savePageRequest({
      url: message.url,
      title: message.title,
      clientRequestId: message.clientRequestId,
      originalContent: message.originalContent,
    })
    console.log('result: ', result, 'libraryItemId', libraryItemId)
    if (tabId) {
      switch (result) {
        case 'success':
          chrome.tabs.sendMessage(tabId, {
            message: 'startToolbarDismiss',
            status: 'success',
          })
          if (libraryItemId) {
            const taskQueue = taskQueues[message.clientRequestId]
            taskQueue.setReady(tabId, libraryItemId)
          }
          break
        case 'failure':
          chrome.tabs.sendMessage(tabId, {
            message: 'startToolbarDismiss',
            status: 'failure',
          })
          break
        case 'unauthorized':
          chrome.tabs.sendMessage(tabId, {
            message: 'showLoggedOutToolbar',
          })
          break
      }
    }
  } else if (message.action == 'enqueueTask' && isEnqueueTaskMessage(message)) {
    const taskQueue = taskQueues[message.clientRequestId]
    console.log('enqueing task message: ', message)
    taskQueue.enqueue({ ...message, libraryItemId: message.clientRequestId })
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
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js'],
        })
      }
    } catch (err) {
      console.log('[omnivore] error injecting content script: ', err)
    }

    const clientRequestId = uuidv4()
    taskQueues[clientRequestId] = new TaskQueue()
    chrome.tabs.sendMessage(tabId, { message: 'savePage', clientRequestId })
  }
})
