// TypeScript declarations for Google Sign-In (GSI) library
// https://developers.google.com/identity/gsi/web/reference/js-reference

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: GoogleIdConfiguration) => void
        prompt: () => void
        renderButton: (
          parent: HTMLElement,
          options: GoogleSignInButtonConfiguration
        ) => void
      }
    }
  }
}

interface GoogleIdConfiguration {
  client_id: string
  callback?: (response: GoogleCredentialResponse) => void
  login_uri?: string
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
  context?: 'signin' | 'signup' | 'use'
  ux_mode?: 'popup' | 'redirect'
}

interface GoogleCredentialResponse {
  credential: string
  select_by: string
}

interface GoogleSignInButtonConfiguration {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: string | number
  locale?: string
}
