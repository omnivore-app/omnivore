import Link from 'next/link'
import { Info } from 'phosphor-react'
import { Box } from '../elements/LayoutPrimitives'
import { theme } from '../tokens/stitches.config'
import { TooltipWrapped } from './Tooltip'

type InfoLinkProps = {
  href: string
}

const TooltipStyle = {
  backgroundColor: '#F9D354',
  color: '#0A0806',
}

export function InfoLink(props: InfoLinkProps): JSX.Element {
  return (
    <Box style={{ flex: '1', marginLeft: '9px' }}>
    <Link passHref href={props.href}>
      <a style={{ textDecoration: 'none' }}>
        <TooltipWrapped
          tooltipContent="Learn More"
          tooltipSide={'top'}
          style={TooltipStyle}
          arrowStyles={{ fill: '#F9D354' }}
        >
          <Info size={24} color={theme.colors.grayText.toString()} />
        </TooltipWrapped>
      </a>
    </Link>
  </Box>
  )
}
