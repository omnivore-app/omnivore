import React, { ReactNode } from 'react'
import { PageMetaData } from '../patterns/PageMetaData'
import { VStack, HStack, Box } from '../elements/LayoutPrimitives'
import { OmnivoreNameLogo } from '../elements/images/OmnivoreNameLogo'
import { StyledText } from '../elements/StyledText'
import { Button } from '../elements/Button'
import Link from 'next/link'

const TOTAL_ONBOARDING_PAGES = 6

type OnboardingLayoutProps = {
  pageNumber: number
  title: string
  subTitle: string
  description?: string
  children: ReactNode
  image?: ReactNode
  nextPage?: string,
  reduceSpace?: boolean,
}

export const OnboardingLayout = ({
  pageNumber,
  title,
  subTitle,
  description,
  image,
  children,
  nextPage,
  reduceSpace
}: OnboardingLayoutProps) => {
  const NextButton = () => (
    <Link href={nextPage ? nextPage : `/onboarding/0${pageNumber+1}`}>
      <Button
        style="ctaDarkYellow"
        css={{ 
          width: '111px',
          height: '44px',
          color: 'rgba(10, 8, 6, 0.8)',
          fontWeight: 600,
          fontSize: '16px',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        as="a"
        href={nextPage ? nextPage : `/onboarding/0${pageNumber+1}`}
      >
        Next
      </Button>
    </Link>
  )

  return (
    <>
      <PageMetaData
        path={`/onboarding/0${pageNumber}`}
        title={`Onboarding - ${pageNumber}`}
      />
      <Box
        css={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          minHeight: '100vh',
          '@lgDown': {
            gridTemplateRows: reduceSpace ? 0 : 'initial',
          },
          '@lg': {
            gridTemplateColumns: '1fr 2fr',
          },
        }}
      >
        <VStack
          css={{
            background: '#FFFFFF',
            padding: '21px 19px 0 19px',
            position: 'relative',
            '@lg': {
              padding: '116px 32px 14px 48px',
            },
          }}
          distribution="between"
        >
          <Box
            css={{
              backgroundColor: '#FFD234',
              width: `${Math.floor(
                (pageNumber * 100) / TOTAL_ONBOARDING_PAGES
              )}%`,
              height: '4px',
              position: 'absolute',
              top: '0',
              left: '0',
              '@lg': {
                top: '$1',
              },
              borderRadius: '8px',
            }}
          />
          <Box
            css={{
              width: '100%',
              '@sm': { textAlign: 'center' },
              '@lg': { textAlign: 'left' },
            }}
          >
            <HStack
              distribution="start"
              css={{
                justifyContent: 'center',
                '@lg': { justifyContent: 'flex-start' },
              }}
              alignment="center"
            >
              <OmnivoreNameLogo />
              <StyledText
                style="logoTitle"
                css={{ color: '#0A080666', paddingLeft: '9px', fontSize: 15 }}
              >
                Omnivore
              </StyledText>
            </HStack>
            <Box
              css={{
                marginTop: '24px',
                fontWeight: '700',
                fontSize: 32,
                '@lgDown': {
                  marginTop: '5px',
                  fontSize: 28,
                },
                lineHeight: '125%',
                color: 'rgba(10, 8, 6, 0.8)',
              }}
            >
              {title}
            </Box>
            <Box
              css={{
                marginTop: '24px',
                fontWeight: '400',
                fontSize: 16,
                lineHeight: '125%',
                color: 'rgba(10, 8, 6, 0.8)',
              }}
            >
              {subTitle}
            </Box>
            {image && (
              <Box
                css={{
                  height: '295px',
                  position: 'relative',
                  marginTop: '24px',
                  display: 'none',
                  '@lg': { display: 'block' },
                }}
              >
                {image}
              </Box>
            )}
          </Box>
          <HStack
            distribution="end"
            css={{
              width: '100%',
              justifyContent: 'end',
              '@lgDown': { display: 'none' },
            }}
          >
            <Button
              style="ctaSecondary"
              css={{
                width: '111px',
                height: '44px',
                color: 'rgba(10, 8, 6, 0.8)',
                fontWeight: 600,
                fontSize: '16px',
              }}
            >
              Skip
            </Button>
            <NextButton />
          </HStack>
        </VStack>
        <VStack
          css={{
            background: 'White',
            '@sm': { alignItems: 'center' },
            padding: '2vw 2vw 0 2vw',
            '@lg': {
              background: '#F5F5F4',
              padding: '30px 71px 0 30px',
              alignItems: 'flex-start',
            },
            '@xl': {
              padding: '58px 71px 0 58px',
            },
          }}
          distribution="start"
        >
          {description && (
            <Box
              css={{
                position: 'relative',
                fontWeight: 600,
                fontSize: 16,
                color: 'rgba(10, 8, 6, 0.8)',
                '@lgDown': { paddingLeft: '11px' },
              }}
            >
              {description}
            </Box>
          )}
          {children}
        </VStack>
      </Box>
      <HStack
        css={{
          position: 'fixed',
          bottom: '0',
          width: '100%',
          padding: '20px',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',

          '@lg': { display: 'none' },
        }}
      >
        <Button
          style="ctaSecondary"
          css={{
            width: '111px',
            height: '44px',
            textAlign: 'left',
            color: 'rgba(10, 8, 6, 0.8)',
            fontWeight: 600,
            fontSize: '16px',
          }}
        >
          Skip
        </Button>
        <NextButton />
      </HStack>
    </>
  )
}

