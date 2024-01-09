import { PrimaryLayout } from "../components/templates/PrimaryLayout"
import { VStack } from "./../components/elements/LayoutPrimitives"
import { DiscoverContainer } from "../components/templates/discoverFeed/DiscoverContainer"

export default function Discover(): JSX.Element {
  return <LoadedContent />
}

function LoadedContent(): JSX.Element {
  return (
    <PrimaryLayout
      pageMetaDataProps={{
        title: 'Discover - Omnivore',
        path: '/discover',
      }}
      pageTestId="discover-page-tag"
    >
      <VStack
        alignment="center"
        distribution="center"
        css={{ backgroundColor: '$thLibraryBackground' }}
      >
        <DiscoverContainer />
      </VStack>
    </PrimaryLayout>
  )
}
