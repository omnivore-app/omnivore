import React from 'react'
import { OnboardingLayout } from '../OnboardingLayout'
import MobileInstallHelp from '../../elements/MobileInstallHelp'
import ExtensionsInstallHelp from '../../elements/ExtensionsInstallHelp'
import { Box } from '../../elements/LayoutPrimitives'
import { sendInstallInstructions } from '../../../lib/networking/queries/sendInstallInstructions'
import { Button } from '../../elements/Button'
import { showErrorToast, showSuccessToast } from '../../../lib/toastHelpers'

type OnboardingInstallInstructionsProps = {
  pageNumber: number
}

export const OnboardingInstallInstructions = (props: OnboardingInstallInstructionsProps) => {
  const onEmailInstructionsClick = async () => {
    const res = await sendInstallInstructions()
    if (res !== undefined) {
      showSuccessToast('Instructions Email Sent', { position: 'bottom-right' })
    }
    else {
      showErrorToast('Failed to send', { position: 'bottom-right' })
    }
  }

  return (
    <OnboardingLayout
      pageNumber={props.pageNumber}
      title="Save links to read later"
      subTitle="Save any link to your library using our apps and browser extensions"
      description='Install our apps and browser extensions'
      image={
        <img
          src='/static/images/onboarding/browser-extension.svg'
          alt="Browser Extension"
        />
      }
    >
      <Box css={{
        "@lgDown": {
          marginBottom: 100,
        }
      }}>
        <Box
          css={{
            margin: '27px 0',
            '@lg': {
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0px 3px 11px rgba(32, 31, 29, 0.04)',
            },
            backgroundColor: 'White',
          }}
        >
          <Box
            css={{
              '@lgDown': {
                boxShadow: '0px 3px 11px rgba(32, 31, 29, 0.04)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
              },
            }}
          >
            <MobileInstallHelp onboarding />
          </Box>
          <Box
            css={{
              '@lgDown': {
                boxShadow: '0px 3px 11px rgba(32, 31, 29, 0.04)',
                border: '1px solid rgba(0, 0, 0, 0.06)',
                marginTop: '8px',
              },
            }}
          >
            <ExtensionsInstallHelp onboarding />
          </Box>
        </Box>
        <Box
          css={{
            '@lg': {
              marginBottom: '20px',
            },
          }}
        >
          <Box
            onClick={onEmailInstructionsClick}
            css={{
              fontWeight: '400',
              fontSize: '14px',
              lineHeight: '17.5px',
              color: 'rgba(10, 8, 6, 0.8)',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            Email me instructions
          </Box>
        </Box>
      </Box>
    </OnboardingLayout>
  )
}

