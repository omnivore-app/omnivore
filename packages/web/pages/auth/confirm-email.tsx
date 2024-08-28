import { useRouter } from 'next/router'
import { HStack, VStack } from '../../components/elements/LayoutPrimitives'
import { PageMetaData } from '../../components/patterns/PageMetaData'
import { useEffect, useState } from 'react'
import { parseErrorCodes } from '../../lib/queryParamParser'
import { StyledText } from '../../components/elements/StyledText'
import { Button } from '../../components/elements/Button'
import { AuthLayout } from '../../components/templates/AuthLayout'

export default function ConfirmEmailPage(): JSX.Element {
  const router = useRouter()

  return (
    <AuthLayout>
      <PageMetaData title="Confirm Email" path="/auth/confirm-email" />
      <VStack
        alignment="center"
        css={{
          padding: '20px',
          minWidth: '340px',
          width: '70vw',
          maxWidth: '576px',
          borderRadius: '8px',
          background: '#343434',
          border: '1px solid #6A6968',
          boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.15)',
        }}
      >
        <StyledText style="subHeadline" css={{ color: '#D9D9D9' }}>
          Verification error
        </StyledText>

        <StyledText style="body" css={{ color: '#D9D9D9' }}>
          The verification code supplied is invalid or has expired. Please login
          with your email and password again to generate a new verification
          email. Verifications can only be used once, and expire after five
          minutes.
        </StyledText>

        <HStack
          alignment="center"
          distribution="center"
          css={{
            gap: '10px',
            width: '100%',
            height: '80px',
          }}
        >
          <Button
            type="submit"
            style="ctaBlue"
            css={{
              padding: '10px 50px',
            }}
            onClick={(event) => {
              router.push(`/auth/email-login`)
            }}
          >
            Login
          </Button>
        </HStack>
      </VStack>
    </AuthLayout>
  )
}
