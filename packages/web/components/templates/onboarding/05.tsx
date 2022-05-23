import React from 'react'
import OnboardingLayout2 from '../OnboardingLayout2'
import { Box } from '../../elements/LayoutPrimitives'
import { styled } from '../../tokens/stitches.config'

const StyledImage = styled('img', {
  position: 'relative',
  width: '100%',
  height: '100%',
  '@smDown': {
    width: '160%',
    height: 'auto',
  }
})

const OnboardingPage5 = () => {
  return (
    <OnboardingLayout2
      pageNumber={5}
      title="Highlight and share"
      subTitle="Information about creating and sharing highlights Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet."
      >
      <Box css={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        '@smDown': {
          width: '100%',
          height: 'auto',
        }
      }}>
        <StyledImage
          src='/static/images/onboarding/highlight-and-share.svg'
          alt="Highlight And Share"
        />
      </Box>
    </OnboardingLayout2>
  )
}

export default OnboardingPage5
