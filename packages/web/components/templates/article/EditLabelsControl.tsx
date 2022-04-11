import { useCallback, useRef, useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Box, HStack, SpanBox, VStack } from '../../elements/LayoutPrimitives'
import { Button } from '../../elements/Button'
import { StyledText } from '../../elements/StyledText'
import { CrossIcon } from '../../elements/images/CrossIcon'
import { styled, theme } from '../../tokens/stitches.config'
import { Label } from '../../../lib/networking/fragments/labelFragment'
import { useGetLabelsQuery } from '../../../lib/networking/queries/useGetLabelsQuery'
import { ArticleAttributes } from '../../../lib/networking/queries/useGetArticleQuery'
import { Check, Circle, PencilSimple, Plus } from 'phosphor-react'

import { isTouchScreenDevice } from '../../../lib/deviceType'
import { setLabelsMutation } from '../../../lib/networking/mutations/setLabelsMutation'
import { createLabelMutation } from '../../../lib/networking/mutations/createLabelMutation'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'
import { randomLabelColorHex } from '../../../utils/settings-page/labels/labelColorObjects'
import Router, { useRouter } from 'next/router'

type EditLabelsControlProps = {
  article: ArticleAttributes
  articleActionHandler: (action: string, arg?: unknown) => void
}

type HeaderProps = {
  filterText: string
  focused: boolean
  resetFocusedIndex: () => void
  setFilterText: (text: string) => void
}

const FormInput = styled('input', {
  width: '100%',
  fontSize: '16px',
  fontFamily: 'inter',
  fontWeight: 'normal',
  lineHeight: '1.8',
  color: '$grayTextContrast',
  '&:focus': {
    outline: 'none',
  },
})

const StyledLabel = styled('label', {
  display: 'flex',
  justifyContent: 'flex-start',
})

function Header(props: HeaderProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (props.focused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [props.focused])

  return (
    <VStack css={{ width: '100%', my: '0px', borderBottom: '1px solid $grayBorder'}}>
      <Box css={{ 
        width: '100%',
        my: '14px',
        px: '14px',
      }}>
        <FormInput
          ref={inputRef}
          type="text"
          tabIndex={props.focused && !isTouchScreenDevice() ? 0 : -1}
          autoFocus={!isTouchScreenDevice()}
          value={props.filterText}
          placeholder="Filter for label"
          onChange={(event) => {
            props.setFilterText(event.target.value)
          }}
          onFocus={() => {
            props.resetFocusedIndex()
          }}
          css={{
            border: '1px solid $grayBorder',
            borderRadius: '8px',
            width: '100%',
            bg: 'transparent',
            fontSize: '16px',
            textIndent: '8px',
            marginBottom: '2px',
            color: '$grayTextContrast',
            '&:focus': {
              outline: 'none',
              boxShadow: '0px 0px 2px 2px rgba(255, 234, 159, 0.56)',
            },
          }}
        />
    </Box>
  </VStack>)
}

type LabelListItemProps = {
  label: Label
  focused: boolean
  selected: boolean
  toggleLabel: (label: Label) => void
}

function LabelListItem(props: LabelListItemProps): JSX.Element {
  const ref = useRef<HTMLLabelElement>(null)
  const { label, focused, selected } = props

  useEffect(() => {
    if (props.focused && ref.current) {
      ref.current.focus()
    }
  }, [props.focused])

  return (
    <StyledLabel
      ref={ref}
      css={{
        width: '100%',
        height: '42px',
        borderBottom: '1px solid $grayBorder',
        bg: props.focused ? '$grayBgActive' : 'unset',
      }}
      tabIndex={props.focused ? 0 : -1}
      onClick={(event) => {
        event.preventDefault()
        props.toggleLabel(label)
        ref.current?.blur()
      }}
    >
      <input autoFocus={focused} hidden={true} type="checkbox" checked={selected} readOnly />
      <Box css={{ pl: '10px', width: '32px', display: 'flex', alignItems: 'center' }}>
        {selected && <Check size={15} color={theme.colors.grayText.toString()} weight='bold' />}
      </Box>
      <Box css={{ width: '30px', height: '100%', display: 'flex', alignItems: 'center' }}>
        <Circle width={22} height={22} color={label.color} weight='fill' />
      </Box>
      <Box css={{ overflow: 'clip', height: '100%', display: 'flex', alignItems: 'center' }}>
        <StyledText style="caption">{label.name}</StyledText>
      </Box>
      <Box css={{ pl: '10px', width: '40px', marginLeft: 'auto', display: 'flex', alignItems: 'center'  }}>
        {selected && <CrossIcon
          size={14}
          strokeColor={theme.colors.grayText.toString()}
        />}
      </Box>
    </StyledLabel>
  )
}

type EditLabelsButtonFooterProps = {
  focused: boolean
}

function EditLabelsButtonFooter(props: EditLabelsButtonFooterProps): JSX.Element {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (props.focused && ref.current) {
      ref.current.focus()
    }
  }, [props.focused])

  return (
    <HStack
      ref={ref}
      distribution="start"  alignment="center" css={{
      ml: '20px', gap: '8px', width: '100%', fontSize: '12px', p: '8px', height: '42px',
      bg: props.focused ? '$grayBgActive' : 'unset',
      'a:link': {
        textDecoration: 'none',
      },
      'a:visited': {
        color: theme.colors.grayText.toString(),
      },
    }}
  >
    <PencilSimple size={18} color={theme.colors.grayText.toString()} />
    <Link href="/settings/labels">Edit labels</Link>
  </HStack>
  )
}

export function EditLabelsControl(props: EditLabelsControlProps): JSX.Element {
  const router = useRouter()
  const [filterText, setFilterText] = useState('')
  const { labels } = useGetLabelsQuery()
  const [selectedLabels, setSelectedLabels] = useState<Label[]>(props.article.labels || [])

  const isSelected = useCallback((label: Label): boolean => {
    return selectedLabels.some((other) => {
      return other.id === label.id
    })
  }, [selectedLabels])

  const toggleLabel = useCallback(async (label: Label) => {
    let newSelectedLabels = [...selectedLabels]
    if (isSelected(label)) {
      newSelectedLabels = selectedLabels.filter((other) => {
        return other.id !== label.id
      })
    } else {
      newSelectedLabels = [...selectedLabels, label]
    }
    setSelectedLabels(newSelectedLabels)

    const result = await setLabelsMutation(
      props.article.linkId,
      newSelectedLabels.map((label) => label.id)
    )
    props.article.labels = result
    props.articleActionHandler('refreshLabels', result)
  }, [isSelected, selectedLabels, setSelectedLabels])

  const filteredLabels = useMemo(() => {
    if (!labels) {
      return []
    }
    return labels.filter((label) => {
      return label.name.toLowerCase().includes(filterText.toLowerCase())
    })
  }, [labels, filterText])

  useEffect(() => {
    setFocusedIndex(undefined)
  }, [filterText])

  // Move focus through the labels list on tab or arrow up/down keys
  const [focusedIndex, setFocusedIndex] = useState<number | undefined>(undefined)
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    const maxIndex = filteredLabels.length + 1
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      let newIndex = focusedIndex
      if (focusedIndex) {
        newIndex = Math.max(0, focusedIndex - 1)
      } else {
        newIndex = undefined
      }
      // If the `Create New label` button isn't visible we skip it
      // when navigating with the arrow keys
      if (focusedIndex === maxIndex && !filterText) {
        newIndex = maxIndex - 2
      }
      setFocusedIndex(newIndex)
    }
    if (event.key === 'ArrowDown' || event.key === 'Tab') {
      event.preventDefault()
      let newIndex = focusedIndex
      if (focusedIndex === undefined) {
        newIndex = 0
      } else {
        newIndex = Math.min(maxIndex, focusedIndex + 1)
      }
      // If the `Create New label` button isn't visible we skip it
      // when navigating with the arrow keys
      if (focusedIndex === maxIndex - 2 && !filterText) {
        newIndex = maxIndex
      }
      setFocusedIndex(newIndex)
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (focusedIndex === maxIndex) {
        router.push('/settings/labels')
        return
      }
      if (focusedIndex !== undefined) {
        const label = filteredLabels[focusedIndex]
        if (label) {
          toggleLabel(label)
        }
      }
    }
  }, [filteredLabels, focusedIndex, isSelected, selectedLabels, setSelectedLabels])

  return (
    <VStack
      distribution="start"
      onKeyDown={handleKeyDown}
      css={{ 
        p: '0',
        maxHeight: '92%',
        maxWidth: '265px',
        '@mdDown': {
          maxWidth: '100%',
          maxHeight: '92%',
        },
    }}>
      <Header
        focused={focusedIndex === undefined}
        resetFocusedIndex={() => setFocusedIndex(undefined)}
        setFilterText={setFilterText} filterText={filterText}
      />
      <VStack css={{ flexGrow: '1', overflow: 'scroll', width: '100%', height: '100%', maxHeight: '400px',  }}>
        {filteredLabels &&
          filteredLabels.map((label, idx) => (
            <LabelListItem
              key={label.id}
              label={label}
              focused={idx === focusedIndex}
              selected={isSelected(label)}
              toggleLabel={toggleLabel}
            />
          ))}
      </VStack>
      {filterText && (
        <Button style='modalOption' css={{
          pl: '26px',
          color: theme.colors.grayText.toString(),
          height: '42px',
          borderBottom: '1px solid $grayBorder',
          bg: focusedIndex === filteredLabels.length ? '$grayBgActive' : 'unset',
        }} 
          onClick={async () => {
            const label = await createLabelMutation(filterText, randomLabelColorHex(), '')
            if (label) {
              showSuccessToast(`Created label ${label.name}`, { position: 'bottom-right' })
              toggleLabel(label)
            } else {
              showErrorToast('Failed to create label', { position: 'bottom-right' })
            }
          }}
        >
          <HStack alignment='center' distribution='start' css={{ gap: '8px' }}>
            <Plus size={18} color={theme.colors.grayText.toString()} />
            <SpanBox css={{ fontSize: '12px' }}>{`Create new label "${filterText}"`}</SpanBox>
          </HStack>
        </Button>
      )}

      <EditLabelsButtonFooter focused={focusedIndex === (filteredLabels.length + 1)} />
    </VStack>
  )
}