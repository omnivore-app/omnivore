import { useEffect, useState } from 'react'
import { PrimaryLayout } from '../../components/templates/PrimaryLayout'
import { Button } from '../../components/elements/Button'
import { PlusIcon } from '../../components/elements/images/PlusIcon'
import { styled, theme } from '../../components/tokens/stitches.config'
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
import { applyStoredTheme } from '../../lib/themeUpdater'
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

const TableHeading = styled(Box, {
  backgroundColor: '$grayBgActive',
  // gridTemplateColumns: '20% 30% 1fr 230px 1fr',
  gridTemplateColumns: '20% 30% 1fr 1fr',
  alignItems: 'center',
  padding: '12px 0px',
  borderRadius: '5px 5px 0px 0px',
  width: '100%',
  textTransform: 'uppercase',
  display: 'none',
  '@md': {
    display: 'grid',
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

const IconButton = styled(Button, {
  variants: {
    style: {
      ctaWhite: {
        color: 'red',
        padding: '14px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid $grayBorder',
        boxSizing: 'border-box',
        borderRadius: 6,
      },
    },
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
  console.log('LabelsPage ~ labelColorHex', labelColorHex)
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
                      '@md': {
                        display: 'flex',
                      },
                    }}
                  >
                    <PlusIcon size={20} strokeColor={'#0A0806'} />
                    <SpanBox>Create New Label</SpanBox>
                  </Button>
                  <Box
                    css={{
                      position: 'fixed',
                      bottom: '58px',
                      right: '16px',
                      zIndex: '1',
                      '@md': {
                        display: 'none',
                      },
                    }}
                  >
                    <Button
                      style="ctaDarkYellow"
                      onClick={() => {
                        setIsCreateMode(true)
                      }}
                    >
                      <Plus size={24} />
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Box>
          <TableHeading>
            <Box>
              <StyledText
                style="highlightTitle"
                css={{
                  color: '$grayTextContrast',
                  padding: '0 5px 0 60px',
                }}
              >
                Name
              </StyledText>
            </Box>
            <Box style={{ flex: '35%' }}>
              <StyledText
                style="highlightTitle"
                css={{
                  color: '$grayTextContrast',
                }}
              >
                Description
              </StyledText>
            </Box>
            {/* <Box>
              <StyledText
                style="highlightTitle"
                css={{
                  color: '$grayTextContrast',
                  textAlign: 'right',
                  paddingRight: '40px',
                }}
              >
                Uses
              </StyledText>
            </Box> */}
            <Box style={{ flex: '30%' }}>
              <StyledText
                style="highlightTitle"
                css={{
                  color: '$grayTextContrast',
                  paddingLeft: '15px',
                }}
              >
                Color
              </StyledText>
            </Box>
            <Box>
              <StyledText
                style="highlightTitle"
                css={{
                  color: '$grayTextContrast',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                Actions
              </StyledText>
            </Box>
          </TableHeading>
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

  const handleEdit = () => {
    editingLabelId && updateLabel(editingLabelId)
    setEditingLabelId(null)
  }

  const moreActionsButton = () => {
    return (
      <Button
        style="plainIcon"
        css={{
          mr: '$1',
          display: 'flex',
          background: 'transparent',
          border: 'none',
        }}
        onClick={() => true}
        disabled={isCreateMode}
      >
        <Dropdown
          triggerElement={<DotsThree size={24} color={theme.colors.toolColor.toString()} />}
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
              <PencilSimple size={24} color={theme.colors.toolColor.toString()} />
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
      </Button>
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
            gridTemplateColumns: '20% 30% 1fr 1fr',
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
          {(showInput || !label) ? null : (
            <HStack alignment="center" css={{ ml: '16px' }}>
              <LabelChip color={label.color} text={label.name} />
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

        {/* <HStack
          distribution="end"
          alignment="center"
          css={{
            display: 'none',
            '@md': {
              display: 'flex',
              paddingRight: '30px',
            },
          }}
        >
          <StyledText css={{ fontSize: '$2' }}>
            {isCreateMode && !label ? '-' : 536}
          </StyledText>
        </HStack> */}

        <HStack
          distribution="start"
          css={{
            padding: '4px 8px',
            paddingLeft: '10px',
            alignItems: 'center',
          }}
        >
          <LabelColorDropdown
            isCreateMode={isCreateMode && !label}
            canEdit={editingLabelId === label?.id}
            labelColorHexRowId={labelColorHex.rowId}
            labelColorHexValue={labelColorHex.value}
            labelId={label?.id || ''}
            labelColor={label?.color || 'custom color'}
            setLabelColorHex={setLabelColorHex}
          />
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
                  width: 46,
                  height: 46,
                  background: '$labelButtonsBg',
                }}
                onClick={() => handleGenerateRandomColor(label?.id)}
                disabled={!(isCreateMode && !label) && !(editingLabelId === label?.id)}
              >
                <ArrowClockwise size={16} color={theme.colors.toolColor.toString()} />
              </IconButton>
            </Box>
          </TooltipWrapped>
          <Box css={{'@md': { display: 'none' }}}>
            {moreActionsButton()}
          </Box>
        </HStack>

        <HStack
          distribution="start"
          alignment="center"
          css={{
            padding: '4px 8px',
            '@md': {
              justifyContent: 'center',
            },
          }}
        >
            {editingLabelId === label?.id || !label ? (
              <>
                <Button
                  style="ctaDarkYellow"
                  css={{ mr: '$1' }}
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
                alignment="center"
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
                  <PencilSimple size={16} color={theme.colors.toolColor.toString()} />
                </IconButton>
                <IconButton
                  style="ctaWhite"
                  css={{ mr: '$1', background: '$labelButtonsBg' }}
                  onClick={() => deleteLabel(label.id)}
                  disabled={isCreateMode}
                >
                  <Trash size={16} color={theme.colors.toolColor.toString()} />
                </IconButton>
                {moreActionsButton()}
              </HStack>
            )}
        </HStack>
        {/* <Box className="showHidden">
          <StyledText
            style="body"
            css={{
              color: '$grayTextContrast',
              fontSize: '14px',
              marginBottom: '$2',
            }}
          >
            {label?.description}
          </StyledText>
          <StyledText
            css={{ fontSize: '$2', textAlign: 'right', color: '$grayText' }}
          >
            {536} Uses
          </StyledText>
        </Box> */}
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
