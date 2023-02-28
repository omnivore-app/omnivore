import { Box, HStack, SpanBox } from './LayoutPrimitives'
import { styled } from '../tokens/stitches.config'
import { Root as Slider, Thumb, Track, Range } from '@radix-ui/react-slider'

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
    margin: '0px',
    height: '8px',
    width: '225px',
    borderRadius: '10px',
    backgroundColor: '#F2F2F2',
  },
  '.SliderThumb': {
    display: 'block',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '4px solid white',
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
        <Track className="SliderTrack" />
        <Thumb className="SliderThumb" />
      </StyledSlider>
    </HStack>
  )
}
