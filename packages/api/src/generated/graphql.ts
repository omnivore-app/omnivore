import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ResolverContext } from '../resolvers/types';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
};


export type ArchiveLinkError = {
  __typename?: 'ArchiveLinkError';
  message: Scalars['String'];
  errorCodes: Array<ArchiveLinkErrorCode>;
};

export enum ArchiveLinkErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST'
}

export type ArchiveLinkInput = {
  linkId: Scalars['ID'];
  archived: Scalars['Boolean'];
};

export type ArchiveLinkResult = ArchiveLinkSuccess | ArchiveLinkError;

export type ArchiveLinkSuccess = {
  __typename?: 'ArchiveLinkSuccess';
  linkId: Scalars['String'];
  message: Scalars['String'];
};

export type Article = {
  __typename?: 'Article';
  id: Scalars['ID'];
  title: Scalars['String'];
  slug: Scalars['String'];
  url: Scalars['String'];
  hash: Scalars['String'];
  content: Scalars['String'];
  pageType?: Maybe<PageType>;
  contentReader: ContentReader;
  hasContent?: Maybe<Scalars['Boolean']>;
  author?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  originalHtml?: Maybe<Scalars['String']>;
  createdAt: Scalars['Date'];
  savedAt: Scalars['Date'];
  publishedAt?: Maybe<Scalars['Date']>;
  readingProgressPercent: Scalars['Float'];
  readingProgressAnchorIndex: Scalars['Int'];
  sharedComment?: Maybe<Scalars['String']>;
  savedByViewer?: Maybe<Scalars['Boolean']>;
  postedByViewer?: Maybe<Scalars['Boolean']>;
  originalArticleUrl?: Maybe<Scalars['String']>;
  highlights: Array<Highlight>;
  shareInfo?: Maybe<LinkShareInfo>;
  isArchived: Scalars['Boolean'];
};


export type ArticleHighlightsArgs = {
  input?: Maybe<ArticleHighlightsInput>;
};

export type ArticleEdge = {
  __typename?: 'ArticleEdge';
  cursor: Scalars['String'];
  node: Article;
};

export type ArticleError = {
  __typename?: 'ArticleError';
  errorCodes: Array<ArticleErrorCode>;
};

export enum ArticleErrorCode {
  NotFound = 'NOT_FOUND',
  BadData = 'BAD_DATA',
  Unauthorized = 'UNAUTHORIZED'
}

export type ArticleHighlightsInput = {
  includeFriends?: Maybe<Scalars['Boolean']>;
};

export type ArticleResult = ArticleSuccess | ArticleError;

export type ArticleSavingRequest = {
  __typename?: 'ArticleSavingRequest';
  id: Scalars['ID'];
  /** @deprecated userId has been replaced with user */
  userId: Scalars['ID'];
  user: User;
  article?: Maybe<Article>;
  status: ArticleSavingRequestStatus;
  errorCode?: Maybe<CreateArticleErrorCode>;
  createdAt: Scalars['Date'];
  updatedAt: Scalars['Date'];
};

export type ArticleSavingRequestError = {
  __typename?: 'ArticleSavingRequestError';
  errorCodes: Array<ArticleSavingRequestErrorCode>;
};

export enum ArticleSavingRequestErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  NotFound = 'NOT_FOUND'
}

export type ArticleSavingRequestResult = ArticleSavingRequestSuccess | ArticleSavingRequestError;

export enum ArticleSavingRequestStatus {
  Processing = 'PROCESSING',
  Succeeded = 'SUCCEEDED',
  Failed = 'FAILED'
}

export type ArticleSavingRequestSuccess = {
  __typename?: 'ArticleSavingRequestSuccess';
  articleSavingRequest: ArticleSavingRequest;
};

export type ArticleSuccess = {
  __typename?: 'ArticleSuccess';
  article: Article;
};

export type ArticlesError = {
  __typename?: 'ArticlesError';
  errorCodes: Array<ArticlesErrorCode>;
};

export enum ArticlesErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type ArticlesResult = ArticlesSuccess | ArticlesError;

export type ArticlesSuccess = {
  __typename?: 'ArticlesSuccess';
  edges: Array<ArticleEdge>;
  pageInfo: PageInfo;
};

export enum ContentReader {
  Web = 'WEB',
  Pdf = 'PDF'
}

export type CreateArticleError = {
  __typename?: 'CreateArticleError';
  errorCodes: Array<CreateArticleErrorCode>;
};

export enum CreateArticleErrorCode {
  UnableToFetch = 'UNABLE_TO_FETCH',
  UnableToParse = 'UNABLE_TO_PARSE',
  Unauthorized = 'UNAUTHORIZED',
  NotAllowedToParse = 'NOT_ALLOWED_TO_PARSE',
  PayloadTooLarge = 'PAYLOAD_TOO_LARGE',
  UploadFileMissing = 'UPLOAD_FILE_MISSING'
}

export type CreateArticleInput = {
  url: Scalars['String'];
  preparedDocument?: Maybe<PreparedDocumentInput>;
  articleSavingRequestId?: Maybe<Scalars['ID']>;
  uploadFileId?: Maybe<Scalars['ID']>;
  skipParsing?: Maybe<Scalars['Boolean']>;
  source?: Maybe<Scalars['String']>;
};

export type CreateArticleResult = CreateArticleSuccess | CreateArticleError;

export type CreateArticleSavingRequestError = {
  __typename?: 'CreateArticleSavingRequestError';
  errorCodes: Array<CreateArticleSavingRequestErrorCode>;
};

export enum CreateArticleSavingRequestErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadData = 'BAD_DATA'
}

export type CreateArticleSavingRequestInput = {
  url: Scalars['String'];
};

export type CreateArticleSavingRequestResult = CreateArticleSavingRequestSuccess | CreateArticleSavingRequestError;

export type CreateArticleSavingRequestSuccess = {
  __typename?: 'CreateArticleSavingRequestSuccess';
  articleSavingRequest: ArticleSavingRequest;
};

export type CreateArticleSuccess = {
  __typename?: 'CreateArticleSuccess';
  createdArticle: Article;
  user: User;
  created: Scalars['Boolean'];
};

export type CreateHighlightError = {
  __typename?: 'CreateHighlightError';
  errorCodes: Array<CreateHighlightErrorCode>;
};

export enum CreateHighlightErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  BadData = 'BAD_DATA',
  NotFound = 'NOT_FOUND',
  AlreadyExists = 'ALREADY_EXISTS'
}

export type CreateHighlightInput = {
  id: Scalars['ID'];
  shortId: Scalars['String'];
  articleId: Scalars['ID'];
  patch: Scalars['String'];
  quote: Scalars['String'];
  prefix?: Maybe<Scalars['String']>;
  suffix?: Maybe<Scalars['String']>;
  annotation?: Maybe<Scalars['String']>;
  sharedAt?: Maybe<Scalars['Date']>;
};

export type CreateHighlightReplyError = {
  __typename?: 'CreateHighlightReplyError';
  errorCodes: Array<CreateHighlightReplyErrorCode>;
};

export enum CreateHighlightReplyErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  EmptyAnnotation = 'EMPTY_ANNOTATION'
}

export type CreateHighlightReplyInput = {
  highlightId: Scalars['ID'];
  text: Scalars['String'];
};

export type CreateHighlightReplyResult = CreateHighlightReplySuccess | CreateHighlightReplyError;

export type CreateHighlightReplySuccess = {
  __typename?: 'CreateHighlightReplySuccess';
  highlightReply: HighlightReply;
};

export type CreateHighlightResult = CreateHighlightSuccess | CreateHighlightError;

export type CreateHighlightSuccess = {
  __typename?: 'CreateHighlightSuccess';
  highlight: Highlight;
};

export type CreateLabelError = {
  __typename?: 'CreateLabelError';
  errorCodes: Array<CreateLabelErrorCode>;
};

export enum CreateLabelErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND'
}

export type CreateLabelInput = {
  linkId: Scalars['ID'];
  name: Scalars['String'];
};

export type CreateLabelResult = CreateLabelSuccess | CreateLabelError;

export type CreateLabelSuccess = {
  __typename?: 'CreateLabelSuccess';
  label: Label;
};

export type CreateNewsletterEmailError = {
  __typename?: 'CreateNewsletterEmailError';
  errorCodes: Array<CreateNewsletterEmailErrorCode>;
};

export enum CreateNewsletterEmailErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST'
}

export type CreateNewsletterEmailResult = CreateNewsletterEmailSuccess | CreateNewsletterEmailError;

export type CreateNewsletterEmailSuccess = {
  __typename?: 'CreateNewsletterEmailSuccess';
  newsletterEmail: NewsletterEmail;
};

export type CreateReactionError = {
  __typename?: 'CreateReactionError';
  errorCodes: Array<CreateReactionErrorCode>;
};

export enum CreateReactionErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  BadTarget = 'BAD_TARGET',
  BadCode = 'BAD_CODE',
  NotFound = 'NOT_FOUND'
}

export type CreateReactionInput = {
  highlightId?: Maybe<Scalars['ID']>;
  userArticleId?: Maybe<Scalars['ID']>;
  code: ReactionType;
};

export type CreateReactionResult = CreateReactionSuccess | CreateReactionError;

export type CreateReactionSuccess = {
  __typename?: 'CreateReactionSuccess';
  reaction: Reaction;
};

export type CreateReminderError = {
  __typename?: 'CreateReminderError';
  errorCodes: Array<CreateReminderErrorCode>;
};

export enum CreateReminderErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND'
}

export type CreateReminderInput = {
  linkId?: Maybe<Scalars['ID']>;
  clientRequestId?: Maybe<Scalars['ID']>;
  archiveUntil: Scalars['Boolean'];
  sendNotification: Scalars['Boolean'];
  remindAt: Scalars['Date'];
};

export type CreateReminderResult = CreateReminderSuccess | CreateReminderError;

export type CreateReminderSuccess = {
  __typename?: 'CreateReminderSuccess';
  reminder: Reminder;
};


export type DeleteHighlightError = {
  __typename?: 'DeleteHighlightError';
  errorCodes: Array<DeleteHighlightErrorCode>;
};

export enum DeleteHighlightErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND'
}

export type DeleteHighlightReplyError = {
  __typename?: 'DeleteHighlightReplyError';
  errorCodes: Array<DeleteHighlightReplyErrorCode>;
};

export enum DeleteHighlightReplyErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND'
}

export type DeleteHighlightReplyResult = DeleteHighlightReplySuccess | DeleteHighlightReplyError;

export type DeleteHighlightReplySuccess = {
  __typename?: 'DeleteHighlightReplySuccess';
  highlightReply: HighlightReply;
};

export type DeleteHighlightResult = DeleteHighlightSuccess | DeleteHighlightError;

export type DeleteHighlightSuccess = {
  __typename?: 'DeleteHighlightSuccess';
  highlight: Highlight;
};

export type DeleteLabelError = {
  __typename?: 'DeleteLabelError';
  errorCodes: Array<DeleteLabelErrorCode>;
};

export enum DeleteLabelErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND'
}

export type DeleteLabelResult = DeleteLabelSuccess | DeleteLabelError;

export type DeleteLabelSuccess = {
  __typename?: 'DeleteLabelSuccess';
  label: Label;
};

export type DeleteNewsletterEmailError = {
  __typename?: 'DeleteNewsletterEmailError';
  errorCodes: Array<DeleteNewsletterEmailErrorCode>;
};

export enum DeleteNewsletterEmailErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND'
}

export type DeleteNewsletterEmailResult = DeleteNewsletterEmailSuccess | DeleteNewsletterEmailError;

export type DeleteNewsletterEmailSuccess = {
  __typename?: 'DeleteNewsletterEmailSuccess';
  newsletterEmail: NewsletterEmail;
};

export type DeleteReactionError = {
  __typename?: 'DeleteReactionError';
  errorCodes: Array<DeleteReactionErrorCode>;
};

export enum DeleteReactionErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND'
}

export type DeleteReactionResult = DeleteReactionSuccess | DeleteReactionError;

export type DeleteReactionSuccess = {
  __typename?: 'DeleteReactionSuccess';
  reaction: Reaction;
};

export type DeleteReminderError = {
  __typename?: 'DeleteReminderError';
  errorCodes: Array<DeleteReminderErrorCode>;
};

export enum DeleteReminderErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND'
}

export type DeleteReminderResult = DeleteReminderSuccess | DeleteReminderError;

export type DeleteReminderSuccess = {
  __typename?: 'DeleteReminderSuccess';
  reminder: Reminder;
};

export type DeviceToken = {
  __typename?: 'DeviceToken';
  id: Scalars['ID'];
  token: Scalars['String'];
  createdAt: Scalars['Date'];
};

export type FeedArticle = {
  __typename?: 'FeedArticle';
  id: Scalars['ID'];
  article: Article;
  sharedBy: User;
  sharedAt: Scalars['Date'];
  sharedComment?: Maybe<Scalars['String']>;
  sharedWithHighlights?: Maybe<Scalars['Boolean']>;
  highlightsCount?: Maybe<Scalars['Int']>;
  annotationsCount?: Maybe<Scalars['Int']>;
  highlight?: Maybe<Highlight>;
  reactions: Array<Reaction>;
};

export type FeedArticleEdge = {
  __typename?: 'FeedArticleEdge';
  cursor: Scalars['String'];
  node: FeedArticle;
};

export type FeedArticlesError = {
  __typename?: 'FeedArticlesError';
  errorCodes: Array<FeedArticlesErrorCode>;
};

export enum FeedArticlesErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type FeedArticlesResult = FeedArticlesSuccess | FeedArticlesError;

export type FeedArticlesSuccess = {
  __typename?: 'FeedArticlesSuccess';
  edges: Array<FeedArticleEdge>;
  pageInfo: PageInfo;
};

export type GetFollowersError = {
  __typename?: 'GetFollowersError';
  errorCodes: Array<GetFollowersErrorCode>;
};

export enum GetFollowersErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type GetFollowersResult = GetFollowersSuccess | GetFollowersError;

export type GetFollowersSuccess = {
  __typename?: 'GetFollowersSuccess';
  followers: Array<User>;
};

export type GetFollowingError = {
  __typename?: 'GetFollowingError';
  errorCodes: Array<GetFollowingErrorCode>;
};

export enum GetFollowingErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type GetFollowingResult = GetFollowingSuccess | GetFollowingError;

export type GetFollowingSuccess = {
  __typename?: 'GetFollowingSuccess';
  following: Array<User>;
};

export type GetUserPersonalizationError = {
  __typename?: 'GetUserPersonalizationError';
  errorCodes: Array<GetUserPersonalizationErrorCode>;
};

export enum GetUserPersonalizationErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type GetUserPersonalizationResult = GetUserPersonalizationSuccess | GetUserPersonalizationError;

export type GetUserPersonalizationSuccess = {
  __typename?: 'GetUserPersonalizationSuccess';
  userPersonalization?: Maybe<UserPersonalization>;
};

export type GoogleLoginInput = {
  secret: Scalars['String'];
  email: Scalars['String'];
};

export type GoogleSignupError = {
  __typename?: 'GoogleSignupError';
  errorCodes: Array<Maybe<SignupErrorCode>>;
};

export type GoogleSignupInput = {
  secret: Scalars['String'];
  email: Scalars['String'];
  username: Scalars['String'];
  name: Scalars['String'];
  pictureUrl: Scalars['String'];
  sourceUserId: Scalars['String'];
  bio?: Maybe<Scalars['String']>;
};

export type GoogleSignupResult = GoogleSignupSuccess | GoogleSignupError;

export type GoogleSignupSuccess = {
  __typename?: 'GoogleSignupSuccess';
  me: User;
};

export type Highlight = {
  __typename?: 'Highlight';
  id: Scalars['ID'];
  shortId: Scalars['String'];
  user: User;
  article: Article;
  quote: Scalars['String'];
  prefix?: Maybe<Scalars['String']>;
  suffix?: Maybe<Scalars['String']>;
  patch: Scalars['String'];
  annotation?: Maybe<Scalars['String']>;
  replies: Array<HighlightReply>;
  sharedAt?: Maybe<Scalars['Date']>;
  createdAt: Scalars['Date'];
  updatedAt: Scalars['Date'];
  reactions: Array<Reaction>;
  createdByMe: Scalars['Boolean'];
};

export type HighlightReply = {
  __typename?: 'HighlightReply';
  id: Scalars['ID'];
  user: User;
  highlight: Highlight;
  text: Scalars['String'];
  createdAt: Scalars['Date'];
  updatedAt: Scalars['Date'];
};

export type HighlightStats = {
  __typename?: 'HighlightStats';
  highlightCount: Scalars['Int'];
};

export type Label = {
  __typename?: 'Label';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type LabelsError = {
  __typename?: 'LabelsError';
  errorCodes: Array<LabelsErrorCode>;
};

export enum LabelsErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND'
}

export type LabelsResult = LabelsSuccess | LabelsError;

export type LabelsSuccess = {
  __typename?: 'LabelsSuccess';
  labels: Array<Label>;
};

export type Link = {
  __typename?: 'Link';
  id: Scalars['ID'];
  url: Scalars['String'];
  slug: Scalars['String'];
  savedBy: User;
  savedAt: Scalars['Date'];
  savedByViewer: Scalars['Boolean'];
  postedByViewer: Scalars['Boolean'];
  readState: ReadState;
  highlightStats: HighlightStats;
  shareInfo: LinkShareInfo;
  shareStats: ShareStats;
  page: Page;
};

export type LinkShareInfo = {
  __typename?: 'LinkShareInfo';
  title: Scalars['String'];
  description: Scalars['String'];
  imageUrl: Scalars['String'];
};

export type LogOutError = {
  __typename?: 'LogOutError';
  errorCodes: Array<LogOutErrorCode>;
};

export enum LogOutErrorCode {
  LogOutFailed = 'LOG_OUT_FAILED'
}

export type LogOutResult = LogOutSuccess | LogOutError;

export type LogOutSuccess = {
  __typename?: 'LogOutSuccess';
  message?: Maybe<Scalars['String']>;
};

export type LoginError = {
  __typename?: 'LoginError';
  errorCodes: Array<LoginErrorCode>;
};

export enum LoginErrorCode {
  AuthFailed = 'AUTH_FAILED',
  UserAlreadyExists = 'USER_ALREADY_EXISTS',
  InvalidCredentials = 'INVALID_CREDENTIALS',
  UserNotFound = 'USER_NOT_FOUND',
  WrongSource = 'WRONG_SOURCE',
  AccessDenied = 'ACCESS_DENIED'
}

export type LoginInput = {
  password: Scalars['String'];
  email: Scalars['String'];
};

export type LoginResult = LoginSuccess | LoginError;

export type LoginSuccess = {
  __typename?: 'LoginSuccess';
  me: User;
};

export type MergeHighlightError = {
  __typename?: 'MergeHighlightError';
  errorCodes: Array<MergeHighlightErrorCode>;
};

export enum MergeHighlightErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  BadData = 'BAD_DATA',
  NotFound = 'NOT_FOUND',
  AlreadyExists = 'ALREADY_EXISTS'
}

export type MergeHighlightInput = {
  id: Scalars['ID'];
  shortId: Scalars['ID'];
  articleId: Scalars['ID'];
  patch: Scalars['String'];
  quote: Scalars['String'];
  prefix?: Maybe<Scalars['String']>;
  suffix?: Maybe<Scalars['String']>;
  annotation?: Maybe<Scalars['String']>;
  overlapHighlightIdList: Array<Scalars['String']>;
};

export type MergeHighlightResult = MergeHighlightSuccess | MergeHighlightError;

export type MergeHighlightSuccess = {
  __typename?: 'MergeHighlightSuccess';
  highlight: Highlight;
  overlapHighlightIdList: Array<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  googleLogin: LoginResult;
  googleSignup: GoogleSignupResult;
  logOut: LogOutResult;
  updateUser: UpdateUserResult;
  updateUserProfile: UpdateUserProfileResult;
  createArticle: CreateArticleResult;
  createHighlight: CreateHighlightResult;
  mergeHighlight: MergeHighlightResult;
  updateHighlight: UpdateHighlightResult;
  deleteHighlight: DeleteHighlightResult;
  createHighlightReply: CreateHighlightReplyResult;
  updateHighlightReply: UpdateHighlightReplyResult;
  deleteHighlightReply: DeleteHighlightReplyResult;
  createReaction: CreateReactionResult;
  deleteReaction: DeleteReactionResult;
  uploadFileRequest: UploadFileRequestResult;
  saveArticleReadingProgress: SaveArticleReadingProgressResult;
  setShareArticle: SetShareArticleResult;
  updateSharedComment: UpdateSharedCommentResult;
  setFollow: SetFollowResult;
  setBookmarkArticle: SetBookmarkArticleResult;
  setUserPersonalization: SetUserPersonalizationResult;
  createArticleSavingRequest: CreateArticleSavingRequestResult;
  setShareHighlight: SetShareHighlightResult;
  reportItem: ReportItemResult;
  updateLinkShareInfo: UpdateLinkShareInfoResult;
  setLinkArchived: ArchiveLinkResult;
  createNewsletterEmail: CreateNewsletterEmailResult;
  deleteNewsletterEmail: DeleteNewsletterEmailResult;
  saveUrl: SaveResult;
  savePage: SaveResult;
  saveFile: SaveResult;
  createReminder: CreateReminderResult;
  updateReminder: UpdateReminderResult;
  deleteReminder: DeleteReminderResult;
  setDeviceToken: SetDeviceTokenResult;
  createLabel: CreateLabelResult;
  deleteLabel: DeleteLabelResult;
  login: LoginResult;
  signup: SignupResult;
};


export type MutationGoogleLoginArgs = {
  input: GoogleLoginInput;
};


export type MutationGoogleSignupArgs = {
  input: GoogleSignupInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};


export type MutationCreateArticleArgs = {
  input: CreateArticleInput;
};


export type MutationCreateHighlightArgs = {
  input: CreateHighlightInput;
};


export type MutationMergeHighlightArgs = {
  input: MergeHighlightInput;
};


export type MutationUpdateHighlightArgs = {
  input: UpdateHighlightInput;
};


export type MutationDeleteHighlightArgs = {
  highlightId: Scalars['ID'];
};


export type MutationCreateHighlightReplyArgs = {
  input: CreateHighlightReplyInput;
};


export type MutationUpdateHighlightReplyArgs = {
  input: UpdateHighlightReplyInput;
};


export type MutationDeleteHighlightReplyArgs = {
  highlightReplyId: Scalars['ID'];
};


export type MutationCreateReactionArgs = {
  input: CreateReactionInput;
};


export type MutationDeleteReactionArgs = {
  id: Scalars['ID'];
};


export type MutationUploadFileRequestArgs = {
  input: UploadFileRequestInput;
};


export type MutationSaveArticleReadingProgressArgs = {
  input: SaveArticleReadingProgressInput;
};


export type MutationSetShareArticleArgs = {
  input: SetShareArticleInput;
};


export type MutationUpdateSharedCommentArgs = {
  input: UpdateSharedCommentInput;
};


export type MutationSetFollowArgs = {
  input: SetFollowInput;
};


export type MutationSetBookmarkArticleArgs = {
  input: SetBookmarkArticleInput;
};


export type MutationSetUserPersonalizationArgs = {
  input: SetUserPersonalizationInput;
};


export type MutationCreateArticleSavingRequestArgs = {
  input: CreateArticleSavingRequestInput;
};


export type MutationSetShareHighlightArgs = {
  input: SetShareHighlightInput;
};


export type MutationReportItemArgs = {
  input: ReportItemInput;
};


export type MutationUpdateLinkShareInfoArgs = {
  input: UpdateLinkShareInfoInput;
};


export type MutationSetLinkArchivedArgs = {
  input: ArchiveLinkInput;
};


export type MutationDeleteNewsletterEmailArgs = {
  newsletterEmailId: Scalars['ID'];
};


export type MutationSaveUrlArgs = {
  input: SaveUrlInput;
};


export type MutationSavePageArgs = {
  input: SavePageInput;
};


export type MutationSaveFileArgs = {
  input: SaveFileInput;
};


export type MutationCreateReminderArgs = {
  input: CreateReminderInput;
};


export type MutationUpdateReminderArgs = {
  input: UpdateReminderInput;
};


export type MutationDeleteReminderArgs = {
  id: Scalars['ID'];
};


export type MutationSetDeviceTokenArgs = {
  input: SetDeviceTokenInput;
};


export type MutationCreateLabelArgs = {
  input: CreateLabelInput;
};


export type MutationDeleteLabelArgs = {
  id: Scalars['ID'];
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationSignupArgs = {
  input: SignupInput;
};

export type NewsletterEmail = {
  __typename?: 'NewsletterEmail';
  id: Scalars['ID'];
  address: Scalars['String'];
  confirmationCode?: Maybe<Scalars['String']>;
};

export type NewsletterEmailsError = {
  __typename?: 'NewsletterEmailsError';
  errorCodes: Array<NewsletterEmailsErrorCode>;
};

export enum NewsletterEmailsErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST'
}

export type NewsletterEmailsResult = NewsletterEmailsSuccess | NewsletterEmailsError;

export type NewsletterEmailsSuccess = {
  __typename?: 'NewsletterEmailsSuccess';
  newsletterEmails: Array<NewsletterEmail>;
};

export type Page = {
  __typename?: 'Page';
  id: Scalars['ID'];
  url: Scalars['String'];
  hash: Scalars['String'];
  originalUrl: Scalars['String'];
  type: PageType;
  image: Scalars['String'];
  title: Scalars['String'];
  author: Scalars['String'];
  description: Scalars['String'];
  publishedAt?: Maybe<Scalars['Date']>;
  originalHtml: Scalars['String'];
  readableHtml: Scalars['String'];
  createdAt: Scalars['Date'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
  endCursor?: Maybe<Scalars['String']>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type PageInfoInput = {
  title?: Maybe<Scalars['String']>;
  author?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  previewImage?: Maybe<Scalars['String']>;
  canonicalUrl?: Maybe<Scalars['String']>;
  publishedAt?: Maybe<Scalars['Date']>;
  contentType?: Maybe<Scalars['String']>;
};

export enum PageType {
  Article = 'ARTICLE',
  Book = 'BOOK',
  File = 'FILE',
  Profile = 'PROFILE',
  Website = 'WEBSITE',
  Unknown = 'UNKNOWN'
}

export type PreparedDocumentInput = {
  document: Scalars['String'];
  pageInfo: PageInfoInput;
};

export type Profile = {
  __typename?: 'Profile';
  id: Scalars['ID'];
  username: Scalars['String'];
  private: Scalars['Boolean'];
  bio?: Maybe<Scalars['String']>;
  pictureUrl?: Maybe<Scalars['String']>;
};

export type Query = {
  __typename?: 'Query';
  hello?: Maybe<Scalars['String']>;
  me?: Maybe<User>;
  user: UserResult;
  articles: ArticlesResult;
  article: ArticleResult;
  sharedArticle: SharedArticleResult;
  feedArticles: FeedArticlesResult;
  users: UsersResult;
  validateUsername: Scalars['Boolean'];
  getFollowers: GetFollowersResult;
  getFollowing: GetFollowingResult;
  getUserPersonalization: GetUserPersonalizationResult;
  articleSavingRequest: ArticleSavingRequestResult;
  newsletterEmails: NewsletterEmailsResult;
  reminder: ReminderResult;
  labels: LabelsResult;
};


export type QueryUserArgs = {
  userId?: Maybe<Scalars['ID']>;
  username?: Maybe<Scalars['String']>;
};


export type QueryArticlesArgs = {
  sharedOnly?: Maybe<Scalars['Boolean']>;
  sort?: Maybe<SortParams>;
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  query?: Maybe<Scalars['String']>;
};


export type QueryArticleArgs = {
  username: Scalars['String'];
  slug: Scalars['String'];
};


export type QuerySharedArticleArgs = {
  username: Scalars['String'];
  slug: Scalars['String'];
  selectedHighlightId?: Maybe<Scalars['String']>;
};


export type QueryFeedArticlesArgs = {
  after?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  sort?: Maybe<SortParams>;
  sharedByUser?: Maybe<Scalars['ID']>;
};


export type QueryValidateUsernameArgs = {
  username: Scalars['String'];
};


export type QueryGetFollowersArgs = {
  userId?: Maybe<Scalars['ID']>;
};


export type QueryGetFollowingArgs = {
  userId?: Maybe<Scalars['ID']>;
};


export type QueryArticleSavingRequestArgs = {
  id: Scalars['ID'];
};


export type QueryReminderArgs = {
  linkId: Scalars['ID'];
};


export type QueryLabelsArgs = {
  linkId: Scalars['ID'];
};

export type Reaction = {
  __typename?: 'Reaction';
  id: Scalars['ID'];
  user: User;
  code: ReactionType;
  createdAt: Scalars['Date'];
  updatedAt?: Maybe<Scalars['Date']>;
};

export enum ReactionType {
  Like = 'LIKE',
  Heart = 'HEART',
  Smile = 'SMILE',
  Hushed = 'HUSHED',
  Crying = 'CRYING',
  Pout = 'POUT'
}

export type ReadState = {
  __typename?: 'ReadState';
  reading?: Maybe<Scalars['Boolean']>;
  readingTime?: Maybe<Scalars['Int']>;
  progressPercent: Scalars['Float'];
  progressAnchorIndex: Scalars['Int'];
};

export type Reminder = {
  __typename?: 'Reminder';
  id: Scalars['ID'];
  archiveUntil: Scalars['Boolean'];
  sendNotification: Scalars['Boolean'];
  remindAt: Scalars['Date'];
};

export type ReminderError = {
  __typename?: 'ReminderError';
  errorCodes: Array<ReminderErrorCode>;
};

export enum ReminderErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND'
}

export type ReminderResult = ReminderSuccess | ReminderError;

export type ReminderSuccess = {
  __typename?: 'ReminderSuccess';
  reminder: Reminder;
};

export type ReportItemInput = {
  pageId: Scalars['ID'];
  itemUrl: Scalars['String'];
  sharedBy?: Maybe<Scalars['ID']>;
  reportTypes: Array<ReportType>;
  reportComment: Scalars['String'];
};

export type ReportItemResult = {
  __typename?: 'ReportItemResult';
  message: Scalars['String'];
};

export enum ReportType {
  Spam = 'SPAM',
  Abusive = 'ABUSIVE',
  ContentDisplay = 'CONTENT_DISPLAY',
  ContentViolation = 'CONTENT_VIOLATION'
}

export type SaveArticleReadingProgressError = {
  __typename?: 'SaveArticleReadingProgressError';
  errorCodes: Array<SaveArticleReadingProgressErrorCode>;
};

export enum SaveArticleReadingProgressErrorCode {
  NotFound = 'NOT_FOUND',
  BadData = 'BAD_DATA',
  Unauthorized = 'UNAUTHORIZED'
}

export type SaveArticleReadingProgressInput = {
  id: Scalars['ID'];
  readingProgressPercent: Scalars['Float'];
  readingProgressAnchorIndex: Scalars['Int'];
};

export type SaveArticleReadingProgressResult = SaveArticleReadingProgressSuccess | SaveArticleReadingProgressError;

export type SaveArticleReadingProgressSuccess = {
  __typename?: 'SaveArticleReadingProgressSuccess';
  updatedArticle: Article;
};

export type SaveError = {
  __typename?: 'SaveError';
  errorCodes: Array<SaveErrorCode>;
  message?: Maybe<Scalars['String']>;
};

export enum SaveErrorCode {
  Unknown = 'UNKNOWN',
  Unauthorized = 'UNAUTHORIZED'
}

export type SaveFileInput = {
  url: Scalars['String'];
  source: Scalars['String'];
  clientRequestId: Scalars['ID'];
  uploadFileId: Scalars['ID'];
};

export type SavePageInput = {
  url: Scalars['String'];
  source: Scalars['String'];
  clientRequestId: Scalars['ID'];
  title?: Maybe<Scalars['String']>;
  originalContent: Scalars['String'];
};

export type SaveResult = SaveSuccess | SaveError;

export type SaveSuccess = {
  __typename?: 'SaveSuccess';
  url: Scalars['String'];
  clientRequestId: Scalars['ID'];
};

export type SaveUrlInput = {
  url: Scalars['String'];
  source: Scalars['String'];
  clientRequestId: Scalars['ID'];
};

export type SetBookmarkArticleError = {
  __typename?: 'SetBookmarkArticleError';
  errorCodes: Array<SetBookmarkArticleErrorCode>;
};

export enum SetBookmarkArticleErrorCode {
  NotFound = 'NOT_FOUND',
  BookmarkExists = 'BOOKMARK_EXISTS'
}

export type SetBookmarkArticleInput = {
  articleID: Scalars['ID'];
  bookmark: Scalars['Boolean'];
};

export type SetBookmarkArticleResult = SetBookmarkArticleSuccess | SetBookmarkArticleError;

export type SetBookmarkArticleSuccess = {
  __typename?: 'SetBookmarkArticleSuccess';
  bookmarkedArticle: Article;
};

export type SetDeviceTokenError = {
  __typename?: 'SetDeviceTokenError';
  errorCodes: Array<SetDeviceTokenErrorCode>;
};

export enum SetDeviceTokenErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND'
}

export type SetDeviceTokenInput = {
  id?: Maybe<Scalars['ID']>;
  token?: Maybe<Scalars['String']>;
};

export type SetDeviceTokenResult = SetDeviceTokenSuccess | SetDeviceTokenError;

export type SetDeviceTokenSuccess = {
  __typename?: 'SetDeviceTokenSuccess';
  deviceToken: DeviceToken;
};

export type SetFollowError = {
  __typename?: 'SetFollowError';
  errorCodes: Array<SetFollowErrorCode>;
};

export enum SetFollowErrorCode {
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SetFollowInput = {
  userId: Scalars['ID'];
  follow: Scalars['Boolean'];
};

export type SetFollowResult = SetFollowSuccess | SetFollowError;

export type SetFollowSuccess = {
  __typename?: 'SetFollowSuccess';
  updatedUser: User;
};

export type SetShareArticleError = {
  __typename?: 'SetShareArticleError';
  errorCodes: Array<SetShareArticleErrorCode>;
};

export enum SetShareArticleErrorCode {
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SetShareArticleInput = {
  articleID: Scalars['ID'];
  share: Scalars['Boolean'];
  sharedComment?: Maybe<Scalars['String']>;
  sharedWithHighlights?: Maybe<Scalars['Boolean']>;
};

export type SetShareArticleResult = SetShareArticleSuccess | SetShareArticleError;

export type SetShareArticleSuccess = {
  __typename?: 'SetShareArticleSuccess';
  updatedFeedArticleId?: Maybe<Scalars['String']>;
  updatedFeedArticle?: Maybe<FeedArticle>;
  updatedArticle: Article;
};

export type SetShareHighlightError = {
  __typename?: 'SetShareHighlightError';
  errorCodes: Array<SetShareHighlightErrorCode>;
};

export enum SetShareHighlightErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  NotFound = 'NOT_FOUND',
  Forbidden = 'FORBIDDEN'
}

export type SetShareHighlightInput = {
  id: Scalars['ID'];
  share: Scalars['Boolean'];
};

export type SetShareHighlightResult = SetShareHighlightSuccess | SetShareHighlightError;

export type SetShareHighlightSuccess = {
  __typename?: 'SetShareHighlightSuccess';
  highlight: Highlight;
};

export type SetUserPersonalizationError = {
  __typename?: 'SetUserPersonalizationError';
  errorCodes: Array<SetUserPersonalizationErrorCode>;
};

export enum SetUserPersonalizationErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type SetUserPersonalizationInput = {
  theme?: Maybe<Scalars['String']>;
  fontSize?: Maybe<Scalars['Int']>;
  fontFamily?: Maybe<Scalars['String']>;
  margin?: Maybe<Scalars['Int']>;
  libraryLayoutType?: Maybe<Scalars['String']>;
  librarySortOrder?: Maybe<SortOrder>;
};

export type SetUserPersonalizationResult = SetUserPersonalizationSuccess | SetUserPersonalizationError;

export type SetUserPersonalizationSuccess = {
  __typename?: 'SetUserPersonalizationSuccess';
  updatedUserPersonalization: UserPersonalization;
};

export type ShareStats = {
  __typename?: 'ShareStats';
  viewCount: Scalars['Int'];
  saveCount: Scalars['Int'];
  readDuration: Scalars['Int'];
};

export type SharedArticleError = {
  __typename?: 'SharedArticleError';
  errorCodes: Array<SharedArticleErrorCode>;
};

export enum SharedArticleErrorCode {
  NotFound = 'NOT_FOUND'
}

export type SharedArticleResult = SharedArticleSuccess | SharedArticleError;

export type SharedArticleSuccess = {
  __typename?: 'SharedArticleSuccess';
  article: Article;
};

export type SignupError = {
  __typename?: 'SignupError';
  errorCodes: Array<Maybe<SignupErrorCode>>;
};

export enum SignupErrorCode {
  Unknown = 'UNKNOWN',
  AccessDenied = 'ACCESS_DENIED',
  GoogleAuthError = 'GOOGLE_AUTH_ERROR',
  InvalidUsername = 'INVALID_USERNAME',
  UserExists = 'USER_EXISTS',
  ExpiredToken = 'EXPIRED_TOKEN',
  InvalidPassword = 'INVALID_PASSWORD'
}

export type SignupInput = {
  email: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
  name: Scalars['String'];
  pictureUrl?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
};

export type SignupResult = SignupSuccess | SignupError;

export type SignupSuccess = {
  __typename?: 'SignupSuccess';
  me: User;
};

export enum SortBy {
  UpdatedTime = 'UPDATED_TIME'
}

export enum SortOrder {
  Ascending = 'ASCENDING',
  Descending = 'DESCENDING'
}

export type SortParams = {
  order?: Maybe<SortOrder>;
  by: SortBy;
};

export type UpdateHighlightError = {
  __typename?: 'UpdateHighlightError';
  errorCodes: Array<UpdateHighlightErrorCode>;
};

export enum UpdateHighlightErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  BadData = 'BAD_DATA'
}

export type UpdateHighlightInput = {
  highlightId: Scalars['ID'];
  annotation?: Maybe<Scalars['String']>;
  sharedAt?: Maybe<Scalars['Date']>;
};

export type UpdateHighlightReplyError = {
  __typename?: 'UpdateHighlightReplyError';
  errorCodes: Array<UpdateHighlightReplyErrorCode>;
};

export enum UpdateHighlightReplyErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND'
}

export type UpdateHighlightReplyInput = {
  highlightReplyId: Scalars['ID'];
  text: Scalars['String'];
};

export type UpdateHighlightReplyResult = UpdateHighlightReplySuccess | UpdateHighlightReplyError;

export type UpdateHighlightReplySuccess = {
  __typename?: 'UpdateHighlightReplySuccess';
  highlightReply: HighlightReply;
};

export type UpdateHighlightResult = UpdateHighlightSuccess | UpdateHighlightError;

export type UpdateHighlightSuccess = {
  __typename?: 'UpdateHighlightSuccess';
  highlight: Highlight;
};

export type UpdateLinkShareInfoError = {
  __typename?: 'UpdateLinkShareInfoError';
  errorCodes: Array<UpdateLinkShareInfoErrorCode>;
};

export enum UpdateLinkShareInfoErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST'
}

export type UpdateLinkShareInfoInput = {
  linkId: Scalars['ID'];
  title: Scalars['String'];
  description: Scalars['String'];
};

export type UpdateLinkShareInfoResult = UpdateLinkShareInfoSuccess | UpdateLinkShareInfoError;

export type UpdateLinkShareInfoSuccess = {
  __typename?: 'UpdateLinkShareInfoSuccess';
  message: Scalars['String'];
};

export type UpdateReminderError = {
  __typename?: 'UpdateReminderError';
  errorCodes: Array<UpdateReminderErrorCode>;
};

export enum UpdateReminderErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND'
}

export type UpdateReminderInput = {
  id: Scalars['ID'];
  archiveUntil: Scalars['Boolean'];
  sendNotification: Scalars['Boolean'];
  remindAt: Scalars['Date'];
};

export type UpdateReminderResult = UpdateReminderSuccess | UpdateReminderError;

export type UpdateReminderSuccess = {
  __typename?: 'UpdateReminderSuccess';
  reminder: Reminder;
};

export type UpdateSharedCommentError = {
  __typename?: 'UpdateSharedCommentError';
  errorCodes: Array<UpdateSharedCommentErrorCode>;
};

export enum UpdateSharedCommentErrorCode {
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdateSharedCommentInput = {
  articleID: Scalars['ID'];
  sharedComment: Scalars['String'];
};

export type UpdateSharedCommentResult = UpdateSharedCommentSuccess | UpdateSharedCommentError;

export type UpdateSharedCommentSuccess = {
  __typename?: 'UpdateSharedCommentSuccess';
  articleID: Scalars['ID'];
  sharedComment: Scalars['String'];
};

export type UpdateUserError = {
  __typename?: 'UpdateUserError';
  errorCodes: Array<UpdateUserErrorCode>;
};

export enum UpdateUserErrorCode {
  EmptyName = 'EMPTY_NAME',
  BioTooLong = 'BIO_TOO_LONG',
  UserNotFound = 'USER_NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdateUserInput = {
  name: Scalars['String'];
  bio?: Maybe<Scalars['String']>;
};

export type UpdateUserProfileError = {
  __typename?: 'UpdateUserProfileError';
  errorCodes: Array<UpdateUserProfileErrorCode>;
};

export enum UpdateUserProfileErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  BadData = 'BAD_DATA',
  BadUsername = 'BAD_USERNAME',
  UsernameExists = 'USERNAME_EXISTS'
}

export type UpdateUserProfileInput = {
  userId: Scalars['ID'];
  username?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  pictureUrl?: Maybe<Scalars['String']>;
};

export type UpdateUserProfileResult = UpdateUserProfileSuccess | UpdateUserProfileError;

export type UpdateUserProfileSuccess = {
  __typename?: 'UpdateUserProfileSuccess';
  user: User;
};

export type UpdateUserResult = UpdateUserSuccess | UpdateUserError;

export type UpdateUserSuccess = {
  __typename?: 'UpdateUserSuccess';
  user: User;
};

export type UploadFileRequestError = {
  __typename?: 'UploadFileRequestError';
  errorCodes: Array<UploadFileRequestErrorCode>;
};

export enum UploadFileRequestErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  BadInput = 'BAD_INPUT',
  FailedCreate = 'FAILED_CREATE'
}

export type UploadFileRequestInput = {
  url: Scalars['String'];
  contentType: Scalars['String'];
};

export type UploadFileRequestResult = UploadFileRequestSuccess | UploadFileRequestError;

export type UploadFileRequestSuccess = {
  __typename?: 'UploadFileRequestSuccess';
  id: Scalars['ID'];
  uploadSignedUrl?: Maybe<Scalars['String']>;
  uploadFileId?: Maybe<Scalars['ID']>;
};

export enum UploadFileStatus {
  Initialized = 'INITIALIZED',
  Completed = 'COMPLETED'
}

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  isFullUser?: Maybe<Scalars['Boolean']>;
  viewerIsFollowing?: Maybe<Scalars['Boolean']>;
  /** @deprecated isFriend has been replaced with viewerIsFollowing */
  isFriend?: Maybe<Scalars['Boolean']>;
  picture?: Maybe<Scalars['String']>;
  profile: Profile;
  sharedArticles: Array<FeedArticle>;
  sharedArticlesCount?: Maybe<Scalars['Int']>;
  sharedHighlightsCount?: Maybe<Scalars['Int']>;
  sharedNotesCount?: Maybe<Scalars['Int']>;
  friendsCount?: Maybe<Scalars['Int']>;
  followersCount?: Maybe<Scalars['Int']>;
};

export type UserError = {
  __typename?: 'UserError';
  errorCodes: Array<UserErrorCode>;
};

export enum UserErrorCode {
  Unauthorized = 'UNAUTHORIZED',
  UserNotFound = 'USER_NOT_FOUND',
  BadRequest = 'BAD_REQUEST'
}

export type UserPersonalization = {
  __typename?: 'UserPersonalization';
  id?: Maybe<Scalars['ID']>;
  theme?: Maybe<Scalars['String']>;
  fontSize?: Maybe<Scalars['Int']>;
  fontFamily?: Maybe<Scalars['String']>;
  margin?: Maybe<Scalars['Int']>;
  libraryLayoutType?: Maybe<Scalars['String']>;
  librarySortOrder?: Maybe<SortOrder>;
};

export type UserResult = UserSuccess | UserError;

export type UserSuccess = {
  __typename?: 'UserSuccess';
  user: User;
};

export type UsersError = {
  __typename?: 'UsersError';
  errorCodes: Array<UsersErrorCode>;
};

export enum UsersErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type UsersResult = UsersSuccess | UsersError;

export type UsersSuccess = {
  __typename?: 'UsersSuccess';
  users: Array<User>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  ArchiveLinkError: ResolverTypeWrapper<ArchiveLinkError>;
  String: ResolverTypeWrapper<Scalars['String']>;
  ArchiveLinkErrorCode: ArchiveLinkErrorCode;
  ArchiveLinkInput: ArchiveLinkInput;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  ArchiveLinkResult: ResolversTypes['ArchiveLinkSuccess'] | ResolversTypes['ArchiveLinkError'];
  ArchiveLinkSuccess: ResolverTypeWrapper<ArchiveLinkSuccess>;
  Article: ResolverTypeWrapper<Article>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  ArticleEdge: ResolverTypeWrapper<ArticleEdge>;
  ArticleError: ResolverTypeWrapper<ArticleError>;
  ArticleErrorCode: ArticleErrorCode;
  ArticleHighlightsInput: ArticleHighlightsInput;
  ArticleResult: ResolversTypes['ArticleSuccess'] | ResolversTypes['ArticleError'];
  ArticleSavingRequest: ResolverTypeWrapper<ArticleSavingRequest>;
  ArticleSavingRequestError: ResolverTypeWrapper<ArticleSavingRequestError>;
  ArticleSavingRequestErrorCode: ArticleSavingRequestErrorCode;
  ArticleSavingRequestResult: ResolversTypes['ArticleSavingRequestSuccess'] | ResolversTypes['ArticleSavingRequestError'];
  ArticleSavingRequestStatus: ArticleSavingRequestStatus;
  ArticleSavingRequestSuccess: ResolverTypeWrapper<ArticleSavingRequestSuccess>;
  ArticleSuccess: ResolverTypeWrapper<ArticleSuccess>;
  ArticlesError: ResolverTypeWrapper<ArticlesError>;
  ArticlesErrorCode: ArticlesErrorCode;
  ArticlesResult: ResolversTypes['ArticlesSuccess'] | ResolversTypes['ArticlesError'];
  ArticlesSuccess: ResolverTypeWrapper<ArticlesSuccess>;
  ContentReader: ContentReader;
  CreateArticleError: ResolverTypeWrapper<CreateArticleError>;
  CreateArticleErrorCode: CreateArticleErrorCode;
  CreateArticleInput: CreateArticleInput;
  CreateArticleResult: ResolversTypes['CreateArticleSuccess'] | ResolversTypes['CreateArticleError'];
  CreateArticleSavingRequestError: ResolverTypeWrapper<CreateArticleSavingRequestError>;
  CreateArticleSavingRequestErrorCode: CreateArticleSavingRequestErrorCode;
  CreateArticleSavingRequestInput: CreateArticleSavingRequestInput;
  CreateArticleSavingRequestResult: ResolversTypes['CreateArticleSavingRequestSuccess'] | ResolversTypes['CreateArticleSavingRequestError'];
  CreateArticleSavingRequestSuccess: ResolverTypeWrapper<CreateArticleSavingRequestSuccess>;
  CreateArticleSuccess: ResolverTypeWrapper<CreateArticleSuccess>;
  CreateHighlightError: ResolverTypeWrapper<CreateHighlightError>;
  CreateHighlightErrorCode: CreateHighlightErrorCode;
  CreateHighlightInput: CreateHighlightInput;
  CreateHighlightReplyError: ResolverTypeWrapper<CreateHighlightReplyError>;
  CreateHighlightReplyErrorCode: CreateHighlightReplyErrorCode;
  CreateHighlightReplyInput: CreateHighlightReplyInput;
  CreateHighlightReplyResult: ResolversTypes['CreateHighlightReplySuccess'] | ResolversTypes['CreateHighlightReplyError'];
  CreateHighlightReplySuccess: ResolverTypeWrapper<CreateHighlightReplySuccess>;
  CreateHighlightResult: ResolversTypes['CreateHighlightSuccess'] | ResolversTypes['CreateHighlightError'];
  CreateHighlightSuccess: ResolverTypeWrapper<CreateHighlightSuccess>;
  CreateLabelError: ResolverTypeWrapper<CreateLabelError>;
  CreateLabelErrorCode: CreateLabelErrorCode;
  CreateLabelInput: CreateLabelInput;
  CreateLabelResult: ResolversTypes['CreateLabelSuccess'] | ResolversTypes['CreateLabelError'];
  CreateLabelSuccess: ResolverTypeWrapper<CreateLabelSuccess>;
  CreateNewsletterEmailError: ResolverTypeWrapper<CreateNewsletterEmailError>;
  CreateNewsletterEmailErrorCode: CreateNewsletterEmailErrorCode;
  CreateNewsletterEmailResult: ResolversTypes['CreateNewsletterEmailSuccess'] | ResolversTypes['CreateNewsletterEmailError'];
  CreateNewsletterEmailSuccess: ResolverTypeWrapper<CreateNewsletterEmailSuccess>;
  CreateReactionError: ResolverTypeWrapper<CreateReactionError>;
  CreateReactionErrorCode: CreateReactionErrorCode;
  CreateReactionInput: CreateReactionInput;
  CreateReactionResult: ResolversTypes['CreateReactionSuccess'] | ResolversTypes['CreateReactionError'];
  CreateReactionSuccess: ResolverTypeWrapper<CreateReactionSuccess>;
  CreateReminderError: ResolverTypeWrapper<CreateReminderError>;
  CreateReminderErrorCode: CreateReminderErrorCode;
  CreateReminderInput: CreateReminderInput;
  CreateReminderResult: ResolversTypes['CreateReminderSuccess'] | ResolversTypes['CreateReminderError'];
  CreateReminderSuccess: ResolverTypeWrapper<CreateReminderSuccess>;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  DeleteHighlightError: ResolverTypeWrapper<DeleteHighlightError>;
  DeleteHighlightErrorCode: DeleteHighlightErrorCode;
  DeleteHighlightReplyError: ResolverTypeWrapper<DeleteHighlightReplyError>;
  DeleteHighlightReplyErrorCode: DeleteHighlightReplyErrorCode;
  DeleteHighlightReplyResult: ResolversTypes['DeleteHighlightReplySuccess'] | ResolversTypes['DeleteHighlightReplyError'];
  DeleteHighlightReplySuccess: ResolverTypeWrapper<DeleteHighlightReplySuccess>;
  DeleteHighlightResult: ResolversTypes['DeleteHighlightSuccess'] | ResolversTypes['DeleteHighlightError'];
  DeleteHighlightSuccess: ResolverTypeWrapper<DeleteHighlightSuccess>;
  DeleteLabelError: ResolverTypeWrapper<DeleteLabelError>;
  DeleteLabelErrorCode: DeleteLabelErrorCode;
  DeleteLabelResult: ResolversTypes['DeleteLabelSuccess'] | ResolversTypes['DeleteLabelError'];
  DeleteLabelSuccess: ResolverTypeWrapper<DeleteLabelSuccess>;
  DeleteNewsletterEmailError: ResolverTypeWrapper<DeleteNewsletterEmailError>;
  DeleteNewsletterEmailErrorCode: DeleteNewsletterEmailErrorCode;
  DeleteNewsletterEmailResult: ResolversTypes['DeleteNewsletterEmailSuccess'] | ResolversTypes['DeleteNewsletterEmailError'];
  DeleteNewsletterEmailSuccess: ResolverTypeWrapper<DeleteNewsletterEmailSuccess>;
  DeleteReactionError: ResolverTypeWrapper<DeleteReactionError>;
  DeleteReactionErrorCode: DeleteReactionErrorCode;
  DeleteReactionResult: ResolversTypes['DeleteReactionSuccess'] | ResolversTypes['DeleteReactionError'];
  DeleteReactionSuccess: ResolverTypeWrapper<DeleteReactionSuccess>;
  DeleteReminderError: ResolverTypeWrapper<DeleteReminderError>;
  DeleteReminderErrorCode: DeleteReminderErrorCode;
  DeleteReminderResult: ResolversTypes['DeleteReminderSuccess'] | ResolversTypes['DeleteReminderError'];
  DeleteReminderSuccess: ResolverTypeWrapper<DeleteReminderSuccess>;
  DeviceToken: ResolverTypeWrapper<DeviceToken>;
  FeedArticle: ResolverTypeWrapper<FeedArticle>;
  FeedArticleEdge: ResolverTypeWrapper<FeedArticleEdge>;
  FeedArticlesError: ResolverTypeWrapper<FeedArticlesError>;
  FeedArticlesErrorCode: FeedArticlesErrorCode;
  FeedArticlesResult: ResolversTypes['FeedArticlesSuccess'] | ResolversTypes['FeedArticlesError'];
  FeedArticlesSuccess: ResolverTypeWrapper<FeedArticlesSuccess>;
  GetFollowersError: ResolverTypeWrapper<GetFollowersError>;
  GetFollowersErrorCode: GetFollowersErrorCode;
  GetFollowersResult: ResolversTypes['GetFollowersSuccess'] | ResolversTypes['GetFollowersError'];
  GetFollowersSuccess: ResolverTypeWrapper<GetFollowersSuccess>;
  GetFollowingError: ResolverTypeWrapper<GetFollowingError>;
  GetFollowingErrorCode: GetFollowingErrorCode;
  GetFollowingResult: ResolversTypes['GetFollowingSuccess'] | ResolversTypes['GetFollowingError'];
  GetFollowingSuccess: ResolverTypeWrapper<GetFollowingSuccess>;
  GetUserPersonalizationError: ResolverTypeWrapper<GetUserPersonalizationError>;
  GetUserPersonalizationErrorCode: GetUserPersonalizationErrorCode;
  GetUserPersonalizationResult: ResolversTypes['GetUserPersonalizationSuccess'] | ResolversTypes['GetUserPersonalizationError'];
  GetUserPersonalizationSuccess: ResolverTypeWrapper<GetUserPersonalizationSuccess>;
  GoogleLoginInput: GoogleLoginInput;
  GoogleSignupError: ResolverTypeWrapper<GoogleSignupError>;
  GoogleSignupInput: GoogleSignupInput;
  GoogleSignupResult: ResolversTypes['GoogleSignupSuccess'] | ResolversTypes['GoogleSignupError'];
  GoogleSignupSuccess: ResolverTypeWrapper<GoogleSignupSuccess>;
  Highlight: ResolverTypeWrapper<Highlight>;
  HighlightReply: ResolverTypeWrapper<HighlightReply>;
  HighlightStats: ResolverTypeWrapper<HighlightStats>;
  Label: ResolverTypeWrapper<Label>;
  LabelsError: ResolverTypeWrapper<LabelsError>;
  LabelsErrorCode: LabelsErrorCode;
  LabelsResult: ResolversTypes['LabelsSuccess'] | ResolversTypes['LabelsError'];
  LabelsSuccess: ResolverTypeWrapper<LabelsSuccess>;
  Link: ResolverTypeWrapper<Link>;
  LinkShareInfo: ResolverTypeWrapper<LinkShareInfo>;
  LogOutError: ResolverTypeWrapper<LogOutError>;
  LogOutErrorCode: LogOutErrorCode;
  LogOutResult: ResolversTypes['LogOutSuccess'] | ResolversTypes['LogOutError'];
  LogOutSuccess: ResolverTypeWrapper<LogOutSuccess>;
  LoginError: ResolverTypeWrapper<LoginError>;
  LoginErrorCode: LoginErrorCode;
  LoginInput: LoginInput;
  LoginResult: ResolversTypes['LoginSuccess'] | ResolversTypes['LoginError'];
  LoginSuccess: ResolverTypeWrapper<LoginSuccess>;
  MergeHighlightError: ResolverTypeWrapper<MergeHighlightError>;
  MergeHighlightErrorCode: MergeHighlightErrorCode;
  MergeHighlightInput: MergeHighlightInput;
  MergeHighlightResult: ResolversTypes['MergeHighlightSuccess'] | ResolversTypes['MergeHighlightError'];
  MergeHighlightSuccess: ResolverTypeWrapper<MergeHighlightSuccess>;
  Mutation: ResolverTypeWrapper<{}>;
  NewsletterEmail: ResolverTypeWrapper<NewsletterEmail>;
  NewsletterEmailsError: ResolverTypeWrapper<NewsletterEmailsError>;
  NewsletterEmailsErrorCode: NewsletterEmailsErrorCode;
  NewsletterEmailsResult: ResolversTypes['NewsletterEmailsSuccess'] | ResolversTypes['NewsletterEmailsError'];
  NewsletterEmailsSuccess: ResolverTypeWrapper<NewsletterEmailsSuccess>;
  Page: ResolverTypeWrapper<Page>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PageInfoInput: PageInfoInput;
  PageType: PageType;
  PreparedDocumentInput: PreparedDocumentInput;
  Profile: ResolverTypeWrapper<Profile>;
  Query: ResolverTypeWrapper<{}>;
  Reaction: ResolverTypeWrapper<Reaction>;
  ReactionType: ReactionType;
  ReadState: ResolverTypeWrapper<ReadState>;
  Reminder: ResolverTypeWrapper<Reminder>;
  ReminderError: ResolverTypeWrapper<ReminderError>;
  ReminderErrorCode: ReminderErrorCode;
  ReminderResult: ResolversTypes['ReminderSuccess'] | ResolversTypes['ReminderError'];
  ReminderSuccess: ResolverTypeWrapper<ReminderSuccess>;
  ReportItemInput: ReportItemInput;
  ReportItemResult: ResolverTypeWrapper<ReportItemResult>;
  ReportType: ReportType;
  SaveArticleReadingProgressError: ResolverTypeWrapper<SaveArticleReadingProgressError>;
  SaveArticleReadingProgressErrorCode: SaveArticleReadingProgressErrorCode;
  SaveArticleReadingProgressInput: SaveArticleReadingProgressInput;
  SaveArticleReadingProgressResult: ResolversTypes['SaveArticleReadingProgressSuccess'] | ResolversTypes['SaveArticleReadingProgressError'];
  SaveArticleReadingProgressSuccess: ResolverTypeWrapper<SaveArticleReadingProgressSuccess>;
  SaveError: ResolverTypeWrapper<SaveError>;
  SaveErrorCode: SaveErrorCode;
  SaveFileInput: SaveFileInput;
  SavePageInput: SavePageInput;
  SaveResult: ResolversTypes['SaveSuccess'] | ResolversTypes['SaveError'];
  SaveSuccess: ResolverTypeWrapper<SaveSuccess>;
  SaveUrlInput: SaveUrlInput;
  SetBookmarkArticleError: ResolverTypeWrapper<SetBookmarkArticleError>;
  SetBookmarkArticleErrorCode: SetBookmarkArticleErrorCode;
  SetBookmarkArticleInput: SetBookmarkArticleInput;
  SetBookmarkArticleResult: ResolversTypes['SetBookmarkArticleSuccess'] | ResolversTypes['SetBookmarkArticleError'];
  SetBookmarkArticleSuccess: ResolverTypeWrapper<SetBookmarkArticleSuccess>;
  SetDeviceTokenError: ResolverTypeWrapper<SetDeviceTokenError>;
  SetDeviceTokenErrorCode: SetDeviceTokenErrorCode;
  SetDeviceTokenInput: SetDeviceTokenInput;
  SetDeviceTokenResult: ResolversTypes['SetDeviceTokenSuccess'] | ResolversTypes['SetDeviceTokenError'];
  SetDeviceTokenSuccess: ResolverTypeWrapper<SetDeviceTokenSuccess>;
  SetFollowError: ResolverTypeWrapper<SetFollowError>;
  SetFollowErrorCode: SetFollowErrorCode;
  SetFollowInput: SetFollowInput;
  SetFollowResult: ResolversTypes['SetFollowSuccess'] | ResolversTypes['SetFollowError'];
  SetFollowSuccess: ResolverTypeWrapper<SetFollowSuccess>;
  SetShareArticleError: ResolverTypeWrapper<SetShareArticleError>;
  SetShareArticleErrorCode: SetShareArticleErrorCode;
  SetShareArticleInput: SetShareArticleInput;
  SetShareArticleResult: ResolversTypes['SetShareArticleSuccess'] | ResolversTypes['SetShareArticleError'];
  SetShareArticleSuccess: ResolverTypeWrapper<SetShareArticleSuccess>;
  SetShareHighlightError: ResolverTypeWrapper<SetShareHighlightError>;
  SetShareHighlightErrorCode: SetShareHighlightErrorCode;
  SetShareHighlightInput: SetShareHighlightInput;
  SetShareHighlightResult: ResolversTypes['SetShareHighlightSuccess'] | ResolversTypes['SetShareHighlightError'];
  SetShareHighlightSuccess: ResolverTypeWrapper<SetShareHighlightSuccess>;
  SetUserPersonalizationError: ResolverTypeWrapper<SetUserPersonalizationError>;
  SetUserPersonalizationErrorCode: SetUserPersonalizationErrorCode;
  SetUserPersonalizationInput: SetUserPersonalizationInput;
  SetUserPersonalizationResult: ResolversTypes['SetUserPersonalizationSuccess'] | ResolversTypes['SetUserPersonalizationError'];
  SetUserPersonalizationSuccess: ResolverTypeWrapper<SetUserPersonalizationSuccess>;
  ShareStats: ResolverTypeWrapper<ShareStats>;
  SharedArticleError: ResolverTypeWrapper<SharedArticleError>;
  SharedArticleErrorCode: SharedArticleErrorCode;
  SharedArticleResult: ResolversTypes['SharedArticleSuccess'] | ResolversTypes['SharedArticleError'];
  SharedArticleSuccess: ResolverTypeWrapper<SharedArticleSuccess>;
  SignupError: ResolverTypeWrapper<SignupError>;
  SignupErrorCode: SignupErrorCode;
  SignupInput: SignupInput;
  SignupResult: ResolversTypes['SignupSuccess'] | ResolversTypes['SignupError'];
  SignupSuccess: ResolverTypeWrapper<SignupSuccess>;
  SortBy: SortBy;
  SortOrder: SortOrder;
  SortParams: SortParams;
  UpdateHighlightError: ResolverTypeWrapper<UpdateHighlightError>;
  UpdateHighlightErrorCode: UpdateHighlightErrorCode;
  UpdateHighlightInput: UpdateHighlightInput;
  UpdateHighlightReplyError: ResolverTypeWrapper<UpdateHighlightReplyError>;
  UpdateHighlightReplyErrorCode: UpdateHighlightReplyErrorCode;
  UpdateHighlightReplyInput: UpdateHighlightReplyInput;
  UpdateHighlightReplyResult: ResolversTypes['UpdateHighlightReplySuccess'] | ResolversTypes['UpdateHighlightReplyError'];
  UpdateHighlightReplySuccess: ResolverTypeWrapper<UpdateHighlightReplySuccess>;
  UpdateHighlightResult: ResolversTypes['UpdateHighlightSuccess'] | ResolversTypes['UpdateHighlightError'];
  UpdateHighlightSuccess: ResolverTypeWrapper<UpdateHighlightSuccess>;
  UpdateLinkShareInfoError: ResolverTypeWrapper<UpdateLinkShareInfoError>;
  UpdateLinkShareInfoErrorCode: UpdateLinkShareInfoErrorCode;
  UpdateLinkShareInfoInput: UpdateLinkShareInfoInput;
  UpdateLinkShareInfoResult: ResolversTypes['UpdateLinkShareInfoSuccess'] | ResolversTypes['UpdateLinkShareInfoError'];
  UpdateLinkShareInfoSuccess: ResolverTypeWrapper<UpdateLinkShareInfoSuccess>;
  UpdateReminderError: ResolverTypeWrapper<UpdateReminderError>;
  UpdateReminderErrorCode: UpdateReminderErrorCode;
  UpdateReminderInput: UpdateReminderInput;
  UpdateReminderResult: ResolversTypes['UpdateReminderSuccess'] | ResolversTypes['UpdateReminderError'];
  UpdateReminderSuccess: ResolverTypeWrapper<UpdateReminderSuccess>;
  UpdateSharedCommentError: ResolverTypeWrapper<UpdateSharedCommentError>;
  UpdateSharedCommentErrorCode: UpdateSharedCommentErrorCode;
  UpdateSharedCommentInput: UpdateSharedCommentInput;
  UpdateSharedCommentResult: ResolversTypes['UpdateSharedCommentSuccess'] | ResolversTypes['UpdateSharedCommentError'];
  UpdateSharedCommentSuccess: ResolverTypeWrapper<UpdateSharedCommentSuccess>;
  UpdateUserError: ResolverTypeWrapper<UpdateUserError>;
  UpdateUserErrorCode: UpdateUserErrorCode;
  UpdateUserInput: UpdateUserInput;
  UpdateUserProfileError: ResolverTypeWrapper<UpdateUserProfileError>;
  UpdateUserProfileErrorCode: UpdateUserProfileErrorCode;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateUserProfileResult: ResolversTypes['UpdateUserProfileSuccess'] | ResolversTypes['UpdateUserProfileError'];
  UpdateUserProfileSuccess: ResolverTypeWrapper<UpdateUserProfileSuccess>;
  UpdateUserResult: ResolversTypes['UpdateUserSuccess'] | ResolversTypes['UpdateUserError'];
  UpdateUserSuccess: ResolverTypeWrapper<UpdateUserSuccess>;
  UploadFileRequestError: ResolverTypeWrapper<UploadFileRequestError>;
  UploadFileRequestErrorCode: UploadFileRequestErrorCode;
  UploadFileRequestInput: UploadFileRequestInput;
  UploadFileRequestResult: ResolversTypes['UploadFileRequestSuccess'] | ResolversTypes['UploadFileRequestError'];
  UploadFileRequestSuccess: ResolverTypeWrapper<UploadFileRequestSuccess>;
  UploadFileStatus: UploadFileStatus;
  User: ResolverTypeWrapper<User>;
  UserError: ResolverTypeWrapper<UserError>;
  UserErrorCode: UserErrorCode;
  UserPersonalization: ResolverTypeWrapper<UserPersonalization>;
  UserResult: ResolversTypes['UserSuccess'] | ResolversTypes['UserError'];
  UserSuccess: ResolverTypeWrapper<UserSuccess>;
  UsersError: ResolverTypeWrapper<UsersError>;
  UsersErrorCode: UsersErrorCode;
  UsersResult: ResolversTypes['UsersSuccess'] | ResolversTypes['UsersError'];
  UsersSuccess: ResolverTypeWrapper<UsersSuccess>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  ArchiveLinkError: ArchiveLinkError;
  String: Scalars['String'];
  ArchiveLinkInput: ArchiveLinkInput;
  ID: Scalars['ID'];
  Boolean: Scalars['Boolean'];
  ArchiveLinkResult: ResolversParentTypes['ArchiveLinkSuccess'] | ResolversParentTypes['ArchiveLinkError'];
  ArchiveLinkSuccess: ArchiveLinkSuccess;
  Article: Article;
  Float: Scalars['Float'];
  Int: Scalars['Int'];
  ArticleEdge: ArticleEdge;
  ArticleError: ArticleError;
  ArticleHighlightsInput: ArticleHighlightsInput;
  ArticleResult: ResolversParentTypes['ArticleSuccess'] | ResolversParentTypes['ArticleError'];
  ArticleSavingRequest: ArticleSavingRequest;
  ArticleSavingRequestError: ArticleSavingRequestError;
  ArticleSavingRequestResult: ResolversParentTypes['ArticleSavingRequestSuccess'] | ResolversParentTypes['ArticleSavingRequestError'];
  ArticleSavingRequestSuccess: ArticleSavingRequestSuccess;
  ArticleSuccess: ArticleSuccess;
  ArticlesError: ArticlesError;
  ArticlesResult: ResolversParentTypes['ArticlesSuccess'] | ResolversParentTypes['ArticlesError'];
  ArticlesSuccess: ArticlesSuccess;
  CreateArticleError: CreateArticleError;
  CreateArticleInput: CreateArticleInput;
  CreateArticleResult: ResolversParentTypes['CreateArticleSuccess'] | ResolversParentTypes['CreateArticleError'];
  CreateArticleSavingRequestError: CreateArticleSavingRequestError;
  CreateArticleSavingRequestInput: CreateArticleSavingRequestInput;
  CreateArticleSavingRequestResult: ResolversParentTypes['CreateArticleSavingRequestSuccess'] | ResolversParentTypes['CreateArticleSavingRequestError'];
  CreateArticleSavingRequestSuccess: CreateArticleSavingRequestSuccess;
  CreateArticleSuccess: CreateArticleSuccess;
  CreateHighlightError: CreateHighlightError;
  CreateHighlightInput: CreateHighlightInput;
  CreateHighlightReplyError: CreateHighlightReplyError;
  CreateHighlightReplyInput: CreateHighlightReplyInput;
  CreateHighlightReplyResult: ResolversParentTypes['CreateHighlightReplySuccess'] | ResolversParentTypes['CreateHighlightReplyError'];
  CreateHighlightReplySuccess: CreateHighlightReplySuccess;
  CreateHighlightResult: ResolversParentTypes['CreateHighlightSuccess'] | ResolversParentTypes['CreateHighlightError'];
  CreateHighlightSuccess: CreateHighlightSuccess;
  CreateLabelError: CreateLabelError;
  CreateLabelInput: CreateLabelInput;
  CreateLabelResult: ResolversParentTypes['CreateLabelSuccess'] | ResolversParentTypes['CreateLabelError'];
  CreateLabelSuccess: CreateLabelSuccess;
  CreateNewsletterEmailError: CreateNewsletterEmailError;
  CreateNewsletterEmailResult: ResolversParentTypes['CreateNewsletterEmailSuccess'] | ResolversParentTypes['CreateNewsletterEmailError'];
  CreateNewsletterEmailSuccess: CreateNewsletterEmailSuccess;
  CreateReactionError: CreateReactionError;
  CreateReactionInput: CreateReactionInput;
  CreateReactionResult: ResolversParentTypes['CreateReactionSuccess'] | ResolversParentTypes['CreateReactionError'];
  CreateReactionSuccess: CreateReactionSuccess;
  CreateReminderError: CreateReminderError;
  CreateReminderInput: CreateReminderInput;
  CreateReminderResult: ResolversParentTypes['CreateReminderSuccess'] | ResolversParentTypes['CreateReminderError'];
  CreateReminderSuccess: CreateReminderSuccess;
  Date: Scalars['Date'];
  DeleteHighlightError: DeleteHighlightError;
  DeleteHighlightReplyError: DeleteHighlightReplyError;
  DeleteHighlightReplyResult: ResolversParentTypes['DeleteHighlightReplySuccess'] | ResolversParentTypes['DeleteHighlightReplyError'];
  DeleteHighlightReplySuccess: DeleteHighlightReplySuccess;
  DeleteHighlightResult: ResolversParentTypes['DeleteHighlightSuccess'] | ResolversParentTypes['DeleteHighlightError'];
  DeleteHighlightSuccess: DeleteHighlightSuccess;
  DeleteLabelError: DeleteLabelError;
  DeleteLabelResult: ResolversParentTypes['DeleteLabelSuccess'] | ResolversParentTypes['DeleteLabelError'];
  DeleteLabelSuccess: DeleteLabelSuccess;
  DeleteNewsletterEmailError: DeleteNewsletterEmailError;
  DeleteNewsletterEmailResult: ResolversParentTypes['DeleteNewsletterEmailSuccess'] | ResolversParentTypes['DeleteNewsletterEmailError'];
  DeleteNewsletterEmailSuccess: DeleteNewsletterEmailSuccess;
  DeleteReactionError: DeleteReactionError;
  DeleteReactionResult: ResolversParentTypes['DeleteReactionSuccess'] | ResolversParentTypes['DeleteReactionError'];
  DeleteReactionSuccess: DeleteReactionSuccess;
  DeleteReminderError: DeleteReminderError;
  DeleteReminderResult: ResolversParentTypes['DeleteReminderSuccess'] | ResolversParentTypes['DeleteReminderError'];
  DeleteReminderSuccess: DeleteReminderSuccess;
  DeviceToken: DeviceToken;
  FeedArticle: FeedArticle;
  FeedArticleEdge: FeedArticleEdge;
  FeedArticlesError: FeedArticlesError;
  FeedArticlesResult: ResolversParentTypes['FeedArticlesSuccess'] | ResolversParentTypes['FeedArticlesError'];
  FeedArticlesSuccess: FeedArticlesSuccess;
  GetFollowersError: GetFollowersError;
  GetFollowersResult: ResolversParentTypes['GetFollowersSuccess'] | ResolversParentTypes['GetFollowersError'];
  GetFollowersSuccess: GetFollowersSuccess;
  GetFollowingError: GetFollowingError;
  GetFollowingResult: ResolversParentTypes['GetFollowingSuccess'] | ResolversParentTypes['GetFollowingError'];
  GetFollowingSuccess: GetFollowingSuccess;
  GetUserPersonalizationError: GetUserPersonalizationError;
  GetUserPersonalizationResult: ResolversParentTypes['GetUserPersonalizationSuccess'] | ResolversParentTypes['GetUserPersonalizationError'];
  GetUserPersonalizationSuccess: GetUserPersonalizationSuccess;
  GoogleLoginInput: GoogleLoginInput;
  GoogleSignupError: GoogleSignupError;
  GoogleSignupInput: GoogleSignupInput;
  GoogleSignupResult: ResolversParentTypes['GoogleSignupSuccess'] | ResolversParentTypes['GoogleSignupError'];
  GoogleSignupSuccess: GoogleSignupSuccess;
  Highlight: Highlight;
  HighlightReply: HighlightReply;
  HighlightStats: HighlightStats;
  Label: Label;
  LabelsError: LabelsError;
  LabelsResult: ResolversParentTypes['LabelsSuccess'] | ResolversParentTypes['LabelsError'];
  LabelsSuccess: LabelsSuccess;
  Link: Link;
  LinkShareInfo: LinkShareInfo;
  LogOutError: LogOutError;
  LogOutResult: ResolversParentTypes['LogOutSuccess'] | ResolversParentTypes['LogOutError'];
  LogOutSuccess: LogOutSuccess;
  LoginError: LoginError;
  LoginInput: LoginInput;
  LoginResult: ResolversParentTypes['LoginSuccess'] | ResolversParentTypes['LoginError'];
  LoginSuccess: LoginSuccess;
  MergeHighlightError: MergeHighlightError;
  MergeHighlightInput: MergeHighlightInput;
  MergeHighlightResult: ResolversParentTypes['MergeHighlightSuccess'] | ResolversParentTypes['MergeHighlightError'];
  MergeHighlightSuccess: MergeHighlightSuccess;
  Mutation: {};
  NewsletterEmail: NewsletterEmail;
  NewsletterEmailsError: NewsletterEmailsError;
  NewsletterEmailsResult: ResolversParentTypes['NewsletterEmailsSuccess'] | ResolversParentTypes['NewsletterEmailsError'];
  NewsletterEmailsSuccess: NewsletterEmailsSuccess;
  Page: Page;
  PageInfo: PageInfo;
  PageInfoInput: PageInfoInput;
  PreparedDocumentInput: PreparedDocumentInput;
  Profile: Profile;
  Query: {};
  Reaction: Reaction;
  ReadState: ReadState;
  Reminder: Reminder;
  ReminderError: ReminderError;
  ReminderResult: ResolversParentTypes['ReminderSuccess'] | ResolversParentTypes['ReminderError'];
  ReminderSuccess: ReminderSuccess;
  ReportItemInput: ReportItemInput;
  ReportItemResult: ReportItemResult;
  SaveArticleReadingProgressError: SaveArticleReadingProgressError;
  SaveArticleReadingProgressInput: SaveArticleReadingProgressInput;
  SaveArticleReadingProgressResult: ResolversParentTypes['SaveArticleReadingProgressSuccess'] | ResolversParentTypes['SaveArticleReadingProgressError'];
  SaveArticleReadingProgressSuccess: SaveArticleReadingProgressSuccess;
  SaveError: SaveError;
  SaveFileInput: SaveFileInput;
  SavePageInput: SavePageInput;
  SaveResult: ResolversParentTypes['SaveSuccess'] | ResolversParentTypes['SaveError'];
  SaveSuccess: SaveSuccess;
  SaveUrlInput: SaveUrlInput;
  SetBookmarkArticleError: SetBookmarkArticleError;
  SetBookmarkArticleInput: SetBookmarkArticleInput;
  SetBookmarkArticleResult: ResolversParentTypes['SetBookmarkArticleSuccess'] | ResolversParentTypes['SetBookmarkArticleError'];
  SetBookmarkArticleSuccess: SetBookmarkArticleSuccess;
  SetDeviceTokenError: SetDeviceTokenError;
  SetDeviceTokenInput: SetDeviceTokenInput;
  SetDeviceTokenResult: ResolversParentTypes['SetDeviceTokenSuccess'] | ResolversParentTypes['SetDeviceTokenError'];
  SetDeviceTokenSuccess: SetDeviceTokenSuccess;
  SetFollowError: SetFollowError;
  SetFollowInput: SetFollowInput;
  SetFollowResult: ResolversParentTypes['SetFollowSuccess'] | ResolversParentTypes['SetFollowError'];
  SetFollowSuccess: SetFollowSuccess;
  SetShareArticleError: SetShareArticleError;
  SetShareArticleInput: SetShareArticleInput;
  SetShareArticleResult: ResolversParentTypes['SetShareArticleSuccess'] | ResolversParentTypes['SetShareArticleError'];
  SetShareArticleSuccess: SetShareArticleSuccess;
  SetShareHighlightError: SetShareHighlightError;
  SetShareHighlightInput: SetShareHighlightInput;
  SetShareHighlightResult: ResolversParentTypes['SetShareHighlightSuccess'] | ResolversParentTypes['SetShareHighlightError'];
  SetShareHighlightSuccess: SetShareHighlightSuccess;
  SetUserPersonalizationError: SetUserPersonalizationError;
  SetUserPersonalizationInput: SetUserPersonalizationInput;
  SetUserPersonalizationResult: ResolversParentTypes['SetUserPersonalizationSuccess'] | ResolversParentTypes['SetUserPersonalizationError'];
  SetUserPersonalizationSuccess: SetUserPersonalizationSuccess;
  ShareStats: ShareStats;
  SharedArticleError: SharedArticleError;
  SharedArticleResult: ResolversParentTypes['SharedArticleSuccess'] | ResolversParentTypes['SharedArticleError'];
  SharedArticleSuccess: SharedArticleSuccess;
  SignupError: SignupError;
  SignupInput: SignupInput;
  SignupResult: ResolversParentTypes['SignupSuccess'] | ResolversParentTypes['SignupError'];
  SignupSuccess: SignupSuccess;
  SortParams: SortParams;
  UpdateHighlightError: UpdateHighlightError;
  UpdateHighlightInput: UpdateHighlightInput;
  UpdateHighlightReplyError: UpdateHighlightReplyError;
  UpdateHighlightReplyInput: UpdateHighlightReplyInput;
  UpdateHighlightReplyResult: ResolversParentTypes['UpdateHighlightReplySuccess'] | ResolversParentTypes['UpdateHighlightReplyError'];
  UpdateHighlightReplySuccess: UpdateHighlightReplySuccess;
  UpdateHighlightResult: ResolversParentTypes['UpdateHighlightSuccess'] | ResolversParentTypes['UpdateHighlightError'];
  UpdateHighlightSuccess: UpdateHighlightSuccess;
  UpdateLinkShareInfoError: UpdateLinkShareInfoError;
  UpdateLinkShareInfoInput: UpdateLinkShareInfoInput;
  UpdateLinkShareInfoResult: ResolversParentTypes['UpdateLinkShareInfoSuccess'] | ResolversParentTypes['UpdateLinkShareInfoError'];
  UpdateLinkShareInfoSuccess: UpdateLinkShareInfoSuccess;
  UpdateReminderError: UpdateReminderError;
  UpdateReminderInput: UpdateReminderInput;
  UpdateReminderResult: ResolversParentTypes['UpdateReminderSuccess'] | ResolversParentTypes['UpdateReminderError'];
  UpdateReminderSuccess: UpdateReminderSuccess;
  UpdateSharedCommentError: UpdateSharedCommentError;
  UpdateSharedCommentInput: UpdateSharedCommentInput;
  UpdateSharedCommentResult: ResolversParentTypes['UpdateSharedCommentSuccess'] | ResolversParentTypes['UpdateSharedCommentError'];
  UpdateSharedCommentSuccess: UpdateSharedCommentSuccess;
  UpdateUserError: UpdateUserError;
  UpdateUserInput: UpdateUserInput;
  UpdateUserProfileError: UpdateUserProfileError;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateUserProfileResult: ResolversParentTypes['UpdateUserProfileSuccess'] | ResolversParentTypes['UpdateUserProfileError'];
  UpdateUserProfileSuccess: UpdateUserProfileSuccess;
  UpdateUserResult: ResolversParentTypes['UpdateUserSuccess'] | ResolversParentTypes['UpdateUserError'];
  UpdateUserSuccess: UpdateUserSuccess;
  UploadFileRequestError: UploadFileRequestError;
  UploadFileRequestInput: UploadFileRequestInput;
  UploadFileRequestResult: ResolversParentTypes['UploadFileRequestSuccess'] | ResolversParentTypes['UploadFileRequestError'];
  UploadFileRequestSuccess: UploadFileRequestSuccess;
  User: User;
  UserError: UserError;
  UserPersonalization: UserPersonalization;
  UserResult: ResolversParentTypes['UserSuccess'] | ResolversParentTypes['UserError'];
  UserSuccess: UserSuccess;
  UsersError: UsersError;
  UsersResult: ResolversParentTypes['UsersSuccess'] | ResolversParentTypes['UsersError'];
  UsersSuccess: UsersSuccess;
};

export type SanitizeDirectiveArgs = {   allowedTags?: Maybe<Array<Maybe<Scalars['String']>>>;
  maxLength?: Maybe<Scalars['Int']>; };

export type SanitizeDirectiveResolver<Result, Parent, ContextType = ResolverContext, Args = SanitizeDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type ArchiveLinkErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArchiveLinkError'] = ResolversParentTypes['ArchiveLinkError']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  errorCodes?: Resolver<Array<ResolversTypes['ArchiveLinkErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArchiveLinkResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArchiveLinkResult'] = ResolversParentTypes['ArchiveLinkResult']> = {
  __resolveType: TypeResolveFn<'ArchiveLinkSuccess' | 'ArchiveLinkError', ParentType, ContextType>;
};

export type ArchiveLinkSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArchiveLinkSuccess'] = ResolversParentTypes['ArchiveLinkSuccess']> = {
  linkId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticleResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Article'] = ResolversParentTypes['Article']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  pageType?: Resolver<Maybe<ResolversTypes['PageType']>, ParentType, ContextType>;
  contentReader?: Resolver<ResolversTypes['ContentReader'], ParentType, ContextType>;
  hasContent?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  author?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  originalHtml?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  savedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  readingProgressPercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  readingProgressAnchorIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  sharedComment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  savedByViewer?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  postedByViewer?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  originalArticleUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  highlights?: Resolver<Array<ResolversTypes['Highlight']>, ParentType, ContextType, RequireFields<ArticleHighlightsArgs, never>>;
  shareInfo?: Resolver<Maybe<ResolversTypes['LinkShareInfo']>, ParentType, ContextType>;
  isArchived?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticleEdgeResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticleEdge'] = ResolversParentTypes['ArticleEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticleError'] = ResolversParentTypes['ArticleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['ArticleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticleResult'] = ResolversParentTypes['ArticleResult']> = {
  __resolveType: TypeResolveFn<'ArticleSuccess' | 'ArticleError', ParentType, ContextType>;
};

export type ArticleSavingRequestResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticleSavingRequest'] = ResolversParentTypes['ArticleSavingRequest']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ArticleSavingRequestStatus'], ParentType, ContextType>;
  errorCode?: Resolver<Maybe<ResolversTypes['CreateArticleErrorCode']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticleSavingRequestErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticleSavingRequestError'] = ResolversParentTypes['ArticleSavingRequestError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['ArticleSavingRequestErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticleSavingRequestResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticleSavingRequestResult'] = ResolversParentTypes['ArticleSavingRequestResult']> = {
  __resolveType: TypeResolveFn<'ArticleSavingRequestSuccess' | 'ArticleSavingRequestError', ParentType, ContextType>;
};

export type ArticleSavingRequestSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticleSavingRequestSuccess'] = ResolversParentTypes['ArticleSavingRequestSuccess']> = {
  articleSavingRequest?: Resolver<ResolversTypes['ArticleSavingRequest'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticleSuccess'] = ResolversParentTypes['ArticleSuccess']> = {
  article?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticlesErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticlesError'] = ResolversParentTypes['ArticlesError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['ArticlesErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticlesResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticlesResult'] = ResolversParentTypes['ArticlesResult']> = {
  __resolveType: TypeResolveFn<'ArticlesSuccess' | 'ArticlesError', ParentType, ContextType>;
};

export type ArticlesSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticlesSuccess'] = ResolversParentTypes['ArticlesSuccess']> = {
  edges?: Resolver<Array<ResolversTypes['ArticleEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateArticleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateArticleError'] = ResolversParentTypes['CreateArticleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['CreateArticleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateArticleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateArticleResult'] = ResolversParentTypes['CreateArticleResult']> = {
  __resolveType: TypeResolveFn<'CreateArticleSuccess' | 'CreateArticleError', ParentType, ContextType>;
};

export type CreateArticleSavingRequestErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateArticleSavingRequestError'] = ResolversParentTypes['CreateArticleSavingRequestError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['CreateArticleSavingRequestErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateArticleSavingRequestResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateArticleSavingRequestResult'] = ResolversParentTypes['CreateArticleSavingRequestResult']> = {
  __resolveType: TypeResolveFn<'CreateArticleSavingRequestSuccess' | 'CreateArticleSavingRequestError', ParentType, ContextType>;
};

export type CreateArticleSavingRequestSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateArticleSavingRequestSuccess'] = ResolversParentTypes['CreateArticleSavingRequestSuccess']> = {
  articleSavingRequest?: Resolver<ResolversTypes['ArticleSavingRequest'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateArticleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateArticleSuccess'] = ResolversParentTypes['CreateArticleSuccess']> = {
  createdArticle?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  created?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateHighlightErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateHighlightError'] = ResolversParentTypes['CreateHighlightError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['CreateHighlightErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateHighlightReplyErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateHighlightReplyError'] = ResolversParentTypes['CreateHighlightReplyError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['CreateHighlightReplyErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateHighlightReplyResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateHighlightReplyResult'] = ResolversParentTypes['CreateHighlightReplyResult']> = {
  __resolveType: TypeResolveFn<'CreateHighlightReplySuccess' | 'CreateHighlightReplyError', ParentType, ContextType>;
};

export type CreateHighlightReplySuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateHighlightReplySuccess'] = ResolversParentTypes['CreateHighlightReplySuccess']> = {
  highlightReply?: Resolver<ResolversTypes['HighlightReply'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateHighlightResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateHighlightResult'] = ResolversParentTypes['CreateHighlightResult']> = {
  __resolveType: TypeResolveFn<'CreateHighlightSuccess' | 'CreateHighlightError', ParentType, ContextType>;
};

export type CreateHighlightSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateHighlightSuccess'] = ResolversParentTypes['CreateHighlightSuccess']> = {
  highlight?: Resolver<ResolversTypes['Highlight'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateLabelErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateLabelError'] = ResolversParentTypes['CreateLabelError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['CreateLabelErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateLabelResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateLabelResult'] = ResolversParentTypes['CreateLabelResult']> = {
  __resolveType: TypeResolveFn<'CreateLabelSuccess' | 'CreateLabelError', ParentType, ContextType>;
};

export type CreateLabelSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateLabelSuccess'] = ResolversParentTypes['CreateLabelSuccess']> = {
  label?: Resolver<ResolversTypes['Label'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateNewsletterEmailErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateNewsletterEmailError'] = ResolversParentTypes['CreateNewsletterEmailError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['CreateNewsletterEmailErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateNewsletterEmailResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateNewsletterEmailResult'] = ResolversParentTypes['CreateNewsletterEmailResult']> = {
  __resolveType: TypeResolveFn<'CreateNewsletterEmailSuccess' | 'CreateNewsletterEmailError', ParentType, ContextType>;
};

export type CreateNewsletterEmailSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateNewsletterEmailSuccess'] = ResolversParentTypes['CreateNewsletterEmailSuccess']> = {
  newsletterEmail?: Resolver<ResolversTypes['NewsletterEmail'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateReactionErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateReactionError'] = ResolversParentTypes['CreateReactionError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['CreateReactionErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateReactionResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateReactionResult'] = ResolversParentTypes['CreateReactionResult']> = {
  __resolveType: TypeResolveFn<'CreateReactionSuccess' | 'CreateReactionError', ParentType, ContextType>;
};

export type CreateReactionSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateReactionSuccess'] = ResolversParentTypes['CreateReactionSuccess']> = {
  reaction?: Resolver<ResolversTypes['Reaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateReminderErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateReminderError'] = ResolversParentTypes['CreateReminderError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['CreateReminderErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateReminderResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateReminderResult'] = ResolversParentTypes['CreateReminderResult']> = {
  __resolveType: TypeResolveFn<'CreateReminderSuccess' | 'CreateReminderError', ParentType, ContextType>;
};

export type CreateReminderSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateReminderSuccess'] = ResolversParentTypes['CreateReminderSuccess']> = {
  reminder?: Resolver<ResolversTypes['Reminder'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DeleteHighlightErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteHighlightError'] = ResolversParentTypes['DeleteHighlightError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteHighlightErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteHighlightReplyErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteHighlightReplyError'] = ResolversParentTypes['DeleteHighlightReplyError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteHighlightReplyErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteHighlightReplyResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteHighlightReplyResult'] = ResolversParentTypes['DeleteHighlightReplyResult']> = {
  __resolveType: TypeResolveFn<'DeleteHighlightReplySuccess' | 'DeleteHighlightReplyError', ParentType, ContextType>;
};

export type DeleteHighlightReplySuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteHighlightReplySuccess'] = ResolversParentTypes['DeleteHighlightReplySuccess']> = {
  highlightReply?: Resolver<ResolversTypes['HighlightReply'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteHighlightResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteHighlightResult'] = ResolversParentTypes['DeleteHighlightResult']> = {
  __resolveType: TypeResolveFn<'DeleteHighlightSuccess' | 'DeleteHighlightError', ParentType, ContextType>;
};

export type DeleteHighlightSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteHighlightSuccess'] = ResolversParentTypes['DeleteHighlightSuccess']> = {
  highlight?: Resolver<ResolversTypes['Highlight'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteLabelErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteLabelError'] = ResolversParentTypes['DeleteLabelError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteLabelErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteLabelResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteLabelResult'] = ResolversParentTypes['DeleteLabelResult']> = {
  __resolveType: TypeResolveFn<'DeleteLabelSuccess' | 'DeleteLabelError', ParentType, ContextType>;
};

export type DeleteLabelSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteLabelSuccess'] = ResolversParentTypes['DeleteLabelSuccess']> = {
  label?: Resolver<ResolversTypes['Label'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteNewsletterEmailErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteNewsletterEmailError'] = ResolversParentTypes['DeleteNewsletterEmailError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteNewsletterEmailErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteNewsletterEmailResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteNewsletterEmailResult'] = ResolversParentTypes['DeleteNewsletterEmailResult']> = {
  __resolveType: TypeResolveFn<'DeleteNewsletterEmailSuccess' | 'DeleteNewsletterEmailError', ParentType, ContextType>;
};

export type DeleteNewsletterEmailSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteNewsletterEmailSuccess'] = ResolversParentTypes['DeleteNewsletterEmailSuccess']> = {
  newsletterEmail?: Resolver<ResolversTypes['NewsletterEmail'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteReactionErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteReactionError'] = ResolversParentTypes['DeleteReactionError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteReactionErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteReactionResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteReactionResult'] = ResolversParentTypes['DeleteReactionResult']> = {
  __resolveType: TypeResolveFn<'DeleteReactionSuccess' | 'DeleteReactionError', ParentType, ContextType>;
};

export type DeleteReactionSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteReactionSuccess'] = ResolversParentTypes['DeleteReactionSuccess']> = {
  reaction?: Resolver<ResolversTypes['Reaction'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteReminderErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteReminderError'] = ResolversParentTypes['DeleteReminderError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteReminderErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteReminderResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteReminderResult'] = ResolversParentTypes['DeleteReminderResult']> = {
  __resolveType: TypeResolveFn<'DeleteReminderSuccess' | 'DeleteReminderError', ParentType, ContextType>;
};

export type DeleteReminderSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteReminderSuccess'] = ResolversParentTypes['DeleteReminderSuccess']> = {
  reminder?: Resolver<ResolversTypes['Reminder'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeviceTokenResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeviceToken'] = ResolversParentTypes['DeviceToken']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeedArticleResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FeedArticle'] = ResolversParentTypes['FeedArticle']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  article?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  sharedBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  sharedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  sharedComment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sharedWithHighlights?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  highlightsCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  annotationsCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  highlight?: Resolver<Maybe<ResolversTypes['Highlight']>, ParentType, ContextType>;
  reactions?: Resolver<Array<ResolversTypes['Reaction']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeedArticleEdgeResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FeedArticleEdge'] = ResolversParentTypes['FeedArticleEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['FeedArticle'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeedArticlesErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FeedArticlesError'] = ResolversParentTypes['FeedArticlesError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['FeedArticlesErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeedArticlesResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FeedArticlesResult'] = ResolversParentTypes['FeedArticlesResult']> = {
  __resolveType: TypeResolveFn<'FeedArticlesSuccess' | 'FeedArticlesError', ParentType, ContextType>;
};

export type FeedArticlesSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FeedArticlesSuccess'] = ResolversParentTypes['FeedArticlesSuccess']> = {
  edges?: Resolver<Array<ResolversTypes['FeedArticleEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetFollowersErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetFollowersError'] = ResolversParentTypes['GetFollowersError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['GetFollowersErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetFollowersResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetFollowersResult'] = ResolversParentTypes['GetFollowersResult']> = {
  __resolveType: TypeResolveFn<'GetFollowersSuccess' | 'GetFollowersError', ParentType, ContextType>;
};

export type GetFollowersSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetFollowersSuccess'] = ResolversParentTypes['GetFollowersSuccess']> = {
  followers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetFollowingErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetFollowingError'] = ResolversParentTypes['GetFollowingError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['GetFollowingErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetFollowingResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetFollowingResult'] = ResolversParentTypes['GetFollowingResult']> = {
  __resolveType: TypeResolveFn<'GetFollowingSuccess' | 'GetFollowingError', ParentType, ContextType>;
};

export type GetFollowingSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetFollowingSuccess'] = ResolversParentTypes['GetFollowingSuccess']> = {
  following?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetUserPersonalizationErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetUserPersonalizationError'] = ResolversParentTypes['GetUserPersonalizationError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['GetUserPersonalizationErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetUserPersonalizationResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetUserPersonalizationResult'] = ResolversParentTypes['GetUserPersonalizationResult']> = {
  __resolveType: TypeResolveFn<'GetUserPersonalizationSuccess' | 'GetUserPersonalizationError', ParentType, ContextType>;
};

export type GetUserPersonalizationSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetUserPersonalizationSuccess'] = ResolversParentTypes['GetUserPersonalizationSuccess']> = {
  userPersonalization?: Resolver<Maybe<ResolversTypes['UserPersonalization']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GoogleSignupErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GoogleSignupError'] = ResolversParentTypes['GoogleSignupError']> = {
  errorCodes?: Resolver<Array<Maybe<ResolversTypes['SignupErrorCode']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GoogleSignupResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GoogleSignupResult'] = ResolversParentTypes['GoogleSignupResult']> = {
  __resolveType: TypeResolveFn<'GoogleSignupSuccess' | 'GoogleSignupError', ParentType, ContextType>;
};

export type GoogleSignupSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GoogleSignupSuccess'] = ResolversParentTypes['GoogleSignupSuccess']> = {
  me?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HighlightResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Highlight'] = ResolversParentTypes['Highlight']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  shortId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  article?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  quote?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  prefix?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  suffix?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  patch?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  annotation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  replies?: Resolver<Array<ResolversTypes['HighlightReply']>, ParentType, ContextType>;
  sharedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  reactions?: Resolver<Array<ResolversTypes['Reaction']>, ParentType, ContextType>;
  createdByMe?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HighlightReplyResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HighlightReply'] = ResolversParentTypes['HighlightReply']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  highlight?: Resolver<ResolversTypes['Highlight'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HighlightStatsResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HighlightStats'] = ResolversParentTypes['HighlightStats']> = {
  highlightCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LabelResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Label'] = ResolversParentTypes['Label']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LabelsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LabelsError'] = ResolversParentTypes['LabelsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['LabelsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LabelsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LabelsResult'] = ResolversParentTypes['LabelsResult']> = {
  __resolveType: TypeResolveFn<'LabelsSuccess' | 'LabelsError', ParentType, ContextType>;
};

export type LabelsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LabelsSuccess'] = ResolversParentTypes['LabelsSuccess']> = {
  labels?: Resolver<Array<ResolversTypes['Label']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LinkResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Link'] = ResolversParentTypes['Link']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  savedBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  savedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  savedByViewer?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  postedByViewer?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  readState?: Resolver<ResolversTypes['ReadState'], ParentType, ContextType>;
  highlightStats?: Resolver<ResolversTypes['HighlightStats'], ParentType, ContextType>;
  shareInfo?: Resolver<ResolversTypes['LinkShareInfo'], ParentType, ContextType>;
  shareStats?: Resolver<ResolversTypes['ShareStats'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Page'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LinkShareInfoResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LinkShareInfo'] = ResolversParentTypes['LinkShareInfo']> = {
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  imageUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LogOutErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LogOutError'] = ResolversParentTypes['LogOutError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['LogOutErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LogOutResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LogOutResult'] = ResolversParentTypes['LogOutResult']> = {
  __resolveType: TypeResolveFn<'LogOutSuccess' | 'LogOutError', ParentType, ContextType>;
};

export type LogOutSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LogOutSuccess'] = ResolversParentTypes['LogOutSuccess']> = {
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LoginErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LoginError'] = ResolversParentTypes['LoginError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['LoginErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LoginResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LoginResult'] = ResolversParentTypes['LoginResult']> = {
  __resolveType: TypeResolveFn<'LoginSuccess' | 'LoginError', ParentType, ContextType>;
};

export type LoginSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LoginSuccess'] = ResolversParentTypes['LoginSuccess']> = {
  me?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MergeHighlightErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MergeHighlightError'] = ResolversParentTypes['MergeHighlightError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['MergeHighlightErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MergeHighlightResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MergeHighlightResult'] = ResolversParentTypes['MergeHighlightResult']> = {
  __resolveType: TypeResolveFn<'MergeHighlightSuccess' | 'MergeHighlightError', ParentType, ContextType>;
};

export type MergeHighlightSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MergeHighlightSuccess'] = ResolversParentTypes['MergeHighlightSuccess']> = {
  highlight?: Resolver<ResolversTypes['Highlight'], ParentType, ContextType>;
  overlapHighlightIdList?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  googleLogin?: Resolver<ResolversTypes['LoginResult'], ParentType, ContextType, RequireFields<MutationGoogleLoginArgs, 'input'>>;
  googleSignup?: Resolver<ResolversTypes['GoogleSignupResult'], ParentType, ContextType, RequireFields<MutationGoogleSignupArgs, 'input'>>;
  logOut?: Resolver<ResolversTypes['LogOutResult'], ParentType, ContextType>;
  updateUser?: Resolver<ResolversTypes['UpdateUserResult'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'input'>>;
  updateUserProfile?: Resolver<ResolversTypes['UpdateUserProfileResult'], ParentType, ContextType, RequireFields<MutationUpdateUserProfileArgs, 'input'>>;
  createArticle?: Resolver<ResolversTypes['CreateArticleResult'], ParentType, ContextType, RequireFields<MutationCreateArticleArgs, 'input'>>;
  createHighlight?: Resolver<ResolversTypes['CreateHighlightResult'], ParentType, ContextType, RequireFields<MutationCreateHighlightArgs, 'input'>>;
  mergeHighlight?: Resolver<ResolversTypes['MergeHighlightResult'], ParentType, ContextType, RequireFields<MutationMergeHighlightArgs, 'input'>>;
  updateHighlight?: Resolver<ResolversTypes['UpdateHighlightResult'], ParentType, ContextType, RequireFields<MutationUpdateHighlightArgs, 'input'>>;
  deleteHighlight?: Resolver<ResolversTypes['DeleteHighlightResult'], ParentType, ContextType, RequireFields<MutationDeleteHighlightArgs, 'highlightId'>>;
  createHighlightReply?: Resolver<ResolversTypes['CreateHighlightReplyResult'], ParentType, ContextType, RequireFields<MutationCreateHighlightReplyArgs, 'input'>>;
  updateHighlightReply?: Resolver<ResolversTypes['UpdateHighlightReplyResult'], ParentType, ContextType, RequireFields<MutationUpdateHighlightReplyArgs, 'input'>>;
  deleteHighlightReply?: Resolver<ResolversTypes['DeleteHighlightReplyResult'], ParentType, ContextType, RequireFields<MutationDeleteHighlightReplyArgs, 'highlightReplyId'>>;
  createReaction?: Resolver<ResolversTypes['CreateReactionResult'], ParentType, ContextType, RequireFields<MutationCreateReactionArgs, 'input'>>;
  deleteReaction?: Resolver<ResolversTypes['DeleteReactionResult'], ParentType, ContextType, RequireFields<MutationDeleteReactionArgs, 'id'>>;
  uploadFileRequest?: Resolver<ResolversTypes['UploadFileRequestResult'], ParentType, ContextType, RequireFields<MutationUploadFileRequestArgs, 'input'>>;
  saveArticleReadingProgress?: Resolver<ResolversTypes['SaveArticleReadingProgressResult'], ParentType, ContextType, RequireFields<MutationSaveArticleReadingProgressArgs, 'input'>>;
  setShareArticle?: Resolver<ResolversTypes['SetShareArticleResult'], ParentType, ContextType, RequireFields<MutationSetShareArticleArgs, 'input'>>;
  updateSharedComment?: Resolver<ResolversTypes['UpdateSharedCommentResult'], ParentType, ContextType, RequireFields<MutationUpdateSharedCommentArgs, 'input'>>;
  setFollow?: Resolver<ResolversTypes['SetFollowResult'], ParentType, ContextType, RequireFields<MutationSetFollowArgs, 'input'>>;
  setBookmarkArticle?: Resolver<ResolversTypes['SetBookmarkArticleResult'], ParentType, ContextType, RequireFields<MutationSetBookmarkArticleArgs, 'input'>>;
  setUserPersonalization?: Resolver<ResolversTypes['SetUserPersonalizationResult'], ParentType, ContextType, RequireFields<MutationSetUserPersonalizationArgs, 'input'>>;
  createArticleSavingRequest?: Resolver<ResolversTypes['CreateArticleSavingRequestResult'], ParentType, ContextType, RequireFields<MutationCreateArticleSavingRequestArgs, 'input'>>;
  setShareHighlight?: Resolver<ResolversTypes['SetShareHighlightResult'], ParentType, ContextType, RequireFields<MutationSetShareHighlightArgs, 'input'>>;
  reportItem?: Resolver<ResolversTypes['ReportItemResult'], ParentType, ContextType, RequireFields<MutationReportItemArgs, 'input'>>;
  updateLinkShareInfo?: Resolver<ResolversTypes['UpdateLinkShareInfoResult'], ParentType, ContextType, RequireFields<MutationUpdateLinkShareInfoArgs, 'input'>>;
  setLinkArchived?: Resolver<ResolversTypes['ArchiveLinkResult'], ParentType, ContextType, RequireFields<MutationSetLinkArchivedArgs, 'input'>>;
  createNewsletterEmail?: Resolver<ResolversTypes['CreateNewsletterEmailResult'], ParentType, ContextType>;
  deleteNewsletterEmail?: Resolver<ResolversTypes['DeleteNewsletterEmailResult'], ParentType, ContextType, RequireFields<MutationDeleteNewsletterEmailArgs, 'newsletterEmailId'>>;
  saveUrl?: Resolver<ResolversTypes['SaveResult'], ParentType, ContextType, RequireFields<MutationSaveUrlArgs, 'input'>>;
  savePage?: Resolver<ResolversTypes['SaveResult'], ParentType, ContextType, RequireFields<MutationSavePageArgs, 'input'>>;
  saveFile?: Resolver<ResolversTypes['SaveResult'], ParentType, ContextType, RequireFields<MutationSaveFileArgs, 'input'>>;
  createReminder?: Resolver<ResolversTypes['CreateReminderResult'], ParentType, ContextType, RequireFields<MutationCreateReminderArgs, 'input'>>;
  updateReminder?: Resolver<ResolversTypes['UpdateReminderResult'], ParentType, ContextType, RequireFields<MutationUpdateReminderArgs, 'input'>>;
  deleteReminder?: Resolver<ResolversTypes['DeleteReminderResult'], ParentType, ContextType, RequireFields<MutationDeleteReminderArgs, 'id'>>;
  setDeviceToken?: Resolver<ResolversTypes['SetDeviceTokenResult'], ParentType, ContextType, RequireFields<MutationSetDeviceTokenArgs, 'input'>>;
  createLabel?: Resolver<ResolversTypes['CreateLabelResult'], ParentType, ContextType, RequireFields<MutationCreateLabelArgs, 'input'>>;
  deleteLabel?: Resolver<ResolversTypes['DeleteLabelResult'], ParentType, ContextType, RequireFields<MutationDeleteLabelArgs, 'id'>>;
  login?: Resolver<ResolversTypes['LoginResult'], ParentType, ContextType, RequireFields<MutationLoginArgs, 'input'>>;
  signup?: Resolver<ResolversTypes['SignupResult'], ParentType, ContextType, RequireFields<MutationSignupArgs, 'input'>>;
};

export type NewsletterEmailResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['NewsletterEmail'] = ResolversParentTypes['NewsletterEmail']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  confirmationCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NewsletterEmailsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['NewsletterEmailsError'] = ResolversParentTypes['NewsletterEmailsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['NewsletterEmailsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NewsletterEmailsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['NewsletterEmailsResult'] = ResolversParentTypes['NewsletterEmailsResult']> = {
  __resolveType: TypeResolveFn<'NewsletterEmailsSuccess' | 'NewsletterEmailsError', ParentType, ContextType>;
};

export type NewsletterEmailsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['NewsletterEmailsSuccess'] = ResolversParentTypes['NewsletterEmailsSuccess']> = {
  newsletterEmails?: Resolver<Array<ResolversTypes['NewsletterEmail']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Page'] = ResolversParentTypes['Page']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  originalUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PageType'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  author?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  originalHtml?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  readableHtml?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageInfoResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProfileResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Profile'] = ResolversParentTypes['Profile']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  private?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pictureUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  hello?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user?: Resolver<ResolversTypes['UserResult'], ParentType, ContextType, RequireFields<QueryUserArgs, never>>;
  articles?: Resolver<ResolversTypes['ArticlesResult'], ParentType, ContextType, RequireFields<QueryArticlesArgs, never>>;
  article?: Resolver<ResolversTypes['ArticleResult'], ParentType, ContextType, RequireFields<QueryArticleArgs, 'username' | 'slug'>>;
  sharedArticle?: Resolver<ResolversTypes['SharedArticleResult'], ParentType, ContextType, RequireFields<QuerySharedArticleArgs, 'username' | 'slug'>>;
  feedArticles?: Resolver<ResolversTypes['FeedArticlesResult'], ParentType, ContextType, RequireFields<QueryFeedArticlesArgs, never>>;
  users?: Resolver<ResolversTypes['UsersResult'], ParentType, ContextType>;
  validateUsername?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<QueryValidateUsernameArgs, 'username'>>;
  getFollowers?: Resolver<ResolversTypes['GetFollowersResult'], ParentType, ContextType, RequireFields<QueryGetFollowersArgs, never>>;
  getFollowing?: Resolver<ResolversTypes['GetFollowingResult'], ParentType, ContextType, RequireFields<QueryGetFollowingArgs, never>>;
  getUserPersonalization?: Resolver<ResolversTypes['GetUserPersonalizationResult'], ParentType, ContextType>;
  articleSavingRequest?: Resolver<ResolversTypes['ArticleSavingRequestResult'], ParentType, ContextType, RequireFields<QueryArticleSavingRequestArgs, 'id'>>;
  newsletterEmails?: Resolver<ResolversTypes['NewsletterEmailsResult'], ParentType, ContextType>;
  reminder?: Resolver<ResolversTypes['ReminderResult'], ParentType, ContextType, RequireFields<QueryReminderArgs, 'linkId'>>;
  labels?: Resolver<ResolversTypes['LabelsResult'], ParentType, ContextType, RequireFields<QueryLabelsArgs, 'linkId'>>;
};

export type ReactionResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Reaction'] = ResolversParentTypes['Reaction']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  code?: Resolver<ResolversTypes['ReactionType'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReadStateResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReadState'] = ResolversParentTypes['ReadState']> = {
  reading?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  readingTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  progressPercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  progressAnchorIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReminderResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Reminder'] = ResolversParentTypes['Reminder']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  archiveUntil?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  sendNotification?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  remindAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReminderErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReminderError'] = ResolversParentTypes['ReminderError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['ReminderErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReminderResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReminderResult'] = ResolversParentTypes['ReminderResult']> = {
  __resolveType: TypeResolveFn<'ReminderSuccess' | 'ReminderError', ParentType, ContextType>;
};

export type ReminderSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReminderSuccess'] = ResolversParentTypes['ReminderSuccess']> = {
  reminder?: Resolver<ResolversTypes['Reminder'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReportItemResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReportItemResult'] = ResolversParentTypes['ReportItemResult']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SaveArticleReadingProgressErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveArticleReadingProgressError'] = ResolversParentTypes['SaveArticleReadingProgressError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SaveArticleReadingProgressErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SaveArticleReadingProgressResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveArticleReadingProgressResult'] = ResolversParentTypes['SaveArticleReadingProgressResult']> = {
  __resolveType: TypeResolveFn<'SaveArticleReadingProgressSuccess' | 'SaveArticleReadingProgressError', ParentType, ContextType>;
};

export type SaveArticleReadingProgressSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveArticleReadingProgressSuccess'] = ResolversParentTypes['SaveArticleReadingProgressSuccess']> = {
  updatedArticle?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SaveErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveError'] = ResolversParentTypes['SaveError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SaveErrorCode']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SaveResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveResult'] = ResolversParentTypes['SaveResult']> = {
  __resolveType: TypeResolveFn<'SaveSuccess' | 'SaveError', ParentType, ContextType>;
};

export type SaveSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveSuccess'] = ResolversParentTypes['SaveSuccess']> = {
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  clientRequestId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetBookmarkArticleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetBookmarkArticleError'] = ResolversParentTypes['SetBookmarkArticleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetBookmarkArticleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetBookmarkArticleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetBookmarkArticleResult'] = ResolversParentTypes['SetBookmarkArticleResult']> = {
  __resolveType: TypeResolveFn<'SetBookmarkArticleSuccess' | 'SetBookmarkArticleError', ParentType, ContextType>;
};

export type SetBookmarkArticleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetBookmarkArticleSuccess'] = ResolversParentTypes['SetBookmarkArticleSuccess']> = {
  bookmarkedArticle?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetDeviceTokenErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetDeviceTokenError'] = ResolversParentTypes['SetDeviceTokenError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetDeviceTokenErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetDeviceTokenResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetDeviceTokenResult'] = ResolversParentTypes['SetDeviceTokenResult']> = {
  __resolveType: TypeResolveFn<'SetDeviceTokenSuccess' | 'SetDeviceTokenError', ParentType, ContextType>;
};

export type SetDeviceTokenSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetDeviceTokenSuccess'] = ResolversParentTypes['SetDeviceTokenSuccess']> = {
  deviceToken?: Resolver<ResolversTypes['DeviceToken'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetFollowErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetFollowError'] = ResolversParentTypes['SetFollowError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetFollowErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetFollowResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetFollowResult'] = ResolversParentTypes['SetFollowResult']> = {
  __resolveType: TypeResolveFn<'SetFollowSuccess' | 'SetFollowError', ParentType, ContextType>;
};

export type SetFollowSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetFollowSuccess'] = ResolversParentTypes['SetFollowSuccess']> = {
  updatedUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetShareArticleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetShareArticleError'] = ResolversParentTypes['SetShareArticleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetShareArticleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetShareArticleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetShareArticleResult'] = ResolversParentTypes['SetShareArticleResult']> = {
  __resolveType: TypeResolveFn<'SetShareArticleSuccess' | 'SetShareArticleError', ParentType, ContextType>;
};

export type SetShareArticleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetShareArticleSuccess'] = ResolversParentTypes['SetShareArticleSuccess']> = {
  updatedFeedArticleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedFeedArticle?: Resolver<Maybe<ResolversTypes['FeedArticle']>, ParentType, ContextType>;
  updatedArticle?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetShareHighlightErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetShareHighlightError'] = ResolversParentTypes['SetShareHighlightError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetShareHighlightErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetShareHighlightResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetShareHighlightResult'] = ResolversParentTypes['SetShareHighlightResult']> = {
  __resolveType: TypeResolveFn<'SetShareHighlightSuccess' | 'SetShareHighlightError', ParentType, ContextType>;
};

export type SetShareHighlightSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetShareHighlightSuccess'] = ResolversParentTypes['SetShareHighlightSuccess']> = {
  highlight?: Resolver<ResolversTypes['Highlight'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetUserPersonalizationErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetUserPersonalizationError'] = ResolversParentTypes['SetUserPersonalizationError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetUserPersonalizationErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetUserPersonalizationResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetUserPersonalizationResult'] = ResolversParentTypes['SetUserPersonalizationResult']> = {
  __resolveType: TypeResolveFn<'SetUserPersonalizationSuccess' | 'SetUserPersonalizationError', ParentType, ContextType>;
};

export type SetUserPersonalizationSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetUserPersonalizationSuccess'] = ResolversParentTypes['SetUserPersonalizationSuccess']> = {
  updatedUserPersonalization?: Resolver<ResolversTypes['UserPersonalization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShareStatsResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ShareStats'] = ResolversParentTypes['ShareStats']> = {
  viewCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  saveCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  readDuration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SharedArticleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SharedArticleError'] = ResolversParentTypes['SharedArticleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SharedArticleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SharedArticleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SharedArticleResult'] = ResolversParentTypes['SharedArticleResult']> = {
  __resolveType: TypeResolveFn<'SharedArticleSuccess' | 'SharedArticleError', ParentType, ContextType>;
};

export type SharedArticleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SharedArticleSuccess'] = ResolversParentTypes['SharedArticleSuccess']> = {
  article?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SignupErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SignupError'] = ResolversParentTypes['SignupError']> = {
  errorCodes?: Resolver<Array<Maybe<ResolversTypes['SignupErrorCode']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SignupResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SignupResult'] = ResolversParentTypes['SignupResult']> = {
  __resolveType: TypeResolveFn<'SignupSuccess' | 'SignupError', ParentType, ContextType>;
};

export type SignupSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SignupSuccess'] = ResolversParentTypes['SignupSuccess']> = {
  me?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateHighlightErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateHighlightError'] = ResolversParentTypes['UpdateHighlightError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateHighlightErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateHighlightReplyErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateHighlightReplyError'] = ResolversParentTypes['UpdateHighlightReplyError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateHighlightReplyErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateHighlightReplyResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateHighlightReplyResult'] = ResolversParentTypes['UpdateHighlightReplyResult']> = {
  __resolveType: TypeResolveFn<'UpdateHighlightReplySuccess' | 'UpdateHighlightReplyError', ParentType, ContextType>;
};

export type UpdateHighlightReplySuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateHighlightReplySuccess'] = ResolversParentTypes['UpdateHighlightReplySuccess']> = {
  highlightReply?: Resolver<ResolversTypes['HighlightReply'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateHighlightResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateHighlightResult'] = ResolversParentTypes['UpdateHighlightResult']> = {
  __resolveType: TypeResolveFn<'UpdateHighlightSuccess' | 'UpdateHighlightError', ParentType, ContextType>;
};

export type UpdateHighlightSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateHighlightSuccess'] = ResolversParentTypes['UpdateHighlightSuccess']> = {
  highlight?: Resolver<ResolversTypes['Highlight'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateLinkShareInfoErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateLinkShareInfoError'] = ResolversParentTypes['UpdateLinkShareInfoError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateLinkShareInfoErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateLinkShareInfoResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateLinkShareInfoResult'] = ResolversParentTypes['UpdateLinkShareInfoResult']> = {
  __resolveType: TypeResolveFn<'UpdateLinkShareInfoSuccess' | 'UpdateLinkShareInfoError', ParentType, ContextType>;
};

export type UpdateLinkShareInfoSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateLinkShareInfoSuccess'] = ResolversParentTypes['UpdateLinkShareInfoSuccess']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateReminderErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateReminderError'] = ResolversParentTypes['UpdateReminderError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateReminderErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateReminderResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateReminderResult'] = ResolversParentTypes['UpdateReminderResult']> = {
  __resolveType: TypeResolveFn<'UpdateReminderSuccess' | 'UpdateReminderError', ParentType, ContextType>;
};

export type UpdateReminderSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateReminderSuccess'] = ResolversParentTypes['UpdateReminderSuccess']> = {
  reminder?: Resolver<ResolversTypes['Reminder'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateSharedCommentErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateSharedCommentError'] = ResolversParentTypes['UpdateSharedCommentError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateSharedCommentErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateSharedCommentResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateSharedCommentResult'] = ResolversParentTypes['UpdateSharedCommentResult']> = {
  __resolveType: TypeResolveFn<'UpdateSharedCommentSuccess' | 'UpdateSharedCommentError', ParentType, ContextType>;
};

export type UpdateSharedCommentSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateSharedCommentSuccess'] = ResolversParentTypes['UpdateSharedCommentSuccess']> = {
  articleID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sharedComment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateUserErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateUserError'] = ResolversParentTypes['UpdateUserError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateUserErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateUserProfileErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateUserProfileError'] = ResolversParentTypes['UpdateUserProfileError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateUserProfileErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateUserProfileResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateUserProfileResult'] = ResolversParentTypes['UpdateUserProfileResult']> = {
  __resolveType: TypeResolveFn<'UpdateUserProfileSuccess' | 'UpdateUserProfileError', ParentType, ContextType>;
};

export type UpdateUserProfileSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateUserProfileSuccess'] = ResolversParentTypes['UpdateUserProfileSuccess']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateUserResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateUserResult'] = ResolversParentTypes['UpdateUserResult']> = {
  __resolveType: TypeResolveFn<'UpdateUserSuccess' | 'UpdateUserError', ParentType, ContextType>;
};

export type UpdateUserSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateUserSuccess'] = ResolversParentTypes['UpdateUserSuccess']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UploadFileRequestErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UploadFileRequestError'] = ResolversParentTypes['UploadFileRequestError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UploadFileRequestErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UploadFileRequestResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UploadFileRequestResult'] = ResolversParentTypes['UploadFileRequestResult']> = {
  __resolveType: TypeResolveFn<'UploadFileRequestSuccess' | 'UploadFileRequestError', ParentType, ContextType>;
};

export type UploadFileRequestSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UploadFileRequestSuccess'] = ResolversParentTypes['UploadFileRequestSuccess']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  uploadSignedUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  uploadFileId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  isFullUser?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  viewerIsFollowing?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isFriend?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  picture?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  sharedArticles?: Resolver<Array<ResolversTypes['FeedArticle']>, ParentType, ContextType>;
  sharedArticlesCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sharedHighlightsCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sharedNotesCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  friendsCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  followersCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UserError'] = ResolversParentTypes['UserError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UserErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserPersonalizationResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UserPersonalization'] = ResolversParentTypes['UserPersonalization']> = {
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  theme?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fontSize?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fontFamily?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  margin?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  libraryLayoutType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  librarySortOrder?: Resolver<Maybe<ResolversTypes['SortOrder']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UserResult'] = ResolversParentTypes['UserResult']> = {
  __resolveType: TypeResolveFn<'UserSuccess' | 'UserError', ParentType, ContextType>;
};

export type UserSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UserSuccess'] = ResolversParentTypes['UserSuccess']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UsersErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UsersError'] = ResolversParentTypes['UsersError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UsersErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UsersResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UsersResult'] = ResolversParentTypes['UsersResult']> = {
  __resolveType: TypeResolveFn<'UsersSuccess' | 'UsersError', ParentType, ContextType>;
};

export type UsersSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UsersSuccess'] = ResolversParentTypes['UsersSuccess']> = {
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = ResolverContext> = {
  ArchiveLinkError?: ArchiveLinkErrorResolvers<ContextType>;
  ArchiveLinkResult?: ArchiveLinkResultResolvers<ContextType>;
  ArchiveLinkSuccess?: ArchiveLinkSuccessResolvers<ContextType>;
  Article?: ArticleResolvers<ContextType>;
  ArticleEdge?: ArticleEdgeResolvers<ContextType>;
  ArticleError?: ArticleErrorResolvers<ContextType>;
  ArticleResult?: ArticleResultResolvers<ContextType>;
  ArticleSavingRequest?: ArticleSavingRequestResolvers<ContextType>;
  ArticleSavingRequestError?: ArticleSavingRequestErrorResolvers<ContextType>;
  ArticleSavingRequestResult?: ArticleSavingRequestResultResolvers<ContextType>;
  ArticleSavingRequestSuccess?: ArticleSavingRequestSuccessResolvers<ContextType>;
  ArticleSuccess?: ArticleSuccessResolvers<ContextType>;
  ArticlesError?: ArticlesErrorResolvers<ContextType>;
  ArticlesResult?: ArticlesResultResolvers<ContextType>;
  ArticlesSuccess?: ArticlesSuccessResolvers<ContextType>;
  CreateArticleError?: CreateArticleErrorResolvers<ContextType>;
  CreateArticleResult?: CreateArticleResultResolvers<ContextType>;
  CreateArticleSavingRequestError?: CreateArticleSavingRequestErrorResolvers<ContextType>;
  CreateArticleSavingRequestResult?: CreateArticleSavingRequestResultResolvers<ContextType>;
  CreateArticleSavingRequestSuccess?: CreateArticleSavingRequestSuccessResolvers<ContextType>;
  CreateArticleSuccess?: CreateArticleSuccessResolvers<ContextType>;
  CreateHighlightError?: CreateHighlightErrorResolvers<ContextType>;
  CreateHighlightReplyError?: CreateHighlightReplyErrorResolvers<ContextType>;
  CreateHighlightReplyResult?: CreateHighlightReplyResultResolvers<ContextType>;
  CreateHighlightReplySuccess?: CreateHighlightReplySuccessResolvers<ContextType>;
  CreateHighlightResult?: CreateHighlightResultResolvers<ContextType>;
  CreateHighlightSuccess?: CreateHighlightSuccessResolvers<ContextType>;
  CreateLabelError?: CreateLabelErrorResolvers<ContextType>;
  CreateLabelResult?: CreateLabelResultResolvers<ContextType>;
  CreateLabelSuccess?: CreateLabelSuccessResolvers<ContextType>;
  CreateNewsletterEmailError?: CreateNewsletterEmailErrorResolvers<ContextType>;
  CreateNewsletterEmailResult?: CreateNewsletterEmailResultResolvers<ContextType>;
  CreateNewsletterEmailSuccess?: CreateNewsletterEmailSuccessResolvers<ContextType>;
  CreateReactionError?: CreateReactionErrorResolvers<ContextType>;
  CreateReactionResult?: CreateReactionResultResolvers<ContextType>;
  CreateReactionSuccess?: CreateReactionSuccessResolvers<ContextType>;
  CreateReminderError?: CreateReminderErrorResolvers<ContextType>;
  CreateReminderResult?: CreateReminderResultResolvers<ContextType>;
  CreateReminderSuccess?: CreateReminderSuccessResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DeleteHighlightError?: DeleteHighlightErrorResolvers<ContextType>;
  DeleteHighlightReplyError?: DeleteHighlightReplyErrorResolvers<ContextType>;
  DeleteHighlightReplyResult?: DeleteHighlightReplyResultResolvers<ContextType>;
  DeleteHighlightReplySuccess?: DeleteHighlightReplySuccessResolvers<ContextType>;
  DeleteHighlightResult?: DeleteHighlightResultResolvers<ContextType>;
  DeleteHighlightSuccess?: DeleteHighlightSuccessResolvers<ContextType>;
  DeleteLabelError?: DeleteLabelErrorResolvers<ContextType>;
  DeleteLabelResult?: DeleteLabelResultResolvers<ContextType>;
  DeleteLabelSuccess?: DeleteLabelSuccessResolvers<ContextType>;
  DeleteNewsletterEmailError?: DeleteNewsletterEmailErrorResolvers<ContextType>;
  DeleteNewsletterEmailResult?: DeleteNewsletterEmailResultResolvers<ContextType>;
  DeleteNewsletterEmailSuccess?: DeleteNewsletterEmailSuccessResolvers<ContextType>;
  DeleteReactionError?: DeleteReactionErrorResolvers<ContextType>;
  DeleteReactionResult?: DeleteReactionResultResolvers<ContextType>;
  DeleteReactionSuccess?: DeleteReactionSuccessResolvers<ContextType>;
  DeleteReminderError?: DeleteReminderErrorResolvers<ContextType>;
  DeleteReminderResult?: DeleteReminderResultResolvers<ContextType>;
  DeleteReminderSuccess?: DeleteReminderSuccessResolvers<ContextType>;
  DeviceToken?: DeviceTokenResolvers<ContextType>;
  FeedArticle?: FeedArticleResolvers<ContextType>;
  FeedArticleEdge?: FeedArticleEdgeResolvers<ContextType>;
  FeedArticlesError?: FeedArticlesErrorResolvers<ContextType>;
  FeedArticlesResult?: FeedArticlesResultResolvers<ContextType>;
  FeedArticlesSuccess?: FeedArticlesSuccessResolvers<ContextType>;
  GetFollowersError?: GetFollowersErrorResolvers<ContextType>;
  GetFollowersResult?: GetFollowersResultResolvers<ContextType>;
  GetFollowersSuccess?: GetFollowersSuccessResolvers<ContextType>;
  GetFollowingError?: GetFollowingErrorResolvers<ContextType>;
  GetFollowingResult?: GetFollowingResultResolvers<ContextType>;
  GetFollowingSuccess?: GetFollowingSuccessResolvers<ContextType>;
  GetUserPersonalizationError?: GetUserPersonalizationErrorResolvers<ContextType>;
  GetUserPersonalizationResult?: GetUserPersonalizationResultResolvers<ContextType>;
  GetUserPersonalizationSuccess?: GetUserPersonalizationSuccessResolvers<ContextType>;
  GoogleSignupError?: GoogleSignupErrorResolvers<ContextType>;
  GoogleSignupResult?: GoogleSignupResultResolvers<ContextType>;
  GoogleSignupSuccess?: GoogleSignupSuccessResolvers<ContextType>;
  Highlight?: HighlightResolvers<ContextType>;
  HighlightReply?: HighlightReplyResolvers<ContextType>;
  HighlightStats?: HighlightStatsResolvers<ContextType>;
  Label?: LabelResolvers<ContextType>;
  LabelsError?: LabelsErrorResolvers<ContextType>;
  LabelsResult?: LabelsResultResolvers<ContextType>;
  LabelsSuccess?: LabelsSuccessResolvers<ContextType>;
  Link?: LinkResolvers<ContextType>;
  LinkShareInfo?: LinkShareInfoResolvers<ContextType>;
  LogOutError?: LogOutErrorResolvers<ContextType>;
  LogOutResult?: LogOutResultResolvers<ContextType>;
  LogOutSuccess?: LogOutSuccessResolvers<ContextType>;
  LoginError?: LoginErrorResolvers<ContextType>;
  LoginResult?: LoginResultResolvers<ContextType>;
  LoginSuccess?: LoginSuccessResolvers<ContextType>;
  MergeHighlightError?: MergeHighlightErrorResolvers<ContextType>;
  MergeHighlightResult?: MergeHighlightResultResolvers<ContextType>;
  MergeHighlightSuccess?: MergeHighlightSuccessResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NewsletterEmail?: NewsletterEmailResolvers<ContextType>;
  NewsletterEmailsError?: NewsletterEmailsErrorResolvers<ContextType>;
  NewsletterEmailsResult?: NewsletterEmailsResultResolvers<ContextType>;
  NewsletterEmailsSuccess?: NewsletterEmailsSuccessResolvers<ContextType>;
  Page?: PageResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Profile?: ProfileResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Reaction?: ReactionResolvers<ContextType>;
  ReadState?: ReadStateResolvers<ContextType>;
  Reminder?: ReminderResolvers<ContextType>;
  ReminderError?: ReminderErrorResolvers<ContextType>;
  ReminderResult?: ReminderResultResolvers<ContextType>;
  ReminderSuccess?: ReminderSuccessResolvers<ContextType>;
  ReportItemResult?: ReportItemResultResolvers<ContextType>;
  SaveArticleReadingProgressError?: SaveArticleReadingProgressErrorResolvers<ContextType>;
  SaveArticleReadingProgressResult?: SaveArticleReadingProgressResultResolvers<ContextType>;
  SaveArticleReadingProgressSuccess?: SaveArticleReadingProgressSuccessResolvers<ContextType>;
  SaveError?: SaveErrorResolvers<ContextType>;
  SaveResult?: SaveResultResolvers<ContextType>;
  SaveSuccess?: SaveSuccessResolvers<ContextType>;
  SetBookmarkArticleError?: SetBookmarkArticleErrorResolvers<ContextType>;
  SetBookmarkArticleResult?: SetBookmarkArticleResultResolvers<ContextType>;
  SetBookmarkArticleSuccess?: SetBookmarkArticleSuccessResolvers<ContextType>;
  SetDeviceTokenError?: SetDeviceTokenErrorResolvers<ContextType>;
  SetDeviceTokenResult?: SetDeviceTokenResultResolvers<ContextType>;
  SetDeviceTokenSuccess?: SetDeviceTokenSuccessResolvers<ContextType>;
  SetFollowError?: SetFollowErrorResolvers<ContextType>;
  SetFollowResult?: SetFollowResultResolvers<ContextType>;
  SetFollowSuccess?: SetFollowSuccessResolvers<ContextType>;
  SetShareArticleError?: SetShareArticleErrorResolvers<ContextType>;
  SetShareArticleResult?: SetShareArticleResultResolvers<ContextType>;
  SetShareArticleSuccess?: SetShareArticleSuccessResolvers<ContextType>;
  SetShareHighlightError?: SetShareHighlightErrorResolvers<ContextType>;
  SetShareHighlightResult?: SetShareHighlightResultResolvers<ContextType>;
  SetShareHighlightSuccess?: SetShareHighlightSuccessResolvers<ContextType>;
  SetUserPersonalizationError?: SetUserPersonalizationErrorResolvers<ContextType>;
  SetUserPersonalizationResult?: SetUserPersonalizationResultResolvers<ContextType>;
  SetUserPersonalizationSuccess?: SetUserPersonalizationSuccessResolvers<ContextType>;
  ShareStats?: ShareStatsResolvers<ContextType>;
  SharedArticleError?: SharedArticleErrorResolvers<ContextType>;
  SharedArticleResult?: SharedArticleResultResolvers<ContextType>;
  SharedArticleSuccess?: SharedArticleSuccessResolvers<ContextType>;
  SignupError?: SignupErrorResolvers<ContextType>;
  SignupResult?: SignupResultResolvers<ContextType>;
  SignupSuccess?: SignupSuccessResolvers<ContextType>;
  UpdateHighlightError?: UpdateHighlightErrorResolvers<ContextType>;
  UpdateHighlightReplyError?: UpdateHighlightReplyErrorResolvers<ContextType>;
  UpdateHighlightReplyResult?: UpdateHighlightReplyResultResolvers<ContextType>;
  UpdateHighlightReplySuccess?: UpdateHighlightReplySuccessResolvers<ContextType>;
  UpdateHighlightResult?: UpdateHighlightResultResolvers<ContextType>;
  UpdateHighlightSuccess?: UpdateHighlightSuccessResolvers<ContextType>;
  UpdateLinkShareInfoError?: UpdateLinkShareInfoErrorResolvers<ContextType>;
  UpdateLinkShareInfoResult?: UpdateLinkShareInfoResultResolvers<ContextType>;
  UpdateLinkShareInfoSuccess?: UpdateLinkShareInfoSuccessResolvers<ContextType>;
  UpdateReminderError?: UpdateReminderErrorResolvers<ContextType>;
  UpdateReminderResult?: UpdateReminderResultResolvers<ContextType>;
  UpdateReminderSuccess?: UpdateReminderSuccessResolvers<ContextType>;
  UpdateSharedCommentError?: UpdateSharedCommentErrorResolvers<ContextType>;
  UpdateSharedCommentResult?: UpdateSharedCommentResultResolvers<ContextType>;
  UpdateSharedCommentSuccess?: UpdateSharedCommentSuccessResolvers<ContextType>;
  UpdateUserError?: UpdateUserErrorResolvers<ContextType>;
  UpdateUserProfileError?: UpdateUserProfileErrorResolvers<ContextType>;
  UpdateUserProfileResult?: UpdateUserProfileResultResolvers<ContextType>;
  UpdateUserProfileSuccess?: UpdateUserProfileSuccessResolvers<ContextType>;
  UpdateUserResult?: UpdateUserResultResolvers<ContextType>;
  UpdateUserSuccess?: UpdateUserSuccessResolvers<ContextType>;
  UploadFileRequestError?: UploadFileRequestErrorResolvers<ContextType>;
  UploadFileRequestResult?: UploadFileRequestResultResolvers<ContextType>;
  UploadFileRequestSuccess?: UploadFileRequestSuccessResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserError?: UserErrorResolvers<ContextType>;
  UserPersonalization?: UserPersonalizationResolvers<ContextType>;
  UserResult?: UserResultResolvers<ContextType>;
  UserSuccess?: UserSuccessResolvers<ContextType>;
  UsersError?: UsersErrorResolvers<ContextType>;
  UsersResult?: UsersResultResolvers<ContextType>;
  UsersSuccess?: UsersSuccessResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = ResolverContext> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = ResolverContext> = {
  sanitize?: SanitizeDirectiveResolver<any, any, ContextType>;
};


/**
 * @deprecated
 * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
 */
export type IDirectiveResolvers<ContextType = ResolverContext> = DirectiveResolvers<ContextType>;