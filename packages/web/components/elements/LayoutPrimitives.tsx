import { styled } from '../tokens/stitches.config'
import { Root as RadixSeparator } from '@radix-ui/react-separator'
import type { ReactNode } from 'react'

const stackVariants = {
  alignment: {
    start: { alignItems: 'flex-start' },
    center: { alignItems: 'center' },
    end: { alignItems: 'end' },
  },
  distribution: {
    around: { justifyContent: 'space-around' },
    between: { justifyContent: 'space-between' },
    evenly: { justifyContent: 'space-evenly' },
    start: { justifyContent: 'flex-start' },
    center: { justifyContent: 'center' },
    end: { justifyContent: 'flex-end' },
  },
}

export const Box = styled('div', {})

export const SpanBox = styled('span', {})

export const StyledLink = styled('a', {})

export const Blockquote = styled('blockquote', {})

export const HStack = styled(Box, {
  display: 'flex',
  flexDirection: 'row',
  variants: stackVariants,
  defaultVariants: {
    alignment: 'start',
    distribution: 'around',
  },
})

export const VStack = styled(Box, {
  display: 'flex',
  flexDirection: 'column',
  variants: stackVariants,
  defaultVariants: {
    alignment: 'start',
    distribution: 'around',
  },
})

export const Separator = styled(RadixSeparator, {
  backgroundColor: '$grayLine',
  '&[data-orientation=horizontal]': { height: 1, width: '100%' },
  '&[data-orientation=vertical]': { height: '100%', width: 1 },
})

type MediumBreakpointBoxProps = {
  smallerLayoutNode: ReactNode
  largerLayoutNode: ReactNode
}

export function MediumBreakpointBox(
  props: MediumBreakpointBoxProps
): JSX.Element {
  return (
    <>
      <Box
        css={{
          display: 'none',
          '@md': { display: 'block' },
        }}
      >
        {props.largerLayoutNode}
      </Box>

      <Box
        css={{
          display: 'block',
          '@md': { display: 'none' },
        }}
      >
        {props.smallerLayoutNode}
      </Box>
    </>
  )
}
