import {
  InputHTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { StyledText } from '../../elements/StyledText'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { SearchIcon } from '../../elements/images/SearchIcon'
import { theme } from '../../tokens/stitches.config'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { FormInput } from '../../elements/FormElements'
import { searchBarCommands } from '../../../lib/keyboardShortcuts/navigationShortcuts'
import { useKeyboardShortcuts } from '../../../lib/keyboardShortcuts/useKeyboardShortcuts'
import { Button, IconButton } from '../../elements/Button'
import {
  Circle,
  DotsThree,
  MagnifyingGlass,
  Plus,
  Textbox,
  X,
} from 'phosphor-react'
import { OmnivoreNameLogo } from '../../elements/images/OmnivoreNameLogo'
import { OmnivoreFullLogo } from '../../elements/images/OmnivoreFullLogo'
import { AvatarDropdown } from '../../elements/AvatarDropdown'
import { ListSelectorIcon } from '../../elements/images/ListSelectorIcon'
import { GridSelectorIcon } from '../../elements/images/GridSelectorIcon'
import { useGetSubscriptionsQuery } from '../../../lib/networking/queries/useGetSubscriptionsQuery'
import { useGetLabelsQuery } from '../../../lib/networking/queries/useGetLabelsQuery'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { Checkbox } from '@radix-ui/react-checkbox'

export function LibraryFilterMenu(): JSX.Element {
  return (
    <>
      <Box
        css={{
          left: '0px',
          top: '105px',
          position: 'fixed',
          bg: 'white',
          width: '233px',
          height: '100%',
          borderRight: '1px solid #E1E1E1',
          pr: '15px',
        }}
      >
        <SavedSearches />
        <Subscriptions />
        <Labels />

        <AddLinkButton />
      </Box>
      {/* This spacer pushes library content to the right of 
      the fixed left side menu. */}
      <Box
        css={{
          width: '233px',
          minWidth: '233px',
          height: '100%',
          bg: '$grayBase',
        }}
      ></Box>
    </>
  )
}

function SavedSearches(): JSX.Element {
  return (
    <MenuPanel title="Saved Searches">
      <FilterButton text="Inbox" selected={true} spaced={true} />
      <FilterButton text="Read Later" selected={false} spaced={true} />
      <FilterButton text="Today" selected={false} spaced={true} />
      <FilterButton text="Archived" selected={false} spaced={true} />
      <Box css={{ height: '10px' }}></Box>
    </MenuPanel>
  )
}

function Subscriptions(): JSX.Element {
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
        return <FilterButton key={item.id} text={item.name} selected={false} />
      })}
      <ViewAllButton state={viewAll} setState={setViewAll} />
    </MenuPanel>
  )
}

function Labels(): JSX.Element {
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
        return <LabelButton key={item.id} label={item} state="off" />
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
        width: '100%',
        borderBottom: '1px solid #E1E1E1',
        pl: '15px',
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
            color: '#1E1E1E',
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
                <DotsThree width={20} weight="bold" color="#BEBEBE" />
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
  spaced?: boolean
  selected: boolean
}

function FilterButton(props: FilterButtonProps): JSX.Element {
  return (
    <Box
      css={{
        pl: '10px',
        pt: '2px', // TODO: hack to middle align
        mb: props.spaced ? '10px' : '0px',
        width: '100%',
        height: '30px',
        backgroundColor: props.selected ? '#FFEA9F' : 'unset',
        fontSize: '16px',
        fontWeight: 'regular',
        color: '#3D3D3D',
        verticalAlign: 'middle',
        borderRadius: '3px',
      }}
    >
      {props.text}
    </Box>
  )
}

type LabelButtonProps = {
  label: Label
  state: 'on' | 'off' | 'unset'
}

function LabelButton(props: LabelButtonProps): JSX.Element {
  return (
    <HStack
      css={{
        pl: '10px',
        pt: '2px', // TODO: hack to middle align
        width: '100%',
        height: '30px',
        fontSize: '16px',
        fontWeight: 'regular',
        color: '#3D3D3D',
        verticalAlign: 'middle',
        borderRadius: '3px',
        m: '0px',
      }}
      alignment="center"
      distribution="start"
    >
      <Circle size={9} color={props.label.color} weight="fill" />
      <SpanBox css={{ pl: '10px' }}>{props.label.name}</SpanBox>
      <SpanBox css={{ ml: 'auto' }}>
        <input type="checkbox" />
      </SpanBox>
    </HStack>
  )
}

function AddLinkButton(): JSX.Element {
  return (
    <VStack
      css={{
        position: 'fixed',
        bottom: '0',
        width: '233px',
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
          color: '#3D3D3D',
          display: 'flex',
          alignItems: 'center',
          fontWeight: '600',
        }}
      >
        <Plus size={16} weight="bold" />
        <SpanBox css={{ width: '10px' }}></SpanBox>Add Link
      </Button>
    </VStack>
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
        pl: '10px',
        color: '#BEBEBE',
        fontWeight: '600',
        fontSize: '12px',
        py: '20px',
      }}
      onClick={(e) => {
        props.setState(!props.state)
        e.preventDefault()
      }}
    >
      {props.state ? 'Hide' : 'View All'}
    </Button>
  )
}
