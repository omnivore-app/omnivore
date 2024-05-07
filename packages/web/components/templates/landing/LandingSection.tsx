import { HStack, VStack, Box } from '../../elements/LayoutPrimitives'

export interface LandingSectionProps {
  titleText: string
  descriptionText: React.ReactElement | string | number
  icon?: React.ReactElement
  image: React.ReactElement
  imagePosition?: 'left' | 'right'
}

export function LandingSection(props: LandingSectionProps): JSX.Element {
  return (
    <HStack
      css={{
        width: '100%',
        flexWrap: 'wrap',
        flexDirection:
          (props?.imagePosition ?? 'left') === 'left' ? 'row-reverse' : 'row',
        marginBottom: 20,
        '@mdDown': {
          width: '100%',
        },
      }}
    >
      <VStack
        distribution="center"
        alignment="center"
        css={{
          width: '49%',
          alignSelf: 'start',
          '@mdDown': {
            width: '100%',
            paddingTop: '30px',
          },
          paddingLeft: '30px',
          paddingRight: '30px',
          paddingBottom: '30px',
        }}
      >
        <Box
          as="h2"
          css={{
            fontWeight: '700',
            color: '#FFFFFF',
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
          }}
        >
          {props.titleText}
        </Box>
        <Box
          as="p"
          css={{
            color: '#898989',
          }}
        >
          {props.descriptionText}
        </Box>
      </VStack>
      <Box
        css={{
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
        }}
      >
        {props.image}
      </Box>
    </HStack>
  )
}
