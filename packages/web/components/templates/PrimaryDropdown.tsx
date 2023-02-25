import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { useGetViewerQuery } from '../../lib/networking/queries/useGetViewerQuery'
import { updateTheme } from '../../lib/themeUpdater'
import { AvatarDropdown } from '../elements/AvatarDropdown'
import { DropdownMenu, HeaderDropdownAction } from '../patterns/DropdownMenu'
import { ThemeId } from '../tokens/stitches.config'

export function PrimaryDropdown(): JSX.Element {
  const { viewerData } = useGetViewerQuery()
  const router = useRouter()

  const headerDropdownActionHandler = useCallback(
    (action: HeaderDropdownAction) => {
      switch (action) {
        case 'apply-darker-theme':
          updateTheme(ThemeId.Darker)
          break
        case 'apply-dark-theme':
          updateTheme(ThemeId.Dark)
          break
        case 'apply-lighter-theme':
          updateTheme(ThemeId.Lighter)
          break
        case 'apply-light-theme':
          updateTheme(ThemeId.Light)
          break
        case 'navigate-to-install':
          router.push('/settings/installation')
          break
        case 'navigate-to-emails':
          router.push('/settings/emails')
          break
        case 'navigate-to-labels':
          router.push('/settings/labels')
          break
        case 'navigate-to-subscriptions':
          router.push('/settings/subscriptions')
          break
        case 'navigate-to-api':
          router.push('/settings/api')
          break
        case 'navigate-to-integrations':
          router.push('/settings/integrations')
          break
        case 'logout':
          document.dispatchEvent(new Event('logout'))
          break
        default:
          break
      }
    },
    [updateTheme, router]
  )

  if (!viewerData?.me) {
    return <></>
  }

  return (
    <DropdownMenu
      username={viewerData?.me.profile.username}
      triggerElement={
        <AvatarDropdown userInitials={viewerData?.me?.name.charAt(0) ?? ''} />
      }
      actionHandler={headerDropdownActionHandler}
    />
  )
}
