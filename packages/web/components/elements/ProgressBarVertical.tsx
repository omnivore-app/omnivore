import { Box } from './../elements/LayoutPrimitives'

type ProgressBarVProps = {
  fillPercentage: number
  fillColor: string
  backgroundColor: string
  borderRadius: string
  height?: string
}

export function ProgressBarVertical(props: ProgressBarVProps): JSX.Element {
  return (
    <Box
      css={{
        height: props.height ?? '100%',
        width: '2px',
        borderRadius: '$1',
        overflow: 'hidden',
        backgroundColor: props.backgroundColor,
        mr: '12px',
      }}
    >
      <Box
        css={{
          height: `${props.fillPercentage}%`,
          width: '100%',
          backgroundColor: props.fillColor,
          borderRadius: props.borderRadius,
        }}
      />
    </Box>
  )
}
