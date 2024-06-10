import { GraphQLClient } from 'graphql-request'
import { IncomingMessage } from 'http'
import { fetchEndpoint, gqlEndpoint } from '../appConfig'

declare type RequestCookies = {
  [key: string]: string
}

export type RequestContext = {
  req: IncomingMessage & {
    cookies: RequestCookies
  }
}

export function requestHeaders(): Record<string, string> {
  const authToken = window?.localStorage.getItem('authToken') || undefined
  const pendingAuthToken =
    window?.localStorage.getItem('pendingUserAuth') || undefined

  if (authToken) {
    return {
      'X-OmnivoreClient': 'web',
      authorization: authToken,
    }
  }

  if (pendingAuthToken) {
    return {
      'X-OmnivoreClient': 'web',
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

export function apiPoster(
  path: string,
  body: any,
  method = 'POST'
): Promise<Response> {
  const url = new URL(path, fetchEndpoint)
  return fetch(url.toString(), {
    method: method,
    credentials: 'include',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      ...requestHeaders(),
    },
    body: JSON.stringify(body),
  })
}

export function makePublicGqlFetcher(
  gql: string,
  variables?: unknown
): (query: string) => Promise<unknown> {
  return (query: string) => gqlFetcher(gql, variables, false)
}

// Partially apply gql variables to the request
// This avoids using an object for the swr cache key
export function makeGqlFetcher(
  gql: string,
  variables?: unknown
): (query: string) => Promise<unknown> {
  return (query: string) => gqlFetcher(gql, variables, true)
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
