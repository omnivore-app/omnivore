import { useState } from 'react'
import { UploadModal } from '../UploadModal'
import { LayoutType } from './HomeFeedContainer'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { MultiSelectMode } from './LibraryHeader'
import { LibraryItem } from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Toaster } from 'react-hot-toast'
import TopBarProgress from 'react-topbar-progress-indicator'
import { StyledText } from '../../elements/StyledText'
import { Button } from '../../elements/Button'
import { LIBRARY_LEFT_MENU_WIDTH } from '../navMenu/LibraryLegacyMenu'
import { ArchiveIcon } from '../../elements/icons/ArchiveIcon'
import { TrashIcon } from '../../elements/icons/TrashIcon'
import { BrowserIcon } from '../../elements/icons/BrowserIcon'
import CheckboxComponent from '../../elements/Checkbox'

type TLDRLayoutProps = {
  layout: LayoutType
  viewer?: UserBasicData

  items: LibraryItem[]
  isValidating: boolean

  hasMore: boolean
  totalItems: number

  loadMore: () => void
}

export function TLDRLayout(props: TLDRLayoutProps): JSX.Element {
  return (
    <>
      <VStack
        alignment="start"
        distribution="start"
        css={{
          gap: '50px',
          height: '100%',
          minHeight: '100vh',
          px: '70px',
          width: '100%',
          maxWidth: '800px',
          '@mdDown': {
            p: '10px',
          },
        }}
      >
        <Toaster />

        {props.isValidating && props.items.length == 0 && <TopBarProgress />}

        {props.items.map((item) => {
          return (
            <HStack
              key={`tldr-${item.node.id}`}
              css={{
                gap: '10px',
              }}
            >
              <SpanBox css={{ pt: '1px' }}>
                <input type="checkbox" />
              </SpanBox>

              <VStack
                alignment="start"
                css={
                  {
                    // px: '60px',
                    // pl: '10px',
                    // py: '15px',
                    // gap: '15px',
                    // height: '100%',
                    // color: '#EDEDED',
                    // borderStyle: 'none',
                    // borderBottom: 'none',
                    // borderRadius: '6px',
                    // '@media (min-width: 768px)': {
                    //   width: `calc(100vw - ${LIBRARY_LEFT_MENU_WIDTH})`,
                    // },
                    // '@media (min-width: 930px)': {
                    //   width: '580px',
                    // },
                    // '@media (min-width: 1280px)': {
                    //   width: '890px',
                    // },
                    // '@media (min-width: 1600px)': {
                    //   width: '1200px',
                    // },
                    // '@media (max-width: 930px)': {
                    //   borderRadius: '0px',
                    // },
                  }
                }
                distribution="start"
              >
                <SpanBox
                  css={{
                    fontFamily: '$inter',
                    fontWeight: '600',
                    fontSize: '20px',
                    textDecoration: 'underline',
                  }}
                >
                  {item.node.title}
                </SpanBox>
                <SpanBox
                  css={{
                    fontFamily: '$inter',
                    fontWeight: '500',
                    fontSize: '14px',
                    lineHeight: '30px',
                    color: '#D9D9D9',
                  }}
                >
                  {item.node.aiSummary}
                </SpanBox>
                <HStack css={{ gap: '15px', pt: '5px' }}>
                  <Button style="tldr">
                    <ArchiveIcon size={20} color="#EDEDED" />
                    Archive
                  </Button>
                  <Button style="tldr">
                    <TrashIcon size={20} color="#EDEDED" />
                    Remove
                  </Button>
                  <Button style="tldr">
                    <BrowserIcon size={20} color="#EDEDED" />
                    Open original
                  </Button>
                </HStack>
              </VStack>
            </HStack>
          )
        })}

        <HStack
          distribution="center"
          css={{ width: '100%', mt: '$2', mb: '$4' }}
        >
          {props.hasMore ? (
            <Button
              style="ctaGray"
              css={{
                cursor: props.isValidating ? 'not-allowed' : 'pointer',
              }}
              onClick={props.loadMore}
              disabled={props.isValidating}
            >
              {props.isValidating ? 'Loading' : 'Load More'}
            </Button>
          ) : (
            <StyledText style="caption"></StyledText>
          )}
        </HStack>
      </VStack>
    </>
  )
}
