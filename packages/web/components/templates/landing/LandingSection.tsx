import { HStack, VStack, Box } from '../../elements/LayoutPrimitives'

type LandingSectionProps = {
  titleText: string
  descriptionText: React.ReactElement
  icon?: React.ReactElement
  image: React.ReactElement
}

const titleTextStyles = {
  fontWeight: '700',
  color: '#3D3D3D',
  lineHeight: 1.25,
  '@mdDown': {
    fontSize: 24,
  },
  '@md': {
    fontSize: '$5',
  },
  '@xl': {
    fontSize: 45,
  },
}

const imageContainerStyles = {
  display: 'flex',
  width: '49%',
  alignSelf: 'center',
  justifyContent: 'center',
  '@md': {
    marginBottom: '60px',
  },
  '@mdDown': {
    width: '100%',
  },
}

const layoutStyles = {
  width: '49%',
  alignSelf: 'start',
  '@mdDown': {
    width: '100%',
    paddingTop: '30px',
  },
  paddingLeft: '30px',
  paddingRight: '30px',
  paddingBottom: '30px',
}

export function LandingSection(props: LandingSectionProps): JSX.Element {
  return (
    <HStack
      css={{
        width: '100%',
        flexWrap: 'wrap',
        flexDirection: 'row-reverse',
        marginBottom: 20,
        '@mdDown': {
          width: '100%',
        },
      }}
    >
      <VStack distribution="center" alignment={'center'} css={layoutStyles}>
        <Box css={titleTextStyles}>{props.titleText}</Box>
        <Box
          css={{
            color: 'rgb(125, 125, 125)',
          }}
        >
          {props.descriptionText}
        </Box>
      </VStack>
      <Box css={imageContainerStyles}>{props.image}</Box>
    </HStack>
  )
}
