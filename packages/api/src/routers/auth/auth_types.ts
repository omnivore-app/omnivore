/* eslint-disable @typescript-eslint/no-explicit-any */
export type JsonResponsePayload = {
  statusCode: number
  json: any
}

export type DecodeTokenResult = {
  errorCode?: 401 | 500
  email?: string
  sourceUserId?: string
  name?: string
}

export type AuthProvider = 'APPLE' | 'GOOGLE' | 'EMAIL'

export type UserProfile = {
  username: string
  name: string
  bio?: string
}

export type PendingUserTokenPayload = {
  email: string
  sourceUserId: string
  provider: AuthProvider
  name: string
  username: string
}

// Type guard for PendingUserTokenPayload
export function isPendingUserTokenPayload(
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  object: any
): object is PendingUserTokenPayload {
  return (
    'email' in object &&
    'sourceUserId' in object &&
    'provider' in object &&
    'name' in object &&
    'username' in object
  )
}

export type IntegrationTokenPayload = {
  uid: string
  token: string
}
