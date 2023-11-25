import { PageMetaData } from "../../components/patterns/PageMetaData"
import { ProfileLayout } from "../../components/templates/ProfileLayout"
import { EmailForgotPassword } from "../../components/templates/auth/EmailForgotPassword"
import { Toaster } from "react-hot-toast"

export default function ForgotPassword(): JSX.Element {
  return (
    <>
      <PageMetaData
        title="Reset your password - Omnivore"
        path="/auth-forgot-password"
      />
      <Toaster
        containerStyle={{
          top: '5rem',
        }}
      />
      <ProfileLayout>
        <EmailForgotPassword />
      </ProfileLayout>
      <div data-testid="auth-forgot-password-page-tag" />
    </>
  )
}
