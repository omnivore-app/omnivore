import { SpanBox, HStack } from './LayoutPrimitives'
import { Circle, X } from '@phosphor-icons/react'

type LabelChipProps = {
  text: string
  color: string // expected to be a RGB hex color string
  isSelected?: boolean
}

export function OutlinedLabelChip(props: LabelChipProps): JSX.Element {
  return (
    <HStack
      alignment="center"
      distribution="start"
      css={{
        gap: '10px',
        fontSize: '14px',
        fontWeight: '500',
        fontFamily: '$inter',
        padding: '2.5px 12px',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        backgroundClip: 'padding-box',
        borderRadius: '5px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: '$thLabelOutlineChipBorder',
        color: '$thLabelChipForeground',
      }}
    >
      <Circle size={14} color={props.color} weight="fill" />
      <SpanBox css={{ pr: '2px' }}>{props.text}</SpanBox>
    </HStack>
  )
}
