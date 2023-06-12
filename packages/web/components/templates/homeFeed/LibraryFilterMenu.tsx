import { ReactNode, useMemo, useState } from 'react'
import { StyledText } from '../../elements/StyledText'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { Button } from '../../elements/Button'
import { CaretRight, Circle, DotsThree, Plus } from 'phosphor-react'
import { useGetSubscriptionsQuery } from '../../../lib/networking/queries/useGetSubscriptionsQuery'
import { useGetLabelsQuery } from '../../../lib/networking/queries/useGetLabelsQuery'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { theme } from '../../tokens/stitches.config'
import { currentThemeName } from '../../../lib/themeUpdater'
import { useRegisterActions } from 'kbar'
import { LogoBox } from '../../elements/LogoBox'

export const LIBRARY_LEFT_MENU_WIDTH = '233px'

type LibraryFilterMenuProps = {
  setShowAddLinkModal: (show: boolean) => void

  searchTerm: string | undefined
  applySearchQuery: (searchTerm: string) => void

  showFilterMenu: boolean
  setShowFilterMenu: (show: boolean) => void
}

export function LibraryFilterMenu(props: LibraryFilterMenuProps): JSX.Element {
  return (
    <>
      <Box
        css={{
          left: '0px',
          top: '0px',
          position: 'fixed',
          bg: '$thLeftMenuBackground',
          height: '100%',
          width: LIBRARY_LEFT_MENU_WIDTH,
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '@mdDown': {
            visibility: props.showFilterMenu ? 'visible' : 'hidden',
            width: '100%',
            transition: 'visibility 0s, top 150ms',
          },
        }}
      >
        <Box
          css={{
            width: '100%',
            px: '25px',
            pb: '25px',
            pt: '4.5px',
            lineHeight: '1',
          }}
        >
          <LogoBox />
        </Box>

        <SavedSearches {...props} />
        <Subscriptions {...props} />
        <Labels {...props} />
        <Box css={{ height: '250px ' }} />
      </Box>
      {/* This spacer pushes library content to the right of 
      the fixed left side menu. */}
      <Box
        css={{
          minWidth: LIBRARY_LEFT_MENU_WIDTH,
          height: '100%',
          bg: '$thBackground',
          '@mdDown': {
            display: 'none',
          },
        }}
      ></Box>
    </>
  )
}

function SavedSearches(props: LibraryFilterMenuProps): JSX.Element {
  const items = [
    {
      name: 'Inbox',
      term: 'in:inbox',
    },
    {
      name: 'Continue Reading',
      term: 'in:inbox sort:read-desc is:unread',
    },
    {
      name: 'Read Later',
      term: 'in:inbox -label:Newsletter',
    },
    {
      name: 'Highlights',
      term: 'has:highlights mode:highlights',
    },
    {
      name: 'Unlabeled',
      term: 'no:label',
    },
    {
      name: 'Files',
      term: 'type:file',
    },
    {
      name: 'Archived',
      term: 'in:archive',
    },
  ]

  useRegisterActions(
    items.map((item, idx) => {
      const key = String(idx + 1)
      return {
        id: `saved_search_${key}`,
        name: item.name,
        shortcut: [key],
        section: 'Saved Searches',
        keywords: '?' + item.name,
        perform: () => {
          props.applySearchQuery(item.term)
        },
      }
    }),
    []
  )

  return (
    <MenuPanel title="Saved Searches">
      {items.map((item) => (
        <FilterButton
          key={item.name}
          text={item.name}
          filterTerm={item.term}
          {...props}
        />
      ))}

      <Box css={{ height: '10px' }}></Box>
    </MenuPanel>
  )
}

function Subscriptions(props: LibraryFilterMenuProps): JSX.Element {
  const { subscriptions } = useGetSubscriptionsQuery()
  const [viewAll, setViewAll] = useState(false)

  useRegisterActions(
    subscriptions.map((subscription, idx) => {
      const key = String(idx + 1)
      const name = subscription.name
      return {
        id: `subscription_${key}`,
        section: 'Subscriptions',
        name: name,
        keywords: '*' + name,
        perform: () => {
          props.applySearchQuery(`subscription:\"${name}\"`)
        },
      }
    }),
    [subscriptions]
  )

  if (subscriptions.length < 1) {
    return <></>
  }

  return (
    <MenuPanel
      title="Subscriptions"
      editTitle="Edit Subscriptions"
      editFunc={() => {
        window.location.href = '/settings/subscriptions'
      }}
    >
      {subscriptions.slice(0, viewAll ? undefined : 4).map((item) => {
        return (
          <FilterButton
            key={item.id}
            filterTerm={`subscription:\"${item.name}\"`}
            text={item.name}
            {...props}
          />
        )
      })}
      <ViewAllButton state={viewAll} setState={setViewAll} />
    </MenuPanel>
  )
}

function Labels(props: LibraryFilterMenuProps): JSX.Element {
  const { labels } = useGetLabelsQuery()
  const [viewAll, setViewAll] = useState(false)

  return (
    <MenuPanel
      title="Labels"
      editTitle="Edit Labels"
      hideBottomBorder={true}
      editFunc={() => {
        window.location.href = '/settings/labels'
      }}
    >
      {labels.slice(0, viewAll ? undefined : 4).map((item) => {
        return <LabelButton key={item.id} label={item} {...props} />
      })}
      <ViewAllButton state={viewAll} setState={setViewAll} />
    </MenuPanel>
  )
}

type MenuPanelProps = {
  title: string
  children: ReactNode
  editFunc?: () => void
  editTitle?: string
  hideBottomBorder?: boolean
}

function MenuPanel(props: MenuPanelProps): JSX.Element {
  return (
    <VStack
      css={{
        m: '0px',
        width: '100%',
        borderBottom: props.hideBottomBorder
          ? '1px solid transparent'
          : '1px solid $thBorderColor',
        px: '15px',
      }}
      alignment="start"
      distribution="start"
    >
      <HStack css={{ width: '100%' }} distribution="start" alignment="start">
        <StyledText
          css={{
            fontFamily: 'Inter',
            fontWeight: '600',
            fontSize: '16px',
            lineHeight: '125%',
            color: '$thLibraryMenuPrimary',
            pl: '10px',
            my: '20px',
          }}
        >
          {props.title}
        </StyledText>
        <SpanBox
          css={{
            my: '15px',
            marginLeft: 'auto',
            height: '100%',
            verticalAlign: 'middle',
          }}
        >
          {props.editTitle && props.editFunc && (
            <Dropdown
              triggerElement={
                <Box
                  css={{
                    display: 'flex',
                    height: '30px',
                    width: '30px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '1000px',
                    cursor: 'pointer',
                    '&:hover': {
                      bg: '$thBackground4',
                    },
                  }}
                >
                  <DotsThree
                    size={25}
                    weight="bold"
                    color={theme.colors.thTextSubtle2.toString()}
                  />
                </Box>
              }
            >
              <DropdownOption
                title={props.editTitle}
                onSelect={() => {
                  if (props.editFunc) {
                    props.editFunc()
                  }
                }}
              />
            </Dropdown>
          )}
        </SpanBox>
      </HStack>
      {props.children}
    </VStack>
  )
}

type FilterButtonProps = {
  text: string

  filterTerm: string
  searchTerm: string | undefined

  applySearchQuery: (searchTerm: string) => void

  setShowFilterMenu: (show: boolean) => void
}

function FilterButton(props: FilterButtonProps): JSX.Element {
  const isInboxFilter = (filter: string) => {
    return filter === '' || filter === 'in:inbox'
  }
  const selected = useMemo(() => {
    if (isInboxFilter(props.filterTerm) && !props.searchTerm) {
      return true
    }
    return props.searchTerm === props.filterTerm
  }, [props.searchTerm, props.filterTerm])

  return (
    <Box
      css={{
        pl: '10px',
        mb: '2px',
        display: 'flex',
        width: '100%',
        maxWidth: '100%',
        height: '32px',

        backgroundColor: selected ? '$thLibrarySelectionColor' : 'unset',
        fontSize: '14px',
        fontWeight: 'regular',
        fontFamily: '$display',
        color: selected
          ? '$thLibraryMenuSecondary'
          : '$thLibraryMenuUnselected',
        verticalAlign: 'middle',
        borderRadius: '3px',
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        alignItems: 'center',
        '&:hover': {
          backgroundColor: selected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
        '&:active': {
          backgroundColor: selected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
      }}
      onClick={(e) => {
        props.applySearchQuery(props.filterTerm)
        props.setShowFilterMenu(false)
        e.preventDefault()
      }}
    >
      {props.text}
    </Box>
  )
}

type LabelButtonProps = {
  label: Label
  searchTerm: string | undefined
  applySearchQuery: (searchTerm: string) => void
}

function LabelButton(props: LabelButtonProps): JSX.Element {
  const labelId = `checkbox-label-${props.label.id}`
  const state = useMemo(() => {
    const term = props.searchTerm ?? ''
    if (term.indexOf(`label:\"${props.label.name}\"`) >= 0) {
      return 'on'
    }
    return 'off'
  }, [props.searchTerm, props.label])

  return (
    <HStack
      css={{
        pl: '10px',
        pt: '2px', // TODO: hack to middle align
        width: '100%',
        height: '30px',
        fontSize: '16px',
        fontWeight: 'regular',
        color: '$thTextSubtle',
        verticalAlign: 'middle',
        borderRadius: '3px',
        cursor: 'pointer',

        m: '0px',
        '&:hover': {
          backgroundColor: '$thBackground4',
        },
      }}
      alignment="center"
      distribution="start"
    >
      <label
        htmlFor={labelId}
        style={{
          width: '100%',
          maxWidth: '170px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        <Circle size={9} color={props.label.color} weight="fill" />
        <SpanBox css={{ pl: '10px' }}>{props.label.name}</SpanBox>
      </label>
      <SpanBox
        css={{
          ml: 'auto',
        }}
      >
        <input
          id={labelId}
          type="checkbox"
          checked={state === 'on'}
          onChange={(e) => {
            if (e.target.checked) {
              props.applySearchQuery(
                `${props.searchTerm ?? ''} label:\"${props.label.name}\"`
              )
            } else {
              const query =
                props.searchTerm?.replace(
                  `label:\"${props.label.name}\"`,
                  ''
                ) ?? ''
              props.applySearchQuery(query)
            }
          }}
        />
      </SpanBox>
    </HStack>
  )
}

type ViewAllButtonProps = {
  state: boolean
  setState: (state: boolean) => void
}

function ViewAllButton(props: ViewAllButtonProps): JSX.Element {
  return (
    <Button
      style="ghost"
      css={{
        display: 'flex',
        pl: '10px',
        color: '#898989',
        fontWeight: '600',
        fontSize: '12px',
        py: '20px',
        gap: '2px',
        alignItems: 'center',
      }}
      onClick={(e) => {
        props.setState(!props.state)
        e.preventDefault()
      }}
    >
      {props.state ? 'Hide' : 'View All'}
      {props.state ? null : (
        <CaretRight size={12} color="#898989" weight="bold" />
      )}
    </Button>
  )
}
