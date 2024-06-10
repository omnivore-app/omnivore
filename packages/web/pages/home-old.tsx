import { PrimaryLayout } from '../components/templates/PrimaryLayout'
import { HomeFeedContainer } from '../components/templates/homeFeed/HomeFeedContainer'
import { VStack } from './../components/elements/LayoutPrimitives'

export default function Home(): JSX.Element {
  return <LoadedContent />
}

function LoadedContent(): JSX.Element {
  return (
    <PrimaryLayout
      pageMetaDataProps={{
        title: 'Home - Omnivore',
        path: '/home',
      }}
      pageTestId="home-page-tag"
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
    </PrimaryLayout>
  )
}
