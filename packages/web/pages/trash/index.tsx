import { NavigationLayout } from '../../components/templates/NavigationLayout'
import { LibraryContainer } from '../../components/templates/library/LibraryContainer'

export default function Trash(): JSX.Element {
  return (
    <NavigationLayout
      section="trash"
      pageMetaDataProps={{
        title: 'Trash',
        path: '/trash',
      }}
    >
      <LibraryContainer folder="trash" />
    </NavigationLayout>
  )
}
