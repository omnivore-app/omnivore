import { getStorageItem } from '../utils'
import { Label } from '../types'
import { cancelAutoDismiss, getClientRequestId, toggleRow, updateStatusBox, updateToolbarStatus } from './toolbar'

export async function editLabels() {
  cancelAutoDismiss()

  const currentToastEl = document.querySelector('#omnivore-extension-root')

  if (!currentToastEl || !currentToastEl.shadowRoot) {
    console.log('no statusBox to update')
    return
  }

  let labels = await getStorageItem('labels').then((value: any) => {
    if (value && value.length > 0) {
      return value as Label[]
    }

    return undefined
  })

  toggleRow('#omnivore-edit-labels-row')
  currentToastEl.shadowRoot
    .querySelector<HTMLInputElement>('#omnivore-edit-label-input')
    ?.focus()

  const list = currentToastEl.shadowRoot.querySelector(
    '#omnivore-edit-labels-list'
  )

  // Add a box for waiting for the labels.
  if (!labels) {
    console.error('No labels found, trying to update the cache.')
    chrome.runtime.sendMessage({
      action: 'enqueueTask',
      task: 'updateLabelCache',
      clientRequestId: getClientRequestId(),
    })

    return;
  }


  // currentToastEl.shadowRoot.querySelector(
  //   '#omnivore-edit-label-input'
  // )<HTMLInputElement>.onkeydown = labelEditorKeyDownHandler
  //
  // currentToastEl.shadowRoot.querySelector(
  //   '#omnivore-edit-label-editor'
  // )<HTMLInputElement>.onclick = labelEditorClickHandler
  //
  // currentToastEl.shadowRoot
  //   .querySelector<HTMLInputElement>('#omnivore-edit-label-input')
  //   .addEventListener('input', (event) => {
  //     updateLabels(event.target.value)
  //   })

  if (list) {
    list.innerHTML = ''
    labels
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      )
      .forEach(function (label, idx) {
        const rowHtml = createLabelRow(label)
        list.appendChild(rowHtml)
      })
  }
}

function createLabelRow(label: Label) {
  const element = document.createElement('button')
  const dot = document.createElement('span')
  // @ts-ignore
  dot.style = 'width:10px;height:10px;border-radius:1000px;'
  dot.style.setProperty('background-color', label.color)
  const title = document.createElement('span')
  // @ts-ignore
  title.style = 'margin-left: 10px;pointer-events: none;'
  title.innerText = label.name

  const check = document.createElement('span')
  // @ts-ignore
  check.style = 'margin-left: auto;pointer-events: none;'
  check.className = 'checkbox'
  check.innerHTML = `
      <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.7411 1.75864L4.79692 10.7028L0.69751 6.60341L1.74845 5.55246L4.79692 8.59348L12.6902 0.707703L13.7411 1.75864Z" fill="#888888"/>
      </svg>
    `

  element.appendChild(dot)
  element.appendChild(title)
  element.appendChild(check)

  element.onclick = labelClick
  // element.onkeydown = labelEditorKeyDownHandler
  element.setAttribute('data-label-id', label.id)
  element.setAttribute(
    'data-label-selected',
    label['selected'] ? 'on' : 'off'
  )
  element.setAttribute('tabIndex', '-1')

  return element
}


function labelClick(event: any) {
  event.preventDefault()
  const labelId = event.target?.getAttribute('data-label-id')

  if (labelId) {
    toggleLabel(event, labelId)
  }
}

async function toggleLabel(event: any, labelId: string) {
  const labelSelected = event.target?.getAttribute('data-label-selected')

  if (!labelId || !labelSelected) {
    return
  }

  const toggledValue = labelSelected == 'on' ? false : true
  event.target?.setAttribute(
    'data-label-selected',
    toggledValue ? 'on' : 'off'
  )


  let labels = await getStorageItem('labels').then((value: any) => {
    if (value && value.length > 0) {
      return value as Label[]
    }

    return undefined
  })

  if (!labels) {
    throw Error("No labels selected")
  }

  const label = labels.find((l) => l.id === labelId)
  if (label) {
    syncLabelChanges()
  }

}

function syncLabelChanges() {
  updateStatusBox(
    '#omnivore-edit-labels-status',
    'waiting',
    'Updating Labels...',
    undefined
  )

  const currentToastEl = document.querySelector('#omnivore-extension-root')
  const labels = currentToastEl?.shadowRoot?.querySelector("#omnivore-edit-labels-list")

  if (labels) {
    const setLabels = [...labels.children]
      .filter((l) => l.getAttribute('data-label-selected') === 'on')
      .map((l) => l.getAttribute('data-label-id')!)

    chrome.runtime.sendMessage({
      action: 'enqueueTask',
      task: 'setLabels',
      clientRequestId: getClientRequestId(),
      labels: setLabels,
    })
  }


}
