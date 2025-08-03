import {
  addNoteToLibraryItem,
  archiveLibraryItem,
  deleteItem, setLabels, updateLabelsCache,
  updatePageTitle
} from './scripts/omnivore-api'
import { TaskInput } from './scripts/types'

export class TaskQueue {
  private queue: Array<TaskInput> = []
  private isRunning: boolean = false
  private isReady: boolean = false

  private tabId: number | undefined
  private libraryItemId: string | undefined

  constructor() {}

  enqueue(task: TaskInput): void {
    this.queue.push(task)

    // Only run the next task if the queue is ready
    if (this.isReady) {
      this.runNext()
    }
  }

  private async runNext(): Promise<void> {
    if (this.isRunning || this.queue.length === 0 || !this.isReady) return

    this.isRunning = true
    const task = this.queue.shift()

    if (task) {
      try {
        await this.executeTask(task)
      } catch (err) {
        console.error('Task failed:', err)
      } finally {
        this.isRunning = false
        if (this.isReady) {
          this.runNext()
        }
      }
    }
  }

  private executeTask = async (task: TaskInput) => {
    console.log('executing task: ', task)
    if (!this.libraryItemId) {
      throw Error('Attempting to execute queue that is not ready.')
    }

    try {
      let success = false
      switch (task.task) {
        case 'archive': {
          await archiveLibraryItem(this.libraryItemId)
          success = true
          break
        }
        case 'delete': {
          await deleteItem(this.libraryItemId)
          success = true
          break
        }
        case 'addNote': {
          await addNoteToLibraryItem({
            note: task.note || '',
            libraryItemId: this.libraryItemId,
          })
          success = true
          break
        }
        case 'setLabels':
          await setLabels(this.libraryItemId, task.labels ?? [])
          success = true;
          break
        case 'editTitle': {
          if (!task.title || !this.libraryItemId) {
            throw new Error("Title not set, or library item not yet saved.")
          }

          await updatePageTitle(this.libraryItemId, task.title)
          success = true
          break;
        }
        case 'updateLabelCache': {
          await updateLabelsCache()
          if (this.tabId) {
            chrome.tabs.sendMessage(this.tabId, {
              message: 'updateLabelCache',
              status: 'success',
              task: task.task,
            })
          }
        }
      }
      if (success && this.tabId) {
        chrome.tabs.sendMessage(this.tabId, {
          message: 'updateToolbar',
          status: 'success',
          task: task.task,
        })
      }
    } catch (err) {
      console.log('[omnivore] task queue error: ', err)
      if (this.tabId) {
        console.log('sending error message')
        chrome.tabs.sendMessage(this.tabId, {
          message: 'updateToolbar',
          status: 'failure',
          task: task.task,
        })
      }
    }
  }

  setReady(tabId: number, libraryItemId: string): void {
    console.log('setting ready')
    this.tabId = tabId
    this.libraryItemId = libraryItemId
    this.isReady = true
    this.runNext()
  }
}
