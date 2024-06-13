import { SpanBox, HStack } from './LayoutPrimitives'
import { Circle, X } from '@phosphor-icons/react'

type LabelChipProps = {
  text: string
  color: string // expected to be a RGB hex color string
  isSelected?: boolean
}

export function LabelChip(props: LabelChipProps): JSX.Element {
  return (
    <SpanBox
      css={{
        display: 'inline-table',
        margin: '2px',
        fontSize: '11px',
        fontWeight: '500',
        fontFamily: '$inter',
        padding: '4px 7px',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        backgroundClip: 'padding-box',
        borderRadius: '5px',
        borderWidth: '1px',
        borderStyle: 'solid',
        color: '$thLabelChipForeground',
        borderColor: props.isSelected
          ? '$thLabelChipSelectedBorder'
          : '$thLabelChipBackground',
        backgroundColor: '$thLabelChipBackground',
      }}
    >
      <HStack alignment="center" css={{ gap: '5px' }}>
        <Circle size={14} color={props.color} weight="fill" />
        <SpanBox css={{ pt: '1px' }}>{props.text}</SpanBox>
      </HStack>
    </SpanBox>
  )
  // }

  // return (
  //   <Button
  //     style="plainIcon"
  //     onClick={(e) => {
  //       router.push(`/home?q=label:"${props.text}"`)
  //       e.stopPropagation()
  //     }}
  //   >
  //     <SpanBox
  //       css={{
  //         display: 'inline-table',
  //         margin: '2px',
  //         borderRadius: '4px',
  //         color: textColor,
  //         fontSize: '13px',
  //         fontWeight: '500',
  //         padding: '3px 6px',
  //         whiteSpace: 'nowrap',
  //         cursor: 'pointer',
  //         backgroundClip: 'padding-box',
  //         backgroundColor: props.color,
  //       }}
  //     >
  //       {props.text}
  //     </SpanBox>
  //   </Button>
  // )
}
