/* eslint-disable @typescript-eslint/ban-types */
import { Context as ApolloContext } from 'apollo-server-core'
import winston from 'winston'
import Knex from 'knex'
import UserModel from '../datalayer/user'
import ArticleModel from '../datalayer/article'
import UserArticleModel from '../datalayer/links'
import UserFriendModel from '../datalayer/user_friends'
import UserPersonalizationModel from '../datalayer/user_personalization'
import ArticleSavingRequestModel from '../datalayer/article_saving_request'
import UploadFileDataModel from '../datalayer/upload_files'
import * as jwt from 'jsonwebtoken'
import { Span } from '@opentelemetry/api'
import HighlightModel from '../datalayer/highlight'
import ReactionModel from '../datalayer/reaction'
import { PubsubClient } from '../datalayer/pubsub'
import ReminderModel from '../datalayer/reminders'

export interface Claims {
  uid: string
  iat: number
  userRole?: string
  scope?: string // scope is used for api key like page:search
}

export type ClaimsToSet = {
  uid: string
  userRole?: string | null
}

export type DataModels = {
  user: UserModel
  article: ArticleModel
  userArticle: UserArticleModel
  userFriends: UserFriendModel
  userPersonalization: UserPersonalizationModel
  articleSavingRequest: ArticleSavingRequestModel
  uploadFile: UploadFileDataModel
  highlight: HighlightModel
  reaction: ReactionModel
  reminder: ReminderModel
}

export interface RequestContext {
  log: winston.Logger
  claims: Claims | undefined
  kx: Knex
  pubsub: PubsubClient
  models: DataModels
  setAuth: (claims: ClaimsToSet, secret?: string) => Promise<void>
  clearAuth: () => void
  setClaims: (tx: Knex.Transaction, uuid?: string | undefined) => Promise<void>
  // eslint-disable-next-line @typescript-eslint/ban-types
  signToken: (
    arg1: string | object | Buffer,
    arg2: jwt.Secret
  ) => Promise<unknown>
  authTrx: <TResult>(
    cb: (tx: Knex.Transaction) => TResult,
    userRole?: string
  ) => Promise<TResult>
  tracingSpan: Span
}

export type ResolverContext = ApolloContext<RequestContext>

export type WithDataSourcesContext = {
  uid: string
} & ResolverContext
