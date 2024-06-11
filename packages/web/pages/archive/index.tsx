import { NavigationLayout } from '../../components/templates/NavigationLayout'
import { LibraryContainer } from '../../components/templates/library/LibraryContainer'

export default function Archive(): JSX.Element {
  return (
    <NavigationLayout
      section="archive"
      pageMetaDataProps={{
        title: 'Archive',
        path: '/archive',
      }}
    >
      <LibraryContainer folder="archive" />
    </NavigationLayout>
  )
}
