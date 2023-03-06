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
import { MOBILE_HEADER_HEIGHT } from './HeaderSpacer'

export const LIBRARY_LEFT_MENU_WIDTH = '300px'

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
          top: '105px',
          position: 'fixed',
          bg: '$thBackground',
          height: '100%',
          width: LIBRARY_LEFT_MENU_WIDTH,
          borderRight: '1px solid $thBorderColor',
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '@mdDown': {
            visibility: props.showFilterMenu ? 'visible' : 'hidden',
            top: props.showFilterMenu ? MOBILE_HEADER_HEIGHT : '100%',
            width: '100%',
            transition: 'visibility 0s, top 150ms',
          },
        }}
      >
        <SavedSearches {...props} />
        <Subscriptions {...props} />
        <Labels {...props} />

        <AddLinkButton
          showAddLinkModal={() => props.setShowAddLinkModal(true)}
        />
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
  return (
    <MenuPanel title="Saved Searches">
      <FilterButton text="Inbox" filterTerm="in:inbox" {...props} />
      <FilterButton
        text="Read Later"
        filterTerm="in:inbox -label:Newsletter"
        {...props}
      />
      <FilterButton text="Highlights" filterTerm="type:highlights" {...props} />
      <FilterButton text="Unlabeled" filterTerm="no:label" {...props} />
      <FilterButton text="Files" filterTerm="type:file" {...props} />
      <FilterButton text="Archived" filterTerm="in:archive" {...props} />
      <Box css={{ height: '10px' }}></Box>
    </MenuPanel>
  )
}

function Subscriptions(props: LibraryFilterMenuProps): JSX.Element {
  const { subscriptions } = useGetSubscriptionsQuery()
  const [viewAll, setViewAll] = useState(false)

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
}

function MenuPanel(props: MenuPanelProps): JSX.Element {
  return (
    <VStack
      css={{
        m: '0px',
        width: '100%',
        borderBottom: '1px solid $thBorderColor',
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
            color: '$thTextContrast',
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
        backgroundColor: selected ? '#FFEA9F' : 'unset',
        fontSize: '14px',
        fontWeight: 'regular',
        fontFamily: '$display',
        color: selected ? '#3D3D3D' : '$thTextSubtle',
        verticalAlign: 'middle',
        borderRadius: '3px',
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        alignItems: 'center',
        '&:hover': {
          backgroundColor: selected ? '#FFEA9F' : '$thBackground4',
        },
        '&:active': {
          backgroundColor: selected ? '#FFEA9F' : '$thBackground4',
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
      console.log('returning true for: ', term)
      return 'on'
    }
    console.log('returning off for: ', term)
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
        m: '0px',
        '&:hover': {
          backgroundColor: '$thBackground4',
        },
      }}
      alignment="center"
      distribution="start"
    >
      <label htmlFor={labelId} style={{ width: '100%' }}>
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
            console.log('changing check state')
            if (e.target.checked) {
              props.applySearchQuery
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

type AddLinkButtonProps = {
  showAddLinkModal: () => void
}

function AddLinkButton(props: AddLinkButtonProps): JSX.Element {
  const currentTheme = currentThemeName()
  const isDark = currentTheme == 'Dark'

  return (
    <>
      <VStack
        css={{
          marginTop: 'auto',
          width: LIBRARY_LEFT_MENU_WIDTH,
          height: '80px',
          pl: '25px',
        }}
        distribution="center"
      >
        <Button
          css={{
            height: '40px',
            p: '15px',
            pr: '20px',
            fontSize: '14px',
            verticalAlign: 'center',
            color: isDark
              ? theme.colors.thHighContrast.toString()
              : theme.colors.thTextContrast2.toString(),
            display: 'flex',
            alignItems: 'center',
            fontWeight: '600',
            bg: isDark ? 'transparent' : theme.colors.thBackground2.toString(),
            border: `1px solid ${
              isDark ? theme.colors.thHighContrast.toString() : 'transparent'
            }`,
          }}
          onClick={(e) => {
            props.showAddLinkModal()
            e.preventDefault()
          }}
        >
          <Plus size={16} weight="bold" />
          <SpanBox css={{ width: '10px' }}></SpanBox>Add Link
        </Button>
      </VStack>
      <Box css={{ height: '180px ' }} />
    </>
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
