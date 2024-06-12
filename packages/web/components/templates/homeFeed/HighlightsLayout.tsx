import { useRouter } from 'next/router'
import { HighlighterCircle } from '@phosphor-icons/react'
import { useCallback, useEffect, useReducer, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Highlight } from '../../../lib/networking/fragments/highlightFragment'
import {
  LibraryItem,
  LibraryItemNode,
} from '../../../lib/networking/queries/useGetLibraryItemsQuery'
import { UserBasicData } from '../../../lib/networking/queries/useGetViewerQuery'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'

import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { MenuTrigger } from '../../elements/MenuTrigger'
import {
  MetaStyle,
  timeAgo,
} from '../../patterns/LibraryCards/LibraryCardStyles'
import { LibraryHighlightGridCard } from '../../patterns/LibraryCards/LibraryHighlightGridCard'
import { NotebookContent } from '../article/Notebook'
import { EmptyHighlights } from './EmptyHighlights'
import { highlightsAsMarkdown } from './HighlightItem'
import { MenuHeaderButton } from './LibraryHeader'

type HighlightItemsLayoutProps = {
  items: LibraryItem[]
  viewer: UserBasicData | undefined

  showFilterMenu: boolean
  setShowFilterMenu: (show: boolean) => void

  gridContainerRef: React.RefObject<HTMLDivElement>
}

export function HighlightItemsLayout(
  props: HighlightItemsLayoutProps
): JSX.Element {
  const [currentItem, setCurrentItem] = useState<LibraryItem | undefined>(
    undefined
  )

  const listReducer = (
    state: LibraryItem[],
    action: {
      type: string
      itemId?: string
      highlightId?: string
      items?: LibraryItem[]
    }
  ) => {
    switch (action.type) {
      case 'RESET':
        return action.items ?? []
      case 'REMOVE_HIGHLIGHT':
        const item = state.find((li) => li.node.id === action.itemId)
        if (item && item.node.highlights) {
          item.node.highlights = item.node.highlights.filter(
            (h) => h.id !== action.highlightId
          )
        }
        const result = state.filter(
          (item) => item.node.highlights && item.node.highlights.length > 0
        )
        if (
          item &&
          item == currentItem &&
          (item.node.highlights?.length ?? 0) < 1
        ) {
          setCurrentItem(result.length > 0 ? result[0] : undefined)
        }
        return result
      default:
        throw new Error()
    }
  }

  const [items, dispatchList] = useReducer(listReducer, [])

  function handleDelete(item: LibraryItemNode, highlight: Highlight) {
    dispatchList({
      type: 'REMOVE_HIGHLIGHT',
      itemId: item.id,
      highlightId: highlight.id,
    })
  }

  useEffect(() => {
    dispatchList({
      type: 'RESET',
      items: props.items.filter(
        (item) => item.node.highlights && item.node.highlights.length > 0
      ),
    })
  }, [props.items])

  useEffect(() => {
    // Only set the current item on larger screens
    if (window.innerWidth >= 992 /* lgDown */) {
      if (!currentItem && items.length > 0) {
        setCurrentItem(items[0])
      }
    }
  }, [currentItem, setCurrentItem, items])

  if (items.length < 1) {
    return (
      <Box
        css={{
          width: '100%',
          height: `100vh`,
        }}
      >
        <EmptyHighlights />
      </Box>
    )
  }

  return (
    <>
      <HStack
        css={{
          width: '100%',
          height: `100vh`,
          '@lgDown': {
            overflowY: 'scroll',
          },
          bg: '$thBackground2',
          overflow: 'hidden',
        }}
        distribution="start"
        alignment="start"
      >
        <Toaster />
        <HStack
          css={{
            flexGrow: '0',
            width: '430px',
            minWidth: '430px',
            overflowY: 'scroll',
            height: '100%',
            '@lgDown': {
              width: '100%',
              minWidth: 'unset',
            },
          }}
          distribution="start"
          alignment="start"
        >
          <VStack
            css={{
              minHeight: `100vh`,
              bg: '$thBackground',
            }}
            distribution="start"
            alignment="start"
          >
            <HStack
              css={{
                width: 'calc(100% - 35px)',
                height: '55px',
                mx: '20px',
                borderBottom: '1px solid $thBorderColor',
              }}
              alignment="center"
              distribution="start"
            >
              <SpanBox
                css={{
                  display: 'none',
                  '@mdDown': {
                    display: 'flex',
                  },
                }}
              >
                <MenuHeaderButton
                  showFilterMenu={props.showFilterMenu}
                  setShowFilterMenu={props.setShowFilterMenu}
                />
              </SpanBox>
            </HStack>
            <LibraryItemsList
              items={items}
              viewer={props.viewer}
              currentItem={currentItem}
              setCurrentItem={setCurrentItem}
              deleteHighlight={handleDelete}
            />
            <Box css={{ height: '100px' }} />
          </VStack>
        </HStack>
        {currentItem && (
          <>
            <SpanBox
              css={{
                display: 'flex',
                height: '100%',
                width: '100%',
                flexGrow: '1',
                justifyContent: 'center',
                overflowY: 'scroll',
                '@lgDown': {
                  display: 'none',
                  flexGrow: 'unset',
                },
              }}
            >
              <HighlightList
                item={currentItem}
                viewer={props.viewer}
                deleteHighlight={handleDelete}
              />
            </SpanBox>
          </>
        )}
      </HStack>
    </>
  )
}

type LibraryItemsListProps = {
  items: LibraryItem[]
  viewer: UserBasicData | undefined

  currentItem: LibraryItem | undefined
  setCurrentItem: (item: LibraryItem | undefined) => void

  deleteHighlight: (item: LibraryItemNode, highlight: Highlight) => void
}

function LibraryItemsList(props: LibraryItemsListProps): JSX.Element {
  return (
    <>
      {props.items.map((linkedItem) => (
        <Box
          className="linkedItemCard"
          data-testid="linkedItemCard"
          id={linkedItem.node.id}
          tabIndex={0}
          key={linkedItem.node.id}
          css={{
            width: '100%',
            height: '100%',
            px: '15px',
            cursor: 'pointer',
          }}
          onClick={(event) => {
            props.setCurrentItem(linkedItem)
            event.preventDefault()
          }}
        >
          {props.viewer && (
            <LibraryItemCard
              item={linkedItem}
              viewer={props.viewer}
              selected={props.currentItem?.node.id == linkedItem.node.id}
              deleteHighlight={props.deleteHighlight}
            />
          )}
        </Box>
      ))}
      <Box css={{ height: '240px' }} />
    </>
  )
}

type HighlightTitleCardProps = {
  item: LibraryItem
  viewer: UserBasicData
  selected: boolean
  deleteHighlight: (item: LibraryItemNode, highlight: Highlight) => void
}

function LibraryItemCard(props: HighlightTitleCardProps): JSX.Element {
  return (
    <>
      <SpanBox css={{ display: 'none', '@lgDown': { display: 'flex' } }}>
        <LibraryHighlightGridCard
          item={props.item.node}
          viewer={props.viewer}
          deleteHighlight={props.deleteHighlight}
        />
      </SpanBox>
      <SpanBox css={{ display: 'none', '@lg': { display: 'flex' } }}>
        <HighlightTitleCard {...props} />
      </SpanBox>
    </>
  )
}

function HighlightTitleCard(props: HighlightTitleCardProps): JSX.Element {
  return (
    <HStack
      css={{
        height: '100%',
        width: '100%',
        py: '10px',
        borderBottom: '1px solid $thBorderColor',
      }}
      distribution="start"
    >
      <HStack
        css={{
          width: '100%',
          height: '100%',
          py: '15px',
          px: '15px',
          borderRadius: '10px',
          bg: props.selected ? '$thBackground2' : 'unset',
        }}
      >
        <VStack
          css={{
            width: '100%',
            height: '100%',
            borderRadius: '5px',
          }}
        >
          <HStack css={MetaStyle} distribution="start">
            <Box>
              {timeAgo(props.item.node.savedAt)}
              {` `}
              {props.item.node.wordsCount ?? 0 > 0
                ? `  • ${Math.max(
                    1,
                    Math.round((props.item.node.wordsCount ?? 0) / 235)
                  )} min read`
                : null}
              {props.item.node.readingProgressPercent ?? 0 > 0 ? (
                <>
                  {`  • `}
                  <SpanBox css={{ color: '#55B938' }}>
                    {`${Math.round(props.item.node.readingProgressPercent)}%`}
                  </SpanBox>
                </>
              ) : null}
            </Box>
          </HStack>
          <Box
            css={{
              mt: '5px',
              color: '$thTextContrast2',
              fontSize: '16px',
              fontWeight: '500',
              lineHeight: '1.50',
              fontFamily: '$display',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              wordBreak: 'break-word',
            }}
          >
            {props.item.node.title}
          </Box>
        </VStack>

        <HighlightCountChip
          selected={props.selected}
          count={props.item.node.highlights?.length ?? 0}
        />
      </HStack>
    </HStack>
  )
}

type HighlightListProps = {
  item: LibraryItem
  viewer: UserBasicData | undefined

  deleteHighlight: (item: LibraryItemNode, highlight: Highlight) => void
}

function HighlightList(props: HighlightListProps): JSX.Element {
  const router = useRouter()

  const exportHighlights = useCallback(() => {
    ;(async () => {
      if (!props.item.node.highlights) {
        showErrorToast('No highlights to export')
        return
      }
      const markdown = highlightsAsMarkdown(props.item.node.highlights)
      await navigator.clipboard.writeText(markdown)
      showSuccessToast('Highlight copied')
    })()
  }, [props.item.node.highlights])

  const viewInReader = useCallback(
    (highlightId: string) => {
      if (!router || !router.isReady || !props.viewer) {
        showErrorToast('Error navigating to highlight')
        return
      }
      console.log(
        'pushing user: ',
        props.viewer,
        'slug: ',
        props.item.node.slug
      )
      router.push(
        {
          pathname: '/[username]/[slug]',
          query: {
            username: props.viewer.profile.username,
            slug: props.item.node.slug,
          },
          hash: highlightId,
        },
        `${props.viewer.profile.username}/${props.item.node.slug}#${highlightId}`,
        {
          scroll: false,
        }
      )
    },
    [router, props]
  )

  return (
    <VStack
      css={{
        m: '20px',
        flexGrow: '1',
        height: '100%',
        minWidth: '425px',
        maxWidth: '625px',
        width: '100%',
        justifyContent: 'flex-start',
      }}
      distribution="start"
      alignment="center"
    >
      <HStack
        css={{
          width: '100%',
          height: '100%',
        }}
        alignment="start"
        distribution="end"
      >
        <Dropdown triggerElement={<MenuTrigger />}>
          <DropdownOption
            onSelect={() => {
              exportHighlights()
            }}
            title="Export"
          />
        </Dropdown>
      </HStack>
      <HStack
        css={{ width: '100%', height: '100%', bg: '$thLibrarySearchbox' }}
      >
        {props.viewer && (
          <NotebookContent
            viewer={props.viewer}
            item={props.item.node}
            viewInReader={viewInReader}
          />
        )}
      </HStack>
    </VStack>
  )

  // return (
  //   <HStack
  //     css={{
  //       m: '20px',
  //       height: '100%',
  //       flexGrow: '1',
  //     }}
  //     distribution="center"
  //     alignment="start"
  //   >
  //     <VStack
  //       css={{
  //         width: '425px',
  //         borderRadius: '6px',
  //       }}
  //       alignment="start"
  //       distribution="start"
  //     >
  //       <HStack
  //         css={{
  //           width: '100%',
  //           pt: '25px',
  //           borderBottom: '1px solid $thBorderColor',
  //         }}
  //         alignment="center"
  //         distribution="center"
  //       >
  //         <StyledText
  //           css={{
  //             fontWeight: '600',
  //             fontSize: '15px',
  //             fontFamily: '$display',
  //             width: '100%',
  //             color: 'thTextContrast2',
  //           }}
  //         >
  //           NOTEBOOK
  //         </StyledText>
  //         <Dropdown triggerElement={<MenuTrigger />}>
  //           <DropdownOption
  //             onSelect={() => {
  //               exportHighlights()
  //             }}
  //             title="Export"
  //           />
  //         </Dropdown>
  //       </HStack>

  //       <HStack
  //         css={{
  //           width: '100%',
  //           pt: '25px',
  //           borderBottom: '1px solid $thBorderColor',
  //         }}
  //         alignment="center"
  //         distribution="center"
  //       >
  //         <StyledText
  //           css={{
  //             fontWeight: '600',
  //             fontSize: '15px',
  //             fontFamily: '$display',
  //             width: '100%',
  //             color: 'thTextContrast2',
  //           }}
  //         >
  //           NOTE
  //         </StyledText>
  //       </HStack>
  //       <HighlightNoteBox
  //         sizeMode="normal"
  //         mode={notesEditMode}
  //         setEditMode={setNotesEditMode}
  //         text={note?.annotation}
  //         placeHolder="Add notes to this document..."
  //         saveText={(highlight) => {
  //           console.log('saving text', highlight)
  //         }}
  //       />
  //       <SpanBox css={{ mt: '10px', mb: '25px' }} />

  //       {sortedHighlights && (
  //         <>
  //           <HStack
  //             css={{
  //               width: '100%',
  //               pt: '25px',
  //               borderBottom: '1px solid $thBorderColor',
  //             }}
  //             alignment="center"
  //             distribution="center"
  //           >
  //             <StyledText
  //               css={{
  //                 fontWeight: '600',
  //                 fontSize: '15px',
  //                 fontFamily: '$display',
  //                 width: '100%',
  //                 color: 'thTextContrast2',
  //               }}
  //             >
  //               HIGHLIGHTS
  //             </StyledText>
  //           </HStack>
  //           <VStack
  //             css={{ width: '100%', mt: '20px' }}
  //             distribution="start"
  //             alignment="start"
  //           >
  //             {sortedHighlights.map((highlight) => (
  //               <>
  //                 <HighlightViewItem
  //                   key={highlight.id}
  //                   highlight={highlight}
  //                   updateHighlight={(highlight) => {
  //                     console.log('updated highlight: ', highlight)
  //                   }}

  //                   deleteHighlightAction={(highlight) => {
  //                     console.log('deleting: ', highlight)
  //                   }}

  //                   setSetLabelsTarget: (highlight: Highlight) => void
  //                   setShowConfirmDeleteHighlightId: (id: string | undefined) => void

  //                 />
  //                 <SpanBox css={{ mt: '10px', mb: '25px' }} />
  //               </>
  //             ))}
  //             <Box css={{ height: '100px' }} />
  //           </VStack>
  //           <SpanBox css={{ mt: '10px', mb: '25px' }} />
  //         </>
  //       )}
  //     </VStack>
  //   </HStack>
  // )
}

type HighlightCountChipProps = {
  count: number
  selected: boolean
}

function HighlightCountChip(props: HighlightCountChipProps): JSX.Element {
  return (
    <HStack
      css={{
        gap: '5px',
        borderRadius: '12px',
        marginLeft: 'auto',
        minWidth: '50px',
        minHeight: '25px',
        width: '47px',
        color: props.selected ? '#3D3D3D' : '#898989',
        bg: props.selected ? '#D9D9D9' : '$thBackground2',
        fontFamily: '$inter',
        fontSize: '14px',
        fontWeight: '500',
        ml: '30px',
      }}
      alignment="center"
      distribution="center"
    >
      {props.count}
      <HighlighterCircle
        size={15}
        color={props.selected ? '#3D3D3D' : '#898989'}
      />
    </HStack>
  )
}
