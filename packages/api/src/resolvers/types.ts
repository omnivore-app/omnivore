/* eslint-disable @typescript-eslint/ban-types */
import { Span } from '@opentelemetry/api'
import { Context as ApolloContext } from 'apollo-server-core'
import * as jwt from 'jsonwebtoken'
import { EntityManager } from 'typeorm'
import winston from 'winston'
import { PubsubClient } from '../datalayer/pubsub'

export interface Claims {
  uid: string
  iat: number
  userRole?: string
  scope?: string // scope is used for api key like page:search
  exp?: number
  email?: string
}

export type ClaimsToSet = {
  uid: string
  userRole?: string | null
}

export interface RequestContext {
  log: winston.Logger
  claims: Claims | undefined
  pubsub: PubsubClient
  setAuth: (claims: ClaimsToSet, secret?: string) => Promise<void>
  clearAuth: () => void
  setClaims: (em: EntityManager, uuid?: string | undefined) => Promise<void>
  signToken: (
    arg1: string | object | Buffer,
    arg2: jwt.Secret
  ) => Promise<unknown>
  authTrx: <TResult>(
    cb: (em: EntityManager) => TResult,
    userRole?: string
  ) => Promise<TResult>
  tracingSpan: Span
}

export type ResolverContext = ApolloContext<RequestContext>

export type WithDataSourcesContext = {
  uid: string
} & ResolverContext
