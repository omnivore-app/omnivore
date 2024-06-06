import { NavigationLayout } from '../../components/templates/NavigationLayout'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { HomeFeedContainer } from '../../components/templates/homeFeed/HomeFeedContainer'
import { VStack } from '../../components/elements/LayoutPrimitives'

export default function Highlights(): JSX.Element {
  return (
    <NavigationLayout
      section="highlights"
      pageMetaDataProps={{
        title: 'Highlights',
        path: '/highlights',
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
        <div>Highlights will go here</div>
      </VStack>
    </NavigationLayout>
  )
}
