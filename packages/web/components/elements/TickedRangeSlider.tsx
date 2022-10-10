import { Box, HStack } from './LayoutPrimitives'
import { styled, theme } from '../tokens/stitches.config'

type TickedRangeSliderProps = {
  ticks?: number
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const Tick = styled(Box, {
  background: theme.colors.grayBorderHover,
  width: 2,
  height: 8,
})

export function TickedRangeSlider({
  ticks = 8,
  min = 10,
  max = 28,
  step = 1,
  value,
  onChange,
}: TickedRangeSliderProps): JSX.Element {
  return (
    <Box css={{ zIndex: 2 }}>
      <input
        onChange={(e) => onChange(e.target.value as any)}
        value={value}
        type="range"
        min={min}
        max={max}
        step={step}
        className="slider"
      />
      <HStack
        distribution="between"
        css={{ position: 'relative', bottom: 12.2, left: 2, zIndex: -1 }}
      >
        {[...Array(ticks)].map((val, idx) => (
          <Tick key={`ticks-${idx}`} />
        ))}
      </HStack>
    </Box>
  )
}
