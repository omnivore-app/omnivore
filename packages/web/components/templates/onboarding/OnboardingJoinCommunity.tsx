import React from 'react'
import { OnboardingLayout } from '../OnboardingLayout'
import { Box, HStack, VStack } from '../../elements/LayoutPrimitives'
import { styled } from '../../tokens/stitches.config'

const IconContainer = styled(Box, {width: '30%', justifyContent: 'center', display: 'flex'})
const Icon = styled('img', {width: 100})
const Row = styled(HStack, {
  width: '100%',
  padding: 30,
  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',

  '@smDown': {
    padding: 20,
  }
})
const Text = styled(Box, {
  width: '65%',
  alignSelf: 'center',
  color: '#0A0806CC',
  fontSize: 24,
  fontWeight: '700',
  '@smDown': {
    fontSize: 16,
  }
})
const Container = styled(Box, {
  width: 523,
  border: '1px solid #0000000F',
  background: 'white',

  '@smDown': {
    width: '95%',
  }
})

type OnboardingJoinCommunityProps = {
  pageNumber: number
}

export const OnboardingJoinCommunity = (props: OnboardingJoinCommunityProps) => {
  return (
    <OnboardingLayout
      pageNumber={props.pageNumber}
      title="Join our Community"
      subTitle='Omnivore is open source and open community, join us.'
      nextPage='/home'
      reduceSpace
      >
      <HStack distribution='center' alignment='center' css={{width: '100%', height: '100%'}}>
        <Container>
          <VStack>
            <Row distribution='between'>
              <IconContainer>
                <Icon css={{height: 60}} src='/static/images/onboarding/github.svg' alt="Github Logo" />
              </IconContainer>
              <Text>Star us on Github</Text>
            </Row>
            <Row distribution='between'>
              <IconContainer>
                <Icon src='/static/images/onboarding/discord.svg' alt="Discrod Logo" />
              </IconContainer>
              <Text>Join us on Discord</Text>
            </Row>
            <Row distribution='between'>
              <IconContainer>
                <Icon css={{width: 74, height: 67}} src='/static/images/onboarding/producthunt.svg' alt="ProductHunt Logo" />
              </IconContainer>
              <Text>Like us on Product Hunt</Text>
            </Row>
          </VStack>
        </Container>
      </HStack>
    </OnboardingLayout>
  )
}

