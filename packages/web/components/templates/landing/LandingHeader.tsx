import { Box, SpanBox } from '../../elements/LayoutPrimitives'
import { theme } from '../../tokens/stitches.config'
import { OmnivoreNameLogo } from '../../elements/images/OmnivoreNameLogo'

const containerStyles = {
  position: 'absolute',
  top: 0,
  left: 0,
  p: '0px 15px 0px 15px',
  height: '68px',
  minHeight: '68px',
  display: 'flex',
  alignItems: 'center',
  '@md': { width: '50%' },
  '@xsDown': { height: '48px' },
  justifyContent: 'space-between',
  width: '100%',
}

const linkStyles = {
  marginLeft: 'auto',
  verticalAlign: 'middle',
  cursor: 'pointer',
  lineHeight: '100%',
}

const textStyles = {
  pt: '5px',
  pr: '6px',
  fontSize: 24,
  lineHeight: '24px',
  fontWeight: 'normal'
}

export function LandingHeader(): JSX.Element {
  return (
    <Box css={containerStyles}>
      <OmnivoreNameLogo color={theme.colors.omnivoreGray.toString()} href='/login' />
      <Box css={linkStyles}>
        <Box>
          <a href="/login" style={{textDecoration: 'none', color: 'black'}}>
            <SpanBox css={textStyles}>Log in</SpanBox>
          </a>
        </Box>
      </Box>
    </Box>
  )
}
