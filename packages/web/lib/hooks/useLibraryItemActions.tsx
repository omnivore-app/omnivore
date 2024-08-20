import { useCallback } from 'react'
import {
  showErrorToast,
  showSuccessToast,
  showSuccessToastWithUndo,
} from '../toastHelpers'
import {
  useArchiveItem,
  useDeleteItem,
  useMoveItemToFolder,
  useRestoreItem,
} from '../networking/library_items/useLibraryItems'

export default function useLibraryItemActions() {
  const archiveItem = useArchiveItem()
  const deleteItem = useDeleteItem()
  const moveItem = useMoveItemToFolder()
  const restoreItem = useRestoreItem()

  const doArchiveItem = useCallback(async (itemId: string, slug: string) => {
    const result = await archiveItem.mutateAsync({
      itemId: itemId,
      slug: slug,
      input: {
        linkId: itemId,
        archived: true,
      },
    })

    console.log('result: ', result)
    if (result) {
      showSuccessToast('Link archived', { position: 'bottom-right' })
    } else {
      showErrorToast('Error archiving link', { position: 'bottom-right' })
    }

    return !!result
  }, [])

  const doDeleteItem = useCallback(
    async (itemId: string, slug: string, undo: () => void) => {
      const result = await deleteItem.mutateAsync({ itemId, slug })

      if (result) {
        showSuccessToastWithUndo('Item removed', async () => {
          const result = await restoreItem.mutateAsync({ itemId, slug })

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
    },
    []
  )

  const doMoveItem = useCallback(async (itemId: string, slug: string) => {
    const result = await moveItem.mutateAsync({
      itemId,
      slug,
      folder: 'inbox',
    })
    if (result) {
      showSuccessToast('Moved to library', { position: 'bottom-right' })
    } else {
      showErrorToast('Error moving item', { position: 'bottom-right' })
    }

    return !!result
  }, [])

  const shareItem = useCallback(
    async (title: string, originalArticleUrl: string | undefined) => {
      if (!originalArticleUrl) {
        showErrorToast('Article has no public URL to share', {
          position: 'bottom-right',
        })
      } else if (navigator.share) {
        navigator.share({
          title: title + '\n',
          text: title + '\n',
          url: originalArticleUrl,
        })
      } else {
        await navigator.clipboard.writeText(originalArticleUrl)
        showSuccessToast('URL copied to clipboard', {
          position: 'bottom-right',
        })
      }
    },
    []
  )

  return {
    archiveItem: doArchiveItem,
    deleteItem: doDeleteItem,
    moveItem: doMoveItem,
    shareItem,
  }
}
