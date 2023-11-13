import { HStack, VStack } from "../../elements/LayoutPrimitives"
import { LibraryFilterMenu } from "../homeFeed/LibraryFilterMenu"
import { DiscoverHeader } from "./DiscoverHeader/DiscoverHeader"
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { useGetViewerQuery } from "../../../lib/networking/queries/useGetViewerQuery"
import { LibraryItemsLayout } from "../homeFeed/HomeFeedContainer"
import { EmptyLibrary } from "../homeFeed/EmptyLibrary"

export type LayoutType = 'LIST_LAYOUT' | 'GRID_LAYOUT'

export type TopicTabData = { title: string, subTitle: string};

export function DiscoverContainer(): JSX.Element {
  const router = useRouter();
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [activeTab, setActiveTab] = useState<TopicTabData>({ title: "Community Picks", subTitle: "What The Omnivore Community are reading right now..."})
  const [layoutType, setLayoutType ] = useState<LayoutType>('GRID_LAYOUT');

  useEffect(() => {
    if (window) {
      setLayoutType(window.localStorage['libraryLayout'] || 'GRID_LAYOUT')
    }
  }, [])

  return (
    <VStack
      css={{
        height: '100%',
        width: 'unset',
      }}
    >
      <DiscoverHeader
        handleLinkSubmission={async (link: string, timezone: string, locale: string) => { return  }}
        allowSelectMultiple={true}
        alwaysShowHeader={false}
        showFilterMenu={showFilterMenu}
        setShowFilterMenu={setShowFilterMenu}
        activeTab={activeTab}
        setActiveTab ={setActiveTab}
        layout={layoutType}
        setLayoutType={setLayoutType}
      />
      <HStack css={{ width: '100%', height: '100%' }}>
        <LibraryFilterMenu
          setShowAddLinkModal={() => { return }}
          searchTerm={'NONE'} // This is done to stop the library filter menu actually having a highlight. Hacky.
          applySearchQuery={(searchQuery: string) => {
            router?.push(`/home?q=${searchQuery}`)
          }}
          showFilterMenu={showFilterMenu}
          setShowFilterMenu={setShowFilterMenu}
        />
        <>
        <VStack
          alignment="start"
          distribution="start"
          css={{
            height: '100%',
            minHeight: '100vh',
          }}
        >
          <div
            onDragEnter={(event) => {
              if (
                event.dataTransfer.types.find((t) => t.toLowerCase() == 'files')
              ) {

              }
            }}
            style={{ height: '100%', width: '100%' }}
          >
            <EmptyLibrary
              layoutType={'GRID_LAYOUT'}
              searchTerm={''}
              onAddLinkClicked={() => {
              }}
            />

          </div>
        </VStack>
          </>

      </HStack>
    </VStack>
)

}
