import Link from 'next/link'
import { Box, VStack } from '../elements/LayoutPrimitives'
import { StyledText } from '../elements/StyledText'
import { expandWidthAnim } from './../tokens/cssKeyframes'

type HeaderNavLinkProps = {
  isActive: boolean
  href: string
  text: string
}

export function HeaderNavLink(props: HeaderNavLinkProps): JSX.Element {
  return (
    <Link passHref href={props.href} style={{ textDecoration: 'none' }}>
      <VStack
        alignment="center"
        distribution="center"
        css={{
          cursor: 'pointer',
          px: '$3',
          color: 'inherit',
          textDecoration: 'inherit',
          fontFamily: 'inherit',
          fontSize: '100%',
        }}
      >
        <StyledText style="navLink">{props.text}</StyledText>
        <Box
          css={{
            width: '100%',
            bg: 'rgb(255, 210, 52)',
            height: '2px',
            opacity: props.isActive ? 1 : 0,
            display: props.isActive ? 'unset' : 'none',
            mt: '4px',
            animation: `${expandWidthAnim('0%', '100%')} 0.2s ease-out`,
            '&:hover': {
              opacity: props.isActive ? 0.7 : 0,
            },
          }}
        />
      </VStack>
    </Link>
  )
}
