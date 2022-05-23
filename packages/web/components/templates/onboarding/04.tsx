import React from 'react'
import OnboardingLayout2 from '../OnboardingLayout2'
import { Box } from '../../elements/LayoutPrimitives'
import { styled } from '../../tokens/stitches.config'

const StyledImage = styled('img', {
  position: 'relative',
})

const OnboardingPage4 = () => {
  return (
    <OnboardingLayout2
      pageNumber={4}
      title="Organize all your content"
      subTitle="Information about archiving and tagging
      Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet."
    >
      <Box css={{width: '100%', height: '100%'}}>
        <StyledImage
          src='/static/images/onboarding/organize-content.svg'
          alt="Organize Content Desktop"
          css={{
            width: '100%',
            height: '500px',
            '@smDown': {
              display: 'none',
            },
            '@lg': {
              height: '75%',
            },
            '@xl': {
              width: 'auto',
              height: '95%',
            }
          }}
        />
        <StyledImage
          src='/static/images/onboarding/organize-content-mobile.svg'
          alt="Organize Content Mobile"
          css={{
            mt: 10,
            right: '1.6vh',
            objectFit: 'contain',
            width: '100%',
            '@sm': {
              display: 'none',
            }
          }}
        />
      </Box>
    </OnboardingLayout2>
  )
}

export default OnboardingPage4
