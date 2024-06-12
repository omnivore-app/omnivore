import { Button } from './Button'
import { SpanBox, HStack } from './LayoutPrimitives'
import { Circle, X } from '@phosphor-icons/react'
import { isDarkTheme } from '../../lib/themeUpdater'
import { Label } from '../../lib/networking/fragments/labelFragment'
import { useMemo } from 'react'
import { theme } from '../tokens/stitches.config'

type EditLabelChipStackProps = {
  labels: Label[]
  isSelected?: boolean
  setExpanded: (expanded: boolean) => void
}

export function EditLabelChipStack(
  props: EditLabelChipStackProps
): JSX.Element {
  const isDark = isDarkTheme()

  const selectedBorder = isDark ? '#FFEA9F' : '$omnivoreGray'
  const unSelectedBorder = isDark ? 'transparent' : '#DEDEDE'

  const colors = useMemo(() => {
    const mapped = props.labels.map((l) => l.color)
    if (mapped.length > 7) {
      const set = new Set(mapped)
      return Array.from(set).slice(0, 7)
    }
    return mapped
  }, [props])

  return (
    <SpanBox
      css={{
        display: 'inline-table',
        margin: '2px',
        fontSize: '11px',
        fontWeight: '500',
        fontFamily: '$inter',
        padding: '1px 7px',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        backgroundClip: 'padding-box',
        borderRadius: '5px',
        borderWidth: '1px',
        borderStyle: 'solid',
        color: isDark ? '#EBEBEB' : '#2A2A2A',
        borderColor: props.isSelected ? selectedBorder : unSelectedBorder,
        backgroundColor: isDark ? '#2A2A2A' : '#F9F9F9',
      }}
      onClick={(event) => {
        props.setExpanded(true)
        event.preventDefault()
      }}
    >
      <HStack
        distribution="center"
        alignment="center"
        css={{ gap: '7px', pl: '15px' }}
      >
        {colors.map((color, idx) => (
          <SpanBox
            key={`label-color${idx}`}
            css={{
              marginLeft: -15,
              height: '100%',
              display: 'flex',
            }}
          >
            <Circle size={14} color={color} weight="fill" />
          </SpanBox>
        ))}
        <SpanBox css={{ pt: '1px' }}>{`${props.labels.length} labels`}</SpanBox>
      </HStack>
    </SpanBox>
  )
}
