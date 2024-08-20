/* eslint-disable @typescript-eslint/ban-types */
import { Span } from '@opentelemetry/api'
import { Context as ApolloContext } from 'apollo-server-core'
import DataLoader from 'dataloader'
import * as jwt from 'jsonwebtoken'
import { EntityManager } from 'typeorm'
import winston from 'winston'
import { ReadingProgressDataSource } from '../datasources/reading_progress_data_source'
import { Highlight } from '../entity/highlight'
import { Label } from '../entity/label'
import { LibraryItem } from '../entity/library_item'
import { PublicItem } from '../entity/public_item'
import { Recommendation } from '../entity/recommendation'
import { Subscription } from '../entity/subscription'
import { UploadFile } from '../entity/upload_file'
import { User } from '../entity/user'
import { PubsubClient } from '../pubsub'

export interface Claims {
  uid: string
  iat: number
  userRole?: string
  scope?: string // scope is used for api key like page:search
  exp?: number
  email?: string
  system?: boolean
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
  dataSources: {
    readingProgress: ReadingProgressDataSource
  }
  dataLoaders: {
    labels: DataLoader<string, Label[]>
    highlights: DataLoader<string, Highlight[]>
    recommendations: DataLoader<string, Recommendation[]>
    uploadFiles: DataLoader<string, UploadFile | undefined>
    libraryItems: DataLoader<string, LibraryItem | undefined>
    publicItems: DataLoader<string, PublicItem | undefined>
    subscriptions: DataLoader<string, Subscription | undefined>
    users: DataLoader<string, User | undefined>
    highlightLabels: DataLoader<string, Label[]>
  }
}

export type ResolverContext = ApolloContext<RequestContext>
