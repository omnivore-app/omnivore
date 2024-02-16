import { useCallback, useState } from 'react'

export const useCopyLink = (
  url?: string,
  type?: string
): {
  link: string | undefined
  copyLink: () => Promise<void>
  isLinkCopied: boolean
} => {
  const [isLinkCopied, setIsLinkCopied] = useState(false)

  const link =
    url || (typeof window !== 'undefined' ? window.location.toString() : '')

  const copyLink = useCallback(async (): Promise<void> => {
    await navigator.clipboard.writeText(link)
    setIsLinkCopied(true)
    window.setTimeout(() => setIsLinkCopied(false), 5000)
  }, [link])

  return { link, copyLink, isLinkCopied }
}
