import { NavigationLayout } from '../../components/templates/NavigationLayout'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { HomeFeedContainer } from '../../components/templates/homeFeed/HomeFeedContainer'
import { Box, VStack } from '../../components/elements/LayoutPrimitives'
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
      <LibraryContainer />
    </NavigationLayout>
  )
}
