import { NavigationLayout } from '../../components/templates/NavigationLayout'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { HomeFeedContainer } from '../../components/templates/homeFeed/HomeFeedContainer'
import { VStack } from '../../components/elements/LayoutPrimitives'

export default function Subscriptions(): JSX.Element {
  return (
    <NavigationLayout
      section="subscriptions"
      pageMetaDataProps={{
        title: 'Subscriptions',
        path: '/subscriptions',
      }}
    >
      <VStack
        alignment="start"
        distribution="center"
        css={{
          px: '70px',
          backgroundColor: '$thLibraryBackground',
          '@lgDown': { px: '20px' },
          '@mdDown': { px: '10px' },
        }}
      >
        <div>Subscriptions will go here</div>
      </VStack>
    </NavigationLayout>
  )
}
