import { styled } from '../tokens/stitches.config'

export const FormInput = styled('input', {
  border: 'none',
  width: '100%',
  bg: 'transparent',
  fontSize: '16px',
  fontFamily: 'inter',
  fontWeight: 'normal',
  lineHeight: '1.35',
  color: '$grayTextContrast',
  '&:focus': {
    outline: 'none',
  },
})

export const BorderedFormInput = styled(FormInput, {
  borderRadius: '6px',
  border: `1px solid $grayBorder`,
  p: '$3',
})
