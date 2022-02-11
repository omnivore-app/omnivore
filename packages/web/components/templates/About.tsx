import { HStack, VStack } from '../elements/LayoutPrimitives'
import { OmnivoreNameLogo } from '../elements/images/OmnivoreNameLogo'
import Image from 'next/image'
import { StyledText } from '../elements/StyledText'
import { Button } from '../elements/Button'
import { theme } from '../tokens/stitches.config'

export function About(): JSX.Element {
  return (
    <VStack css={{ width: '100%' }}>
      <HStack
        distribution="start"
        css={{ px: '$4', py: '0', bg: '#FFEA9F', width: '100%' }}
      >
        <VStack css={{ width: '20em', my: '$3' }}>
          <OmnivoreNameLogo color={theme.colors.omnivoreGray.toString()} />
          <StyledText style="subHeadline" css={{ color: 'black' }}>
            Everything you read. Safe, organized, and easy to share.
          </StyledText>

          <Button style="ctaPill">Get started</Button>
        </VStack>
        <VStack
          css={{
            position: 'relative',
            width: '100%',
            height: '224px',
            '@md': {
              height: '442px',
            },
          }}
        >
          <Image
            src="/static/images/about/header-illustration.png"
            alt="Illustration of Woman Reading"
            layout="fill"
            objectFit="cover"
            objectPosition="50% 50%"
          />
        </VStack>
      </HStack>
      <VStack alignment="center" distribution="center" css={{ width: '100%' }}>
        <StyledText
          style="body"
          css={{ color: 'black', fontSize: '$3', mb: '0', mt: '6em' }}
        >
          This is Omnivore
        </StyledText>
        <StyledText
          style="headline"
          css={{
            mt: '$1',
            mb: '2em',
            color: 'black',
            fontSize: '3em',
            maxWidth: '10em',
            textAlign: 'center',
          }}
        >
          Collect and share the best of the web
        </StyledText>
      </VStack>
      <AboutSection
        title="Simply reader-friendly."
        description="With a single click using Omnivore’s extension or mobile app, save any link you come across on the Internet. Your links are saved forever, so you will never lose anything. We also strip out the unnecessary content to give you a reader-friendly view of your saved pages."
        imageAltText="image of omnivore share extension"
        imageSource="/static/images/about/save-article.png"
        leadWithImage={false}
      />
      <AboutSection
        title="Make it your own."
        description="Curate your own personal collection of saved links and annotate these links with your thoughts. Omnivore lets you highlight any text you find inspiring and attach personal notes to these highlights."
        imageAltText="image of omnivore user library"
        imageSource="/static/images/about/library.png"
        leadWithImage
      />
      <AboutSection
        title="A better way to share."
        description="With Omnivore’s highlight and notes feature, you can share specific snippets from a link with your friends. Our share feature is integrated with top social media sites so sharing with your friends is just one click away."
        imageAltText="image of omnivore highlight and annotation"
        imageSource="/static/images/about/sharing.png"
        leadWithImage={false}
      />
      <AboutSection
        title="Discover new content."
        description="Follow friends and people you admire and see what they are reading. With our highlight and notes feature, you can read through the eyes of others and see what others have highlighted and commented."
        imageAltText="image of omnivore shared article feed"
        imageSource="/static/images/about/profile.png"
        leadWithImage
      />
    </VStack>
  )
}

type AboutSectionProps = {
  title: string
  description: string
  imageSource: string
  imageAltText: string
  leadWithImage: boolean
}

function AboutSection(props: AboutSectionProps): JSX.Element {
  return (
    <HStack
      alignment="center"
      distribution="center"
      css={{
        flexDirection: props.leadWithImage ? 'row-reverse' : 'row',
        width: '100%',
        gap: '$6',
        bg: props.leadWithImage ? '#FBFAF9' : '#FFFFFF',
      }}
    >
      <VStack
        alignment={props.leadWithImage ? 'start' : 'end'}
        css={{ width: '50%' }}
      >
        <StyledText
          style="headline"
          css={{ color: 'black', textAlign: 'center', maxWidth: '25em' }}
        >
          {props.title}
        </StyledText>
        <StyledText style="body" css={{ color: 'black', maxWidth: '25em' }}>
          {props.description}
        </StyledText>
      </VStack>
      <VStack css={{ width: '50%', height: '300px' }}>
        <VStack
          css={{
            position: 'relative',
            height: '224px',
            width: '100%',
          }}
        >
          <Image
            src={props.imageSource}
            alt={props.imageAltText}
            layout="fill"
            objectFit="contain"
            objectPosition={props.leadWithImage ? 'right 50%' : 'left 50%'}
          />
        </VStack>
      </VStack>
    </HStack>
  )
}
