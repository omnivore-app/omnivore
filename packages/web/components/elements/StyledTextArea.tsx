import { styled } from '../tokens/stitches.config'

export const StyledTextArea = styled('textarea', {
  outline: 'none',
  border: 'none',
  overflow: 'auto',
  resize: 'none',
  background: 'unset',
  color: '$grayText',
  fontSize: '$3',
  fontFamily: 'inter',
  lineHeight: '1.35',
  '&::placeholder': {
    opacity: 0.7,
  },
})

export const BorderedTextArea = styled(StyledTextArea, {
  borderRadius: '6px',
  border: `1px solid $grayBorder`,
  p: '$3',
  fontSize: '$1',
})
