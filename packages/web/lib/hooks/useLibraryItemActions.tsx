import { useState, useEffect, useCallback } from 'react'
import { setLinkArchivedMutation } from '../networking/mutations/setLinkArchivedMutation'
import {
  showErrorToast,
  showSuccessToast,
  showSuccessToastWithUndo,
} from '../toastHelpers'
import { deleteLinkMutation } from '../networking/mutations/deleteLinkMutation'
import { updatePageMutation } from '../networking/mutations/updatePageMutation'
import { State } from '../networking/fragments/articleFragment'

export default function useLibraryItemActions() {
  const archiveItem = useCallback(async (itemId: string) => {
    const result = await setLinkArchivedMutation({
      linkId: itemId,
      archived: true,
    })

    if (result) {
      showSuccessToast('Link archived', { position: 'bottom-right' })
    } else {
      showErrorToast('Error archiving link', { position: 'bottom-right' })
    }

    return !!result
  }, [])

  const deleteItem = useCallback(async (itemId: string, undo: () => void) => {
    const result = await deleteLinkMutation(itemId)

    if (result) {
      showSuccessToastWithUndo('Item removed', async () => {
        const result = await updatePageMutation({
          pageId: itemId,
          state: State.SUCCEEDED,
        })

        undo()

        if (result) {
          showSuccessToast('Item recovered')
        } else {
          showErrorToast('Error recovering, check your deleted items')
        }
      })
    } else {
      showErrorToast('Error removing item', { position: 'bottom-right' })
    }

    return !!result
  }, [])

  const moveItem = useCallback(async (itemId: string) => {
    const result = await setLinkArchivedMutation({
      linkId: itemId,
      archived: true,
    })

    if (result) {
      showSuccessToast('Link archived', { position: 'bottom-right' })
    } else {
      showErrorToast('Error archiving link', { position: 'bottom-right' })
    }

    return !!result
  }, [])

  return { archiveItem, deleteItem, moveItem }
}
