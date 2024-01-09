export type Maybe<T> = T | null
export type Exact<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
/** All built-in and custom scalars, mapped to their actual values */
export interface Scalars {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  Date: any
}

export enum SortOrder {
  Ascending = 'ASCENDING',
  Descending = 'DESCENDING',
}

export enum ReactionType {
  Like = 'LIKE',
  Heart = 'HEART',
  Smile = 'SMILE',
  Hushed = 'HUSHED',
  Crying = 'CRYING',
  Pout = 'POUT',
}

export enum SortBy {
  UpdatedTime = 'UPDATED_TIME',
  Score = 'SCORE',
  SavedAt = 'SAVED_AT',
  PublishedAt = 'PUBLISHED_AT',
}

export enum ContentReader {
  Web = 'WEB',
  Pdf = 'PDF',
  Epub = 'EPUB',
}

export interface SortParams {
  order?: Maybe<SortOrder>
  by: SortBy
}

export interface PageInfo {
  __typename?: 'PageInfo'
  hasNextPage: Scalars['Boolean']
  hasPreviousPage: Scalars['Boolean']
  startCursor?: Maybe<Scalars['String']>
  endCursor?: Maybe<Scalars['String']>
  totalCount?: Maybe<Scalars['Int']>
}

export interface ArticleEdge {
  __typename?: 'ArticleEdge'
  cursor: Scalars['String']
  node: Article
}

export interface FeedArticleEdge {
  __typename?: 'FeedArticleEdge'
  cursor: Scalars['String']
  node: FeedArticle
}

export interface ArticlesSuccess {
  __typename?: 'ArticlesSuccess'
  edges: ArticleEdge[]
  pageInfo: PageInfo
}

export interface User {
  __typename?: 'User'
  id: Scalars['ID']
  name: Scalars['String']
  isFullUser?: Maybe<Scalars['Boolean']>
  viewerIsFollowing?: Maybe<Scalars['Boolean']>
  /** @deprecated isFriend has been replaced with viewerIsFollowing */
  isFriend?: Maybe<Scalars['Boolean']>
  picture?: Maybe<Scalars['String']>
  profile: Profile
  sharedArticles: FeedArticle[]
  sharedArticlesCount?: Maybe<Scalars['Int']>
  sharedHighlightsCount?: Maybe<Scalars['Int']>
  sharedNotesCount?: Maybe<Scalars['Int']>
  friendsCount?: Maybe<Scalars['Int']>
  followersCount?: Maybe<Scalars['Int']>
}

export interface Profile {
  __typename?: 'Profile'
  id: Scalars['ID']
  username: Scalars['String']
  private: Scalars['Boolean']
  bio?: Maybe<Scalars['String']>
  pictureUrl?: Maybe<Scalars['String']>
}

export type UserResult = UserSuccess | UserError

export enum UserErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  UserNotFound = 'USER_NOT_FOUND',
  BadRequest = 'BAD_REQUEST',
}

export interface UserError {
  __typename?: 'UserError'
  errorCodes: UserErrorCode[]
}

export interface UserSuccess {
  __typename?: 'UserSuccess'
  user: User
}

export type UsersResult = UsersSuccess | UsersError

export enum UsersErrorCode {
  Unauthorized = 'UNAUTHORIZED',
}

export interface UsersError {
  __typename?: 'UsersError'
  errorCodes: UsersErrorCode[]
}

export interface UsersSuccess {
  __typename?: 'UsersSuccess'
  users: User[]
}

export type LoginResult = LoginSuccess | LoginError

export interface LoginSuccess {
  __typename?: 'LoginSuccess'
  me: User
}

export interface LoginError {
  __typename?: 'LoginError'
  errorCodes: LoginErrorCode[]
}

export enum LoginErrorCode {
  AuthFailed = 'AUTH_FAILED',
  UserAlreadyExists = 'USER_ALREADY_EXISTS',
  InvalidCredentials = 'INVALID_CREDENTIALS',
  UserNotFound = 'USER_NOT_FOUND',
  WrongSource = 'WRONG_SOURCE',
  AccessDenied = 'ACCESS_DENIED',
}

export interface GoogleLoginInput {
  secret: Scalars['String']
  email: Scalars['String']
}

export interface GoogleSignupInput {
  secret: Scalars['String']
  email: Scalars['String']
  username: Scalars['String']
  name: Scalars['String']
  pictureUrl: Scalars['String']
  sourceUserId: Scalars['String']
  bio?: Maybe<Scalars['String']>
}

export interface GoogleSignupSuccess {
  __typename?: 'GoogleSignupSuccess'
  me: User
}

export enum SignupErrorCode {
  Unknown = 'UNKNOWN',
  AccessDenied = 'ACCESS_DENIED',
  GoogleAuthError = 'GOOGLE_AUTH_ERROR',
  InvalidUsername = 'INVALID_USERNAME',
  UserExists = 'USER_EXISTS',
  ExpiredToken = 'EXPIRED_TOKEN',
  InvalidPassword = 'INVALID_PASSWORD',
  InvalidEmail = 'INVALID_EMAIL',
}

export interface GoogleSignupError {
  __typename?: 'GoogleSignupError'
  errorCodes: Array<Maybe<SignupErrorCode>>
}

export type GoogleSignupResult = GoogleSignupSuccess | GoogleSignupError

export type LogOutResult = LogOutSuccess | LogOutError

export enum LogOutErrorCode {
  LogOutFailed = 'LOG_OUT_FAILED',
}

export interface LogOutError {
  __typename?: 'LogOutError'
  errorCodes: LogOutErrorCode[]
}

export interface LogOutSuccess {
  __typename?: 'LogOutSuccess'
  message?: Maybe<Scalars['String']>
}

export enum DeleteAccountErrorCode {
  UserNotFound = 'USER_NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
}

export interface DeleteAccountError {
  __typename?: 'DeleteAccountError'
  errorCodes: DeleteAccountErrorCode[]
}

export interface DeleteAccountSuccess {
  __typename?: 'DeleteAccountSuccess'
  userID: Scalars['ID']
}

export type DeleteAccountResult = DeleteAccountSuccess | DeleteAccountError

export type UpdateUserResult = UpdateUserSuccess | UpdateUserError

export interface UpdateUserInput {
  name: Scalars['String']
  bio?: Maybe<Scalars['String']>
}

export enum UpdateUserErrorCode {
  EmptyName = 'EMPTY_NAME',
  BioTooLong = 'BIO_TOO_LONG',
  UserNotFound = 'USER_NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
}

export interface UpdateUserError {
  __typename?: 'UpdateUserError'
  errorCodes: UpdateUserErrorCode[]
}

export interface UpdateUserSuccess {
  __typename?: 'UpdateUserSuccess'
  user: User
}

export type UpdateUserProfileResult =
  | UpdateUserProfileSuccess
  | UpdateUserProfileError

export interface UpdateUserProfileInput {
  userId: Scalars['ID']
  username?: Maybe<Scalars['String']>
  bio?: Maybe<Scalars['String']>
  pictureUrl?: Maybe<Scalars['String']>
}

export interface UpdateUserProfileSuccess {
  __typename?: 'UpdateUserProfileSuccess'
  user: User
}

export enum UpdateUserProfileErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  BadData = 'BAD_DATA',
  BadUsername = 'BAD_USERNAME',
  UsernameExists = 'USERNAME_EXISTS',
}

export interface UpdateUserProfileError {
  __typename?: 'UpdateUserProfileError'
  errorCodes: UpdateUserProfileErrorCode[]
}

export interface ArticleHighlightsInput {
  includeFriends?: Maybe<Scalars['Boolean']>
}

export interface ReadState {
  __typename?: 'ReadState'
  reading?: Maybe<Scalars['Boolean']>
  readingTime?: Maybe<Scalars['Int']>
  progressPercent: Scalars['Float']
  progressAnchorIndex: Scalars['Int']
}

export interface HighlightStats {
  __typename?: 'HighlightStats'
  highlightCount: Scalars['Int']
}

export interface ShareStats {
  __typename?: 'ShareStats'
  viewCount: Scalars['Int']
  saveCount: Scalars['Int']
  readDuration: Scalars['Int']
}

export interface LinkShareInfo {
  __typename?: 'LinkShareInfo'
  title: Scalars['String']
  description: Scalars['String']
  imageUrl: Scalars['String']
}

export interface Link {
  __typename?: 'Link'
  id: Scalars['ID']
  url: Scalars['String']
  slug: Scalars['String']
  savedBy: User
  savedAt: Scalars['Date']
  updatedAt: Scalars['Date']
  savedByViewer: Scalars['Boolean']
  postedByViewer: Scalars['Boolean']
  readState: ReadState
  highlightStats: HighlightStats
  shareInfo: LinkShareInfo
  shareStats: ShareStats
  page: Page
}

export enum PageType {
  Article = 'ARTICLE',
  Book = 'BOOK',
  File = 'FILE',
  Profile = 'PROFILE',
  Website = 'WEBSITE',
  Highlights = 'HIGHLIGHTS',
  Unknown = 'UNKNOWN',
  Tweet = 'TWEET',
  Video = 'VIDEO',
  Image = 'IMAGE',
}

export interface Page {
  __typename?: 'Page'
  id: Scalars['ID']
  url: Scalars['String']
  hash: Scalars['String']
  originalUrl: Scalars['String']
  type: PageType
  image: Scalars['String']
  title: Scalars['String']
  author?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  publishedAt?: Maybe<Scalars['Date']>
  originalHtml: Scalars['String']
  readableHtml: Scalars['String']
  createdAt: Scalars['Date']
  updatedAt: Scalars['Date']
}

export interface RecommendingUser {
  __typename?: 'RecommendingUser'
  userId: Scalars['String']
  name: Scalars['String']
  username: Scalars['String']
  profileImageURL?: Maybe<Scalars['String']>
}

export interface Recommendation {
  __typename?: 'Recommendation'
  id: Scalars['ID']
  name: Scalars['String']
  user?: Maybe<RecommendingUser>
  recommendedAt: Scalars['Date']
  note?: Maybe<Scalars['String']>
}

export interface Article {
  __typename?: 'Article'
  id: Scalars['ID']
  title: Scalars['String']
  slug: Scalars['String']
  url: Scalars['String']
  hash: Scalars['String']
  content: Scalars['String']
  pageType?: Maybe<PageType>
  contentReader: ContentReader
  hasContent?: Maybe<Scalars['Boolean']>
  author?: Maybe<Scalars['String']>
  image?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  originalHtml?: Maybe<Scalars['String']>
  createdAt: Scalars['Date']
  savedAt: Scalars['Date']
  updatedAt: Scalars['Date']
  publishedAt?: Maybe<Scalars['Date']>
  readingProgressTopPercent?: Maybe<Scalars['Float']>
  readingProgressPercent: Scalars['Float']
  readingProgressAnchorIndex: Scalars['Int']
  sharedComment?: Maybe<Scalars['String']>
  savedByViewer?: Maybe<Scalars['Boolean']>
  postedByViewer?: Maybe<Scalars['Boolean']>
  originalArticleUrl?: Maybe<Scalars['String']>
  highlights: Highlight[]
  shareInfo?: Maybe<LinkShareInfo>
  isArchived: Scalars['Boolean']
  linkId?: Maybe<Scalars['ID']>
  labels?: Maybe<Label[]>
  uploadFileId?: Maybe<Scalars['ID']>
  siteName?: Maybe<Scalars['String']>
  siteIcon?: Maybe<Scalars['String']>
  subscription?: Maybe<Scalars['String']>
  unsubMailTo?: Maybe<Scalars['String']>
  unsubHttpUrl?: Maybe<Scalars['String']>
  state?: Maybe<ArticleSavingRequestStatus>
  language?: Maybe<Scalars['String']>
  readAt?: Maybe<Scalars['Date']>
  recommendations?: Maybe<Recommendation[]>
  wordsCount?: Maybe<Scalars['Int']>
}

export interface ArticleHighlightsArgs {
  input?: Maybe<ArticleHighlightsInput>
}

export type ArticleResult = ArticleSuccess | ArticleError

export enum ArticleErrorCode {
  NotFound = 'NOT_FOUND',
  BadData = 'BAD_DATA',
  Unauthorized = 'UNAUTHORIZED',
}

export interface ArticleError {
  __typename?: 'ArticleError'
  errorCodes: ArticleErrorCode[]
}

export interface ArticleSuccess {
  __typename?: 'ArticleSuccess'
  article: Article
}

export type SharedArticleResult = SharedArticleSuccess | SharedArticleError

export enum SharedArticleErrorCode {
  NotFound = 'NOT_FOUND',
}

export interface SharedArticleError {
  __typename?: 'SharedArticleError'
  errorCodes: SharedArticleErrorCode[]
}

export interface SharedArticleSuccess {
  __typename?: 'SharedArticleSuccess'
  article: Article
}

export type ArticlesResult = ArticlesSuccess | ArticlesError

export enum ArticlesErrorCode {
  Unauthorized = 'UNAUTHORIZED',
}

export interface ArticlesError {
  __typename?: 'ArticlesError'
  errorCodes: ArticlesErrorCode[]
}

export interface PageInfoInput {
  title?: Maybe<Scalars['String']>
  author?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  previewImage?: Maybe<Scalars['String']>
  canonicalUrl?: Maybe<Scalars['String']>
  publishedAt?: Maybe<Scalars['Date']>
  contentType?: Maybe<Scalars['String']>
}

export interface PreparedDocumentInput {
  document: Scalars['String']
  pageInfo: PageInfoInput
}

export enum UploadFileStatus {
  Initialized = 'INITIALIZED',
  Completed = 'COMPLETED',
}

export type UploadFileRequestResult =
  | UploadFileRequestSuccess
  | UploadFileRequestError

export interface UploadFileRequestInput {
  url: Scalars['String']
  contentType: Scalars['String']
  createPageEntry?: Maybe<Scalars['Boolean']>
  clientRequestId?: Maybe<Scalars['String']>
}

export enum UploadFileRequestErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadInput = 'BAD_INPUT',
  FailedCreate = 'FAILED_CREATE',
}

export interface UploadFileRequestError {
  __typename?: 'UploadFileRequestError'
  errorCodes: UploadFileRequestErrorCode[]
}

export interface UploadFileRequestSuccess {
  __typename?: 'UploadFileRequestSuccess'
  id: Scalars['ID']
  uploadSignedUrl?: Maybe<Scalars['String']>
  uploadFileId?: Maybe<Scalars['ID']>
  createdPageId?: Maybe<Scalars['String']>
}

export type CreateArticleResult = CreateArticleSuccess | CreateArticleError

export interface CreateArticleInput {
  url: Scalars['String']
  preparedDocument?: Maybe<PreparedDocumentInput>
  articleSavingRequestId?: Maybe<Scalars['ID']>
  uploadFileId?: Maybe<Scalars['ID']>
  skipParsing?: Maybe<Scalars['Boolean']>
  source?: Maybe<Scalars['String']>
  state?: Maybe<ArticleSavingRequestStatus>
  labels?: Maybe<CreateLabelInput[]>
}

export enum CreateArticleErrorCode {
  UnableToFetch = 'UNABLE_TO_FETCH',
  UnableToParse = 'UNABLE_TO_PARSE',
  Unauthorized = 'UNAUTHORIZED',
  NotAllowedToParse = 'NOT_ALLOWED_TO_PARSE',
  PayloadTooLarge = 'PAYLOAD_TOO_LARGE',
  UploadFileMissing = 'UPLOAD_FILE_MISSING',
  ElasticError = 'ELASTIC_ERROR',
}

export interface CreateArticleError {
  __typename?: 'CreateArticleError'
  errorCodes: CreateArticleErrorCode[]
}

export interface CreateArticleSuccess {
  __typename?: 'CreateArticleSuccess'
  createdArticle: Article
  user: User
  created: Scalars['Boolean']
}

export enum SaveErrorCode {
  Unknown = 'UNKNOWN',
  Unauthorized = 'UNAUTHORIZED',
  EmbeddedHighlightFailed = 'EMBEDDED_HIGHLIGHT_FAILED',
}

export interface SaveError {
  __typename?: 'SaveError'
  errorCodes: SaveErrorCode[]
  message?: Maybe<Scalars['String']>
}

export interface SaveSuccess {
  __typename?: 'SaveSuccess'
  url: Scalars['String']
  clientRequestId: Scalars['ID']
}

export interface SaveFileInput {
  url: Scalars['String']
  source: Scalars['String']
  clientRequestId: Scalars['ID']
  uploadFileId: Scalars['ID']
  state?: Maybe<ArticleSavingRequestStatus>
  labels?: Maybe<CreateLabelInput[]>
}

export interface ParseResult {
  title: Scalars['String']
  byline?: Maybe<Scalars['String']>
  dir?: Maybe<Scalars['String']>
  content: Scalars['String']
  textContent: Scalars['String']
  length: Scalars['Int']
  excerpt: Scalars['String']
  siteName?: Maybe<Scalars['String']>
  siteIcon?: Maybe<Scalars['String']>
  previewImage?: Maybe<Scalars['String']>
  publishedDate?: Maybe<Scalars['Date']>
  language?: Maybe<Scalars['String']>
}

export interface SavePageInput {
  url: Scalars['String']
  source: Scalars['String']
  clientRequestId: Scalars['ID']
  title?: Maybe<Scalars['String']>
  originalContent: Scalars['String']
  parseResult?: Maybe<ParseResult>
  state?: Maybe<ArticleSavingRequestStatus>
  labels?: Maybe<CreateLabelInput[]>
}

export interface SaveUrlInput {
  url: Scalars['String']
  source: Scalars['String']
  clientRequestId: Scalars['ID']
  state?: Maybe<ArticleSavingRequestStatus>
  labels?: Maybe<CreateLabelInput[]>
}

export type SaveResult = SaveSuccess | SaveError

export interface UpdatePageInput {
  pageId: Scalars['ID']
  title?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  byline?: Maybe<Scalars['String']>
  savedAt?: Maybe<Scalars['Date']>
  publishedAt?: Maybe<Scalars['Date']>
  previewImage?: Maybe<Scalars['String']>
}

export interface UpdatePageSuccess {
  __typename?: 'UpdatePageSuccess'
  updatedPage: Article
}

export enum UpdatePageErrorCode {
  UpdateFailed = 'UPDATE_FAILED',
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Forbidden = 'FORBIDDEN',
}

export interface UpdatePageError {
  __typename?: 'UpdatePageError'
  errorCodes: UpdatePageErrorCode[]
}

export type UpdatePageResult = UpdatePageSuccess | UpdatePageError

export type SetFollowResult = SetFollowSuccess | SetFollowError

export interface SetFollowInput {
  userId: Scalars['ID']
  follow: Scalars['Boolean']
}

export enum SetFollowErrorCode {
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
}

export interface SetFollowError {
  __typename?: 'SetFollowError'
  errorCodes: SetFollowErrorCode[]
}

export interface SetFollowSuccess {
  __typename?: 'SetFollowSuccess'
  updatedUser: User
}

export type SaveArticleReadingProgressResult =
  | SaveArticleReadingProgressSuccess
  | SaveArticleReadingProgressError

export interface SaveArticleReadingProgressInput {
  id: Scalars['ID']
  readingProgressTopPercent?: Maybe<Scalars['Float']>
  readingProgressPercent: Scalars['Float']
  readingProgressAnchorIndex: Scalars['Int']
}

export enum SaveArticleReadingProgressErrorCode {
  NotFound = 'NOT_FOUND',
  BadData = 'BAD_DATA',
  Unauthorized = 'UNAUTHORIZED',
}

export interface SaveArticleReadingProgressError {
  __typename?: 'SaveArticleReadingProgressError'
  errorCodes: SaveArticleReadingProgressErrorCode[]
}

export interface SaveArticleReadingProgressSuccess {
  __typename?: 'SaveArticleReadingProgressSuccess'
  updatedArticle: Article
}

export type SetBookmarkArticleResult =
  | SetBookmarkArticleSuccess
  | SetBookmarkArticleError

export interface SetBookmarkArticleInput {
  articleID: Scalars['ID']
  bookmark: Scalars['Boolean']
}

export enum SetBookmarkArticleErrorCode {
  NotFound = 'NOT_FOUND',
  BookmarkExists = 'BOOKMARK_EXISTS',
}

export interface SetBookmarkArticleError {
  __typename?: 'SetBookmarkArticleError'
  errorCodes: SetBookmarkArticleErrorCode[]
}

export interface SetBookmarkArticleSuccess {
  __typename?: 'SetBookmarkArticleSuccess'
  bookmarkedArticle: Article
}

export interface FeedArticle {
  __typename?: 'FeedArticle'
  id: Scalars['ID']
  article: Article
  sharedBy: User
  sharedAt: Scalars['Date']
  sharedComment?: Maybe<Scalars['String']>
  sharedWithHighlights?: Maybe<Scalars['Boolean']>
  highlightsCount?: Maybe<Scalars['Int']>
  annotationsCount?: Maybe<Scalars['Int']>
  highlight?: Maybe<Highlight>
  reactions: Reaction[]
}

export enum HighlightType {
  Highlight = 'HIGHLIGHT',
  Redaction = 'REDACTION',
  Note = 'NOTE',
}

export interface Highlight {
  __typename?: 'Highlight'
  id: Scalars['ID']
  shortId: Scalars['String']
  user: User
  quote?: Maybe<Scalars['String']>
  prefix?: Maybe<Scalars['String']>
  suffix?: Maybe<Scalars['String']>
  patch?: Maybe<Scalars['String']>
  annotation?: Maybe<Scalars['String']>
  replies: HighlightReply[]
  sharedAt?: Maybe<Scalars['Date']>
  createdAt: Scalars['Date']
  updatedAt: Scalars['Date']
  reactions: Reaction[]
  createdByMe: Scalars['Boolean']
  highlightPositionPercent?: Maybe<Scalars['Float']>
  highlightPositionAnchorIndex?: Maybe<Scalars['Int']>
  labels?: Maybe<Label[]>
  type: HighlightType
  html?: Maybe<Scalars['String']>
}

export interface CreateHighlightInput {
  id: Scalars['ID']
  shortId: Scalars['String']
  articleId: Scalars['ID']
  patch?: Maybe<Scalars['String']>
  quote?: Maybe<Scalars['String']>
  prefix?: Maybe<Scalars['String']>
  suffix?: Maybe<Scalars['String']>
  annotation?: Maybe<Scalars['String']>
  sharedAt?: Maybe<Scalars['Date']>
  highlightPositionPercent?: Maybe<Scalars['Float']>
  highlightPositionAnchorIndex?: Maybe<Scalars['Int']>
  type?: Maybe<HighlightType>
  html?: Maybe<Scalars['String']>
}

export interface CreateHighlightSuccess {
  __typename?: 'CreateHighlightSuccess'
  highlight: Highlight
}

export enum CreateHighlightErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  BadData = 'BAD_DATA',
  NotFound = 'NOT_FOUND',
  AlreadyExists = 'ALREADY_EXISTS',
}

export interface CreateHighlightError {
  __typename?: 'CreateHighlightError'
  errorCodes: CreateHighlightErrorCode[]
}

export type CreateHighlightResult =
  | CreateHighlightSuccess
  | CreateHighlightError

export interface MergeHighlightInput {
  id: Scalars['ID']
  shortId: Scalars['ID']
  articleId: Scalars['ID']
  patch: Scalars['String']
  quote: Scalars['String']
  prefix?: Maybe<Scalars['String']>
  suffix?: Maybe<Scalars['String']>
  annotation?: Maybe<Scalars['String']>
  overlapHighlightIdList: Array<Scalars['String']>
  highlightPositionPercent?: Maybe<Scalars['Float']>
  highlightPositionAnchorIndex?: Maybe<Scalars['Int']>
  html?: Maybe<Scalars['String']>
}

export interface MergeHighlightSuccess {
  __typename?: 'MergeHighlightSuccess'
  highlight: Highlight
  overlapHighlightIdList: Array<Scalars['String']>
}

export enum MergeHighlightErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  BadData = 'BAD_DATA',
  NotFound = 'NOT_FOUND',
  AlreadyExists = 'ALREADY_EXISTS',
}

export interface MergeHighlightError {
  __typename?: 'MergeHighlightError'
  errorCodes: MergeHighlightErrorCode[]
}

export type MergeHighlightResult = MergeHighlightSuccess | MergeHighlightError

export interface UpdateHighlightInput {
  highlightId: Scalars['ID']
  annotation?: Maybe<Scalars['String']>
  sharedAt?: Maybe<Scalars['Date']>
  quote?: Maybe<Scalars['String']>
  html?: Maybe<Scalars['String']>
}

export interface UpdateHighlightSuccess {
  __typename?: 'UpdateHighlightSuccess'
  highlight: Highlight
}

export enum UpdateHighlightErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  BadData = 'BAD_DATA',
}

export interface UpdateHighlightError {
  __typename?: 'UpdateHighlightError'
  errorCodes: UpdateHighlightErrorCode[]
}

export type UpdateHighlightResult =
  | UpdateHighlightSuccess
  | UpdateHighlightError

export interface DeleteHighlightSuccess {
  __typename?: 'DeleteHighlightSuccess'
  highlight: Highlight
}

export enum DeleteHighlightErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
}

export interface DeleteHighlightError {
  __typename?: 'DeleteHighlightError'
  errorCodes: DeleteHighlightErrorCode[]
}

export type DeleteHighlightResult =
  | DeleteHighlightSuccess
  | DeleteHighlightError

export interface HighlightReply {
  __typename?: 'HighlightReply'
  id: Scalars['ID']
  user: User
  highlight: Highlight
  text: Scalars['String']
  createdAt: Scalars['Date']
  updatedAt: Scalars['Date']
}

export interface CreateHighlightReplyInput {
  highlightId: Scalars['ID']
  text: Scalars['String']
}

export interface CreateHighlightReplySuccess {
  __typename?: 'CreateHighlightReplySuccess'
  highlightReply: HighlightReply
}

export enum CreateHighlightReplyErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  EmptyAnnotation = 'EMPTY_ANNOTATION',
}

export interface CreateHighlightReplyError {
  __typename?: 'CreateHighlightReplyError'
  errorCodes: CreateHighlightReplyErrorCode[]
}

export type CreateHighlightReplyResult =
  | CreateHighlightReplySuccess
  | CreateHighlightReplyError

export interface UpdateHighlightReplyInput {
  highlightReplyId: Scalars['ID']
  text: Scalars['String']
}

export interface UpdateHighlightReplySuccess {
  __typename?: 'UpdateHighlightReplySuccess'
  highlightReply: HighlightReply
}

export enum UpdateHighlightReplyErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
}

export interface UpdateHighlightReplyError {
  __typename?: 'UpdateHighlightReplyError'
  errorCodes: UpdateHighlightReplyErrorCode[]
}

export type UpdateHighlightReplyResult =
  | UpdateHighlightReplySuccess
  | UpdateHighlightReplyError

export interface DeleteHighlightReplySuccess {
  __typename?: 'DeleteHighlightReplySuccess'
  highlightReply: HighlightReply
}

export enum DeleteHighlightReplyErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
}

export interface DeleteHighlightReplyError {
  __typename?: 'DeleteHighlightReplyError'
  errorCodes: DeleteHighlightReplyErrorCode[]
}

export type DeleteHighlightReplyResult =
  | DeleteHighlightReplySuccess
  | DeleteHighlightReplyError

export interface Reaction {
  __typename?: 'Reaction'
  id: Scalars['ID']
  user: User
  code: ReactionType
  createdAt: Scalars['Date']
  updatedAt?: Maybe<Scalars['Date']>
}

export interface CreateReactionInput {
  highlightId?: Maybe<Scalars['ID']>
  userArticleId?: Maybe<Scalars['ID']>
  code: ReactionType
}

export interface CreateReactionSuccess {
  __typename?: 'CreateReactionSuccess'
  reaction: Reaction
}

export enum CreateReactionErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  BadTarget = 'BAD_TARGET',
  BadCode = 'BAD_CODE',
  NotFound = 'NOT_FOUND',
}

export interface CreateReactionError {
  __typename?: 'CreateReactionError'
  errorCodes: CreateReactionErrorCode[]
}

export type CreateReactionResult = CreateReactionSuccess | CreateReactionError

export interface DeleteReactionSuccess {
  __typename?: 'DeleteReactionSuccess'
  reaction: Reaction
}

export enum DeleteReactionErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
}

export interface DeleteReactionError {
  __typename?: 'DeleteReactionError'
  errorCodes: DeleteReactionErrorCode[]
}

export type DeleteReactionResult = DeleteReactionSuccess | DeleteReactionError

export type FeedArticlesResult = FeedArticlesSuccess | FeedArticlesError

export enum FeedArticlesErrorCode {
  Unauthorized = 'UNAUTHORIZED',
}

export interface FeedArticlesError {
  __typename?: 'FeedArticlesError'
  errorCodes: FeedArticlesErrorCode[]
}

export interface FeedArticlesSuccess {
  __typename?: 'FeedArticlesSuccess'
  edges: FeedArticleEdge[]
  pageInfo: PageInfo
}

export enum SetShareArticleErrorCode {
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
}

export interface SetShareArticleSuccess {
  __typename?: 'SetShareArticleSuccess'
  updatedFeedArticleId?: Maybe<Scalars['String']>
  updatedFeedArticle?: Maybe<FeedArticle>
  updatedArticle: Article
}

export interface SetShareArticleError {
  __typename?: 'SetShareArticleError'
  errorCodes: SetShareArticleErrorCode[]
}

export type SetShareArticleResult =
  | SetShareArticleSuccess
  | SetShareArticleError

export interface SetShareArticleInput {
  articleID: Scalars['ID']
  share: Scalars['Boolean']
  sharedComment?: Maybe<Scalars['String']>
  sharedWithHighlights?: Maybe<Scalars['Boolean']>
}

export enum UpdateSharedCommentErrorCode {
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
}

export interface UpdateSharedCommentSuccess {
  __typename?: 'UpdateSharedCommentSuccess'
  articleID: Scalars['ID']
  sharedComment: Scalars['String']
}

export interface UpdateSharedCommentError {
  __typename?: 'UpdateSharedCommentError'
  errorCodes: UpdateSharedCommentErrorCode[]
}

export type UpdateSharedCommentResult =
  | UpdateSharedCommentSuccess
  | UpdateSharedCommentError

export interface UpdateSharedCommentInput {
  articleID: Scalars['ID']
  sharedComment: Scalars['String']
}

export type GetFollowersResult = GetFollowersSuccess | GetFollowersError

export enum GetFollowersErrorCode {
  Unauthorized = 'UNAUTHORIZED',
}

export interface GetFollowersError {
  __typename?: 'GetFollowersError'
  errorCodes: GetFollowersErrorCode[]
}

export interface GetFollowersSuccess {
  __typename?: 'GetFollowersSuccess'
  followers: User[]
}

export type GetFollowingResult = GetFollowingSuccess | GetFollowingError

export enum GetFollowingErrorCode {
  Unauthorized = 'UNAUTHORIZED',
}

export interface GetFollowingError {
  __typename?: 'GetFollowingError'
  errorCodes: GetFollowingErrorCode[]
}

export interface GetFollowingSuccess {
  __typename?: 'GetFollowingSuccess'
  following: User[]
}

export interface UserPersonalization {
  __typename?: 'UserPersonalization'
  id?: Maybe<Scalars['ID']>
  theme?: Maybe<Scalars['String']>
  fontSize?: Maybe<Scalars['Int']>
  fontFamily?: Maybe<Scalars['String']>
  margin?: Maybe<Scalars['Int']>
  libraryLayoutType?: Maybe<Scalars['String']>
  librarySortOrder?: Maybe<SortOrder>
  speechVoice?: Maybe<Scalars['String']>
  speechSecondaryVoice?: Maybe<Scalars['String']>
  speechRate?: Maybe<Scalars['String']>
  speechVolume?: Maybe<Scalars['String']>
}

export type GetUserPersonalizationResult =
  | GetUserPersonalizationSuccess
  | GetUserPersonalizationError

export enum GetUserPersonalizationErrorCode {
  Unauthorized = 'UNAUTHORIZED',
}

export interface GetUserPersonalizationError {
  __typename?: 'GetUserPersonalizationError'
  errorCodes: GetUserPersonalizationErrorCode[]
}

export interface GetUserPersonalizationSuccess {
  __typename?: 'GetUserPersonalizationSuccess'
  userPersonalization?: Maybe<UserPersonalization>
}

export type SetUserPersonalizationResult =
  | SetUserPersonalizationSuccess
  | SetUserPersonalizationError

export enum SetUserPersonalizationErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  NotFound = 'NOT_FOUND',
}

export interface SetUserPersonalizationError {
  __typename?: 'SetUserPersonalizationError'
  errorCodes: SetUserPersonalizationErrorCode[]
}

export interface SetUserPersonalizationSuccess {
  __typename?: 'SetUserPersonalizationSuccess'
  updatedUserPersonalization: UserPersonalization
}

export interface SetUserPersonalizationInput {
  theme?: Maybe<Scalars['String']>
  fontSize?: Maybe<Scalars['Int']>
  fontFamily?: Maybe<Scalars['String']>
  margin?: Maybe<Scalars['Int']>
  libraryLayoutType?: Maybe<Scalars['String']>
  librarySortOrder?: Maybe<SortOrder>
  speechVoice?: Maybe<Scalars['String']>
  speechSecondaryVoice?: Maybe<Scalars['String']>
  speechRate?: Maybe<Scalars['String']>
  speechVolume?: Maybe<Scalars['String']>
}

export enum ArticleSavingRequestStatus {
  Processing = 'PROCESSING',
  Succeeded = 'SUCCEEDED',
  Failed = 'FAILED',
  Deleted = 'DELETED',
  Archived = 'ARCHIVED',
}

export interface ArticleSavingRequest {
  __typename?: 'ArticleSavingRequest'
  id: Scalars['ID']
  /** @deprecated userId has been replaced with user */
  userId: Scalars['ID']
  user: User
  /** @deprecated article has been replaced with slug */
  article?: Maybe<Article>
  slug: Scalars['String']
  status: ArticleSavingRequestStatus
  errorCode?: Maybe<CreateArticleErrorCode>
  createdAt: Scalars['Date']
  updatedAt: Scalars['Date']
  url: Scalars['String']
}

export type ArticleSavingRequestResult =
  | ArticleSavingRequestSuccess
  | ArticleSavingRequestError

export enum ArticleSavingRequestErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  NotFound = 'NOT_FOUND',
  BadData = 'BAD_DATA',
}

export interface ArticleSavingRequestError {
  __typename?: 'ArticleSavingRequestError'
  errorCodes: ArticleSavingRequestErrorCode[]
}

export interface ArticleSavingRequestSuccess {
  __typename?: 'ArticleSavingRequestSuccess'
  articleSavingRequest: ArticleSavingRequest
}

export type CreateArticleSavingRequestResult =
  | CreateArticleSavingRequestSuccess
  | CreateArticleSavingRequestError

export enum CreateArticleSavingRequestErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadData = 'BAD_DATA',
}

export interface CreateArticleSavingRequestError {
  __typename?: 'CreateArticleSavingRequestError'
  errorCodes: CreateArticleSavingRequestErrorCode[]
}

export interface CreateArticleSavingRequestSuccess {
  __typename?: 'CreateArticleSavingRequestSuccess'
  articleSavingRequest: ArticleSavingRequest
}

export interface CreateArticleSavingRequestInput {
  url: Scalars['String']
}

export type SetShareHighlightResult =
  | SetShareHighlightSuccess
  | SetShareHighlightError

export enum SetShareHighlightErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  NotFound = 'NOT_FOUND',
  Forbidden = 'FORBIDDEN',
}

export interface SetShareHighlightError {
  __typename?: 'SetShareHighlightError'
  errorCodes: SetShareHighlightErrorCode[]
}

export interface SetShareHighlightSuccess {
  __typename?: 'SetShareHighlightSuccess'
  highlight: Highlight
}

export interface SetShareHighlightInput {
  id: Scalars['ID']
  share: Scalars['Boolean']
}

export enum ReportType {
  Spam = 'SPAM',
  Abusive = 'ABUSIVE',
  ContentDisplay = 'CONTENT_DISPLAY',
  ContentViolation = 'CONTENT_VIOLATION',
}

export interface ReportItemInput {
  pageId: Scalars['ID']
  itemUrl: Scalars['String']
  sharedBy?: Maybe<Scalars['ID']>
  reportTypes: ReportType[]
  reportComment: Scalars['String']
}

export interface ReportItemResult {
  __typename?: 'ReportItemResult'
  message: Scalars['String']
}

export interface UpdateLinkShareInfoInput {
  linkId: Scalars['ID']
  title: Scalars['String']
  description: Scalars['String']
}

export type UpdateLinkShareInfoResult =
  | UpdateLinkShareInfoSuccess
  | UpdateLinkShareInfoError

export enum UpdateLinkShareInfoErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export interface UpdateLinkShareInfoError {
  __typename?: 'UpdateLinkShareInfoError'
  errorCodes: UpdateLinkShareInfoErrorCode[]
}

export interface UpdateLinkShareInfoSuccess {
  __typename?: 'UpdateLinkShareInfoSuccess'
  message: Scalars['String']
}

export interface ArchiveLinkInput {
  linkId: Scalars['ID']
  archived: Scalars['Boolean']
}

export enum ArchiveLinkErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export interface ArchiveLinkError {
  __typename?: 'ArchiveLinkError'
  message: Scalars['String']
  errorCodes: ArchiveLinkErrorCode[]
}

export interface ArchiveLinkSuccess {
  __typename?: 'ArchiveLinkSuccess'
  linkId: Scalars['String']
  message: Scalars['String']
}

export type ArchiveLinkResult = ArchiveLinkSuccess | ArchiveLinkError

export enum NewsletterEmailsErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export interface NewsletterEmail {
  __typename?: 'NewsletterEmail'
  id: Scalars['ID']
  address: Scalars['String']
  confirmationCode?: Maybe<Scalars['String']>
  createdAt: Scalars['Date']
  subscriptionCount: Scalars['Int']
}

export interface NewsletterEmailsSuccess {
  __typename?: 'NewsletterEmailsSuccess'
  newsletterEmails: NewsletterEmail[]
}

export interface NewsletterEmailsError {
  __typename?: 'NewsletterEmailsError'
  errorCodes: NewsletterEmailsErrorCode[]
}

export type NewsletterEmailsResult =
  | NewsletterEmailsSuccess
  | NewsletterEmailsError

export enum CreateNewsletterEmailErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export interface CreateNewsletterEmailSuccess {
  __typename?: 'CreateNewsletterEmailSuccess'
  newsletterEmail: NewsletterEmail
}

export interface CreateNewsletterEmailError {
  __typename?: 'CreateNewsletterEmailError'
  errorCodes: CreateNewsletterEmailErrorCode[]
}

export type CreateNewsletterEmailResult =
  | CreateNewsletterEmailSuccess
  | CreateNewsletterEmailError

export enum DeleteNewsletterEmailErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export interface DeleteNewsletterEmailSuccess {
  __typename?: 'DeleteNewsletterEmailSuccess'
  newsletterEmail: NewsletterEmail
}

export interface DeleteNewsletterEmailError {
  __typename?: 'DeleteNewsletterEmailError'
  errorCodes: DeleteNewsletterEmailErrorCode[]
}

export type DeleteNewsletterEmailResult =
  | DeleteNewsletterEmailSuccess
  | DeleteNewsletterEmailError

export interface Reminder {
  __typename?: 'Reminder'
  id: Scalars['ID']
  archiveUntil: Scalars['Boolean']
  sendNotification: Scalars['Boolean']
  remindAt: Scalars['Date']
}

export interface ReminderSuccess {
  __typename?: 'ReminderSuccess'
  reminder: Reminder
}

export enum ReminderErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export interface ReminderError {
  __typename?: 'ReminderError'
  errorCodes: ReminderErrorCode[]
}

export type ReminderResult = ReminderSuccess | ReminderError

export interface CreateReminderInput {
  linkId?: Maybe<Scalars['ID']>
  clientRequestId?: Maybe<Scalars['ID']>
  archiveUntil: Scalars['Boolean']
  sendNotification: Scalars['Boolean']
  remindAt: Scalars['Date']
}

export interface CreateReminderSuccess {
  __typename?: 'CreateReminderSuccess'
  reminder: Reminder
}

export enum CreateReminderErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export interface CreateReminderError {
  __typename?: 'CreateReminderError'
  errorCodes: CreateReminderErrorCode[]
}

export type CreateReminderResult = CreateReminderSuccess | CreateReminderError

export interface UpdateReminderInput {
  id: Scalars['ID']
  archiveUntil: Scalars['Boolean']
  sendNotification: Scalars['Boolean']
  remindAt: Scalars['Date']
}

export type UpdateReminderResult = UpdateReminderSuccess | UpdateReminderError

export interface UpdateReminderSuccess {
  __typename?: 'UpdateReminderSuccess'
  reminder: Reminder
}

export enum UpdateReminderErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export interface UpdateReminderError {
  __typename?: 'UpdateReminderError'
  errorCodes: UpdateReminderErrorCode[]
}

export type DeleteReminderResult = DeleteReminderSuccess | DeleteReminderError

export interface DeleteReminderSuccess {
  __typename?: 'DeleteReminderSuccess'
  reminder: Reminder
}

export enum DeleteReminderErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export interface DeleteReminderError {
  __typename?: 'DeleteReminderError'
  errorCodes: DeleteReminderErrorCode[]
}

export interface SendInstallInstructionsSuccess {
  __typename?: 'SendInstallInstructionsSuccess'
  sent: Scalars['Boolean']
}

export enum SendInstallInstructionsErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Forbidden = 'FORBIDDEN',
}

export interface SendInstallInstructionsError {
  __typename?: 'SendInstallInstructionsError'
  errorCodes: SendInstallInstructionsErrorCode[]
}

export type SendInstallInstructionsResult =
  | SendInstallInstructionsSuccess
  | SendInstallInstructionsError

export interface SetDeviceTokenInput {
  id?: Maybe<Scalars['ID']>
  token?: Maybe<Scalars['String']>
}

export interface DeviceToken {
  __typename?: 'DeviceToken'
  id: Scalars['ID']
  token: Scalars['String']
  createdAt: Scalars['Date']
}

export interface SetDeviceTokenSuccess {
  __typename?: 'SetDeviceTokenSuccess'
  deviceToken: DeviceToken
}

export enum SetDeviceTokenErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export interface SetDeviceTokenError {
  __typename?: 'SetDeviceTokenError'
  errorCodes: SetDeviceTokenErrorCode[]
}

export type SetDeviceTokenResult = SetDeviceTokenSuccess | SetDeviceTokenError

export interface Label {
  __typename?: 'Label'
  id: Scalars['ID']
  name: Scalars['String']
  color: Scalars['String']
  description?: Maybe<Scalars['String']>
  createdAt?: Maybe<Scalars['Date']>
  position?: Maybe<Scalars['Int']>
  internal?: Maybe<Scalars['Boolean']>
}

export interface LabelsSuccess {
  __typename?: 'LabelsSuccess'
  labels: Label[]
}

export enum LabelsErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export interface LabelsError {
  __typename?: 'LabelsError'
  errorCodes: LabelsErrorCode[]
}

export type LabelsResult = LabelsSuccess | LabelsError

export interface CreateLabelInput {
  name: Scalars['String']
  color?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
}

export interface CreateLabelSuccess {
  __typename?: 'CreateLabelSuccess'
  label: Label
}

export enum CreateLabelErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  LabelAlreadyExists = 'LABEL_ALREADY_EXISTS',
}

export interface CreateLabelError {
  __typename?: 'CreateLabelError'
  errorCodes: CreateLabelErrorCode[]
}

export type CreateLabelResult = CreateLabelSuccess | CreateLabelError

export interface DeleteLabelSuccess {
  __typename?: 'DeleteLabelSuccess'
  label: Label
}

export enum DeleteLabelErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Forbidden = 'FORBIDDEN',
}

export interface DeleteLabelError {
  __typename?: 'DeleteLabelError'
  errorCodes: DeleteLabelErrorCode[]
}

export type DeleteLabelResult = DeleteLabelSuccess | DeleteLabelError

export interface UpdateLabelInput {
  labelId: Scalars['ID']
  color: Scalars['String']
  description?: Maybe<Scalars['String']>
  name: Scalars['String']
}

export interface UpdateLabelSuccess {
  __typename?: 'UpdateLabelSuccess'
  label: Label
}

export enum UpdateLabelErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Forbidden = 'FORBIDDEN',
}

export interface UpdateLabelError {
  __typename?: 'UpdateLabelError'
  errorCodes: UpdateLabelErrorCode[]
}

export type UpdateLabelResult = UpdateLabelSuccess | UpdateLabelError

export interface SetLabelsInput {
  pageId: Scalars['ID']
  labelIds: Array<Scalars['ID']>
}

export type SetLabelsResult = SetLabelsSuccess | SetLabelsError

export interface SetLabelsSuccess {
  __typename?: 'SetLabelsSuccess'
  labels: Label[]
}

export interface SetLabelsError {
  __typename?: 'SetLabelsError'
  errorCodes: SetLabelsErrorCode[]
}

export enum SetLabelsErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export interface GenerateApiKeyInput {
  name: Scalars['String']
  scopes?: Maybe<Array<Scalars['String']>>
  expiresAt: Scalars['Date']
}

export type GenerateApiKeyResult = GenerateApiKeySuccess | GenerateApiKeyError

export interface GenerateApiKeySuccess {
  __typename?: 'GenerateApiKeySuccess'
  apiKey: ApiKey
}

export interface GenerateApiKeyError {
  __typename?: 'GenerateApiKeyError'
  errorCodes: GenerateApiKeyErrorCode[]
}

export enum GenerateApiKeyErrorCode {
  BadRequest = 'BAD_REQUEST',
  AlreadyExists = 'ALREADY_EXISTS',
  Unauthorized = 'UNAUTHORIZED',
}

export type SearchResult = SearchSuccess | SearchError

export interface SearchItem {
  __typename?: 'SearchItem'
  id: Scalars['ID']
  title: Scalars['String']
  slug: Scalars['String']
  url: Scalars['String']
  pageType: PageType
  contentReader: ContentReader
  createdAt: Scalars['Date']
  updatedAt?: Maybe<Scalars['Date']>
  isArchived: Scalars['Boolean']
  readingProgressTopPercent?: Maybe<Scalars['Float']>
  readingProgressPercent: Scalars['Float']
  readingProgressAnchorIndex: Scalars['Int']
  author?: Maybe<Scalars['String']>
  image?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  publishedAt?: Maybe<Scalars['Date']>
  ownedByViewer?: Maybe<Scalars['Boolean']>
  originalArticleUrl?: Maybe<Scalars['String']>
  uploadFileId?: Maybe<Scalars['ID']>
  pageId?: Maybe<Scalars['ID']>
  shortId?: Maybe<Scalars['String']>
  quote?: Maybe<Scalars['String']>
  annotation?: Maybe<Scalars['String']>
  labels?: Maybe<Label[]>
  subscription?: Maybe<Scalars['String']>
  unsubMailTo?: Maybe<Scalars['String']>
  unsubHttpUrl?: Maybe<Scalars['String']>
  state?: Maybe<ArticleSavingRequestStatus>
  siteName?: Maybe<Scalars['String']>
  language?: Maybe<Scalars['String']>
  readAt?: Maybe<Scalars['Date']>
  savedAt: Scalars['Date']
  highlights?: Maybe<Highlight[]>
  siteIcon?: Maybe<Scalars['String']>
  recommendations?: Maybe<Recommendation[]>
  wordsCount?: Maybe<Scalars['Int']>
  content?: Maybe<Scalars['String']>
  archivedAt?: Maybe<Scalars['Date']>
}

export interface SearchItemEdge {
  __typename?: 'SearchItemEdge'
  cursor: Scalars['String']
  node: SearchItem
}

export interface SearchSuccess {
  __typename?: 'SearchSuccess'
  edges: SearchItemEdge[]
  pageInfo: PageInfo
}

export enum SearchErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  QueryTooLong = 'QUERY_TOO_LONG',
}

export interface SearchError {
  __typename?: 'SearchError'
  errorCodes: SearchErrorCode[]
}

export type SubscriptionsResult = SubscriptionsSuccess | SubscriptionsError

export interface SubscriptionsSuccess {
  __typename?: 'SubscriptionsSuccess'
  subscriptions: Subscription[]
}

export interface Subscription {
  __typename?: 'Subscription'
  id: Scalars['ID']
  name: Scalars['String']
  newsletterEmail: Scalars['String']
  url?: Maybe<Scalars['String']>
  description?: Maybe<Scalars['String']>
  status: SubscriptionStatus
  unsubscribeMailTo?: Maybe<Scalars['String']>
  unsubscribeHttpUrl?: Maybe<Scalars['String']>
  icon?: Maybe<Scalars['String']>
  createdAt: Scalars['Date']
  updatedAt: Scalars['Date']
}

export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Unsubscribed = 'UNSUBSCRIBED',
  Deleted = 'DELETED',
}

export interface SubscriptionsError {
  __typename?: 'SubscriptionsError'
  errorCodes: SubscriptionsErrorCode[]
}

export enum SubscriptionsErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export type UnsubscribeResult = UnsubscribeSuccess | UnsubscribeError

export interface UnsubscribeSuccess {
  __typename?: 'UnsubscribeSuccess'
  subscription: Subscription
}

export interface UnsubscribeError {
  __typename?: 'UnsubscribeError'
  errorCodes: UnsubscribeErrorCode[]
}

export enum UnsubscribeErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  AlreadyUnsubscribed = 'ALREADY_UNSUBSCRIBED',
  UnsubscribeMethodNotFound = 'UNSUBSCRIBE_METHOD_NOT_FOUND',
}

export type SubscribeResult = SubscribeSuccess | SubscribeError

export interface SubscribeSuccess {
  __typename?: 'SubscribeSuccess'
  subscriptions: Subscription[]
}

export interface SubscribeError {
  __typename?: 'SubscribeError'
  errorCodes: SubscribeErrorCode[]
}

export enum SubscribeErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  AlreadySubscribed = 'ALREADY_SUBSCRIBED',
}

export type AddPopularReadResult = AddPopularReadSuccess | AddPopularReadError

export interface AddPopularReadSuccess {
  __typename?: 'AddPopularReadSuccess'
  pageId: Scalars['String']
}

export interface AddPopularReadError {
  __typename?: 'AddPopularReadError'
  errorCodes: AddPopularReadErrorCode[]
}

export enum AddPopularReadErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export interface SetWebhookInput {
  id?: Maybe<Scalars['ID']>
  url: Scalars['String']
  eventTypes: WebhookEvent[]
  contentType?: Maybe<Scalars['String']>
  method?: Maybe<Scalars['String']>
  enabled?: Maybe<Scalars['Boolean']>
}

export enum WebhookEvent {
  PageCreated = 'PAGE_CREATED',
  PageUpdated = 'PAGE_UPDATED',
  PageDeleted = 'PAGE_DELETED',
  HighlightCreated = 'HIGHLIGHT_CREATED',
  HighlightUpdated = 'HIGHLIGHT_UPDATED',
  HighlightDeleted = 'HIGHLIGHT_DELETED',
  LabelCreated = 'LABEL_CREATED',
  LabelUpdated = 'LABEL_UPDATED',
  LabelDeleted = 'LABEL_DELETED',
}

export type SetWebhookResult = SetWebhookSuccess | SetWebhookError

export interface SetWebhookSuccess {
  __typename?: 'SetWebhookSuccess'
  webhook: Webhook
}

export interface Webhook {
  __typename?: 'Webhook'
  id: Scalars['ID']
  url: Scalars['String']
  eventTypes: WebhookEvent[]
  contentType: Scalars['String']
  method: Scalars['String']
  enabled: Scalars['Boolean']
  createdAt: Scalars['Date']
  updatedAt: Scalars['Date']
}

export interface SetWebhookError {
  __typename?: 'SetWebhookError'
  errorCodes: SetWebhookErrorCode[]
}

export enum SetWebhookErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  AlreadyExists = 'ALREADY_EXISTS',
  NotFound = 'NOT_FOUND',
}

export type DeleteWebhookResult = DeleteWebhookSuccess | DeleteWebhookError

export interface DeleteWebhookSuccess {
  __typename?: 'DeleteWebhookSuccess'
  webhook: Webhook
}

export interface DeleteWebhookError {
  __typename?: 'DeleteWebhookError'
  errorCodes: DeleteWebhookErrorCode[]
}

export enum DeleteWebhookErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export type WebhookResult = WebhookSuccess | WebhookError

export interface WebhookSuccess {
  __typename?: 'WebhookSuccess'
  webhook: Webhook
}

export interface WebhookError {
  __typename?: 'WebhookError'
  errorCodes: WebhookErrorCode[]
}

export enum WebhookErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export type WebhooksResult = WebhooksSuccess | WebhooksError

export interface WebhooksSuccess {
  __typename?: 'WebhooksSuccess'
  webhooks: Webhook[]
}

export interface WebhooksError {
  __typename?: 'WebhooksError'
  errorCodes: WebhooksErrorCode[]
}

export enum WebhooksErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export type ApiKeysResult = ApiKeysSuccess | ApiKeysError

export interface ApiKeysSuccess {
  __typename?: 'ApiKeysSuccess'
  apiKeys: ApiKey[]
}

export interface ApiKey {
  __typename?: 'ApiKey'
  id: Scalars['ID']
  name: Scalars['String']
  key?: Maybe<Scalars['String']>
  scopes?: Maybe<Array<Scalars['String']>>
  createdAt: Scalars['Date']
  expiresAt: Scalars['Date']
  usedAt?: Maybe<Scalars['Date']>
}

export interface ApiKeysError {
  __typename?: 'ApiKeysError'
  errorCodes: ApiKeysErrorCode[]
}

export enum ApiKeysErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export type RevokeApiKeyResult = RevokeApiKeySuccess | RevokeApiKeyError

export interface RevokeApiKeySuccess {
  __typename?: 'RevokeApiKeySuccess'
  apiKey: ApiKey
}

export interface RevokeApiKeyError {
  __typename?: 'RevokeApiKeyError'
  errorCodes: RevokeApiKeyErrorCode[]
}

export enum RevokeApiKeyErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export interface SetLabelsForHighlightInput {
  highlightId: Scalars['ID']
  labelIds: Array<Scalars['ID']>
}

export type TypeaheadSearchResult =
  | TypeaheadSearchSuccess
  | TypeaheadSearchError

export interface TypeaheadSearchSuccess {
  __typename?: 'TypeaheadSearchSuccess'
  items: TypeaheadSearchItem[]
}

export interface TypeaheadSearchError {
  __typename?: 'TypeaheadSearchError'
  errorCodes: TypeaheadSearchErrorCode[]
}

export enum TypeaheadSearchErrorCode {
  Unauthorized = 'UNAUTHORIZED',
}

export interface TypeaheadSearchItem {
  __typename?: 'TypeaheadSearchItem'
  id: Scalars['ID']
  title: Scalars['String']
  slug: Scalars['String']
  siteName?: Maybe<Scalars['String']>
  contentReader: ContentReader
}

export type UpdatesSinceResult = UpdatesSinceSuccess | UpdatesSinceError

export interface UpdatesSinceSuccess {
  __typename?: 'UpdatesSinceSuccess'
  edges: SyncUpdatedItemEdge[]
  pageInfo: PageInfo
}

export interface SyncUpdatedItemEdge {
  __typename?: 'SyncUpdatedItemEdge'
  cursor: Scalars['String']
  updateReason: UpdateReason
  itemID: Scalars['ID']
  node?: Maybe<SearchItem>
}

export enum UpdateReason {
  Created = 'CREATED',
  Updated = 'UPDATED',
  Deleted = 'DELETED',
}

export interface UpdatesSinceError {
  __typename?: 'UpdatesSinceError'
  errorCodes: UpdatesSinceErrorCode[]
}

export enum UpdatesSinceErrorCode {
  Unauthorized = 'UNAUTHORIZED',
}

export interface MoveLabelInput {
  labelId: Scalars['ID']
  afterLabelId?: Maybe<Scalars['ID']>
}

export type MoveLabelResult = MoveLabelSuccess | MoveLabelError

export interface MoveLabelSuccess {
  __typename?: 'MoveLabelSuccess'
  label: Label
}

export interface MoveLabelError {
  __typename?: 'MoveLabelError'
  errorCodes: MoveLabelErrorCode[]
}

export enum MoveLabelErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export type SetIntegrationResult = SetIntegrationSuccess | SetIntegrationError

export interface SetIntegrationSuccess {
  __typename?: 'SetIntegrationSuccess'
  integration: Integration
}

export interface Integration {
  __typename?: 'Integration'
  id: Scalars['ID']
  name: Scalars['String']
  type: IntegrationType
  token: Scalars['String']
  enabled: Scalars['Boolean']
  createdAt: Scalars['Date']
  updatedAt: Scalars['Date']
}

export enum IntegrationType {
  Export = 'EXPORT',
  Import = 'IMPORT',
}

export interface SetIntegrationError {
  __typename?: 'SetIntegrationError'
  errorCodes: SetIntegrationErrorCode[]
}

export enum SetIntegrationErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  InvalidToken = 'INVALID_TOKEN',
  AlreadyExists = 'ALREADY_EXISTS',
}

export interface SetIntegrationInput {
  id?: Maybe<Scalars['ID']>
  name: Scalars['String']
  type?: Maybe<IntegrationType>
  token: Scalars['String']
  enabled: Scalars['Boolean']
}

export type IntegrationsResult = IntegrationsSuccess | IntegrationsError

export interface IntegrationsSuccess {
  __typename?: 'IntegrationsSuccess'
  integrations: Integration[]
}

export interface IntegrationsError {
  __typename?: 'IntegrationsError'
  errorCodes: IntegrationsErrorCode[]
}

export enum IntegrationsErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export type DeleteIntegrationResult =
  | DeleteIntegrationSuccess
  | DeleteIntegrationError

export interface DeleteIntegrationSuccess {
  __typename?: 'DeleteIntegrationSuccess'
  integration: Integration
}

export interface DeleteIntegrationError {
  __typename?: 'DeleteIntegrationError'
  errorCodes: DeleteIntegrationErrorCode[]
}

export enum DeleteIntegrationErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export type RecentSearchesResult = RecentSearchesSuccess | RecentSearchesError

export interface RecentSearchesSuccess {
  __typename?: 'RecentSearchesSuccess'
  searches: RecentSearch[]
}

export interface RecentSearch {
  __typename?: 'RecentSearch'
  id: Scalars['ID']
  term: Scalars['String']
  createdAt: Scalars['Date']
}

export interface RecentSearchesError {
  __typename?: 'RecentSearchesError'
  errorCodes: RecentSearchesErrorCode[]
}

export enum RecentSearchesErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export interface OptInFeatureInput {
  name: Scalars['String']
}

export type OptInFeatureResult = OptInFeatureSuccess | OptInFeatureError

export interface OptInFeatureSuccess {
  __typename?: 'OptInFeatureSuccess'
  feature: Feature
}

export interface Feature {
  __typename?: 'Feature'
  id: Scalars['ID']
  name: Scalars['String']
  token: Scalars['String']
  createdAt: Scalars['Date']
  updatedAt: Scalars['Date']
  grantedAt?: Maybe<Scalars['Date']>
  expiresAt?: Maybe<Scalars['Date']>
}

export interface OptInFeatureError {
  __typename?: 'OptInFeatureError'
  errorCodes: OptInFeatureErrorCode[]
}

export enum OptInFeatureErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export type RulesResult = RulesSuccess | RulesError

export interface RulesSuccess {
  __typename?: 'RulesSuccess'
  rules: Rule[]
}

export interface Rule {
  __typename?: 'Rule'
  id: Scalars['ID']
  name: Scalars['String']
  filter: Scalars['String']
  actions: RuleAction[]
  enabled: Scalars['Boolean']
  createdAt: Scalars['Date']
  updatedAt: Scalars['Date']
}

export interface RuleAction {
  __typename?: 'RuleAction'
  type: RuleActionType
  params: Array<Scalars['String']>
}

export enum RuleActionType {
  AddLabel = 'ADD_LABEL',
  Archive = 'ARCHIVE',
  MarkAsRead = 'MARK_AS_READ',
  SendNotification = 'SEND_NOTIFICATION',
}

export interface RulesError {
  __typename?: 'RulesError'
  errorCodes: RulesErrorCode[]
}

export enum RulesErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export interface SetRuleInput {
  id?: Maybe<Scalars['ID']>
  name: Scalars['String']
  description?: Maybe<Scalars['String']>
  filter: Scalars['String']
  actions: RuleActionInput[]
  enabled: Scalars['Boolean']
}

export interface RuleActionInput {
  type: RuleActionType
  params: Array<Scalars['String']>
}

export type SetRuleResult = SetRuleSuccess | SetRuleError

export interface SetRuleSuccess {
  __typename?: 'SetRuleSuccess'
  rule: Rule
}

export interface SetRuleError {
  __typename?: 'SetRuleError'
  errorCodes: SetRuleErrorCode[]
}

export enum SetRuleErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export type DeleteRuleResult = DeleteRuleSuccess | DeleteRuleError

export interface DeleteRuleSuccess {
  __typename?: 'DeleteRuleSuccess'
  rule: Rule
}

export interface DeleteRuleError {
  __typename?: 'DeleteRuleError'
  errorCodes: DeleteRuleErrorCode[]
}

export enum DeleteRuleErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export type DeviceTokensResult = DeviceTokensSuccess | DeviceTokensError

export interface DeviceTokensSuccess {
  __typename?: 'DeviceTokensSuccess'
  deviceTokens: DeviceToken[]
}

export interface DeviceTokensError {
  __typename?: 'DeviceTokensError'
  errorCodes: DeviceTokensErrorCode[]
}

export enum DeviceTokensErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export interface SaveFilterInput {
  id?: Maybe<Scalars['ID']>
  name: Scalars['String']
  filter: Scalars['String']
  description?: Maybe<Scalars['String']>
}

export type SaveFilterResult = SaveFilterSuccess | SaveFilterError

export interface SaveFilterSuccess {
  __typename?: 'SaveFilterSuccess'
  filter: Filter
}

export interface Filter {
  __typename?: 'Filter'
  id: Scalars['ID']
  name: Scalars['String']
  filter: Scalars['String']
  position: Scalars['Int']
  description?: Maybe<Scalars['String']>
  createdAt: Scalars['Date']
  updatedAt: Scalars['Date']
}

export interface SaveFilterError {
  __typename?: 'SaveFilterError'
  errorCodes: SaveFilterErrorCode[]
}

export enum SaveFilterErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export type FiltersResult = FiltersSuccess | FiltersError

export interface FiltersSuccess {
  __typename?: 'FiltersSuccess'
  filters: Filter[]
}

export interface FiltersError {
  __typename?: 'FiltersError'
  errorCodes: FiltersErrorCode[]
}

export enum FiltersErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export type DeleteFilterResult = DeleteFilterSuccess | DeleteFilterError

export interface DeleteFilterSuccess {
  __typename?: 'DeleteFilterSuccess'
  filter: Filter
}

export interface DeleteFilterError {
  __typename?: 'DeleteFilterError'
  errorCodes: DeleteFilterErrorCode[]
}

export enum DeleteFilterErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export interface MoveFilterInput {
  filterId: Scalars['ID']
  afterFilterId?: Maybe<Scalars['ID']>
}

export type MoveFilterResult = MoveFilterSuccess | MoveFilterError

export interface MoveFilterSuccess {
  __typename?: 'MoveFilterSuccess'
  filter: Filter
}

export interface MoveFilterError {
  __typename?: 'MoveFilterError'
  errorCodes: MoveFilterErrorCode[]
}

export enum MoveFilterErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export interface CreateGroupInput {
  name: Scalars['String']
  maxMembers?: Maybe<Scalars['Int']>
  expiresInDays?: Maybe<Scalars['Int']>
  description?: Maybe<Scalars['String']>
  topics?: Maybe<Array<Scalars['String']>>
  onlyAdminCanPost?: Maybe<Scalars['Boolean']>
  onlyAdminCanSeeMembers?: Maybe<Scalars['Boolean']>
}

export type CreateGroupResult = CreateGroupSuccess | CreateGroupError

export interface CreateGroupSuccess {
  __typename?: 'CreateGroupSuccess'
  group: RecommendationGroup
}

export interface RecommendationGroup {
  __typename?: 'RecommendationGroup'
  id: Scalars['ID']
  name: Scalars['String']
  inviteUrl: Scalars['String']
  admins: User[]
  members: User[]
  createdAt: Scalars['Date']
  updatedAt: Scalars['Date']
  canPost: Scalars['Boolean']
  description?: Maybe<Scalars['String']>
  topics?: Maybe<Array<Scalars['String']>>
  canSeeMembers: Scalars['Boolean']
}

export interface CreateGroupError {
  __typename?: 'CreateGroupError'
  errorCodes: CreateGroupErrorCode[]
}

export enum CreateGroupErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export type GroupsResult = GroupsSuccess | GroupsError

export interface GroupsSuccess {
  __typename?: 'GroupsSuccess'
  groups: RecommendationGroup[]
}

export interface GroupsError {
  __typename?: 'GroupsError'
  errorCodes: GroupsErrorCode[]
}

export enum GroupsErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export interface RecommendInput {
  pageId: Scalars['ID']
  groupIds: Array<Scalars['ID']>
  note?: Maybe<Scalars['String']>
  recommendedWithHighlights?: Maybe<Scalars['Boolean']>
}

export type RecommendResult = RecommendSuccess | RecommendError

export interface RecommendSuccess {
  __typename?: 'RecommendSuccess'
  success: Scalars['Boolean']
}

export interface RecommendError {
  __typename?: 'RecommendError'
  errorCodes: RecommendErrorCode[]
}

export enum RecommendErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export type JoinGroupResult = JoinGroupSuccess | JoinGroupError

export interface JoinGroupSuccess {
  __typename?: 'JoinGroupSuccess'
  group: RecommendationGroup
}

export interface JoinGroupError {
  __typename?: 'JoinGroupError'
  errorCodes: JoinGroupErrorCode[]
}

export enum JoinGroupErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export interface RecommendHighlightsInput {
  pageId: Scalars['ID']
  highlightIds: Array<Scalars['ID']>
  groupIds: Array<Scalars['ID']>
  note?: Maybe<Scalars['String']>
}

export type RecommendHighlightsResult =
  | RecommendHighlightsSuccess
  | RecommendHighlightsError

export interface RecommendHighlightsSuccess {
  __typename?: 'RecommendHighlightsSuccess'
  success: Scalars['Boolean']
}

export interface RecommendHighlightsError {
  __typename?: 'RecommendHighlightsError'
  errorCodes: RecommendHighlightsErrorCode[]
}

export enum RecommendHighlightsErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export type LeaveGroupResult = LeaveGroupSuccess | LeaveGroupError

export interface LeaveGroupSuccess {
  __typename?: 'LeaveGroupSuccess'
  success: Scalars['Boolean']
}

export interface LeaveGroupError {
  __typename?: 'LeaveGroupError'
  errorCodes: LeaveGroupErrorCode[]
}

export enum LeaveGroupErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export enum UploadImportFileType {
  UrlList = 'URL_LIST',
  Pocket = 'POCKET',
  Matter = 'MATTER',
}

export enum UploadImportFileErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  UploadDailyLimitExceeded = 'UPLOAD_DAILY_LIMIT_EXCEEDED',
}

export type UploadImportFileResult =
  | UploadImportFileSuccess
  | UploadImportFileError

export interface UploadImportFileError {
  __typename?: 'UploadImportFileError'
  errorCodes: UploadImportFileErrorCode[]
}

export interface UploadImportFileSuccess {
  __typename?: 'UploadImportFileSuccess'
  uploadSignedUrl?: Maybe<Scalars['String']>
}

export type RecentEmailsResult = RecentEmailsSuccess | RecentEmailsError

export interface RecentEmailsSuccess {
  __typename?: 'RecentEmailsSuccess'
  recentEmails: RecentEmail[]
}

export interface RecentEmailsError {
  __typename?: 'RecentEmailsError'
  errorCodes: RecentEmailsErrorCode[]
}

export enum RecentEmailsErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export interface RecentEmail {
  __typename?: 'RecentEmail'
  id: Scalars['ID']
  from: Scalars['String']
  to: Scalars['String']
  subject: Scalars['String']
  type: Scalars['String']
  text: Scalars['String']
  html?: Maybe<Scalars['String']>
  createdAt: Scalars['Date']
}

export type MarkEmailAsItemResult =
  | MarkEmailAsItemSuccess
  | MarkEmailAsItemError

export interface MarkEmailAsItemSuccess {
  __typename?: 'MarkEmailAsItemSuccess'
  success: Scalars['Boolean']
}

export interface MarkEmailAsItemError {
  __typename?: 'MarkEmailAsItemError'
  errorCodes: MarkEmailAsItemErrorCode[]
}

export enum MarkEmailAsItemErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
}

export enum BulkActionType {
  Delete = 'DELETE',
  Archive = 'ARCHIVE',
  MarkAsRead = 'MARK_AS_READ',
  AddLabels = 'ADD_LABELS',
}

export type BulkActionResult = BulkActionSuccess | BulkActionError

export interface BulkActionSuccess {
  __typename?: 'BulkActionSuccess'
  success: Scalars['Boolean']
}

export interface BulkActionError {
  __typename?: 'BulkActionError'
  errorCodes: BulkActionErrorCode[]
}

export enum BulkActionErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export type ImportFromIntegrationResult =
  | ImportFromIntegrationSuccess
  | ImportFromIntegrationError

export interface ImportFromIntegrationSuccess {
  __typename?: 'ImportFromIntegrationSuccess'
  success: Scalars['Boolean']
}

export interface ImportFromIntegrationError {
  __typename?: 'ImportFromIntegrationError'
  errorCodes: ImportFromIntegrationErrorCode[]
}

export enum ImportFromIntegrationErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
}

export type SetFavoriteArticleResult =
  | SetFavoriteArticleSuccess
  | SetFavoriteArticleError

export interface SetFavoriteArticleSuccess {
  __typename?: 'SetFavoriteArticleSuccess'
  favoriteArticle: Article
}

export interface SetFavoriteArticleError {
  __typename?: 'SetFavoriteArticleError'
  errorCodes: SetFavoriteArticleErrorCode[]
}

export enum SetFavoriteArticleErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  AlreadyExists = 'ALREADY_EXISTS',
}

export interface Mutation {
  __typename?: 'Mutation'
  googleLogin: LoginResult
  googleSignup: GoogleSignupResult
  logOut: LogOutResult
  deleteAccount: DeleteAccountResult
  updateUser: UpdateUserResult
  updateUserProfile: UpdateUserProfileResult
  createArticle: CreateArticleResult
  createHighlight: CreateHighlightResult
  mergeHighlight: MergeHighlightResult
  updateHighlight: UpdateHighlightResult
  deleteHighlight: DeleteHighlightResult
  createHighlightReply: CreateHighlightReplyResult
  updateHighlightReply: UpdateHighlightReplyResult
  deleteHighlightReply: DeleteHighlightReplyResult
  createReaction: CreateReactionResult
  deleteReaction: DeleteReactionResult
  uploadFileRequest: UploadFileRequestResult
  saveArticleReadingProgress: SaveArticleReadingProgressResult
  setShareArticle: SetShareArticleResult
  updateSharedComment: UpdateSharedCommentResult
  setFollow: SetFollowResult
  setBookmarkArticle: SetBookmarkArticleResult
  setUserPersonalization: SetUserPersonalizationResult
  createArticleSavingRequest: CreateArticleSavingRequestResult
  setShareHighlight: SetShareHighlightResult
  reportItem: ReportItemResult
  updateLinkShareInfo: UpdateLinkShareInfoResult
  setLinkArchived: ArchiveLinkResult
  createNewsletterEmail: CreateNewsletterEmailResult
  deleteNewsletterEmail: DeleteNewsletterEmailResult
  saveUrl: SaveResult
  savePage: SaveResult
  updatePage: UpdatePageResult
  saveFile: SaveResult
  createReminder: CreateReminderResult
  updateReminder: UpdateReminderResult
  deleteReminder: DeleteReminderResult
  setDeviceToken: SetDeviceTokenResult
  createLabel: CreateLabelResult
  updateLabel: UpdateLabelResult
  deleteLabel: DeleteLabelResult
  setLabels: SetLabelsResult
  generateApiKey: GenerateApiKeyResult
  unsubscribe: UnsubscribeResult
  subscribe: SubscribeResult
  addPopularRead: AddPopularReadResult
  setWebhook: SetWebhookResult
  deleteWebhook: DeleteWebhookResult
  revokeApiKey: RevokeApiKeyResult
  setLabelsForHighlight: SetLabelsResult
  moveLabel: MoveLabelResult
  setIntegration: SetIntegrationResult
  deleteIntegration: DeleteIntegrationResult
  optInFeature: OptInFeatureResult
  setRule: SetRuleResult
  deleteRule: DeleteRuleResult
  saveFilter: SaveFilterResult
  deleteFilter: DeleteFilterResult
  moveFilter: MoveFilterResult
  createGroup: CreateGroupResult
  recommend: RecommendResult
  joinGroup: JoinGroupResult
  recommendHighlights: RecommendHighlightsResult
  leaveGroup: LeaveGroupResult
  uploadImportFile: UploadImportFileResult
  markEmailAsItem: MarkEmailAsItemResult
  bulkAction: BulkActionResult
  importFromIntegration: ImportFromIntegrationResult
  setFavoriteArticle: SetFavoriteArticleResult
}

export interface MutationGoogleLoginArgs {
  input: GoogleLoginInput
}

export interface MutationGoogleSignupArgs {
  input: GoogleSignupInput
}

export interface MutationDeleteAccountArgs {
  userID: Scalars['ID']
}

export interface MutationUpdateUserArgs {
  input: UpdateUserInput
}

export interface MutationUpdateUserProfileArgs {
  input: UpdateUserProfileInput
}

export interface MutationCreateArticleArgs {
  input: CreateArticleInput
}

export interface MutationCreateHighlightArgs {
  input: CreateHighlightInput
}

export interface MutationMergeHighlightArgs {
  input: MergeHighlightInput
}

export interface MutationUpdateHighlightArgs {
  input: UpdateHighlightInput
}

export interface MutationDeleteHighlightArgs {
  highlightId: Scalars['ID']
}

export interface MutationCreateHighlightReplyArgs {
  input: CreateHighlightReplyInput
}

export interface MutationUpdateHighlightReplyArgs {
  input: UpdateHighlightReplyInput
}

export interface MutationDeleteHighlightReplyArgs {
  highlightReplyId: Scalars['ID']
}

export interface MutationCreateReactionArgs {
  input: CreateReactionInput
}

export interface MutationDeleteReactionArgs {
  id: Scalars['ID']
}

export interface MutationUploadFileRequestArgs {
  input: UploadFileRequestInput
}

export interface MutationSaveArticleReadingProgressArgs {
  input: SaveArticleReadingProgressInput
}

export interface MutationSetShareArticleArgs {
  input: SetShareArticleInput
}

export interface MutationUpdateSharedCommentArgs {
  input: UpdateSharedCommentInput
}

export interface MutationSetFollowArgs {
  input: SetFollowInput
}

export interface MutationSetBookmarkArticleArgs {
  input: SetBookmarkArticleInput
}

export interface MutationSetUserPersonalizationArgs {
  input: SetUserPersonalizationInput
}

export interface MutationCreateArticleSavingRequestArgs {
  input: CreateArticleSavingRequestInput
}

export interface MutationSetShareHighlightArgs {
  input: SetShareHighlightInput
}

export interface MutationReportItemArgs {
  input: ReportItemInput
}

export interface MutationUpdateLinkShareInfoArgs {
  input: UpdateLinkShareInfoInput
}

export interface MutationSetLinkArchivedArgs {
  input: ArchiveLinkInput
}

export interface MutationDeleteNewsletterEmailArgs {
  newsletterEmailId: Scalars['ID']
}

export interface MutationSaveUrlArgs {
  input: SaveUrlInput
}

export interface MutationSavePageArgs {
  input: SavePageInput
}

export interface MutationUpdatePageArgs {
  input: UpdatePageInput
}

export interface MutationSaveFileArgs {
  input: SaveFileInput
}

export interface MutationCreateReminderArgs {
  input: CreateReminderInput
}

export interface MutationUpdateReminderArgs {
  input: UpdateReminderInput
}

export interface MutationDeleteReminderArgs {
  id: Scalars['ID']
}

export interface MutationSetDeviceTokenArgs {
  input: SetDeviceTokenInput
}

export interface MutationCreateLabelArgs {
  input: CreateLabelInput
}

export interface MutationUpdateLabelArgs {
  input: UpdateLabelInput
}

export interface MutationDeleteLabelArgs {
  id: Scalars['ID']
}

export interface MutationSetLabelsArgs {
  input: SetLabelsInput
}

export interface MutationGenerateApiKeyArgs {
  input: GenerateApiKeyInput
}

export interface MutationUnsubscribeArgs {
  name: Scalars['String']
}

export interface MutationSubscribeArgs {
  name: Scalars['String']
}

export interface MutationAddPopularReadArgs {
  name: Scalars['String']
}

export interface MutationSetWebhookArgs {
  input: SetWebhookInput
}

export interface MutationDeleteWebhookArgs {
  id: Scalars['ID']
}

export interface MutationRevokeApiKeyArgs {
  id: Scalars['ID']
}

export interface MutationSetLabelsForHighlightArgs {
  input: SetLabelsForHighlightInput
}

export interface MutationMoveLabelArgs {
  input: MoveLabelInput
}

export interface MutationSetIntegrationArgs {
  input: SetIntegrationInput
}

export interface MutationDeleteIntegrationArgs {
  id: Scalars['ID']
}

export interface MutationOptInFeatureArgs {
  input: OptInFeatureInput
}

export interface MutationSetRuleArgs {
  input: SetRuleInput
}

export interface MutationDeleteRuleArgs {
  id: Scalars['ID']
}

export interface MutationSaveFilterArgs {
  input: SaveFilterInput
}

export interface MutationDeleteFilterArgs {
  id: Scalars['ID']
}

export interface MutationMoveFilterArgs {
  input: MoveFilterInput
}

export interface MutationCreateGroupArgs {
  input: CreateGroupInput
}

export interface MutationRecommendArgs {
  input: RecommendInput
}

export interface MutationJoinGroupArgs {
  inviteCode: Scalars['String']
}

export interface MutationRecommendHighlightsArgs {
  input: RecommendHighlightsInput
}

export interface MutationLeaveGroupArgs {
  groupId: Scalars['ID']
}

export interface MutationUploadImportFileArgs {
  type: UploadImportFileType
  contentType: Scalars['String']
}

export interface MutationMarkEmailAsItemArgs {
  recentEmailId: Scalars['ID']
}

export interface MutationBulkActionArgs {
  query: Scalars['String']
  action: BulkActionType
  labelIds?: Maybe<Array<Scalars['ID']>>
  expectedCount?: Maybe<Scalars['Int']>
  async?: Maybe<Scalars['Boolean']>
}

export interface MutationImportFromIntegrationArgs {
  integrationId: Scalars['ID']
}

export interface MutationSetFavoriteArticleArgs {
  id: Scalars['ID']
}

export interface Query {
  __typename?: 'Query'
  hello?: Maybe<Scalars['String']>
  me?: Maybe<User>
  user: UserResult
  articles: ArticlesResult
  article: ArticleResult
  sharedArticle: SharedArticleResult
  feedArticles: FeedArticlesResult
  users: UsersResult
  validateUsername: Scalars['Boolean']
  getFollowers: GetFollowersResult
  getFollowing: GetFollowingResult
  getUserPersonalization: GetUserPersonalizationResult
  articleSavingRequest: ArticleSavingRequestResult
  newsletterEmails: NewsletterEmailsResult
  reminder: ReminderResult
  labels: LabelsResult
  search: SearchResult
  subscriptions: SubscriptionsResult
  sendInstallInstructions: SendInstallInstructionsResult
  webhooks: WebhooksResult
  webhook: WebhookResult
  apiKeys: ApiKeysResult
  typeaheadSearch: TypeaheadSearchResult
  updatesSince: UpdatesSinceResult
  integrations: IntegrationsResult
  recentSearches: RecentSearchesResult
  rules: RulesResult
  deviceTokens: DeviceTokensResult
  filters: FiltersResult
  groups: GroupsResult
  recentEmails: RecentEmailsResult
}

export interface QueryUserArgs {
  userId?: Maybe<Scalars['ID']>
  username?: Maybe<Scalars['String']>
}

export interface QueryArticlesArgs {
  sharedOnly?: Maybe<Scalars['Boolean']>
  sort?: Maybe<SortParams>
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  query?: Maybe<Scalars['String']>
  includePending?: Maybe<Scalars['Boolean']>
}

export interface QueryArticleArgs {
  username: Scalars['String']
  slug: Scalars['String']
  format?: Maybe<Scalars['String']>
}

export interface QuerySharedArticleArgs {
  username: Scalars['String']
  slug: Scalars['String']
  selectedHighlightId?: Maybe<Scalars['String']>
}

export interface QueryFeedArticlesArgs {
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  sort?: Maybe<SortParams>
  sharedByUser?: Maybe<Scalars['ID']>
}

export interface QueryValidateUsernameArgs {
  username: Scalars['String']
}

export interface QueryGetFollowersArgs {
  userId?: Maybe<Scalars['ID']>
}

export interface QueryGetFollowingArgs {
  userId?: Maybe<Scalars['ID']>
}

export interface QueryArticleSavingRequestArgs {
  id?: Maybe<Scalars['ID']>
  url?: Maybe<Scalars['String']>
}

export interface QueryReminderArgs {
  linkId: Scalars['ID']
}

export interface QuerySearchArgs {
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  query?: Maybe<Scalars['String']>
  includeContent?: Maybe<Scalars['Boolean']>
  format?: Maybe<Scalars['String']>
}

export interface QuerySubscriptionsArgs {
  sort?: Maybe<SortParams>
}

export interface QueryWebhookArgs {
  id: Scalars['ID']
}

export interface QueryTypeaheadSearchArgs {
  query: Scalars['String']
  first?: Maybe<Scalars['Int']>
}

export interface QueryUpdatesSinceArgs {
  after?: Maybe<Scalars['String']>
  first?: Maybe<Scalars['Int']>
  since: Scalars['Date']
  sort?: Maybe<SortParams>
}

export interface QueryRulesArgs {
  enabled?: Maybe<Scalars['Boolean']>
}
