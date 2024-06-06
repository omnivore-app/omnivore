import { NavigationLayout } from '../../components/templates/NavigationLayout'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { HomeFeedContainer } from '../../components/templates/homeFeed/HomeFeedContainer'
import { VStack } from '../../components/elements/LayoutPrimitives'

export default function Home(): JSX.Element {
  return <LoadedContent />
}

function LoadedContent(): JSX.Element {
  return (
    <NavigationLayout
      section="library"
      pageMetaDataProps={{
        title: 'Library',
        path: '/library',
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
        <HomeFeedContainer />
      </VStack>
    </NavigationLayout>
  )
}
