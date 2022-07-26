import { PageMetaData } from '../components/patterns/PageMetaData'
import { ProfileLayout } from '../components/templates/ProfileLayout'
import { EmailResetPassword } from '../components/templates/EmailResetPassword'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import toast, { Toaster } from 'react-hot-toast'
import { showSuccessToast } from '../lib/toastHelpers'

export default function ForgotPassword(): JSX.Element {
  const router = useRouter()

  useEffect(() => {
    if (router && router.isReady && router.query.message === 'SUCCESS') {
      showSuccessToast('Reset password email sent')
      setTimeout(() => {
        window.location.href = '/email-login'
      }, 2000)
    }
  }, [router])


  return (
    <>
      <PageMetaData title="Reset your password - Omnivore" path="/email-reset-password" />
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <ProfileLayout>
        <EmailResetPassword />
      </ProfileLayout>
      <div data-testid="email-reset-password-page-tag" />
    </>
  )
}
