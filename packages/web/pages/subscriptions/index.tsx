import { NavigationLayout } from '../../components/templates/NavigationLayout'
import { LibraryContainer } from '../../components/templates/library/LibraryContainer'

export default function Subscriptions(): JSX.Element {
  return (
    <NavigationLayout
      section="subscriptions"
      pageMetaDataProps={{
        title: 'Subscriptions',
        path: '/subscriptions',
      }}
    >
      <LibraryContainer folder="following" />
    </NavigationLayout>
  )
}
