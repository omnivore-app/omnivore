import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useAddItem } from '../networking/library_items/useLibraryItems'
import { showErrorToast, showSuccessToastWithAction } from '../toastHelpers'
import { useRouter } from 'next/router'

export const useHandleAddUrl = () => {
  const router = useRouter()
  const addItem = useAddItem()
  return useCallback(async (url: string, timezone: string, locale: string) => {
    const itemId = uuidv4()
    const result = await addItem.mutateAsync({
      itemId,
      url,
      timezone,
      locale,
    })
    console.log('result: ', result)
    if (result) {
      showSuccessToastWithAction('Item saving', 'Read now', async () => {
        router.push(`/article?url=${encodeURIComponent(url)}`)
        return Promise.resolve()
      })
    } else {
      showErrorToast('Error saving url', { position: 'bottom-right' })
    }
  }, [])
}
