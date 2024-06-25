import { useRouter } from 'next/router'
import { useApplyLocalTheme } from '../../lib/hooks/useApplyLocalTheme'
import {
  NavigationLayout,
  NavigationSection,
} from '../../components/templates/NavigationLayout'
import { HomeContainer } from '../../components/nav-containers/HomeContainer'
import { LibraryContainer } from '../../components/templates/library/LibraryContainer'
import { useMemo } from 'react'
import { HighlightsContainer } from '../../components/nav-containers/HighlightsContainer'

export default function Home(): JSX.Element {
  const router = useRouter()
  useApplyLocalTheme()

  const section: NavigationSection | undefined = useMemo(() => {
    if (!router.isReady) {
      return undefined
    }
    const res = router.query.section
    if (typeof res !== 'string') {
      return undefined
    }
    return res as NavigationSection
  }, [router])

  const sectionView = (name: string | string[] | undefined) => {
    if (typeof name !== 'string') {
      return <></>
    }
    switch (name) {
      case 'home':
        return <HomeContainer />
      case 'highlights':
        return <HighlightsContainer />
      case 'library':
        return (
          <LibraryContainer
            folder="inbox"
            filterFunc={(item) => {
              console.log('filtering: ', item)
              return (
                item.state != 'DELETED' &&
                !item.isArchived &&
                item.folder == 'inbox'
              )
            }}
          />
        )
      case 'subscriptions':
        return (
          <LibraryContainer
            folder="following"
            filterFunc={(item) => {
              return (
                item.state != 'DELETED' &&
                !item.isArchived &&
                item.folder == 'following'
              )
            }}
          />
        )
      case 'archive':
        return (
          <LibraryContainer
            folder="archive"
            filterFunc={(item) => item.state != 'DELETED' && item.isArchived}
          />
        )
      case 'trash':
        return (
          <LibraryContainer
            folder="trash"
            filterFunc={(item) => item.state == 'DELETED'}
          />
        )

      default:
        return <></>
    }
  }

  return (
    <NavigationLayout section={section ?? 'home'}>
      {sectionView(section)}
    </NavigationLayout>
  )
}
