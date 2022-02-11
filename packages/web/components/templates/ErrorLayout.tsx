import {
  Box,
  MediumBreakpointBox,
  VStack,
  HStack,
} from '../elements/LayoutPrimitives'
import Image from 'next/image'
import { OmnivoreNameLogo } from '../elements/images/OmnivoreNameLogo'
import { StyledText } from '../elements/StyledText'
import Link from 'next/link'
import { theme } from '../tokens/stitches.config'

type ErrorPageStatusCode = 404 | 500

type ErrorLayoutProps = {
  statusCode: ErrorPageStatusCode
}

export function ErrorLayout(props: ErrorLayoutProps): JSX.Element {
  return (
    <Box css={{ height: '100%' }}>
      <MediumBreakpointBox
        smallerLayoutNode={<MobileErrorLayout {...props} />}
        largerLayoutNode={<MediumErrorLayout {...props} />}
      />
    </Box>
  )
}

function MobileErrorLayout(props: ErrorLayoutProps) {
  return (
    <VStack css={{ overflow: 'scroll' }}>
      <HStack
        distribution="center"
        css={{
          maxHeight: '180px',
          width: '100%',
        }}
      >
        <OmnivoreIllustration />
      </HStack>
      <VStack
        alignment="center"
        distribution="center"
        css={{
          bg: '$yellow5',
          width: '100%',
          flexGrow: 1,
        }}
      >
        <StyledText>{props.statusCode}</StyledText>
      </VStack>
    </VStack>
  )
}

function MediumErrorLayout(props: ErrorLayoutProps) {
  return (
    <Box
      css={{
        display: 'grid',
        gridTemplateColumns: '1fr 3fr',
        bg: '$omnivoreYellow',
        height: '100%',
      }}
    >
      <VStack
        alignment="start"
        distribution="start"
        css={{ height: '100%', m: '$2', '@md': { m: '$3' } }}
      >
        <Box>
          <Link passHref href="/">
            <a style={{ textDecoration: 'none' }}>
            <OmnivoreNameLogo color={theme.colors.omnivoreGray.toString()} />
            </a>
          </Link>
        </Box>
        <StyledText>{props.statusCode}</StyledText>
      </VStack>
      <VStack alignment="center" distribution="center">
        <OmnivoreIllustration isLargeLayout={true} />
      </VStack>
    </Box>
  )
}

type OmnivoreIllustrationProps = {
  isLargeLayout?: boolean
}

function OmnivoreIllustration({ isLargeLayout }: OmnivoreIllustrationProps) {
  return (
    <Image
      src={`/static/images/landing-illustration${
        isLargeLayout ? '.png' : '-mobile.svg'
      }`}
      alt="Illustration of Woman Reading"
      width={isLargeLayout ? 1280 : 375}
      height={isLargeLayout ? 1164 : 230}
    />
  )
}
