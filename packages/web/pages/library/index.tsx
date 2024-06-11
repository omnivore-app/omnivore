import { NavigationLayout } from '../../components/templates/NavigationLayout'
import { LibraryContainer } from '../../components/templates/library/LibraryContainer'

export default function Library(): JSX.Element {
  return (
    <NavigationLayout
      section="library"
      pageMetaDataProps={{
        title: 'Library',
        path: '/library',
      }}
    >
      <LibraryContainer folder="inbox" />
    </NavigationLayout>
  )
}
