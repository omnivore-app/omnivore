import { styled } from '../../../tokens/stitches.config'

export const ToolbarIconButton = styled('div', {
  paddingLeft: '10px',
  paddingTop: '5px',
  height: '43px',
  width: '44px',
  '&:hover': {
    background: '$thBackground'
  },
})

export const ToolbarButton = styled('button', {
  fontFamily: 'Inter',
  fontWeight: 'normal',
  color: '$grayTextContrast',
  width: '26px',
  height: '26px',
  padding: '5px 3px 5px 3px',
  background: 'none',
  outline: 'inherit',
  border: '1px solid black',
  backgroundColor: '$thBackground5',
  '&:hover': {
    background: '$thBackground'
  },
})

export const PageInput = styled('input', {
  width: '40px',
  height: '26px',
  padding: '4px',
  textAlign: 'center',
  border: '1px solid black',
  borderLeft: '0px',
  borderRight: '1px',
  backgroundColor: '$thBackground5',
  '@media only screen and (min-device-width: 20em) and (max-device-width: 30em)': {
    paddingLeft: '1px',
    paddingRight: '1px',
    width: '20px',
    border: '0px',
  }
})

export const SearchInput = styled('input', {
  height: '26px',
  width: '330px',
  padding: '4px',
  border: '1px solid black',
  borderRadius: '4px',
  paddingRight: '60px',
  marginRight: '5px',
  backgroundColor: '$thFormInput',
  '&:focus': {
    outline: 'none',
  }
})
