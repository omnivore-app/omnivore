export type AuthProvider = 'GOOGLE' | 'APPLE' | 'EMAIL'

export interface DecodeTokenResult {
  errorCode?: 401 | 500
  email?: string
  sourceUserId?: string
  name?: string
}

export interface PendingUserTokenPayload {
  email: string
  sourceUserId: string
  provider: AuthProvider
  name: string
  username: string
}

export interface GoogleWebAuthResponse {
  redirectURL: string
  authToken?: string
  pendingUserAuth?: string
}

export interface OAuthUserInfo {
  email: string
  sourceUserId: string
  name?: string
  pictureUrl?: string
}

// Type guard for PendingUserTokenPayload
export function isPendingUserTokenPayload(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object: any,
): object is PendingUserTokenPayload {
  return (
    'email' in object &&
    'sourceUserId' in object &&
    'provider' in object &&
    'name' in object &&
    'username' in object
  )
}
