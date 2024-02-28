import { GraphQLClient } from 'graphql-request'
import { gqlEndpoint, fetchEndpoint } from '../appConfig'
import { IncomingMessage } from 'http'

declare type RequestCookies = {
  [key: string]: string
}

export type RequestContext = {
  req: IncomingMessage & {
    cookies: RequestCookies
  }
}

type RequestHeaders = {
  authorization?: string
  pendingUserAuth?: string
}

function requestHeaders(): RequestHeaders {
  const authToken = window?.localStorage.getItem('authToken') || undefined
  const pendingAuthToken =
    window?.localStorage.getItem('pendingUserAuth') || undefined

  if (authToken) {
    return {
      authorization: authToken,
    }
  }

  if (pendingAuthToken) {
    return {
      pendingUserAuth: pendingAuthToken,
    }
  }

  return {}
}

export function publicGqlFetcher(
  query: string,
  variables?: unknown
): Promise<unknown> {
  return gqlFetcher(query, variables, false)
}

export function gqlFetcher(
  query: string,
  variables?: unknown,
  requiresAuth = true
): Promise<unknown> {
  if (requiresAuth) {
    verifyAuth()
  }

  const graphQLClient = new GraphQLClient(gqlEndpoint, {
    credentials: 'include',
    mode: 'cors',
  })
  return graphQLClient.request(query, variables, requestHeaders())
}

export function apiFetcher(path: string): Promise<unknown> {
  const url = new URL(path, fetchEndpoint)
  return fetch(url.toString(), {
    headers: requestHeaders(),
    credentials: 'include',
    mode: 'cors',
  }).then((result) => {
    return result.json()
  })
}

export function makePublicGqlFetcher(
  variables?: unknown
): (query: string) => Promise<unknown> {
  return (query: string) => gqlFetcher(query, variables, false)
}

// Partially apply gql variables to the request
// This avoids using an object for the swr cache key
export function makeGqlFetcher(
  variables?: unknown
): (query: string) => Promise<unknown> {
  return (query: string) => gqlFetcher(query, variables, true)
}

export function ssrFetcher(
  context: RequestContext,
  query: string,
  variables?: unknown,
  requiresAuth = true
): Promise<unknown> {
  const graphQLClient = new GraphQLClient(gqlEndpoint, {
    credentials: 'include',
    mode: 'cors',
  })
  const token =
    context.req.cookies['auth'] ||
    context.req.cookies['authToken'] ||
    context.req.headers['authorization']
  if (requiresAuth && !token) {
    throw Error('No token found on request for SSR')
  }

  return graphQLClient.request(
    query,
    variables,
    requiresAuth
      ? {
          authorization: token as string,
        }
      : {}
  )
}

async function verifyAuth(): Promise<void> {
  if (typeof window === 'undefined') {
    return
  }

  if (window.localStorage.getItem('authVerified')) {
    return
  }

  try {
    const response = await fetch(`${fetchEndpoint}/auth/verify`, {
      credentials: 'include',
      mode: 'cors',
      headers: requestHeaders(),
    })

    if (response.status !== 200) {
      return
    }

    const { authStatus } = await response.json()

    switch (authStatus) {
      case 'AUTHENTICATED':
        window.localStorage.setItem('authVerified', 'true')
        break
      case 'PENDING_USER':
        if (window.location.pathname !== '/confirm-profile') {
          window.location.href = '/confirm-profile'
        }
        break
      case 'NOT_AUTHENTICATED':
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?errorCodes=AUTH_FAILED'
        }
    }
  } catch {
    return
  }
}
