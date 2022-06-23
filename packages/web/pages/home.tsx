import { PrimaryLayout } from '../components/templates/PrimaryLayout'
import { HomeFeedContainer } from '../components/templates/homeFeed/HomeFeedContainer'
import { VStack } from './../components/elements/LayoutPrimitives'
import { useRef } from 'react'

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
      <VStack alignment="center" distribution="center">
        <HomeFeedContainer />
      </VStack>
    </PrimaryLayout>
  )
}
