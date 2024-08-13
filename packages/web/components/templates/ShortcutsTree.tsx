import { useRouter } from 'next/router'
import { NodeApi, SimpleTree, Tree, TreeApi } from 'react-arborist'
import useResizeObserver from 'use-resize-observer'
import {
  Shortcut,
  useGetShortcuts,
  useSetShortcuts,
} from '../../lib/networking/shortcuts/useShortcuts'
import { usePersistedState } from '../../lib/hooks/usePersistedState'
import { CSSProperties, useCallback, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Box, HStack, SpanBox } from '../elements/LayoutPrimitives'
import { Dropdown, DropdownOption } from '../elements/DropdownElements'
import { DotsThree, ListMagnifyingGlass, Tag } from '@phosphor-icons/react'
import { ShortcutFolderClosed } from '../elements/icons/ShortcutFolderClosed'
import { theme } from '../tokens/stitches.config'
import { ShortcutFolderOpen } from '../elements/icons/ShortcutFolderOpen'
import { CoverImage } from '../elements/CoverImage'
import { NewsletterIcon } from '../elements/icons/NewsletterIcon'
import { FollowingIcon } from '../elements/icons/FollowingIcon'
import { StyledText } from '../elements/StyledText'
import { OpenMap } from 'react-arborist/dist/module/state/open-slice'

type ShortcutsTreeProps = {
  treeRef: React.MutableRefObject<TreeApi<Shortcut> | undefined>
}

export const ShortcutsTree = (props: ShortcutsTreeProps): JSX.Element => {
  const router = useRouter()
  const { ref, width, height } = useResizeObserver()
  const { data, isLoading } = useGetShortcuts()
  const setShorcuts = useSetShortcuts()

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

  const syncTreeData = async (data: Shortcut[]) => {
    await setShorcuts.mutateAsync({ shortcuts: data })
  }

  const onMove = useCallback(
    async (args: {
      dragIds: string[]
      parentId: null | string
      index: number
    }) => {
      for (const id of args.dragIds) {
        tree?.move({ id, parentId: args.parentId, index: args.index })
      }
      await syncTreeData(tree.data)
    },
    [tree, data]
  )

  const onCreate = useCallback(
    async (args: { parentId: string | null; index: number; type: string }) => {
      const data = { id: uuidv4(), name: '', type: 'folder' } as any
      if (args.type === 'internal') {
        data.children = []
      }
      tree.create({ parentId: args.parentId, index: args.index, data })
      await syncTreeData(tree.data)
      return data
    },
    [tree, data]
  )

  const onDelete = useCallback(
    async (args: { ids: string[] }) => {
      args.ids.forEach((id) => tree.drop({ id }))
      await syncTreeData(tree.data)
    },
    [tree, data]
  )

  const onRename = useCallback(
    async (args: { name: string; id: string }) => {
      tree.update({ id: args.id, changes: { name: args.name } as any })
      await syncTreeData(tree.data)
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
      if (node.data.type == 'folder') {
        const join = node.data.join
        if (join == 'or') {
          const query = node.children
            ?.map((child) => {
              return `(${child.data.filter})`
            })
            .join(' OR ')
        }
      } else if (node.data.section != null && node.data.filter != null) {
        router.push(`/${node.data.section}?q=${node.data.filter}`)
      }
    },
    [tree, router]
  )

  function countTotalShortcuts(shortcuts: Shortcut[]): number {
    let total = 0

    for (const shortcut of shortcuts) {
      // Count the current shortcut
      total++

      // If the shortcut has children, recursively count them
      if (shortcut.children && shortcut.children.length > 0) {
        total += countTotalShortcuts(shortcut.children)
      }
    }

    return total
  }

  const maximumHeight = useMemo(() => {
    if (!data) {
      return 320
    }
    return countTotalShortcuts(data as Shortcut[]) * 36
  }, [data])

  return (
    <Box
      ref={ref}
      css={{
        height: maximumHeight,
        flexGrow: 1,
        minBlockSize: 0,
      }}
    >
      {!isLoading && (
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
          width={width}
          height={maximumHeight}
        >
          {NodeRenderer}
        </Tree>
      )}
    </Box>
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

  return (
    <HStack
      ref={args.dragHandle}
      alignment="center"
      distribution="start"
      css={{
        pl: `${20 + args.node.level * 15}px`,
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
