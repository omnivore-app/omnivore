import { useEffect, useMemo, useState } from 'react'
import { SettingsLayout } from '../../components/templates/SettingsLayout'
import { Button } from '../../components/elements/Button'
import { styled } from '../../components/tokens/stitches.config'
import {
  Box,
  SpanBox,
  HStack,
  VStack,
} from '../../components/elements/LayoutPrimitives'
import { Toaster } from 'react-hot-toast'
import { useGetLabelsQuery } from '../../lib/networking/queries/useGetLabelsQuery'
import { createLabelMutation } from '../../lib/networking/mutations/createLabelMutation'
import { updateLabelMutation } from '../../lib/networking/mutations/updateLabelMutation'
import { deleteLabelMutation } from '../../lib/networking/mutations/deleteLabelMutation'
import { applyStoredTheme, isDarkTheme } from '../../lib/themeUpdater'
import { showErrorToast, showSuccessToast } from '../../lib/toastHelpers'
import { Label, LabelColor } from '../../lib/networking/fragments/labelFragment'
import { StyledText } from '../../components/elements/StyledText'
import {
  ArrowClockwise,
  DotsThree,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react'
import { GenericTableCardProps } from '../../utils/settings-page/labels/types'
import { labelColorObjects } from '../../utils/settings-page/labels/labelColorObjects'
import { LabelColorDropdown } from '../../components/elements/LabelColorDropdown'
import {
  Dropdown,
  DropdownOption,
} from '../../components/elements/DropdownElements'
import { LabelChip } from '../../components/elements/LabelChip'
import { ConfirmationModal } from '../../components/patterns/ConfirmationModal'
import { InfoLink } from '../../components/elements/InfoLink'
import { usePersistedState } from '../../lib/hooks/usePersistedState'
import { FeatureHelpBox } from '../../components/elements/FeatureHelpBox'

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

const Input = styled('input', { ...inputStyles })

const TextArea = styled('textarea', { ...inputStyles })

export default function LabelsPage(): JSX.Element {
  const { labels, revalidate } = useGetLabelsQuery()
  const [labelColorHex, setLabelColorHex] = useState('#000000')
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [nameInputText, setNameInputText] = useState<string>('')
  const [descriptionInputText, setDescriptionInputText] = useState<string>('')
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false)
  const [windowWidth, setWindowWidth] = useState<number>(0)
  const [confirmRemoveLabelId, setConfirmRemoveLabelId] = useState<
    string | null
  >(null)
  const [showLabelPageHelp, setShowLabelPageHelp] = usePersistedState<boolean>({
    key: `--settings-labels-show-help`,
    initialValue: true,
  })
  const breakpoint = 768

  applyStoredTheme()

  const sortedLabels = useMemo(() => {
    return labels.sort((left: Label, right: Label) =>
      left.name.localeCompare(right.name)
    )
  }, [labels])

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

  const resetLabelState = () => {
    setIsCreateMode(false)
    setEditingLabelId('')
    setNameInputText('')
    setDescriptionInputText('')
    setLabelColorHex('#000000')
  }

  async function createLabel(): Promise<void> {
    const res = await createLabelMutation(
      nameInputText.trim(),
      labelColorHex,
      descriptionInputText
    )
    if (res) {
      showSuccessToast('Label created', { position: 'bottom-right' })
      resetLabelState()
      revalidate()
    } else {
      showErrorToast('Failed to create label')
    }
  }

  async function updateLabel(id: string): Promise<void> {
    await updateLabelMutation({
      labelId: id,
      name: nameInputText,
      color: labelColorHex,
      description: descriptionInputText,
    })
    revalidate()
  }

  const onEditPress = (label: Label | null) => {
    if (label) {
      setEditingLabelId(label.id)
      setNameInputText(label.name)
      setDescriptionInputText(label.description || '')
      setLabelColorHex(label.color)
    } else {
      resetLabelState()
    }
  }

  async function onDeleteLabel(id: string): Promise<void> {
    const result = await deleteLabelMutation(id)
    if (result) {
      showSuccessToast('Label deleted', { position: 'bottom-right' })
    } else {
      showErrorToast('Failed to delete label', { position: 'bottom-right' })
    }
    revalidate()
  }

  async function deleteLabel(id: string): Promise<void> {
    setConfirmRemoveLabelId(id)
  }

  const handleGenerateRandomColor = (rowId?: string) => {
    const colorHexes = Object.keys(labelColorObjects).slice(
      0,
      -1
    ) as LabelColor[]
    const randomColorHex =
      colorHexes[Math.floor(Math.random() * colorHexes.length)]
    setLabelColorHex(randomColorHex)
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
          {confirmRemoveLabelId ? (
            <ConfirmationModal
              message={
                'Are you sure? Deleting a label will remove it from all pages.'
              }
              onAccept={() => {
                onDeleteLabel(confirmRemoveLabelId)
                setConfirmRemoveLabelId(null)
              }}
              onOpenChange={() => setConfirmRemoveLabelId(null)}
            />
          ) : null}
          {showLabelPageHelp && (
            <FeatureHelpBox
              helpTitle="Use labels to organize your library and optimize your workflow."
              helpMessage="Use this page to view and edit all your labels. Labels can be attached to individual library items, or your highlights, and are used to keep your library organized."
              docsMessage={'Read the Docs'}
              docsDestination="https://docs.omnivore.app/using/organizing.html#labels"
              onDismiss={() => {
                setShowLabelPageHelp(false)
              }}
              helpCTAText="Create a label"
              onClickCTA={() => {
                resetLabelState()
                handleGenerateRandomColor()
                setIsCreateMode(true)
              }}
            />
          )}
          <HeaderWrapper>
            <Box
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Box>
                <StyledText style="fixedHeadline">Labels </StyledText>
              </Box>
              <InfoLink href="https://docs.omnivore.app/using/organizing.html#labels" />
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
                        resetLabelState()
                        handleGenerateRandomColor()
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
                          display: 'flex',
                          '@md': {},
                        }}
                      >
                        <SpanBox>Create a label</SpanBox>
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
                  label={null}
                  labelColorHex={labelColorHex}
                  editingLabelId={editingLabelId}
                  isCreateMode={isCreateMode}
                  handleGenerateRandomColor={handleGenerateRandomColor}
                  setEditingLabelId={setEditingLabelId}
                  setLabelColorHex={setLabelColorHex}
                  deleteLabel={deleteLabel}
                  nameInputText={nameInputText}
                  descriptionInputText={descriptionInputText}
                  setNameInputText={setNameInputText}
                  setDescriptionInputText={setDescriptionInputText}
                  setIsCreateMode={setIsCreateMode}
                  createLabel={createLabel}
                  updateLabel={updateLabel}
                  onEditPress={onEditPress}
                  resetState={resetLabelState}
                />
              ) : (
                <MobileEditCard
                  label={null}
                  labelColorHex={labelColorHex}
                  editingLabelId={editingLabelId}
                  isCreateMode={isCreateMode}
                  handleGenerateRandomColor={handleGenerateRandomColor}
                  setEditingLabelId={setEditingLabelId}
                  setLabelColorHex={setLabelColorHex}
                  deleteLabel={deleteLabel}
                  nameInputText={nameInputText}
                  descriptionInputText={descriptionInputText}
                  setNameInputText={setNameInputText}
                  setDescriptionInputText={setDescriptionInputText}
                  setIsCreateMode={setIsCreateMode}
                  createLabel={createLabel}
                  resetState={resetLabelState}
                  updateLabel={updateLabel}
                />
              )
            ) : null}
          </>
          {sortedLabels
            ? sortedLabels.map((label, i) => {
                const isLastChild = i === sortedLabels.length - 1
                const isFirstChild = i === 0
                const cardProps = {
                  label: label,
                  labelColorHex: labelColorHex,
                  editingLabelId: editingLabelId,
                  isCreateMode: isCreateMode,
                  isLastChild: isLastChild,
                  isFirstChild: isFirstChild,
                  handleGenerateRandomColor: handleGenerateRandomColor,
                  setEditingLabelId: setEditingLabelId,
                  setLabelColorHex: setLabelColorHex,
                  deleteLabel: deleteLabel,
                  nameInputText: nameInputText,
                  descriptionInputText: descriptionInputText,
                  setNameInputText: setNameInputText,
                  setDescriptionInputText: setDescriptionInputText,
                  setIsCreateMode: setIsCreateMode,
                  createLabel: createLabel,
                  resetState: resetLabelState,
                  updateLabel: updateLabel,
                }

                if (editingLabelId == label.id) {
                  if (windowWidth >= breakpoint) {
                    return (
                      <DesktopEditCard
                        key={`edit-${label.id}`}
                        {...cardProps}
                      />
                    )
                  } else {
                    return (
                      <MobileEditCard key={`edit-${label.id}`} {...cardProps} />
                    )
                  }
                }

                return (
                  <GenericTableCard
                    key={label.id}
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

function GenericTableCard(
  props: GenericTableCardProps & {
    isLastChild?: boolean
    isFirstChild?: boolean
  }
) {
  const {
    label,
    isLastChild,
    isFirstChild,
    editingLabelId,
    labelColorHex,
    isCreateMode,
    nameInputText,
    descriptionInputText,
    handleGenerateRandomColor,
    setLabelColorHex,
    setEditingLabelId,
    deleteLabel,
    setNameInputText,
    setDescriptionInputText,
    createLabel,
    updateLabel,
    onEditPress,
    resetState,
  } = props
  const showInput = editingLabelId === label?.id || (isCreateMode && !label)
  const labelColor = editingLabelId === label?.id ? labelColorHex : label?.color
  const iconColor = isDarkTheme() ? '#D8D7D5' : '#5F5E58'

  const handleEdit = () => {
    editingLabelId && updateLabel(editingLabelId)
    setEditingLabelId(null)
  }

  const moreActionsButton = () => {
    return (
      <ActionsWrapper>
        <Dropdown
          disabled={isCreateMode}
          triggerElement={<DotsThree size={24} color={iconColor} />}
        >
          <DropdownOption onSelect={() => null}>
            <Button
              style="plainIcon"
              css={{
                mr: '0px',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'transparent',
                border: 0,
              }}
              onClick={() => onEditPress(label)}
              disabled={isCreateMode}
            >
              <PencilSimple size={24} color={iconColor} />
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
              onClick={() => (label ? deleteLabel(label.id) : null)}
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

  return (
    <TableCard
      css={{
        '&:hover': {
          background: 'rgba(255, 234, 159, 0.12)',
        },
        borderTopLeftRadius: isFirstChild ? '5px' : '',
        borderTopRightRadius: isFirstChild ? '5px' : '',
        borderBottomLeftRadius: isLastChild ? '5px' : '',
        borderBottomRightRadius: isLastChild ? '5px' : '',
      }}
    >
      <TableCardBox
        css={{
          display: 'grid',
          width: '100%',
          gridGap: '$1',
          gridTemplateColumns: '3fr 2fr',
          height: editingLabelId == label?.id ? '120px' : '56px',
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
            gridTemplateColumns: '20% 28% 1fr 1fr',
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
          {showInput && !label ? null : (
            <HStack
              alignment="center"
              css={{ ml: '16px', '@smDown': { ml: '0px' } }}
            >
              <LabelChip
                color={labelColor || '#000000'}
                text={label?.name || ''}
              />
            </HStack>
          )}
          {showInput && !label ? (
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
          ) : null}
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
              placeholder="Description (optional)"
              value={descriptionInputText}
              onChange={(event) => setDescriptionInputText(event.target.value)}
              autoFocus={!!label}
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
              {editingLabelId === label?.id
                ? descriptionInputText
                : label?.description || ''}
            </StyledText>
          )}
        </HStack>

        <HStack
          distribution="start"
          css={{
            padding: '4px 8px',
            paddingLeft: '10px',
            alignItems: 'center',
          }}
        >
          {showInput && (
            <LabelColorDropdown
              isCreateMode={isCreateMode && !label}
              canEdit={editingLabelId === label?.id}
              labelColor={labelColorHex}
              setLabelColor={setLabelColorHex}
              labelId={label?.id || ''}
            />
          )}
          {showInput && (
            <Box title="Random color" css={{ py: 4 }}>
              <IconButton
                style="ctaWhite"
                css={{
                  mr: '$1',
                  width: 40,
                  height: 40,
                  background: '$labelButtonsBg',
                }}
                onClick={() => handleGenerateRandomColor(label?.id)}
                disabled={
                  !(isCreateMode && !label) && !(editingLabelId === label?.id)
                }
              >
                <ArrowClockwise size={16} color={iconColor} />
              </IconButton>
            </Box>
          )}
          {!showInput && (
            <Box css={{ marginLeft: 'auto', '@md': { display: 'none' } }}>
              {moreActionsButton()}
            </Box>
          )}
        </HStack>

        <HStack
          distribution="start"
          alignment="center"
          css={{
            ml: '8px',
            display: 'flex',
            '@md': {
              display: 'none',
            },
          }}
        >
          {showInput && (
            <Input
              type="text"
              placeholder="What this label is about..."
              value={descriptionInputText}
              onChange={(event) => setDescriptionInputText(event.target.value)}
              autoFocus={!!label}
            />
          )}
        </HStack>

        <HStack
          distribution="end"
          alignment="center"
          css={{
            padding: '0px 8px',
          }}
        >
          {editingLabelId === label?.id || !label ? (
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
                onClick={() => (label ? handleEdit() : createLabel())}
              >
                Save
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
                css={{ mr: '$1', background: '$labelButtonsBg' }}
                onClick={() => onEditPress(label)}
                disabled={isCreateMode}
              >
                <PencilSimple size={16} color={iconColor} />
              </IconButton>
              <IconButton
                style="ctaWhite"
                css={{ mr: '$1', background: '$labelButtonsBg' }}
                onClick={() => deleteLabel(label.id)}
                disabled={isCreateMode}
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

function MobileEditCard(props: any) {
  const {
    label,
    editingLabelId,
    labelColorHex,
    isCreateMode,
    nameInputText,
    descriptionInputText,
    setLabelColorHex,
    setEditingLabelId,
    setNameInputText,
    setDescriptionInputText,
    createLabel,
    resetState,
    updateLabel,
    isFirstChild,
    isLastChild,
  } = props

  const handleEdit = () => {
    editingLabelId && updateLabel(editingLabelId)
    setEditingLabelId(null)
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
        {nameInputText && (
          <SpanBox css={{ ml: '-2px', mt: '0px' }}>
            <LabelChip color={labelColorHex} text={nameInputText} />
          </SpanBox>
        )}
        <Input
          type="text"
          value={nameInputText}
          onChange={(event) => setNameInputText(event.target.value)}
          autoFocus
        />
        <LabelColorDropdown
          isCreateMode={isCreateMode && !label}
          canEdit={editingLabelId === label?.id}
          labelId={label?.id || ''}
          labelColor={label?.color || '#000000'}
          setLabelColor={setLabelColorHex}
        />
        <TextArea
          placeholder="Description (optional)"
          value={descriptionInputText}
          onChange={(event) => setDescriptionInputText(event.target.value)}
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
            onClick={() => (label ? handleEdit() : createLabel())}
          >
            Save
          </Button>
        </HStack>
      </VStack>
    </TableCard>
  )
}

function DesktopEditCard(props: any) {
  const {
    label,
    editingLabelId,
    labelColorHex,
    isCreateMode,
    nameInputText,
    descriptionInputText,
    setLabelColorHex,
    setEditingLabelId,
    setNameInputText,
    setDescriptionInputText,
    createLabel,
    resetState,
    updateLabel,
    isFirstChild,
    isLastChild,
  } = props

  const handleEdit = () => {
    editingLabelId && updateLabel(editingLabelId)
    setEditingLabelId(null)
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
        {nameInputText && (
          <SpanBox css={{ px: '11px', mt: '3px' }}>
            <LabelChip color={labelColorHex} text={nameInputText} />
          </SpanBox>
        )}
        <HStack
          distribution="start"
          alignment="center"
          css={{ pt: '6px', px: '13px', width: '100%', gap: '16px' }}
        >
          <Input
            type="text"
            value={nameInputText}
            onChange={(event) => setNameInputText(event.target.value)}
            autoFocus
          />
          <LabelColorDropdown
            isCreateMode={isCreateMode && !label}
            canEdit={editingLabelId === label?.id}
            labelId={label?.id || ''}
            labelColor={labelColorHex}
            setLabelColor={setLabelColorHex}
          />
          <Input
            type="text"
            placeholder="Description (optional)"
            value={descriptionInputText}
            onChange={(event) => setDescriptionInputText(event.target.value)}
          />
          <HStack
            distribution="end"
            alignment="center"
            css={{ marginLeft: 'auto', width: '100%' }}
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
              onClick={() => (label ? handleEdit() : createLabel())}
            >
              Save
            </Button>
          </HStack>
        </HStack>
      </VStack>
    </TableCard>
  )
}
