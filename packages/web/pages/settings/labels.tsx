import { useEffect, useState } from 'react'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
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
import { Label } from '../../lib/networking/queries/useGetLabelsQuery'

import { StyledText } from '../../components/elements/StyledText'
import {
  ArrowClockwise,
  DotsThree,
  PencilSimple,
  Trash,
  Plus,
} from 'phosphor-react'
import {
  LabelColor,
  GenericTableCardProps,
  LabelColorHex,
} from '../../utils/settings-page/labels/types'
import { labelColorObjects, } from '../../utils/settings-page/labels/labelColorObjects'
import {
  TooltipWrapped
} from '../../components/elements/Tooltip'
import { LabelColorDropdown } from '../../components/elements/LabelColorDropdown'
import {
  Dropdown,
  DropdownOption,
} from '../../components/elements/DropdownElements'
import { LabelChip } from '../../components/elements/LabelChip'

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

  '&:hover': {
    border: '0.3px solid #FFD234',
    backgroundColor: '#FFFDF4',
  },
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
  backgroundColor: 'transparent',
  color: '$grayTextContrast',
  padding: '13px 6px',
  margin: '$2 0',
  border: '1px solid $grayBorder',
  borderRadius: '6px',
  fontSize: '13px',
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

const MobileBtnWrapper = styled(Box, {
  display: 'flex',
  position: 'fixed',
  bottom: '16px',
  right: '25px',
  '@md': {
    display: 'none',
  },
})

const Input = styled('input', { ...inputStyles })

const TextArea = styled('textarea', { ...inputStyles })

export default function LabelsPage(): JSX.Element {
  const { labels, revalidate } = useGetLabelsQuery()
  const [labelColorHex, setLabelColorHex] = useState<LabelColorHex>({
    rowId: '',
    value: 'custom color',
  })
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null)
  const [nameInputText, setNameInputText] = useState<string>('')
  const [descriptionInputText, setDescriptionInputText] = useState<string>('')
  const [isCreateMode, setIsCreateMode] = useState<boolean>(false)
  const [windowWidth, setWindowWidth] = useState<number>(0)
  const breakpoint = 768

  applyStoredTheme(false)

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
    setLabelColorHex({ rowId: '', value: 'custom color' })
  }

  async function createLabel(): Promise<void> {
    const res = await createLabelMutation(
      nameInputText,
      labelColorHex.value,
      descriptionInputText
    )
    if (res) {
      if (res.createLabel.errorCodes && res.createLabel.errorCodes.length > 0) {
        showErrorToast(res.createLabel.errorCodes[0])
      } else {
        showSuccessToast('Label created')
        resetLabelState()
        revalidate()
      }
    } else {
      showErrorToast('Failed to create label')
    }
  }

  async function updateLabel(id: string): Promise<void> {
    await updateLabelMutation({
      labelId: id,
      name: nameInputText,
      color: labelColorHex.value,
      description: descriptionInputText,
    })
    revalidate()
  }

  const onEditPress = (label : Label | null) => {
    if (label) {
      setEditingLabelId(label.id)
      setNameInputText(label.name)
      setDescriptionInputText(label.description || '')
      setLabelColorHex({ rowId: '', value: label.color })
    }
    else {
      resetLabelState()
    }
  }

  async function deleteLabel(id: string): Promise<void> {
    await deleteLabelMutation(id)
    revalidate()
  }

  const handleGenerateRandomColor = (rowId?: string) => {
    const colorHexes = Object.keys(labelColorObjects).slice(
      0,
      -1
    ) as LabelColor[]
    const randomColorHex =
      colorHexes[Math.floor(Math.random() * colorHexes.length)]
    setLabelColorHex((prevState) => ({
      ...prevState,
      rowId: rowId || '',
      value: randomColorHex,
    }))
  }

  return (
    <PrimaryLayout pageTestId="settings-labels-tag">
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <VStack
        css={{
          mx: '10px',
          color: '$grayText',
        }}
      >
        <HeaderWrapper>
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <Box style={{ flex: '1' }}>
              <StyledText style="fixedHeadline">Labels</StyledText>
            </Box>
            <Box css={{ minWidth: '178px', display: 'flex', justifyContent: 'flex-end' }}>
              {editingLabelId || isCreateMode ? null : (
                <>
                  <Button
                    onClick={() => {
                      resetLabelState()
                      setIsCreateMode(true)
                    }}
                    style="ctaDarkYellow"
                    css={{
                      display: 'none',
                      alignItems: 'center',
                      '@md': {
                        display: 'flex',
                      },
                    }}
                  >
                    <Plus size={18} style={{ marginRight: '6.5px' }} />
                    <SpanBox>Add Label</SpanBox>
                  </Button>
                  <MobileBtnWrapper>
                    <Button
                      onClick={() => setIsCreateMode(true)}
                      style="ctaDarkYellow"
                      css={{
                        display: 'flex',
                        border: '1px solid $grayBorder',
                        borderRadius: '8px',
                      }}
                    >
                      <Plus size={24} />
                    </Button>
                  </MobileBtnWrapper>
                </>
              )}
            </Box>
          </Box>
        </HeaderWrapper>
        <>
          {isCreateMode ? (
            windowWidth > breakpoint ? (
              <GenericTableCard
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
              />
            )
          ) : null}
        </>
        {labels
          ? labels.map((label, i) => {
            const isLastChild = i === labels.length - 1
            const isFirstChild = i === 0

              return (
                <GenericTableCard
                  key={label.id}
                  isLastChild={isLastChild}
                  isFirstChild={isFirstChild}
                  label={label as unknown as Label}
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
              )
            })
          : null}
      </VStack>
    </PrimaryLayout>
  )
}

function GenericTableCard(props: GenericTableCardProps & { isLastChild?: boolean; isFirstChild?: boolean}) {
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
  const colorObject =
    labelColorObjects[label?.color || ''] || labelColorObjects['custom color']
  const { text, border, background } = colorObject
  const showInput =
    editingLabelId === label?.id || (isCreateMode && !label)
  const labelName = label?.name || nameInputText

  const isDarkMode = isDarkTheme()
  const iconColor = isDarkMode ? '#D8D7D5': '#5F5E58'

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
                mr: '$1',
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
                css={{ fontSize: '$5', marginLeft: '$2' }}
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
                css={{ fontSize: '$5', marginLeft: '$2', color: '#AA2D11' }}
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
      '@mdDown': {
        borderTopLeftRadius: isFirstChild ? '5px' : '',
        borderTopRightRadius: isFirstChild ? '5px' : '',
      },
      borderBottomLeftRadius: isLastChild ? '5px' : '',
      borderBottomRightRadius: isLastChild ? '5px' : '',
    }}>
      <TableCardBox
        css={{
          display: 'grid',
          width: '100%',
          gridGap: '$1',
          height: '56px',
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
            // gridTemplateColumns: '20% 15% 1fr 1fr 1fr',
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
          {(showInput && !label) ? null : (
            <HStack alignment="center" css={{ ml: '16px' }}>
              <LabelChip color={label?.color || ''} text={label?.name || ''} />
            </HStack>
          )}
          {(showInput && !label) ? (
            <Input
              type="text"
              value={nameInputText}
              onChange={(event) => setNameInputText(event.target.value)}
              required
              autoFocus
            />
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
              placeholder='What this label is about...'
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
              }}
            >
              {editingLabelId === label?.id ? descriptionInputText : label?.description || ''}
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
              labelColorHexRowId={labelColorHex.rowId}
              labelColorHexValue={labelColorHex.value}
              labelId={label?.id || ''}
              labelColor={label?.color || 'custom color'}
              setLabelColorHex={setLabelColorHex}
            />
          )}
          {showInput && (
          <TooltipWrapped
            tooltipSide={'top'}
            tooltipContent='Random Color'
            arrowStyles={{fill: '#F9D354'}}
            style={{backgroundColor: '#F9D354', color: 'black'}}
          >
            <Box css={{py: 4}}>
              <IconButton
                style="ctaWhite"
                css={{
                  mr: '$1',
                  width: 40,
                  height: 40,
                  background: '$labelButtonsBg',
                }}
                onClick={() => handleGenerateRandomColor(label?.id)}
                disabled={!(isCreateMode && !label) && !(editingLabelId === label?.id)}
              >
                <ArrowClockwise size={16} color={iconColor} />
              </IconButton>
            </Box>
          </TooltipWrapped>
          )}
          <Box css={{'@md': { display: 'none' }}}>
            {moreActionsButton()}
          </Box>
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
                  style="ctaDarkYellow"
                  css={{ my: '0px', mr: '$1' }}
                  onClick={() =>
                    label ? handleEdit() : createLabel()
                  }
                >
                  Save
                </Button>
                <Button
                  style="plainIcon"
                  css={{ mr: '$1' }}
                  onClick={() => {
                    resetState()
                  }}
                >
                  Cancel
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
                    width: '100%'
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
    resetState
  } = props
  return (
    <TableCard>
      <VStack distribution="center" css={{ width: '100%' }}>
        <StyledText>{editingLabelId ? 'Edit Label' : 'New Label'}</StyledText>
        <Input
          type="text"
          value={nameInputText || label?.name}
          onChange={(event) => setNameInputText(event.target.value)}
          autoFocus
        />
        <LabelColorDropdown
          isCreateMode={isCreateMode && !label}
          canEdit={editingLabelId === label?.id}
          labelColorHexRowId={labelColorHex.rowId}
          labelColorHexValue={labelColorHex.value}
          labelId={label?.id || ''}
          labelColor={label?.color || 'custom color'}
          setLabelColorHex={setLabelColorHex}
        />
        <TextArea
          value={descriptionInputText || label?.description}
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
            onClick={() => (label ? setEditingLabelId(null) : createLabel())}
          >
            Save
          </Button>
        </HStack>
      </VStack>
    </TableCard>
  )
}
