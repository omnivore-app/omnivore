import {
  CSSProperties,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'
import { StyledText } from '../../elements/StyledText'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { DotsThree, List, X, Tag } from '@phosphor-icons/react'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { theme } from '../../tokens/stitches.config'
import { usePersistedState } from '../../../lib/hooks/usePersistedState'
import { NavMenuFooter } from './Footer'
import { FollowingIcon } from '../../elements/icons/FollowingIcon'
import { HomeIcon } from '../../elements/icons/HomeIcon'
import { LibraryIcon } from '../../elements/icons/LibraryIcon'
import { HighlightsIcon } from '../../elements/icons/HighlightsIcon'
import { CoverImage } from '../../elements/CoverImage'
import { NewsletterIcon } from '../../elements/icons/NewsletterIcon'
import { Dropdown, DropdownOption } from '../../elements/DropdownElements'
import { useRouter } from 'next/router'
import { NavigationSection } from '../NavigationLayout'
import { NodeApi, SimpleTree, Tree, TreeApi } from 'react-arborist'
import { ListMagnifyingGlass } from '@phosphor-icons/react'
import React from 'react'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { fetchEndpoint } from '../../../lib/appConfig'
import { requestHeaders } from '../../../lib/networking/networkHelpers'
import { v4 as uuidv4 } from 'uuid'
import { showErrorToast } from '../../../lib/toastHelpers'
import { OpenMap } from 'react-arborist/dist/module/state/open-slice'
import { ArchiveSectionIcon } from '../../elements/icons/ArchiveSectionIcon'
import { NavMoreButtonDownIcon } from '../../elements/icons/NavMoreButtonDown'
import { NavMoreButtonUpIcon } from '../../elements/icons/NavMoreButtonUp'
import { ShortcutFolderClosed } from '../../elements/icons/ShortcutFolderClosed'
import { TrashSectionIcon } from '../../elements/icons/TrashSectionIcon'
import { ShortcutFolderOpen } from '../../elements/icons/ShortcutFolderOpen'

export const LIBRARY_LEFT_MENU_WIDTH = '275px'

export type ShortcutType = 'search' | 'label' | 'newsletter' | 'feed' | 'folder'

export type Shortcut = {
  type: ShortcutType

  id: string
  name: string
  section: string
  filter: string

  icon?: string
  label?: Label

  join?: string
}

type NavigationMenuProps = {
  section: NavigationSection

  setShowAddLinkModal: (show: boolean) => void

  showMenu: boolean
  setShowMenu: (show: boolean) => void
}

export function NavigationMenu(props: NavigationMenuProps): JSX.Element {
  return (
    <>
      <Box
        css={{
          left: '0px',
          top: '0px',
          position: 'fixed',
          height: '100%',
          width: LIBRARY_LEFT_MENU_WIDTH,
          bg: '$thLeftMenuBackground',
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          '@mdDown': {
            width: '100%',
            transition: 'top 100ms, visibility 100ms',
            top: props.showMenu ? '0' : '100%',
            visibility: props.showMenu ? 'visible' : 'hidden',
          },
          zIndex: 10,
        }}
      >
        <Box
          css={{
            width: '100%',
            px: '15px',
            pb: '17px',
            pt: '15px',
            lineHeight: '1',
            '@mdDown': {
              pb: '0px',
              pt: '5px',
              px: '15px',
            },
          }}
        >
          <SpanBox css={{ mr: 'auto', '@mdDown': { display: 'none' } }}>
            <Button
              style="plainIcon"
              onClick={(event) => {
                props.setShowMenu(false)
                event.preventDefault()
              }}
            >
              <List
                size="25"
                color={theme.colors.readerTextSubtle.toString()}
              />
            </Button>
          </SpanBox>

          <Button
            style="plainIcon"
            css={{
              display: 'none',
              '@mdDown': {
                display: 'flex',
                ml: 'auto',
                pt: '10px',
                pb: '0px',
              },
            }}
            onClick={(event) => {
              props.setShowMenu(false)
              event.preventDefault()
            }}
          >
            <X size={30} />
          </Button>
        </Box>
        <LibraryNav {...props} />
        <Shortcuts {...props} />
        <NavMenuFooter {...props} showFullThemeSection={true} />
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

const LibraryNav = (props: NavigationMenuProps): JSX.Element => {
  const [moreFolderSectionOpen, setMoreFolderSectionOpen] =
    usePersistedState<boolean>({
      key: 'nav-more-folder-open',
      isSessionStorage: false,
      initialValue: true,
    })
  return (
    <VStack
      css={{
        m: '0px',
        mt: '10px',
        gap: '5px',
        width: '100%',
        borderBottom: '1px solid $thBorderColor',
        px: '0px',
        pb: '25px',
      }}
      alignment="start"
      distribution="start"
    >
      <NavButton
        {...props}
        text="Home"
        section="home"
        isSelected={props.section == 'home'}
        icon={<HomeIcon color={theme.colors.thHomeIcon.toString()} />}
      />
      <NavButton
        {...props}
        text="Library"
        section="library"
        isSelected={props.section == 'library'}
        icon={<LibraryIcon color={theme.colors.ctaBlue.toString()} />}
      />
      <NavButton
        {...props}
        text="Subscriptions"
        section="subscriptions"
        isSelected={props.section == 'subscriptions'}
        icon={<FollowingIcon color="#F59932" />}
      />
      <NavButton
        {...props}
        text="Highlights"
        section="highlights"
        isSelected={props.section == 'highlights'}
        icon={<HighlightsIcon color={theme.colors.highlight.toString()} />}
      />
      <Button
        style="articleActionIcon"
        css={{
          display: 'flex',
          width: '100%',

          gap: '10px',
          maxWidth: '100%',
          height: '34px',
          px: '15px',

          fontSize: '15px',
          fontWeight: 'regular',
          fontFamily: '$display',

          color: '$thLibraryMenuUnselected',

          '&:hover': {
            opacity: '1',
            color: '$thLibraryMenuUnselected',
            backgroundColor: '$thBackground4',
          },
        }}
        onClick={(event) => {
          setMoreFolderSectionOpen(!moreFolderSectionOpen)
          event.preventDefault()
        }}
      >
        <HStack
          css={{ gap: '10px', width: '100%' }}
          alignment="center"
          distribution="start"
        >
          {moreFolderSectionOpen ? (
            <NavMoreButtonUpIcon
              color={theme.colors.thLibraryMenuPrimary.toString()}
            />
          ) : (
            <NavMoreButtonDownIcon
              color={theme.colors.thLibraryMenuPrimary.toString()}
            />
          )}
          <SpanBox>More</SpanBox>
        </HStack>
      </Button>
      {moreFolderSectionOpen && (
        <SpanBox css={{ width: '100%' }}>
          <NavButton
            {...props}
            text="Archive"
            section="archive"
            isSelected={props.section == 'archive'}
            icon={
              <ArchiveSectionIcon
                color={theme.colors.thLibraryMenuPrimary.toString()}
              />
            }
          />
          <NavButton
            {...props}
            text="Trash"
            section="trash"
            isSelected={props.section == 'trash'}
            icon={
              <TrashSectionIcon
                color={theme.colors.thLibraryMenuPrimary.toString()}
              />
            }
          />
        </SpanBox>
      )}
    </VStack>
  )
}

const Shortcuts = (props: NavigationMenuProps): JSX.Element => {
  const treeRef = useRef<TreeApi<Shortcut> | undefined>(undefined)
  const { trigger: resetShortcutsTrigger } = useSWRMutation(
    '/api/shortcuts',
    resetShortcuts
  )

  const createNewFolder = useCallback(async () => {
    if (treeRef.current) {
      const result = await treeRef.current.create({
        type: 'internal',
        index: 0,
      })
      console.log('create leaf: ', result)
    }
  }, [treeRef])

  const resetShortcutsToDefault = useCallback(async () => {
    resetShortcutsTrigger(null, {
      revalidate: true,
    })
  }, [])

  return (
    <VStack
      css={{
        m: '0px',
        gap: '8px',
        width: '100%',
        px: '0px',
        pb: '25px',
      }}
      alignment="start"
      distribution="start"
    >
      <HStack
        alignment="center"
        distribution="start"
        css={{ width: '100%', pr: '0px' }}
      >
        <StyledText
          css={{
            fontFamily: '$display',
            fontSize: '14px',
            lineHeight: '125%',
            color: '$thLibraryMenuPrimary',
            mb: '10px',
            px: '15px',
          }}
        >
          Shortcuts
        </StyledText>
        <SpanBox css={{ display: 'flex', ml: 'auto', mt: '5px', mr: '15px' }}>
          <Dropdown
            side="bottom"
            triggerElement={<DotsThree size={20} />}
            css={{ ml: 'auto' }}
          >
            <DropdownOption
              onSelect={resetShortcutsToDefault}
              title="Reset to default"
            />
            <DropdownOption
              onSelect={createNewFolder}
              title="Create new folder"
            />
          </Dropdown>
        </SpanBox>
      </HStack>
      <Box
        css={{
          '[role="treeitem"]': {
            outline: 'none',
          },
          '[role="treeitem"]:focus': {
            outline: 'none',
          },
        }}
      >
        <ShortcutsTree treeRef={treeRef} />
      </Box>
    </VStack>
  )
}

type ShortcutsTreeProps = {
  treeRef: React.MutableRefObject<TreeApi<Shortcut> | undefined>
}

async function getShortcuts(path: string): Promise<Shortcut[]> {
  const url = new URL(path, fetchEndpoint)
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: requestHeaders(),
      credentials: 'include',
      mode: 'cors',
    })
    const payload = await response.json()
    if ('shortcuts' in payload) {
      return payload['shortcuts'] as Shortcut[]
    }
    return []
  } catch (err) {
    console.log('error getting shortcuts: ', err)
    throw err
  }
}

async function setShortcuts(
  path: string,
  { arg }: { arg: { shortcuts: Shortcut[] } }
): Promise<Shortcut[]> {
  const url = new URL(path, fetchEndpoint)
  try {
    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...requestHeaders(),
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(arg),
    })
    const payload = await response.json()
    if (!('shortcuts' in payload)) {
      throw new Error('Error syncing shortcuts')
    }
    return payload['shortcuts'] as Shortcut[]
  } catch (err) {
    showErrorToast('Error syncing shortcut changes.')
  }
  return arg.shortcuts
}

async function resetShortcuts(path: string): Promise<Shortcut[]> {
  const url = new URL(path, fetchEndpoint)
  try {
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...requestHeaders(),
      },
      credentials: 'include',
      mode: 'cors',
    })
    const payload = await response.json()
    if (!('shortcuts' in payload)) {
      throw new Error('Error syncing shortcuts')
    }
    return payload['shortcuts'] as Shortcut[]
  } catch (err) {
    showErrorToast('Error syncing shortcut changes.')
  }
  return []
}

const cachedShortcutsData = (): Shortcut[] | undefined => {
  if (typeof localStorage !== 'undefined') {
    const str = localStorage.getItem('/api/shortcuts')
    if (str) {
      return JSON.parse(str) as Shortcut[]
    }
  }
  return undefined
}

const ShortcutsTree = (props: ShortcutsTreeProps): JSX.Element => {
  const router = useRouter()

  const { isValidating, data } = useSWR('/api/shortcuts', getShortcuts, {
    fallbackData: cachedShortcutsData(),
    onSuccess(data) {
      localStorage.setItem('/api/shortcuts', JSON.stringify(data))
    },
  })
  const { trigger, isMutating } = useSWRMutation('/api/shortcuts', setShortcuts)
  const [folderOpenState, setFolderOpenState] = usePersistedState<
    Record<string, boolean>
  >({
    key: 'nav-menu-open-state',
    isSessionStorage: false,
    initialValue: {},
  })
  const tree = useMemo(() => {
    const result = new SimpleTree<Shortcut>((data ?? []) as Shortcut[])
    return result
  }, [data])

  const syncTreeData = (data: Shortcut[]) => {
    trigger(
      { shortcuts: data },
      {
        optimisticData: data,
        rollbackOnError: true,
        populateCache: (updatedShortcuts) => {
          return updatedShortcuts
        },
        revalidate: false,
      }
    )
  }

  const onMove = useCallback(
    (args: { dragIds: string[]; parentId: null | string; index: number }) => {
      for (const id of args.dragIds) {
        tree?.move({ id, parentId: args.parentId, index: args.index })
      }
      syncTreeData(tree.data)
    },
    [tree, data]
  )

  const onCreate = useCallback(
    (args: { parentId: string | null; index: number; type: string }) => {
      const data = { id: uuidv4(), name: '', type: 'folder' } as any
      if (args.type === 'internal') {
        data.children = []
      }
      tree.create({ parentId: args.parentId, index: args.index, data })
      syncTreeData(tree.data)
      return data
    },
    [tree, data]
  )

  const onDelete = useCallback(
    (args: { ids: string[] }) => {
      args.ids.forEach((id) => tree.drop({ id }))
      syncTreeData(tree.data)
    },
    [tree, data]
  )

  const onRename = useCallback(
    (args: { name: string; id: string }) => {
      tree.update({ id: args.id, changes: { name: args.name } as any })
      syncTreeData(tree.data)
    },
    [tree, data]
  )

  const onToggle = useCallback(
    (id: string) => {
      if (id && props.treeRef.current) {
        const isOpen = props.treeRef.current?.isOpen(id)
        const newItem: OpenMap = {}
        newItem[id] = isOpen
        setFolderOpenState({ ...folderOpenState, ...newItem })
      }
    },
    [props, folderOpenState, setFolderOpenState]
  )

  const onActivate = useCallback(
    (node: NodeApi<Shortcut>) => {
      console.log('onActivate: ', node)
      if (node.data.type == 'folder') {
        const join = node.data.join
        if (join == 'or') {
          const query = node.children
            ?.map((child) => {
              return `(${child.data.filter})`
            })
            .join(' OR ')
          console.log('query: ', query)
        }
      } else if (node.data.section != null && node.data.filter != null) {
        router.push(`/l/${node.data.section}?q=${node.data.filter}`)
      }
    },
    [tree, router]
  )

  return (
    <>
      {!isValidating && (
        <Tree
          ref={props.treeRef}
          data={data as Shortcut[]}
          onCreate={onCreate}
          onMove={onMove}
          onDelete={onDelete}
          onRename={onRename}
          onToggle={onToggle}
          onActivate={onActivate}
          rowHeight={36}
          initialOpenState={folderOpenState}
          width={275}
        >
          {NodeRenderer}
        </Tree>
      )}
    </>
  )
}

function NodeRenderer(args: {
  style: CSSProperties
  node: NodeApi<Shortcut>
  tree: TreeApi<Shortcut>
  dragHandle?: (el: HTMLDivElement | null) => void
  preview?: boolean
}) {
  const isSelected = false
  const [menuVisible, setMenuVisible] = useState(false)
  const [menuOpened, setMenuOpened] = useState(false)

  const router = useRouter()

  return (
    <HStack
      ref={args.dragHandle}
      alignment="center"
      distribution="start"
      css={{
        pl: `${15 + args.node.level * 15}px`,
        mb: '2px',
        gap: '10px',
        display: 'flex',
        width: '100%',
        maxWidth: '100%',
        height: '34px',

        backgroundColor: isSelected ? '$thLibrarySelectionColor' : 'unset',
        fontSize: '15px',
        fontWeight: 'regular',
        fontFamily: '$display',
        color: isSelected
          ? '$thLibraryMenuSecondary'
          : '$thLibraryMenuUnselected',
        verticalAlign: 'middle',
        borderRadius: '3px',
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '&:hover': {
          backgroundColor: isSelected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
        '&:active': {
          outline: 'unset',
          backgroundColor: isSelected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
        '&:hover [role="hover-menu"]': {
          opacity: '1',
        },
      }}
      onMouseEnter={() => {
        setMenuVisible(true)
      }}
      onMouseLeave={() => {
        setMenuVisible(false)
      }}
      title={args.node.data.name}
      onClick={(e) => {
        //  router.push(`/` + props.section)
      }}
    >
      <HStack
        css={{
          width: '100%',
          height: '100%',
        }}
        distribution="start"
        alignment="center"
      >
        <NodeItemContents node={args.node} />
        <SpanBox
          role="hover-menu"
          css={{
            display: 'flex',
            ml: 'auto',
            mr: '15px',
            opacity: menuVisible || menuOpened ? '1' : '0',
          }}
        >
          <Dropdown
            side="bottom"
            triggerElement={<DotsThree size={20} />}
            css={{ ml: 'auto' }}
            onOpenChange={(open) => {
              setMenuOpened(open)
            }}
          >
            <DropdownOption
              onSelect={() => {
                args.tree.delete(args.node)
              }}
              title="Remove"
            />
            {/* {args.node.data.type == 'folder' && (
              <DropdownOption
                onSelect={() => {
                  args.node.data.join = 'or'
                }}
                title="Folder query: OR"
              />
            )} */}
          </Dropdown>
        </SpanBox>
      </HStack>
    </HStack>
  )
}

type NodeItemContentsProps = {
  node: NodeApi<Shortcut>
}

const NodeItemContents = (props: NodeItemContentsProps): JSX.Element => {
  if (props.node.isEditing) {
    return (
      <input
        autoFocus
        type="text"
        defaultValue={props.node.data.name}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => props.node.reset()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            props.node.reset()
          }
          if (e.key === 'Enter') {
            // props.node.data = {
            //   id: 'new-folder',
            //   type: 'folder',
            //   name: e.currentTarget.value,
            // }
            props.node.submit(e.currentTarget.value)
            props.node.activate()
          }
        }}
      />
    )
  }
  if (props.node.isLeaf) {
    const shortcut = props.node.data
    if (shortcut) {
      switch (shortcut.type) {
        case 'feed':
        case 'newsletter':
          return (
            <SpanBox>
              <FeedOrNewsletterShortcut shortcut={shortcut} />
            </SpanBox>
          )
        case 'label':
          return (
            <Box>
              <LabelShortcut shortcut={shortcut} />
            </Box>
          )
        case 'search':
          return (
            <Box>
              <SearchShortcut shortcut={shortcut} />
            </Box>
          )
      }
    }
  } else {
    return (
      <HStack
        distribution="start"
        alignment="center"
        css={{ gap: '10px', width: '100%' }}
        onClick={(event) => {
          props.node.toggle()
          event.preventDefault()
        }}
      >
        {props.node.isClosed ? (
          <ShortcutFolderClosed
            color={theme.colors.thLibraryMenuPrimary.toString()}
          />
        ) : (
          <ShortcutFolderOpen
            color={theme.colors.thLibraryMenuPrimary.toString()}
          />
        )}
        {props.node.data.name}
      </HStack>
    )
  }
  return <></>
}

type ShortcutItemProps = {
  shortcut: Shortcut
}

const FeedOrNewsletterShortcut = (props: ShortcutItemProps): JSX.Element => {
  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{ pl: '10px', width: '100%', gap: '10px' }}
      key={`search-${props.shortcut.id}`}
    >
      <HStack
        distribution="start"
        alignment="center"
        css={{ minWidth: '20px' }}
      >
        {props.shortcut.icon ? (
          <CoverImage
            src={props.shortcut.icon}
            width={20}
            height={20}
            css={{ borderRadius: '20px' }}
          />
        ) : props.shortcut.type == 'newsletter' ? (
          <NewsletterIcon color="#F59932" size={18} />
        ) : (
          <FollowingIcon color="#F59932" size={21} />
        )}
      </HStack>
      <StyledText style="settingsItem">{props.shortcut.name}</StyledText>
    </HStack>
  )
}

const SearchShortcut = (props: ShortcutItemProps): JSX.Element => {
  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{ pl: '10px', width: '100%', gap: '7px' }}
      key={`search-${props.shortcut.id}`}
    >
      <HStack
        distribution="start"
        alignment="center"
        css={{ minWidth: '20px' }}
      >
        <ListMagnifyingGlass size={17} />
      </HStack>
      <StyledText style="settingsItem">{props.shortcut.name}</StyledText>
    </HStack>
  )
}

const LabelShortcut = (props: ShortcutItemProps): JSX.Element => {
  // <OutlinedLabelChip
  //   text={props.shortcut.name}
  //   color={props.shortcut.label?.color ?? 'gray'}
  // />
  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{ width: '100%', gap: '7px' }}
      key={`search-${props.shortcut.id}`}
    >
      <Tag
        size={15}
        color={props.shortcut.label?.color ?? 'gray'}
        weight="fill"
      />
      <StyledText style="settingsItem" css={{ pb: '1px' }}>
        {props.shortcut.name}
      </StyledText>
    </HStack>
  )
}

type NavButtonProps = {
  text: string
  icon: ReactNode

  isSelected: boolean
  section: NavigationSection
}

function NavButton(props: NavButtonProps): JSX.Element {
  const router = useRouter()

  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{
        pl: '10px',
        mb: '2px',
        gap: '10px',
        display: 'flex',
        width: '100%',
        maxWidth: '100%',
        height: '34px',
        px: '15px',

        backgroundColor: props.isSelected
          ? '$thLibrarySelectionColor'
          : 'unset',
        fontSize: '15px',
        fontWeight: 'regular',
        fontFamily: '$display',
        color: props.isSelected
          ? '$thLibraryMenuSecondary'
          : '$thLibraryMenuUnselected',
        verticalAlign: 'middle',
        borderRadius: '3px',
        cursor: 'pointer',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        '&:hover': {
          backgroundColor: props.isSelected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
        '&:active': {
          backgroundColor: props.isSelected
            ? '$thLibrarySelectionColor'
            : '$thBackground4',
        },
      }}
      title={props.text}
      onClick={(e) => {
        router.push(`/l/` + props.section)
      }}
    >
      {props.icon}
      {props.text}
    </HStack>
  )
}
