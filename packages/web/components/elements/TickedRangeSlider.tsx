import { Box, HStack, SpanBox } from './LayoutPrimitives'
import { styled } from '../tokens/stitches.config'
import { Root as Slider, Thumb, Track } from '@radix-ui/react-slider'

type TickedRangeSliderProps = {
  ticks?: number
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const StyledSlider = styled(Slider, {
  display: 'flex',
  alignItems: 'center',

  '.SliderTrack': {
    display: 'flex',
    justifyContent: 'center',
    margin: '0px',
    height: '8px',
    width: '225px',
    borderRadius: '10px',
    backgroundColor: '$thTextSubtle2',
  },
  '.SliderThumb': {
    display: 'block',
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    border: '2px solid $thTextSubtle2',
    backgroundColor: '#FFD234',
    boxShadow: '0px 0px 20px rgba(19, 56, 77, 0.2)',
  },
})

export function TickedRangeSlider({
  min = 10,
  max = 28,
  step = 1,
  value,
  onChange,
}: TickedRangeSliderProps): JSX.Element {
  return (
    <HStack
      alignment="center"
      css={{
        width: '225px',
        height: '20px',
        position: 'relative',
      }}
    >
      <StyledSlider
        max={max}
        min={min}
        step={step}
        value={[value]}
        onValueChange={(value) => {
          if (value.length) {
            onChange(value[0])
          }
        }}
      >
        <Track className="SliderTrack">
          <Box css={{ bg: '#CECECE', width: '2.5px', height: '100%' }} />
        </Track>
        <Thumb className="SliderThumb" />
      </StyledSlider>
    </HStack>
  )
}
