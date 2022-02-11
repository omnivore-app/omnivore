import { PrimaryLayout } from '../components/templates/PrimaryLayout'
import { HomeFeedContainer } from '../components/templates/homeFeed/HomeFeedContainer'
import { VStack } from './../components/elements/LayoutPrimitives'
import { useRef } from 'react'

export default function Home(): JSX.Element {
  return <LoadedContent />
}

function LoadedContent(): JSX.Element {
  const scrollRef = useRef<HTMLDivElement | null>(null)

  return (
    <PrimaryLayout
      pageMetaDataProps={{
        title: 'Home - Omnivore',
        path: '/home',
      }}
      scrollElementRef={scrollRef}
      pageTestId="home-page-tag"
    >
      <VStack alignment="center" distribution="center" ref={scrollRef}>
        <HomeFeedContainer scrollElementRef={scrollRef} />
      </VStack>
    </PrimaryLayout>
  )
}
