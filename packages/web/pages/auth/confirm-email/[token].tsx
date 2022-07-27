import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'

import { HStack } from '../../../components/elements/LayoutPrimitives'
import { fetchEndpoint } from '../../../lib/appConfig'
import { LoadingView } from '../../../components/patterns/LoadingView'
import { PageMetaData } from '../../../components/patterns/PageMetaData'
import { ProfileLayout } from '../../../components/templates/ProfileLayout'

export default function ConfirmEmail(): JSX.Element {
  const authForm = useRef<HTMLFormElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!router || !router.isReady || !authForm.current) {
      return
    }

    authForm.current?.submit()
  }, [router, authForm])

  return (
    <>
      <PageMetaData title="Confirm Email - Omnivore" path="/confirm-email" />
      <ProfileLayout>
        <form
          ref={authForm}
          method="POST"
          action={`${fetchEndpoint}/auth/confirm-email`}
        >
          <input type="hidden" name="token" value={router.query.token} />
        </form>
        <HStack css={{ bg: '$grayBg', padding: '24px', width: '100%', height: '100%'}}>
          <LoadingView />
        </HStack>
      </ProfileLayout>
      <div data-testid="confirm-email-page-tag" />
    </>
  )
}
