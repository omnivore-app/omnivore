import {
  Dispatch,
  MouseEventHandler,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { Button } from '../../components/elements/Button'
import { styled, theme } from '../../components/tokens/stitches.config'
import {
  Box,
  SpanBox,
  HStack,
  VStack,
} from '../../components/elements/LayoutPrimitives'
import { Toaster } from 'react-hot-toast'
import { applyStoredTheme, isDarkTheme } from '../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { StyledText } from '../../components/elements/StyledText'
import {
  DotsThree,
  PencilSimple,
  Trash,
  Plus,
  ArrowsDownUp,
} from '@phosphor-icons/react'
import {
  Dropdown,
  DropdownOption,
} from '../../components/elements/DropdownElements'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { InfoLink } from '../../components/elements/InfoLink'
import { useGetSavedSearchQuery } from '../../lib/networking/queries/useGetSavedSearchQuery'
import { SavedSearch } from '../../lib/networking/fragments/savedSearchFragment'
import CheckboxComponent from '../../components/elements/Checkbox'
import { updateFilterMutation } from '../../lib/networking/mutations/updateFilterMutation'
import { saveFilterMutation } from '../../lib/networking/mutations/saveFilterMutation'
import { inRange } from 'lodash'
import { deleteFilterMutation } from '../../lib/networking/mutations/deleteFilterMutation'

const HeaderWrapper = styled(Box, {
  width: '100%',
})

const TableCard = styled(Box, {
  padding: '0px',
  backgroundColor: '$grayBg',
  display: 'flex',
  alignItems: 'center',
  border: '0.3px solid $grayBgActive',
  width: '100%',
  '@md': {
    paddingLeft: '0',
  },
})

const TableCardBox = styled(Box, {
  display: 'grid',
  width: '100%',
  gridGap: '$1',
  gridTemplateColumns: '3fr 1fr',
  '.showHidden': {
    display: 'none',
  },
  '&:hover': {
    '.showHidden': {
      display: 'unset',
      gridColumn: 'span 2',
      width: '100%',
      padding: '$2 $3 0 $3',
    },
  },
  '@md': {
    gridTemplateColumns: '20% 15% 1fr 1fr 1fr',
    '&:hover': {
      '.showHidden': {
        display: 'none',
      },
    },
  },
})

const inputStyles = {
  height: '35px',
  backgroundColor: 'transparent',
  color: '$grayTextContrast',
  padding: '6px 6px',
  margin: '$2 0',
  border: '1px solid $grayBorder',
  borderRadius: '6px',
  fontSize: '16px',
  FontFamily: '$fontFamily',
  width: '100%',
  '@md': {
    width: 'auto',
    minWidth: '180px',
  },
  '&[disabled]': {
    border: 'none',
  },
  '&:focus': {
    outlineColor: '$omnivoreYellow',
    outlineStyle: 'solid',
  },
}

const ActionsWrapper = styled(Box, {
  mr: '$1',
  display: 'flex',
  width: 40,
  height: 40,
  alignItems: 'center',
  bg: 'transparent',
  cursor: 'pointer',
  fontFamily: 'inter',
  fontSize: '$2',
  lineHeight: '1.25',
  color: '$grayText',
  '&:hover': {
    opacity: 0.8,
  },
})

const IconButton = styled(Button, {
  variants: {
    style: {
      ctaWhite: {
        color: 'red',
        padding: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid $grayBorder',
        boxSizing: 'border-box',
        borderRadius: 6,
        width: 40,
        height: 40,
      },
    },
  },
})

const TOP_SETTINGS_PANEL = 147
const HEIGHT_SETTING_CARD = 56

const Input = styled('input', { ...inputStyles })

const TextArea = styled('textarea', { ...inputStyles })

export default function SavedSearchesPage(): JSX.Element {
  const { savedSearches, isLoading } = useGetSavedSearchQuery()
  const [nameInputText, setNameInputText] = useState<string>('')
  const [queryInputText, setQueryInputText] = useState<string>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false)
  const [windowWidth, setWindowWidth] = useState<number>(0)
  const [confirmRemoveSavedSearchId, setConfirmRemoveSavedSearchId] = useState<
    string | null
  >(null)
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null)
  const [draggedElementPosition, setDraggedElementPosition] = useState<{
    x: number
    y: number
  } | null>(null)
  const [sortedSavedSearch, setSortedSavedSearch] = useState<SavedSearch[]>([])

  // Some theming stuff here.
  const breakpoint = 768
  applyStoredTheme()

  useEffect(() => {
    setSortedSavedSearch(
      [...(savedSearches ?? [])].sort((l, r) => l.position - r.position)
    )
  }, [isLoading])

  useEffect(() => {
    const handleResizeWindow = () => setWindowWidth(window.innerWidth)
    if (windowWidth === 0) {
      setWindowWidth(window.innerWidth)
    }
    window.addEventListener('resize', handleResizeWindow)
    return () => {
      window.removeEventListener('resize', handleResizeWindow)
    }
  }, [windowWidth])

  const resetSavedSearchState = () => {
    setIsCreateMode(false)
    setNameInputText('')
    setQueryInputText('')
    setEditingId(null)
  }

  async function createSavedSearch(): Promise<void> {
    try {
      const savedFilter = await saveFilterMutation({
        name: nameInputText,
        filter: queryInputText,
        category: 'Search',
        position: sortedSavedSearch?.length ?? 0,
      })
      showSuccessToast(`Added Filter: ${nameInputText}`)

      if (savedFilter) {
        setSortedSavedSearch([...sortedSavedSearch, savedFilter])
      }
      resetSavedSearchState()
    } catch (e) {
      showErrorToast('Unable to create filter. Unknown error occurred.')
    }
  }

  async function updateSavedSearch(id: string): Promise<void> {
    resetSavedSearchState()

    const changedSortedSearch = sortedSavedSearch?.find((it) => it.id == id)
    if (changedSortedSearch != undefined) {
      changedSortedSearch.name = nameInputText
      changedSortedSearch.filter = queryInputText
      setSortedSavedSearch(sortedSavedSearch)
      await updateFilterMutation({
        id,
        name: nameInputText,
        filter: queryInputText,
      })
    }
  }

  const onEditPress = (savedSearch: SavedSearch | null) => {
    if (savedSearch) {
      setNameInputText(savedSearch.name)
      setQueryInputText(savedSearch.filter || '')
      setEditingId(savedSearch.id)
    } else {
      resetSavedSearchState()
    }
  }

  async function onDeleteSavedSearch(id: string): Promise<void> {
    const currentElement = sortedSavedSearch?.find((it) => it.id == id)
    if (currentElement) {
      await deleteFilterMutation(id)

      setSortedSavedSearch(
        sortedSavedSearch
          .filter((it) => it.id !== id)
          .map((it) => {
            return {
              ...it,
              position:
                currentElement.position > it.position
                  ? it.position
                  : it.position - 1,
            }
          })
      )
    }

    return
  }

  async function deleteSavedSearch(id: string): Promise<void> {
    setConfirmRemoveSavedSearchId(id)
  }

  async function updatePositionOnMouseUp(
    y: number
  ): Promise<string | undefined> {
    const currentElement = sortedSavedSearch?.find(
      ({ id }) => id == draggedElementId
    )
    if (currentElement) {
      const idx = Math.floor(
        (y + window.scrollY - 25 - TOP_SETTINGS_PANEL) / HEIGHT_SETTING_CARD
      )
      const correctedIdx = Math.min(
        Math.max(idx, 0),
        sortedSavedSearch?.length - 1
      )
      const moveUp = correctedIdx < currentElement.position

      if (correctedIdx != currentElement.position) {
        const newlyOrdered = sortedSavedSearch
          ?.map((search) => {
            let pos = search.position
            if (
              inRange(
                pos,
                Math.min(correctedIdx, currentElement.position),
                Math.max(correctedIdx, currentElement.position)
              ) ||
              search.position == correctedIdx
            ) {
              pos = search.position + (moveUp ? +1 : -1)
            }
            if (draggedElementId == search?.id) {
              pos = correctedIdx
            }
            return {
              ...search,
              position: pos,
            }
          })
          ?.sort((l, r) => l.position - r.position)
        setSortedSavedSearch(newlyOrdered)
        return updateFilterMutation({
          ...currentElement,
          position: correctedIdx,
        })
      }
    }

    return
  }

  return (
    <SettingsLayout>
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <HStack css={{ width: '100%', height: '100%' }}>
        <VStack
          css={{
            mx: '10px',
            color: '$grayText',
            width: '100%',
            maxWidth: '865px',
          }}
        >
          {confirmRemoveSavedSearchId ? (
            <ConfirmationModal
              message={'Are you sure?'}
              onAccept={async () => {
                await onDeleteSavedSearch(confirmRemoveSavedSearchId)
                setConfirmRemoveSavedSearchId(null)
              }}
              onOpenChange={() => setConfirmRemoveSavedSearchId(null)}
            />
          ) : null}
          <HeaderWrapper>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box>
                <StyledText style="fixedHeadline">Saved Searches </StyledText>
              </Box>
              <InfoLink href="https://docs.omnivore.app/using/search.html" />
              <Box
                css={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginLeft: 'auto',
                }}
              >
                {isCreateMode ? null : (
                  <>
                    <Button
                      onClick={() => {
                        resetSavedSearchState()
                        setIsCreateMode(true)
                      }}
                      style="ctaDarkYellow"
                      css={{
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: 'auto',
                      }}
                    >
                      <SpanBox
                        css={{
                          display: 'none',
                          '@md': {
                            display: 'flex',
                          },
                        }}
                      >
                        <SpanBox>Add Saved Search</SpanBox>
                      </SpanBox>
                      <SpanBox
                        css={{
                          p: '0',
                          display: 'flex',
                          '@md': {
                            display: 'none',
                          },
                        }}
                      >
                        <Plus size={24} />
                      </SpanBox>
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </HeaderWrapper>
          <>
            {isCreateMode ? (
              windowWidth > breakpoint ? (
                <DesktopEditCard
                  savedSearch={null}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  isCreateMode={isCreateMode}
                  deleteSavedSearch={deleteSavedSearch}
                  nameInputText={nameInputText}
                  queryInputText={queryInputText}
                  setNameInputText={setNameInputText}
                  setQueryInputText={setQueryInputText}
                  setIsCreateMode={setIsCreateMode}
                  createSavedSearch={createSavedSearch}
                  updateSavedSearch={updateSavedSearch}
                  onEditPress={onEditPress}
                  resetState={resetSavedSearchState}
                  draggedElementId={draggedElementId}
                  setDraggedElementId={setDraggedElementId}
                  setDraggedElementPosition={setDraggedElementPosition}
                />
              ) : (
                <MobileEditCard
                  savedSearch={null}
                  editingId={editingId}
                  setEditingId={setEditingId}
                  isCreateMode={isCreateMode}
                  deleteSavedSearch={deleteSavedSearch}
                  nameInputText={nameInputText}
                  queryInputText={queryInputText}
                  setNameInputText={setNameInputText}
                  setQueryInputText={setQueryInputText}
                  setIsCreateMode={setIsCreateMode}
                  createSavedSearch={createSavedSearch}
                  updateSavedSearch={updateSavedSearch}
                  onEditPress={onEditPress}
                  resetState={resetSavedSearchState}
                  draggedElementId={draggedElementId}
                  setDraggedElementId={setDraggedElementId}
                  setDraggedElementPosition={setDraggedElementPosition}
                />
              )
            ) : null}
          </>
          {sortedSavedSearch
            ? sortedSavedSearch.map((savedSearch, i) => {
                const isLastChild = i === sortedSavedSearch.length - 1
                const isFirstChild = i === 0
                const positionY =
                  TOP_SETTINGS_PANEL + HEIGHT_SETTING_CARD * (i + 1)
                const cardProps = {
                  savedSearch,
                  editingId,
                  isCreateMode: isCreateMode,
                  isLastChild: isLastChild,
                  isFirstChild: isFirstChild,
                  setEditingId,
                  nameInputText: nameInputText,
                  queryInputText: queryInputText,
                  setNameInputText: setNameInputText,
                  setQueryInputText: setQueryInputText,
                  setIsCreateMode: setIsCreateMode,
                  resetState: resetSavedSearchState,
                  updateSavedSearch,
                  deleteSavedSearch,
                  createSavedSearch,
                  draggedElementId,
                  setDraggedElementId,
                  onEditPress,
                  setDraggedElementPosition,
                  isSwappedCard:
                    (draggedElementPosition &&
                      draggedElementId != savedSearch.id &&
                      draggedElementPosition.y +
                        window.scrollY +
                        HEIGHT_SETTING_CARD >
                        positionY &&
                      draggedElementPosition?.y +
                        window.scrollY +
                        HEIGHT_SETTING_CARD <
                        positionY + HEIGHT_SETTING_CARD) ||
                    undefined,
                  updatePositionOnMouseUp,
                }
                if (editingId == savedSearch.id) {
                  if (windowWidth >= breakpoint) {
                    return (
                      <DesktopEditCard
                        key={`edit-${savedSearch.id}`}
                        {...cardProps}
                      />
                    )
                  } else {
                    return (
                      <MobileEditCard
                        key={`edit-${savedSearch.id}`}
                        {...cardProps}
                      />
                    )
                  }
                }

                return (
                  <GenericTableCard
                    key={savedSearch.id}
                    {...cardProps}
                    onEditPress={onEditPress}
                  />
                )
              })
            : null}
        </VStack>
      </HStack>
      <Box css={{ height: '120px' }} />
    </SettingsLayout>
  )
}

type EditCardProps = {
  savedSearch: SavedSearch | null
  editingId: string | null
  nameInputText: string
  queryInputText: string
  setQueryInputText: Dispatch<SetStateAction<string>>
  isCreateMode: boolean
  setIsCreateMode: Dispatch<SetStateAction<boolean>>
  setEditingId: Dispatch<SetStateAction<string | null>>
  setNameInputText: Dispatch<SetStateAction<string>>
  createSavedSearch: () => Promise<void>
  updateSavedSearch: (id: string) => Promise<void>
  deleteSavedSearch: (id: string) => Promise<void>
  resetState: () => void
  onEditPress: (savedSearch: SavedSearch | null) => void
  isFirstChild?: boolean | undefined
  isLastChild?: boolean | undefined
  draggedElementId: string | null
  setDraggedElementId: Dispatch<SetStateAction<string | null>>
  setDraggedElementPosition: Dispatch<
    SetStateAction<{ x: number; y: number } | null>
  >
  isSwappedCard?: boolean
  updatePositionOnMouseUp?: (y: number) => Promise<string | undefined>
}

function GenericTableCard(
  props: EditCardProps & {
    isLastChild?: boolean
    isFirstChild?: boolean
  }
) {
  const {
    savedSearch,
    isLastChild,
    isFirstChild,
    editingId,
    isCreateMode,
    nameInputText,
    queryInputText,
    setQueryInputText,
    setEditingId,
    deleteSavedSearch,
    setNameInputText,
    createSavedSearch,
    updateSavedSearch,
    onEditPress,
    resetState,
    draggedElementId,
    setDraggedElementId,
    setDraggedElementPosition,
    isSwappedCard,
    updatePositionOnMouseUp,
  } = props
  const [isVisible, setIsVisible] = useState(!!savedSearch?.visible)
  const showInput =
    editingId === savedSearch?.id || (isCreateMode && !savedSearch)
  const iconColor = isDarkTheme() ? '#D8D7D5' : '#5F5E58'
  const DEFAULT_STYLE = { position: null }
  const [style, setStyle] = useState<
    Partial<{
      position: string | null
      top: string
      left: string
      maxWidth: string
    }>
  >(DEFAULT_STYLE)
  const handleEdit = () => {
    editingId && updateSavedSearch(editingId)
    setEditingId(null)
  }
  const moreActionsButton = () => {
    return (
      <ActionsWrapper>
        <Dropdown
          disabled={isCreateMode}
          triggerElement={<DotsThree size={'100%'} color={iconColor} />}
        >
          <DropdownOption onSelect={() => null}>
            <Button
              style="plainIcon"
              css={{
                mr: '0px',
                display: isCreateMode ? 'none' : 'flex',
                alignItems: 'center',
                backgroundColor: 'transparent',
                border: 0,
              }}
              onClick={() => onEditPress(savedSearch)}
              disabled={isCreateMode}
            >
              <PencilSimple size={24} color={'black'} />
              <StyledText
                color="$grayText"
                css={{ m: '0px', fontSize: '$5', marginLeft: '$2' }}
              >
                Edit
              </StyledText>
            </Button>
          </DropdownOption>
          <DropdownOption onSelect={() => null}>
            <Button
              style="plainIcon"
              css={{
                mr: '$1',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'transparent',
                border: 0,
              }}
              onClick={() =>
                savedSearch ? deleteSavedSearch(savedSearch.id) : null
              }
              disabled={isCreateMode}
            >
              <Trash size={24} color="#AA2D11" />
              <StyledText
                css={{
                  m: '0px',
                  fontSize: '$5',
                  marginLeft: '$2',
                  color: '#AA2D11',
                }}
              >
                Delete
              </StyledText>
            </Button>
          </DropdownOption>
        </Dropdown>
      </ActionsWrapper>
    )
  }

  const onMouseDown = (e: MouseEvent) => {
    if (savedSearch) {
      setDraggedElementId(savedSearch.id)
      setDraggedElementPosition({ y: e.clientY - 25, x: e.clientX - 25 })
    }
  }

  const onMouseUp = async (e: MouseEvent) => {
    if (
      draggedElementId != null &&
      draggedElementId == savedSearch?.id &&
      updatePositionOnMouseUp
    ) {
      const updatePosition = updatePositionOnMouseUp(e.clientY)
      setDraggedElementId(null)
      setStyle(DEFAULT_STYLE)
      setDraggedElementPosition(null)
      await updatePosition
    }
  }

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (draggedElementId != null && draggedElementId == savedSearch?.id) {
        setStyle({
          position: 'absolute',
          top: `${e.clientY - 25 + window.scrollY}px`,
          left: `${e.clientX - 25 + window.scrollX}px`,
          maxWidth: '865px',
        })
        setDraggedElementPosition({ y: e.clientY - 25, x: e.clientX - 25 })
      }
    },
    [draggedElementId, savedSearch, setDraggedElementPosition]
  )

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [draggedElementId, onMouseMove])

  const setVisibility = async () => {
    await updateFilterMutation({ ...savedSearch, visible: !isVisible })
    setIsVisible(!isVisible)
  }

  return (
    <TableCard
      className={'tableCard'}
      css={
        {
          ...style,
          '&:hover': {
            background: 'rgba(255, 234, 159, 0.12)',
          },
          borderTop: isSwappedCard
            ? `56px solid ${theme.colors.thBackground}`
            : undefined,
          borderTopLeftRadius: isFirstChild ? '5px' : '',
          borderTopRightRadius: isFirstChild ? '5px' : '',
          borderBottomLeftRadius: isLastChild ? '5px' : '',
          borderBottomRightRadius: isLastChild ? '5px' : '',
        } as never
      }
    >
      <TableCardBox
        onMouseUp={onMouseUp as unknown as MouseEventHandler}
        css={{
          display: 'grid',
          width: '100%',
          gridGap: '$1',
          gridTemplateColumns: '1fr 1fr 17fr 2fr',
          height: editingId == savedSearch?.id ? '120px' : '56px',
          '.showHidden': {
            display: 'none',
          },
          '&:hover': {
            '.showHidden': {
              display: 'unset',
              gridColumn: 'span 2',
              width: '100%',
              padding: '$2 $3 0 $3',
            },
          },
          '@md': {
            height: '56px',
            gridTemplateColumns: '4% 3% 20% 28% 1fr 1fr',
          },
        }}
      >
        <HStack
          distribution="start"
          alignment="center"
          css={{
            padding: '0 5px',
          }}
        >
          <ArrowsDownUp
            size={28}
            style={{ cursor: 'grab' }}
            onMouseDown={onMouseDown as unknown as MouseEventHandler}
          />
        </HStack>
        <HStack
          distribution="start"
          alignment="center"
          css={{
            padding: '0 5px',
          }}
        >
          <CheckboxComponent checked={isVisible} setChecked={setVisibility} />
        </HStack>
        <HStack
          distribution="start"
          alignment="center"
          css={{
            padding: '0 5px',
          }}
        >
          {showInput && !savedSearch ? (
            <SpanBox
              css={{
                '@smDown': {
                  display: 'none',
                },
              }}
            >
              <Input
                type="text"
                value={nameInputText}
                onChange={(event) => setNameInputText(event.target.value)}
                required
                autoFocus
              />
            </SpanBox>
          ) : (
            <StyledText
              style="body"
              css={{
                color: '$grayTextContrast',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                paddingLeft: '15px',
              }}
            >
              {editingId === savedSearch?.id
                ? nameInputText
                : savedSearch?.name || ''}
            </StyledText>
          )}
        </HStack>

        <HStack
          distribution="start"
          alignment="center"
          css={{
            display: 'none',
            '@md': {
              display: 'flex',
            },
          }}
        >
          {showInput ? (
            <Input
              type="text"
              placeholder="Query (e.g. in:inbox)"
              value={queryInputText}
              onChange={(event) => setQueryInputText(event.target.value)}
              autoFocus={!!savedSearch}
            />
          ) : (
            <StyledText
              style="body"
              css={{
                color: '$grayTextContrast',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {editingId === savedSearch?.id
                ? queryInputText
                : savedSearch?.filter || ''}
            </StyledText>
          )}
        </HStack>

        {!savedSearch?.defaultFilter && (
          <HStack
            distribution="start"
            css={{
              padding: '4px 8px',
              paddingLeft: '10px',
              alignItems: 'center',
            }}
          >
            {!showInput && (
              <Box css={{ marginLeft: 'auto', '@md': { display: 'none' } }}>
                {moreActionsButton()}
              </Box>
            )}
          </HStack>
        )}

        <HStack
          distribution="end"
          alignment="center"
          css={{
            padding: '0px 8px',
            display: 'flex',
            '@sm': {
              display: 'none',
            },
            '@md': {
              display: 'flex',
            },
          }}
        >
          {editingId === savedSearch?.id || !savedSearch ? (
            <>
              <Button
                style="plainIcon"
                css={{ mr: '$1' }}
                onClick={() => {
                  resetState()
                }}
              >
                Cancel
              </Button>
              <Button
                style="ctaDarkYellow"
                css={{ my: '0px', mr: '$1' }}
                disabled={!nameInputText && !queryInputText}
                onClick={() =>
                  savedSearch ? handleEdit() : createSavedSearch()
                }
              >
                Saved
              </Button>
            </>
          ) : (
            <HStack
              distribution="end"
              alignment="end"
              css={{
                display: 'none',
                '@md': {
                  display: 'flex',
                  width: '100%',
                },
              }}
            >
              <IconButton
                style="ctaWhite"
                css={{
                  mr: '$1',
                  background: '$labelButtonsBg',
                  display: savedSearch?.defaultFilter ? 'none' : 'block',
                }}
                onClick={() => onEditPress(savedSearch)}
                disabled={isCreateMode}
              >
                <PencilSimple size={16} color={iconColor} />
              </IconButton>
              <IconButton
                style="ctaWhite"
                css={{
                  mr: '$1',
                  background: '$labelButtonsBg',
                  display: savedSearch?.defaultFilter ? 'none' : 'block',
                }}
                onClick={() => deleteSavedSearch(savedSearch.id)}
                disabled={isCreateMode || savedSearch?.defaultFilter}
              >
                <Trash size={16} color={iconColor} />
              </IconButton>
            </HStack>
          )}
        </HStack>
      </TableCardBox>
    </TableCard>
  )
}
function MobileEditCard(props: EditCardProps) {
  const {
    savedSearch,
    editingId,
    setEditingId,
    nameInputText,
    setNameInputText,
    queryInputText,
    setQueryInputText,
    createSavedSearch,
    updateSavedSearch,
    resetState,
    isFirstChild,
    isLastChild,
  } = props

  const handleEdit = () => {
    editingId && updateSavedSearch(editingId)
    setEditingId(null)
  }

  return (
    <TableCard
      css={{
        borderTopLeftRadius: isFirstChild ? '5px' : '',
        borderTopRightRadius: isFirstChild ? '5px' : '',
        borderBottomLeftRadius: isLastChild ? '5px' : '',
        borderBottomRightRadius: isLastChild ? '5px' : '',
      }}
    >
      <VStack distribution="center" css={{ width: '100%', margin: '8px' }}>
        <Input
          type="text"
          value={nameInputText}
          onChange={(event) => setNameInputText(event.target.value)}
          autoFocus
        />

        <TextArea
          placeholder="Query (e.g. in:inbox)"
          value={queryInputText}
          onChange={(event) => setQueryInputText(event.target.value)}
          rows={5}
        />
        <HStack
          distribution="end"
          alignment="center"
          css={{ width: '100%', margin: '$1 0' }}
        >
          <Button
            style="plainIcon"
            css={{ mr: '$1' }}
            onClick={() => {
              resetState()
            }}
          >
            Cancel
          </Button>
          <Button
            style="ctaDarkYellow"
            css={{ mr: '$1' }}
            disabled={!nameInputText && !queryInputText}
            onClick={() => (savedSearch ? handleEdit() : createSavedSearch())}
          >
            Save
          </Button>
        </HStack>
      </VStack>
    </TableCard>
  )
}

function DesktopEditCard(props: EditCardProps) {
  const {
    savedSearch,
    editingId,
    setEditingId,
    nameInputText,
    setNameInputText,
    queryInputText,
    setQueryInputText,
    createSavedSearch,
    resetState,
    updateSavedSearch,
    isFirstChild,
    isLastChild,
  } = props

  const handleEdit = () => {
    editingId && updateSavedSearch(editingId)
    setEditingId(null)
  }

  return (
    <TableCard
      css={{
        width: '100%',
        borderTopLeftRadius: isFirstChild ? '5px' : '',
        borderTopRightRadius: isFirstChild ? '5px' : '',
        borderBottomLeftRadius: isLastChild ? '5px' : '',
        borderBottomRightRadius: isLastChild ? '5px' : '',
      }}
    >
      <VStack
        distribution="center"
        css={{ width: '100%', my: '8px', ml: '8px', mr: '0px' }}
      >
        <HStack
          distribution="start"
          alignment="center"
          css={{ pt: '6px', px: '13px', width: '100%', gap: '16px' }}
        >
          <Input
            type="text"
            placeholder="Name"
            value={nameInputText}
            onChange={(event) => setNameInputText(event.target.value)}
            autoFocus
          />

          <Input
            type="text"
            placeholder="Query (e.g. in:inbox)"
            value={queryInputText}
            onChange={(event) => setQueryInputText(event.target.value)}
          />
          <HStack
            distribution="end"
            alignment="center"
            css={{ marginLeft: 'auto', width: '100% ' }}
          >
            <Button
              style="ctaOutlineYellow"
              css={{ mr: '12px' }}
              onClick={() => {
                resetState()
              }}
            >
              Cancel
            </Button>
            <Button
              style="ctaDarkYellow"
              css={{}}
              disabled={!nameInputText && !queryInputText}
              onClick={() => (savedSearch ? handleEdit() : createSavedSearch())}
            >
              Save
            </Button>
          </HStack>
        </HStack>
      </VStack>
    </TableCard>
  )
}
