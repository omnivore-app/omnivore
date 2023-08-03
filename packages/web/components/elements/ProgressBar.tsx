import { Box } from './../elements/LayoutPrimitives'

type ProgressBarProps = {
  fillPercentage: number
  fillColor: string
  backgroundColor: string
  borderRadius: string
}

export function ProgressBar(props: ProgressBarProps): JSX.Element {
  return (
    <Box
      css={{
        height: '5px',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: props.backgroundColor,
      }}
    >
      <Box
        css={{
          height: '100%',
          width: `${props.fillPercentage}%`,
          backgroundColor: props.fillColor,
        }}
      />
    </Box>
  )
}
