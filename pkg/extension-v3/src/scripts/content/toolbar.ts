import { ToolbarMessage, ToolbarStatus } from '../types'
import { getStorageItem, setStorage } from '../utils'
import { editLabels } from './labels'

const systemIcons: { [key: string]: string } = {
  waiting: '<div class="loading-spinner"></div>',
  success: `
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M9.91626 18.6047C14.8868 18.6047 18.9163 14.5752 18.9163 9.60468C18.9163 4.63411 14.8868 0.604675 9.91626 0.604675C4.9457 0.604675 0.91626 4.63411 0.91626 9.60468C0.91626 14.5752 4.9457 18.6047 9.91626 18.6047ZM9.91626 17.1046C14.0584 17.1046 17.4163 13.7468 17.4163 9.60463C17.4163 5.4625 14.0584 2.10463 9.91626 2.10463C5.77412 2.10463 2.41626 5.4625 2.41626 9.60463C2.41626 13.7468 5.77412 17.1046 9.91626 17.1046Z" fill="#32D74B"/>
      <path d="M13.3538 7.28851L8.7704 11.9209L6.47876 9.60469" stroke="#32D74B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
  failure: `
    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M9.74048 18.5508C14.711 18.5508 18.7405 14.5213 18.7405 9.55078C18.7405 4.58022 14.711 0.550781 9.74048 0.550781C4.76992 0.550781 0.740479 4.58022 0.740479 9.55078C0.740479 14.5213 4.76992 18.5508 9.74048 18.5508ZM9.74048 17.0507C13.8826 17.0507 17.2405 13.6929 17.2405 9.55074C17.2405 5.4086 13.8826 2.05074 9.74048 2.05074C5.59834 2.05074 2.24048 5.4086 2.24048 9.55074C2.24048 13.6929 5.59834 17.0507 9.74048 17.0507Z" fill="#C7372F"/>
      <path d="M12.794 11.897L12.794 11.897L10.4474 9.55078L12.794 7.2046L12.794 7.20459C12.8878 7.11079 12.9405 6.98358 12.9405 6.85093C12.9405 6.71828 12.8878 6.59107 12.794 6.49727C12.7002 6.40348 12.573 6.35078 12.4403 6.35078C12.3077 6.35078 12.1805 6.40348 12.0867 6.49727L12.0867 6.49728L9.74048 8.84382L7.3943 6.49728L7.39429 6.49727C7.30049 6.40348 7.17328 6.35078 7.04063 6.35078C6.90798 6.35078 6.78077 6.40348 6.68697 6.49727C6.59317 6.59107 6.54048 6.71828 6.54048 6.85093C6.54048 6.98358 6.59317 7.11079 6.68697 7.20459L6.68698 7.2046L9.03351 9.55078L6.68698 11.897L6.68697 11.897C6.59317 11.9908 6.54048 12.118 6.54048 12.2506C6.54048 12.3833 6.59317 12.5105 6.68697 12.6043C6.78077 12.6981 6.90798 12.7508 7.04063 12.7508C7.17328 12.7508 7.30049 12.6981 7.39429 12.6043L7.3943 12.6043L9.74048 10.2577L12.0867 12.6043L12.0867 12.6043C12.1331 12.6507 12.1882 12.6876 12.2489 12.7127C12.3096 12.7378 12.3746 12.7508 12.4403 12.7508C12.506 12.7508 12.571 12.7378 12.6317 12.7127C12.6924 12.6876 12.7474 12.6507 12.7938 12.6043C12.8878 12.5105 12.9405 12.3833 12.9405 12.2506C12.9405 12.118 12.8878 11.9908 12.7938 11.897L12.7939 11.897H12.794Z" fill="#C7372F" stroke="#C7372F" stroke-width="0.3"/>
    </svg>
    `,
}

const createToastContainer = async (clientRequestId: string) => {
  console.log('===== CREATING TOAST CONTAINER ===== ')
  const file = await fetch(chrome.runtime.getURL('views/toast.html'))
  const html = await file.text()

  const root = document.createElement('div')
  root.tabIndex = 0
  root.id = 'omnivore-extension-root'
  root.attachShadow({ mode: 'open' })
  root.style.opacity = '1.0'

  if (root.shadowRoot) {
    root.shadowRoot.innerHTML = `<style>:host {all initial;}</style>`
  } else {
    alert('Error opening Omnivore user interface.')
    return
  }

  const toastEl = document.createElement('div')
  toastEl.id = '#omnivore-toast'
  toastEl.innerHTML = html
  toastEl.tabIndex = 0
  root.shadowRoot.appendChild(toastEl)

  document.body.appendChild(root)
  connectButtons(root)
  // connectKeyboard(root)

  updateToolbarStatus('waiting')

  return root
}

export const showToolbar = async (clientRequestId: string) => {
  let currentToastEl =
    document.querySelector<HTMLElement>('#omnivore-extension-root') ?? undefined

  const bodyEl = document.body
  if (!bodyEl) return

  console.log('existing currentToastEl: ', currentToastEl)
  if (!currentToastEl) {
    currentToastEl = await createToastContainer(clientRequestId)
  }

  const disableAutoDismiss = await getStorageItem('disableAutoDismiss')
  if (disableAutoDismiss) {
    currentToastEl?.setAttribute('data-disable-auto-dismiss', 'true')
  }
  currentToastEl?.setAttribute(
    'data-omnivore-client-request-id',
    clientRequestId
  )
  ;(currentToastEl as HTMLDivElement)?.focus({
    preventScroll: true,
  })

  updateToolbarStatus('waiting')
}

const autoDismissTime = async () => {
  const strVal = (await getStorageItem('autoDismissTime')) ?? '2500'
  return !Number.isNaN(Number(strVal)) ? Number(strVal) : 2500
}

export const updateToolbarStatus = async (
  status: ToolbarStatus,
  task: string | undefined = undefined
) => {
  const currentToastEl = document.querySelector('#omnivore-extension-root')
  const statusBox = currentToastEl?.shadowRoot?.querySelector(
    '.omnivore-toast-statusBox'
  )
  console.log('updating', status, statusBox)

  if (statusBox) {
    switch (status) {
      case 'success':
        statusBox.innerHTML = systemIcons.success
        break
      case 'failure':
        statusBox.innerHTML = systemIcons.failure
        break
      case 'waiting':
        statusBox.innerHTML = systemIcons.waiting
        break
    }
  }

  // Set a task specific message
  if (task) {
    if (task == 'addNote' && status == 'failure') {
      updateStatusBox(
        '#omnivore-add-note-status',
        'failure',
        'Error adding note...',
        undefined
      )
    }
    if (task == 'addNote' && status == 'success') {
      updateStatusBox(
        '#omnivore-add-note-status',
        'success',
        'Note updated.',
        2500
      )
      setTimeout(() => {
        toggleRow('#omnivore-add-note-status')
      }, 3000)
    }
    if (task == 'setLabels' && status == 'success') {
      updateStatusBox(
        '#omnivore-edit-labels-status',
        'success',
        'Labels Updated',
        2500
      )
    }
    if (task == 'setLabels' && status == 'failure') {
      updateStatusBox(
        '#omnivore-edit-labels-status',
        'failure',
        'Error Updating Labels...',
        2500
      )
    }
    if (task == 'editTitle' && status == 'failure') {
      updateStatusBox(
        '#omnivore-add-note-status',
        'failure',
        'Error updating title...',
        undefined
      )
    }
    if (task == 'editTitle' && status == 'success') {
      updateStatusBox(
        'omnivore-edit-title-status',
        'success',
        'Title updated.',
        2500
      )
      setTimeout(() => {
        toggleRow('#omnivore-edit-title-status')
      }, 3000)
    }
    if (task == 'archive') {
      updateStatusBox(
        '#omnivore-extra-status',
        status,
        status == 'success' ? 'Success' : 'Error',
        status == 'success' ? 2500 : undefined
      )
      if (status == 'success') {
        closeToolbarLater()
      }
    }
  }
}

export const cancelAutoDismiss = () => {
  const currentToastEl = document.querySelector('#omnivore-extension-root')
  if (currentToastEl) {
    currentToastEl.setAttribute('data-disable-auto-dismiss', 'true')
  }
}

// If the user has not disabled auto dismiss on the toolbar this
// will remove it. If the user interacts with the toolbar, this
// dismiss will also be ignored.
export const startToolbarDismiss = async (message: ToolbarMessage) => {
  if (message.status) {
    updateToolbarStatus(message.status)
  }

  const dimissTime = await autoDismissTime()

  setTimeout(() => {
    const currentToastEl = document.querySelector('#omnivore-extension-root')
    if (
      currentToastEl &&
      !currentToastEl.getAttribute('data-disable-auto-dismiss')
    ) {
      ;(currentToastEl as HTMLElement).style.transition = 'opacity 3.5s ease;'
      ;(currentToastEl as HTMLElement).style.opacity = '0'
      setTimeout(() => {
        const currentToastEl = document.querySelector(
          '#omnivore-extension-root'
        )
        if (
          currentToastEl &&
          !currentToastEl.getAttribute('data-disable-auto-dismiss')
        ) {
          currentToastEl.remove()
        }
      }, 500)
    }
  }, dimissTime)
}

const connectButtons = (root: HTMLElement) => {
  const btns = [
    { id: '#omnivore-toast-add-note-btn', func: addNote },
    { id: '#omnivore-toast-edit-title-btn', func: editTitle },
    { id: '#omnivore-toast-edit-labels-btn', func: editLabels },
    { id: '#omnivore-toast-read-now-btn', func: readNow },
    { id: '#omnivore-open-menu-btn', func: openMenu },
    { id: '#omnivore-toast-close-btn', func: closeToolbar },
    { id: '#omnivore-toast-login-btn', func: login },
    { id: '#omnivore-toast-archive-btn', func: archive },
    { id: '#omnivore-toast-delete-btn', func: deleteItem },
  ]

  for (const btnInfo of btns) {
    const btn = root.shadowRoot?.querySelector(btnInfo.id)
    if (btn) {
      console.log(btnInfo.id)
      btn.addEventListener('click', btnInfo.func)
    }
  }

  var x = window.matchMedia('(max-width: 500px)')
  if (x.matches) {
    const labels = root.shadowRoot?.querySelectorAll<HTMLElement>(
      '.omnivore-top-button-label'
    )
    labels?.forEach((label) => {
      label.style.display = 'none'
    })
    const container = root.shadowRoot?.querySelector<HTMLElement>(
      '#omnivore-toast-container'
    )
    if (container) {
      container.style.width = '280px'
      container.style.top = 'unset'
      container.style.bottom = '20px'
    }
  }
}

function editTitle() {
  cancelAutoDismiss()
  toggleRow('#omnivore-edit-title-row')
  let currentToastEl =
    document.querySelector<HTMLElement>('#omnivore-extension-root') ?? undefined

  if (!currentToastEl) {
    console.log('no statusBox to update')
    return
  }

  const titleArea = currentToastEl?.shadowRoot?.querySelector<HTMLTextAreaElement>(
    '#omnivore-edit-title-textarea'
  )

  if (titleArea) {
    titleArea.focus()

    titleArea.onkeydown = (e) => {
      e.cancelBubble = true
    }
  }

  const formElement =  currentToastEl?.shadowRoot?.querySelector<HTMLFormElement>(
    '#omnivore-edit-title-form'
  );

  if (!formElement) {
    console.log('no form to update')
    return
  }

 formElement.onsubmit = (event) => {
    updateStatusBox(
      '#omnivore-edit-title-status',
      'waiting',
      'Updating title...',
      undefined
    )

   const title = titleArea?.value ?? ''

    chrome.runtime.sendMessage({
      action: 'enqueueTask',
      task: 'editTitle',
      clientRequestId: getClientRequestId(),
      title
    })
    event.preventDefault()
  }
}

export const showLoggedOutToolbar = () => {
  cancelAutoDismiss()
  updateToolbarStatus('failure')
  toggleRow('#omnivore-logged-out-row')
  disableAllButtons()
  updateStatusBox(
    '#omnivore-logged-out-status',
    undefined,
    `You are not logged in.`,
    undefined
  )
}

export const updateStatusBox = (
  boxId: string,
  state: ToolbarStatus | undefined,
  message: string,
  dismissAfter: number | undefined
) => {
  const currentToastEl = document.querySelector('#omnivore-extension-root')
  const statusBox = currentToastEl?.shadowRoot?.querySelector(boxId)
  const image = (() => {
    switch (state) {
      case 'waiting':
        return systemIcons.animatedLoader
      case 'success':
        return systemIcons.success
      case 'failure':
        return systemIcons.failure
      default:
        return undefined
    }
  })()
  if (image && statusBox) {
    const color = state == 'failure' ? 'red' : 'unset'
    statusBox.innerHTML = `<span style='padding-right: 10px'>${image}</span><span style='line-height: 20px;color: ${color};text-decoration: none;'>${message}</span>`
  } else if (statusBox) {
    statusBox.innerHTML = message
  }
  if (dismissAfter && statusBox) {
    setTimeout(() => {
      statusBox.innerHTML = ''
    }, dismissAfter)
  }
}

const disableAllButtons = () => {
  const actionButtons = [
    '#omnivore-toast-edit-title-btn',
    '#omnivore-toast-edit-labels-btn',
    '#omnivore-toast-read-now-btn',
    '#omnivore-toast-add-note-btn',
    '#omnivore-open-menu-btn',
  ]
  let currentToastEl = document.querySelector('#omnivore-extension-root')
  actionButtons.forEach((btnId) => {
    const btn =
      currentToastEl?.shadowRoot?.querySelector<HTMLButtonElement>(btnId)
    if (btn) {
      btn.disabled = true
    }
  })
}

export const toggleRow = (rowId: string) => {
  let currentToastEl = document.querySelector('#omnivore-extension-root')

  if (!currentToastEl) {
    console.log('toggleRow: no row to toggle')
    // its possible this was called after closing the extension
    // so just return
    return
  }

  const container = currentToastEl?.shadowRoot?.querySelector(rowId)
  const initialState = container?.getAttribute('data-state')
  const rows = currentToastEl?.shadowRoot?.querySelectorAll(
    '.omnivore-toast-func-row'
  )

  rows?.forEach((r) => {
    r.setAttribute('data-state', 'closed')
  })

  if (container && initialState) {
    const newState = initialState === 'open' ? 'closed' : 'open'
    container.setAttribute('data-state', newState)
  }
}

const noteCacheKey = () => {
  return `cached-note-${document.location.href}`
}

export const getClientRequestId = () => {
  const currentToastEl = document.querySelector('#omnivore-extension-root')
  const clientRequestId = currentToastEl?.getAttribute(
    'data-omnivore-client-request-id'
  )
  return clientRequestId
}

//
// Button functions
//

const login = () => {
  window.open(new URL(`/login`, process.env.OMNIVORE_URL), '_blank')
  closeToolbarLater()
}

const openMenu = () => {
  cancelAutoDismiss()
  toggleRow('#omnivore-extra-buttons-row')
}

const addNote = async () => {
  console.log('[omnivore] adding note')
  cancelAutoDismiss()

  const currentToastEl = document.querySelector('#omnivore-extension-root')
  const clientRequestId = currentToastEl?.getAttribute(
    'data-omnivore-client-request-id'
  )
  console.log('client request id: ', clientRequestId)
  if (!clientRequestId) {
    // TODO: move into an error state
    updateStatusBox(
      '#omnivore-add-note-status',
      'failure',
      'Error adding note...',
      undefined
    )
    return
  }

  const cachedNoteKey = noteCacheKey()

  cancelAutoDismiss()
  toggleRow('#omnivore-add-note-row')

  const noteArea =
    currentToastEl?.shadowRoot?.querySelector<HTMLTextAreaElement>(
      '#omnivore-add-note-textarea'
    )

  if (noteArea) {
    if (cachedNoteKey) {
      const existingNote =
        ((await getStorageItem(cachedNoteKey)) as string) ?? ''
      noteArea.value = existingNote
    }

    if (noteArea.value) {
      noteArea.select()
    } else {
      noteArea.focus()
    }

    noteArea.addEventListener('input', async (event) => {
      const note: Record<string, string> = {}
      note[cachedNoteKey] = (event.target as HTMLTextAreaElement).value
      await setStorage(note)
    })

    noteArea.onkeydown = async (e: KeyboardEvent) => {
      //      e.preventDefault()
      e.stopPropagation()
      // Handle the enter key
      console.log('handling the enter key: ', e.keyCode)
      if (e.keyCode == 13 && (e.metaKey || e.ctrlKey)) {
        updateStatusBox(
          '#omnivore-add-note-status',
          'waiting',
          'Adding note...',
          undefined
        )

        await saveNote(clientRequestId, noteArea.value)
      }
    }
  }

  const form = currentToastEl?.shadowRoot?.querySelector<HTMLElement>(
    '#omnivore-add-note-form'
  )

  if (form) {
    form.onsubmit = async (event) => {
      console.log('handling form submit')
      updateStatusBox(
        '#omnivore-add-note-status',
        'waiting',
        'Adding note...',
        undefined
      )

      if (noteArea) {
        await saveNote(clientRequestId, noteArea.value)
      }

      event.preventDefault()
      event.stopPropagation()
    }
  }
}

const archive = async (event: Event) => {
  const clientRequestId = getClientRequestId()
  try {
    await chrome.runtime.sendMessage({
      action: 'enqueueTask',
      task: 'archive',
      clientRequestId,
    })
  } catch (err) {
    console.log('error archiving item')
  }
  event.preventDefault()
}

const deleteItem = async (event: Event) => {
  const clientRequestId = getClientRequestId()
  try {
    await chrome.runtime.sendMessage({
      action: 'enqueueTask',
      task: 'delete',
      clientRequestId,
    })
  } catch (err) {
    console.log('error archiving item')
  }
  event.preventDefault()
}

const readNow = async () => {
  cancelAutoDismiss()

  let currentToastEl = document.querySelector('#omnivore-extension-root')
  const container = currentToastEl?.shadowRoot?.querySelector(
    '#omnivore-toast-container'
  )
  container?.setAttribute('data-state', 'open')

  window.open(
    new URL(
      `/article?url=${encodeURI(document.location.href)}`,
      (await getStorageItem("omnivoreUrl")) as string,
    ),
    '_blank'
  )

  closeToolbarLater()
}

const closeToolbarLater = () => {
  setTimeout(() => {
    closeToolbar()
  }, 1000)
}
const closeToolbar = () => {
  const currentToastEl = document.querySelector('#omnivore-extension-root')
  if (currentToastEl) {
    currentToastEl.remove()
  }
}

//
// API interactions
//

const saveNote = async (clientRequestId: string, note: string) => {
  try {
    await chrome.runtime.sendMessage({
      action: 'enqueueTask',
      task: 'addNote',
      note,
      clientRequestId,
    })
  } catch (err) {
    console.log('error adding note: ', err)
  }
}
