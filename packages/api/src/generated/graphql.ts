import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { ResolverContext } from '../resolvers/types';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  JSON: any;
};

export type AddDiscoverFeedError = {
  __typename?: 'AddDiscoverFeedError';
  errorCodes: Array<AddDiscoverFeedErrorCode>;
};

export enum AddDiscoverFeedErrorCode {
  BadRequest = 'BAD_REQUEST',
  Conflict = 'CONFLICT',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type AddDiscoverFeedInput = {
  url: Scalars['String'];
};

export type AddDiscoverFeedResult = AddDiscoverFeedError | AddDiscoverFeedSuccess;

export type AddDiscoverFeedSuccess = {
  __typename?: 'AddDiscoverFeedSuccess';
  feed: DiscoverFeed;
};

export type AddPopularReadError = {
  __typename?: 'AddPopularReadError';
  errorCodes: Array<AddPopularReadErrorCode>;
};

export enum AddPopularReadErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type AddPopularReadResult = AddPopularReadError | AddPopularReadSuccess;

export type AddPopularReadSuccess = {
  __typename?: 'AddPopularReadSuccess';
  pageId: Scalars['String'];
};

export enum AllowedReply {
  Confirm = 'CONFIRM',
  Okay = 'OKAY',
  Subscribe = 'SUBSCRIBE',
  Yes = 'YES'
}

export type ApiKey = {
  __typename?: 'ApiKey';
  createdAt: Scalars['Date'];
  expiresAt: Scalars['Date'];
  id: Scalars['ID'];
  key?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  scopes?: Maybe<Array<Scalars['String']>>;
  usedAt?: Maybe<Scalars['Date']>;
};

export type ApiKeysError = {
  __typename?: 'ApiKeysError';
  errorCodes: Array<ApiKeysErrorCode>;
};

export enum ApiKeysErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type ApiKeysResult = ApiKeysError | ApiKeysSuccess;

export type ApiKeysSuccess = {
  __typename?: 'ApiKeysSuccess';
  apiKeys: Array<ApiKey>;
};

export type ArchiveLinkError = {
  __typename?: 'ArchiveLinkError';
  errorCodes: Array<ArchiveLinkErrorCode>;
  message: Scalars['String'];
};

export enum ArchiveLinkErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type ArchiveLinkInput = {
  archived: Scalars['Boolean'];
  linkId: Scalars['ID'];
};

export type ArchiveLinkResult = ArchiveLinkError | ArchiveLinkSuccess;

export type ArchiveLinkSuccess = {
  __typename?: 'ArchiveLinkSuccess';
  linkId: Scalars['String'];
  message: Scalars['String'];
};

export type Article = {
  __typename?: 'Article';
  author?: Maybe<Scalars['String']>;
  content: Scalars['String'];
  contentReader: ContentReader;
  createdAt: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  directionality?: Maybe<DirectionalityType>;
  feedContent?: Maybe<Scalars['String']>;
  folder: Scalars['String'];
  hasContent?: Maybe<Scalars['Boolean']>;
  hash: Scalars['String'];
  highlights: Array<Highlight>;
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  isArchived: Scalars['Boolean'];
  labels?: Maybe<Array<Label>>;
  language?: Maybe<Scalars['String']>;
  linkId?: Maybe<Scalars['ID']>;
  originalArticleUrl?: Maybe<Scalars['String']>;
  originalHtml?: Maybe<Scalars['String']>;
  pageType?: Maybe<PageType>;
  postedByViewer?: Maybe<Scalars['Boolean']>;
  publishedAt?: Maybe<Scalars['Date']>;
  readAt?: Maybe<Scalars['Date']>;
  readingProgressAnchorIndex: Scalars['Int'];
  readingProgressPercent: Scalars['Float'];
  readingProgressTopPercent?: Maybe<Scalars['Float']>;
  recommendations?: Maybe<Array<Recommendation>>;
  savedAt: Scalars['Date'];
  savedByViewer?: Maybe<Scalars['Boolean']>;
  shareInfo?: Maybe<LinkShareInfo>;
  sharedComment?: Maybe<Scalars['String']>;
  siteIcon?: Maybe<Scalars['String']>;
  siteName?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  state?: Maybe<ArticleSavingRequestStatus>;
  subscription?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  unsubHttpUrl?: Maybe<Scalars['String']>;
  unsubMailTo?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Date']>;
  uploadFileId?: Maybe<Scalars['ID']>;
  url: Scalars['String'];
  wordsCount?: Maybe<Scalars['Int']>;
};


export type ArticleHighlightsArgs = {
  input?: InputMaybe<ArticleHighlightsInput>;
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
  BadData = 'BAD_DATA',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type ArticleHighlightsInput = {
  includeFriends?: InputMaybe<Scalars['Boolean']>;
};

export type ArticleResult = ArticleError | ArticleSuccess;

export type ArticleSavingRequest = {
  __typename?: 'ArticleSavingRequest';
  /** @deprecated article has been replaced with slug */
  article?: Maybe<Article>;
  createdAt: Scalars['Date'];
  errorCode?: Maybe<CreateArticleErrorCode>;
  id: Scalars['ID'];
  slug: Scalars['String'];
  status: ArticleSavingRequestStatus;
  updatedAt?: Maybe<Scalars['Date']>;
  url: Scalars['String'];
  user: User;
  /** @deprecated userId has been replaced with user */
  userId: Scalars['ID'];
};

export type ArticleSavingRequestError = {
  __typename?: 'ArticleSavingRequestError';
  errorCodes: Array<ArticleSavingRequestErrorCode>;
};

export enum ArticleSavingRequestErrorCode {
  BadData = 'BAD_DATA',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type ArticleSavingRequestResult = ArticleSavingRequestError | ArticleSavingRequestSuccess;

export enum ArticleSavingRequestStatus {
  Archived = 'ARCHIVED',
  ContentNotFetched = 'CONTENT_NOT_FETCHED',
  Deleted = 'DELETED',
  Failed = 'FAILED',
  Processing = 'PROCESSING',
  Succeeded = 'SUCCEEDED'
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

export type ArticlesResult = ArticlesError | ArticlesSuccess;

export type ArticlesSuccess = {
  __typename?: 'ArticlesSuccess';
  edges: Array<ArticleEdge>;
  pageInfo: PageInfo;
};

export type BulkActionError = {
  __typename?: 'BulkActionError';
  errorCodes: Array<BulkActionErrorCode>;
};

export enum BulkActionErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type BulkActionResult = BulkActionError | BulkActionSuccess;

export type BulkActionSuccess = {
  __typename?: 'BulkActionSuccess';
  success: Scalars['Boolean'];
};

export enum BulkActionType {
  AddLabels = 'ADD_LABELS',
  Archive = 'ARCHIVE',
  Delete = 'DELETE',
  MarkAsRead = 'MARK_AS_READ',
  MarkAsSeen = 'MARK_AS_SEEN',
  MoveToFolder = 'MOVE_TO_FOLDER'
}

export enum ContentReader {
  Epub = 'EPUB',
  Pdf = 'PDF',
  Web = 'WEB'
}

export type CreateArticleError = {
  __typename?: 'CreateArticleError';
  errorCodes: Array<CreateArticleErrorCode>;
};

export enum CreateArticleErrorCode {
  ElasticError = 'ELASTIC_ERROR',
  NotAllowedToParse = 'NOT_ALLOWED_TO_PARSE',
  PayloadTooLarge = 'PAYLOAD_TOO_LARGE',
  UnableToFetch = 'UNABLE_TO_FETCH',
  UnableToParse = 'UNABLE_TO_PARSE',
  Unauthorized = 'UNAUTHORIZED',
  UploadFileMissing = 'UPLOAD_FILE_MISSING'
}

export type CreateArticleInput = {
  articleSavingRequestId?: InputMaybe<Scalars['ID']>;
  folder?: InputMaybe<Scalars['String']>;
  labels?: InputMaybe<Array<CreateLabelInput>>;
  preparedDocument?: InputMaybe<PreparedDocumentInput>;
  publishedAt?: InputMaybe<Scalars['Date']>;
  rssFeedUrl?: InputMaybe<Scalars['String']>;
  savedAt?: InputMaybe<Scalars['Date']>;
  skipParsing?: InputMaybe<Scalars['Boolean']>;
  source?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<ArticleSavingRequestStatus>;
  uploadFileId?: InputMaybe<Scalars['ID']>;
  url: Scalars['String'];
};

export type CreateArticleResult = CreateArticleError | CreateArticleSuccess;

export type CreateArticleSavingRequestError = {
  __typename?: 'CreateArticleSavingRequestError';
  errorCodes: Array<CreateArticleSavingRequestErrorCode>;
};

export enum CreateArticleSavingRequestErrorCode {
  BadData = 'BAD_DATA',
  Unauthorized = 'UNAUTHORIZED'
}

export type CreateArticleSavingRequestInput = {
  url: Scalars['String'];
};

export type CreateArticleSavingRequestResult = CreateArticleSavingRequestError | CreateArticleSavingRequestSuccess;

export type CreateArticleSavingRequestSuccess = {
  __typename?: 'CreateArticleSavingRequestSuccess';
  articleSavingRequest: ArticleSavingRequest;
};

export type CreateArticleSuccess = {
  __typename?: 'CreateArticleSuccess';
  created: Scalars['Boolean'];
  createdArticle: Article;
  user: User;
};

export type CreateFolderPolicyError = {
  __typename?: 'CreateFolderPolicyError';
  errorCodes: Array<CreateFolderPolicyErrorCode>;
};

export enum CreateFolderPolicyErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type CreateFolderPolicyInput = {
  action: FolderPolicyAction;
  afterDays: Scalars['Int'];
  folder: Scalars['String'];
};

export type CreateFolderPolicyResult = CreateFolderPolicyError | CreateFolderPolicySuccess;

export type CreateFolderPolicySuccess = {
  __typename?: 'CreateFolderPolicySuccess';
  policy: FolderPolicy;
};

export type CreateGroupError = {
  __typename?: 'CreateGroupError';
  errorCodes: Array<CreateGroupErrorCode>;
};

export enum CreateGroupErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type CreateGroupInput = {
  description?: InputMaybe<Scalars['String']>;
  expiresInDays?: InputMaybe<Scalars['Int']>;
  maxMembers?: InputMaybe<Scalars['Int']>;
  name: Scalars['String'];
  onlyAdminCanPost?: InputMaybe<Scalars['Boolean']>;
  onlyAdminCanSeeMembers?: InputMaybe<Scalars['Boolean']>;
  topics?: InputMaybe<Array<Scalars['String']>>;
};

export type CreateGroupResult = CreateGroupError | CreateGroupSuccess;

export type CreateGroupSuccess = {
  __typename?: 'CreateGroupSuccess';
  group: RecommendationGroup;
};

export type CreateHighlightError = {
  __typename?: 'CreateHighlightError';
  errorCodes: Array<CreateHighlightErrorCode>;
};

export enum CreateHighlightErrorCode {
  AlreadyExists = 'ALREADY_EXISTS',
  BadData = 'BAD_DATA',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type CreateHighlightInput = {
  annotation?: InputMaybe<Scalars['String']>;
  articleId: Scalars['ID'];
  color?: InputMaybe<Scalars['String']>;
  highlightPositionAnchorIndex?: InputMaybe<Scalars['Int']>;
  highlightPositionPercent?: InputMaybe<Scalars['Float']>;
  html?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  patch?: InputMaybe<Scalars['String']>;
  prefix?: InputMaybe<Scalars['String']>;
  quote?: InputMaybe<Scalars['String']>;
  representation?: InputMaybe<RepresentationType>;
  sharedAt?: InputMaybe<Scalars['Date']>;
  shortId: Scalars['String'];
  suffix?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<HighlightType>;
};

export type CreateHighlightReplyError = {
  __typename?: 'CreateHighlightReplyError';
  errorCodes: Array<CreateHighlightReplyErrorCode>;
};

export enum CreateHighlightReplyErrorCode {
  EmptyAnnotation = 'EMPTY_ANNOTATION',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type CreateHighlightReplyInput = {
  highlightId: Scalars['ID'];
  text: Scalars['String'];
};

export type CreateHighlightReplyResult = CreateHighlightReplyError | CreateHighlightReplySuccess;

export type CreateHighlightReplySuccess = {
  __typename?: 'CreateHighlightReplySuccess';
  highlightReply: HighlightReply;
};

export type CreateHighlightResult = CreateHighlightError | CreateHighlightSuccess;

export type CreateHighlightSuccess = {
  __typename?: 'CreateHighlightSuccess';
  highlight: Highlight;
};

export type CreateLabelError = {
  __typename?: 'CreateLabelError';
  errorCodes: Array<CreateLabelErrorCode>;
};

export enum CreateLabelErrorCode {
  BadRequest = 'BAD_REQUEST',
  LabelAlreadyExists = 'LABEL_ALREADY_EXISTS',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type CreateLabelInput = {
  color?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type CreateLabelResult = CreateLabelError | CreateLabelSuccess;

export type CreateLabelSuccess = {
  __typename?: 'CreateLabelSuccess';
  label: Label;
};

export type CreateNewsletterEmailError = {
  __typename?: 'CreateNewsletterEmailError';
  errorCodes: Array<CreateNewsletterEmailErrorCode>;
};

export enum CreateNewsletterEmailErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type CreateNewsletterEmailInput = {
  description?: InputMaybe<Scalars['String']>;
  folder?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type CreateNewsletterEmailResult = CreateNewsletterEmailError | CreateNewsletterEmailSuccess;

export type CreateNewsletterEmailSuccess = {
  __typename?: 'CreateNewsletterEmailSuccess';
  newsletterEmail: NewsletterEmail;
};

export type CreateReactionError = {
  __typename?: 'CreateReactionError';
  errorCodes: Array<CreateReactionErrorCode>;
};

export enum CreateReactionErrorCode {
  BadCode = 'BAD_CODE',
  BadTarget = 'BAD_TARGET',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type CreateReactionInput = {
  code: ReactionType;
  highlightId?: InputMaybe<Scalars['ID']>;
  userArticleId?: InputMaybe<Scalars['ID']>;
};

export type CreateReactionResult = CreateReactionError | CreateReactionSuccess;

export type CreateReactionSuccess = {
  __typename?: 'CreateReactionSuccess';
  reaction: Reaction;
};

export type CreateReminderError = {
  __typename?: 'CreateReminderError';
  errorCodes: Array<CreateReminderErrorCode>;
};

export enum CreateReminderErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type CreateReminderInput = {
  archiveUntil: Scalars['Boolean'];
  clientRequestId?: InputMaybe<Scalars['ID']>;
  linkId?: InputMaybe<Scalars['ID']>;
  remindAt: Scalars['Date'];
  sendNotification: Scalars['Boolean'];
};

export type CreateReminderResult = CreateReminderError | CreateReminderSuccess;

export type CreateReminderSuccess = {
  __typename?: 'CreateReminderSuccess';
  reminder: Reminder;
};

export type DeleteAccountError = {
  __typename?: 'DeleteAccountError';
  errorCodes: Array<DeleteAccountErrorCode>;
};

export enum DeleteAccountErrorCode {
  Forbidden = 'FORBIDDEN',
  Unauthorized = 'UNAUTHORIZED',
  UserNotFound = 'USER_NOT_FOUND'
}

export type DeleteAccountResult = DeleteAccountError | DeleteAccountSuccess;

export type DeleteAccountSuccess = {
  __typename?: 'DeleteAccountSuccess';
  userID: Scalars['ID'];
};

export type DeleteDiscoverArticleError = {
  __typename?: 'DeleteDiscoverArticleError';
  errorCodes: Array<DeleteDiscoverArticleErrorCode>;
};

export enum DeleteDiscoverArticleErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type DeleteDiscoverArticleInput = {
  discoverArticleId: Scalars['ID'];
};

export type DeleteDiscoverArticleResult = DeleteDiscoverArticleError | DeleteDiscoverArticleSuccess;

export type DeleteDiscoverArticleSuccess = {
  __typename?: 'DeleteDiscoverArticleSuccess';
  id: Scalars['ID'];
};

export type DeleteDiscoverFeedError = {
  __typename?: 'DeleteDiscoverFeedError';
  errorCodes: Array<DeleteDiscoverFeedErrorCode>;
};

export enum DeleteDiscoverFeedErrorCode {
  BadRequest = 'BAD_REQUEST',
  Conflict = 'CONFLICT',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type DeleteDiscoverFeedInput = {
  feedId: Scalars['ID'];
};

export type DeleteDiscoverFeedResult = DeleteDiscoverFeedError | DeleteDiscoverFeedSuccess;

export type DeleteDiscoverFeedSuccess = {
  __typename?: 'DeleteDiscoverFeedSuccess';
  id: Scalars['String'];
};

export type DeleteFilterError = {
  __typename?: 'DeleteFilterError';
  errorCodes: Array<DeleteFilterErrorCode>;
};

export enum DeleteFilterErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type DeleteFilterResult = DeleteFilterError | DeleteFilterSuccess;

export type DeleteFilterSuccess = {
  __typename?: 'DeleteFilterSuccess';
  filter: Filter;
};

export type DeleteFolderPolicyError = {
  __typename?: 'DeleteFolderPolicyError';
  errorCodes: Array<DeleteFolderPolicyErrorCode>;
};

export enum DeleteFolderPolicyErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type DeleteFolderPolicyResult = DeleteFolderPolicyError | DeleteFolderPolicySuccess;

export type DeleteFolderPolicySuccess = {
  __typename?: 'DeleteFolderPolicySuccess';
  success: Scalars['Boolean'];
};

export type DeleteHighlightError = {
  __typename?: 'DeleteHighlightError';
  errorCodes: Array<DeleteHighlightErrorCode>;
};

export enum DeleteHighlightErrorCode {
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type DeleteHighlightReplyError = {
  __typename?: 'DeleteHighlightReplyError';
  errorCodes: Array<DeleteHighlightReplyErrorCode>;
};

export enum DeleteHighlightReplyErrorCode {
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type DeleteHighlightReplyResult = DeleteHighlightReplyError | DeleteHighlightReplySuccess;

export type DeleteHighlightReplySuccess = {
  __typename?: 'DeleteHighlightReplySuccess';
  highlightReply: HighlightReply;
};

export type DeleteHighlightResult = DeleteHighlightError | DeleteHighlightSuccess;

export type DeleteHighlightSuccess = {
  __typename?: 'DeleteHighlightSuccess';
  highlight: Highlight;
};

export type DeleteIntegrationError = {
  __typename?: 'DeleteIntegrationError';
  errorCodes: Array<DeleteIntegrationErrorCode>;
};

export enum DeleteIntegrationErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type DeleteIntegrationResult = DeleteIntegrationError | DeleteIntegrationSuccess;

export type DeleteIntegrationSuccess = {
  __typename?: 'DeleteIntegrationSuccess';
  integration: Integration;
};

export type DeleteLabelError = {
  __typename?: 'DeleteLabelError';
  errorCodes: Array<DeleteLabelErrorCode>;
};

export enum DeleteLabelErrorCode {
  BadRequest = 'BAD_REQUEST',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type DeleteLabelResult = DeleteLabelError | DeleteLabelSuccess;

export type DeleteLabelSuccess = {
  __typename?: 'DeleteLabelSuccess';
  label: Label;
};

export type DeleteNewsletterEmailError = {
  __typename?: 'DeleteNewsletterEmailError';
  errorCodes: Array<DeleteNewsletterEmailErrorCode>;
};

export enum DeleteNewsletterEmailErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type DeleteNewsletterEmailResult = DeleteNewsletterEmailError | DeleteNewsletterEmailSuccess;

export type DeleteNewsletterEmailSuccess = {
  __typename?: 'DeleteNewsletterEmailSuccess';
  newsletterEmail: NewsletterEmail;
};

export type DeleteReactionError = {
  __typename?: 'DeleteReactionError';
  errorCodes: Array<DeleteReactionErrorCode>;
};

export enum DeleteReactionErrorCode {
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type DeleteReactionResult = DeleteReactionError | DeleteReactionSuccess;

export type DeleteReactionSuccess = {
  __typename?: 'DeleteReactionSuccess';
  reaction: Reaction;
};

export type DeleteReminderError = {
  __typename?: 'DeleteReminderError';
  errorCodes: Array<DeleteReminderErrorCode>;
};

export enum DeleteReminderErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type DeleteReminderResult = DeleteReminderError | DeleteReminderSuccess;

export type DeleteReminderSuccess = {
  __typename?: 'DeleteReminderSuccess';
  reminder: Reminder;
};

export type DeleteRuleError = {
  __typename?: 'DeleteRuleError';
  errorCodes: Array<DeleteRuleErrorCode>;
};

export enum DeleteRuleErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type DeleteRuleResult = DeleteRuleError | DeleteRuleSuccess;

export type DeleteRuleSuccess = {
  __typename?: 'DeleteRuleSuccess';
  rule: Rule;
};

export type DeleteWebhookError = {
  __typename?: 'DeleteWebhookError';
  errorCodes: Array<DeleteWebhookErrorCode>;
};

export enum DeleteWebhookErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type DeleteWebhookResult = DeleteWebhookError | DeleteWebhookSuccess;

export type DeleteWebhookSuccess = {
  __typename?: 'DeleteWebhookSuccess';
  webhook: Webhook;
};

export type DeviceToken = {
  __typename?: 'DeviceToken';
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  token: Scalars['String'];
};

export type DeviceTokensError = {
  __typename?: 'DeviceTokensError';
  errorCodes: Array<DeviceTokensErrorCode>;
};

export enum DeviceTokensErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type DeviceTokensResult = DeviceTokensError | DeviceTokensSuccess;

export type DeviceTokensSuccess = {
  __typename?: 'DeviceTokensSuccess';
  deviceTokens: Array<DeviceToken>;
};

export type DigestConfig = {
  __typename?: 'DigestConfig';
  channels?: Maybe<Array<Maybe<Scalars['String']>>>;
};

export type DigestConfigInput = {
  channels?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
};

export enum DirectionalityType {
  Ltr = 'LTR',
  Rtl = 'RTL'
}

export type DiscoverFeed = {
  __typename?: 'DiscoverFeed';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  link: Scalars['String'];
  title: Scalars['String'];
  type: Scalars['String'];
  visibleName?: Maybe<Scalars['String']>;
};

export type DiscoverFeedArticle = {
  __typename?: 'DiscoverFeedArticle';
  author?: Maybe<Scalars['String']>;
  description: Scalars['String'];
  feed: Scalars['String'];
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  publishedDate?: Maybe<Scalars['Date']>;
  savedId?: Maybe<Scalars['String']>;
  savedLinkUrl?: Maybe<Scalars['String']>;
  siteName?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  title: Scalars['String'];
  url: Scalars['String'];
};

export type DiscoverFeedError = {
  __typename?: 'DiscoverFeedError';
  errorCodes: Array<DiscoverFeedErrorCode>;
};

export enum DiscoverFeedErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type DiscoverFeedResult = DiscoverFeedError | DiscoverFeedSuccess;

export type DiscoverFeedSuccess = {
  __typename?: 'DiscoverFeedSuccess';
  feeds: Array<Maybe<DiscoverFeed>>;
};

export type DiscoverTopic = {
  __typename?: 'DiscoverTopic';
  description: Scalars['String'];
  name: Scalars['String'];
};

export type EditDiscoverFeedError = {
  __typename?: 'EditDiscoverFeedError';
  errorCodes: Array<EditDiscoverFeedErrorCode>;
};

export enum EditDiscoverFeedErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type EditDiscoverFeedInput = {
  feedId: Scalars['ID'];
  name: Scalars['String'];
};

export type EditDiscoverFeedResult = EditDiscoverFeedError | EditDiscoverFeedSuccess;

export type EditDiscoverFeedSuccess = {
  __typename?: 'EditDiscoverFeedSuccess';
  id: Scalars['ID'];
};

export type EmptyTrashError = {
  __typename?: 'EmptyTrashError';
  errorCodes: Array<EmptyTrashErrorCode>;
};

export enum EmptyTrashErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type EmptyTrashResult = EmptyTrashError | EmptyTrashSuccess;

export type EmptyTrashSuccess = {
  __typename?: 'EmptyTrashSuccess';
  success?: Maybe<Scalars['Boolean']>;
};

export enum ErrorCode {
  BadRequest = 'BAD_REQUEST',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type ExportToIntegrationError = {
  __typename?: 'ExportToIntegrationError';
  errorCodes: Array<ExportToIntegrationErrorCode>;
};

export enum ExportToIntegrationErrorCode {
  FailedToCreateTask = 'FAILED_TO_CREATE_TASK',
  Unauthorized = 'UNAUTHORIZED'
}

export type ExportToIntegrationResult = ExportToIntegrationError | ExportToIntegrationSuccess;

export type ExportToIntegrationSuccess = {
  __typename?: 'ExportToIntegrationSuccess';
  task: Task;
};

export type Feature = {
  __typename?: 'Feature';
  createdAt: Scalars['Date'];
  expiresAt?: Maybe<Scalars['Date']>;
  grantedAt?: Maybe<Scalars['Date']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  token: Scalars['String'];
  updatedAt?: Maybe<Scalars['Date']>;
};

export type Feed = {
  __typename?: 'Feed';
  author?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['Date']>;
  description?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  image?: Maybe<Scalars['String']>;
  publishedAt?: Maybe<Scalars['Date']>;
  title: Scalars['String'];
  type?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Date']>;
  url: Scalars['String'];
};

export type FeedArticle = {
  __typename?: 'FeedArticle';
  annotationsCount?: Maybe<Scalars['Int']>;
  article: Article;
  highlight?: Maybe<Highlight>;
  highlightsCount?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  reactions: Array<Reaction>;
  sharedAt: Scalars['Date'];
  sharedBy: User;
  sharedComment?: Maybe<Scalars['String']>;
  sharedWithHighlights?: Maybe<Scalars['Boolean']>;
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

export type FeedArticlesResult = FeedArticlesError | FeedArticlesSuccess;

export type FeedArticlesSuccess = {
  __typename?: 'FeedArticlesSuccess';
  edges: Array<FeedArticleEdge>;
  pageInfo: PageInfo;
};

export type FeedEdge = {
  __typename?: 'FeedEdge';
  cursor: Scalars['String'];
  node: Feed;
};

export type FeedsError = {
  __typename?: 'FeedsError';
  errorCodes: Array<FeedsErrorCode>;
};

export enum FeedsErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type FeedsInput = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<Scalars['String']>;
  sort?: InputMaybe<SortParams>;
};

export type FeedsResult = FeedsError | FeedsSuccess;

export type FeedsSuccess = {
  __typename?: 'FeedsSuccess';
  edges: Array<FeedEdge>;
  pageInfo: PageInfo;
};

export type FetchContentError = {
  __typename?: 'FetchContentError';
  errorCodes: Array<FetchContentErrorCode>;
};

export enum FetchContentErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type FetchContentResult = FetchContentError | FetchContentSuccess;

export type FetchContentSuccess = {
  __typename?: 'FetchContentSuccess';
  success: Scalars['Boolean'];
};

export enum FetchContentType {
  Always = 'ALWAYS',
  Never = 'NEVER',
  WhenEmpty = 'WHEN_EMPTY'
}

export type Filter = {
  __typename?: 'Filter';
  category?: Maybe<Scalars['String']>;
  createdAt: Scalars['Date'];
  defaultFilter?: Maybe<Scalars['Boolean']>;
  description?: Maybe<Scalars['String']>;
  filter: Scalars['String'];
  folder?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  position: Scalars['Int'];
  updatedAt?: Maybe<Scalars['Date']>;
  visible?: Maybe<Scalars['Boolean']>;
};

export type FiltersError = {
  __typename?: 'FiltersError';
  errorCodes: Array<FiltersErrorCode>;
};

export enum FiltersErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type FiltersResult = FiltersError | FiltersSuccess;

export type FiltersSuccess = {
  __typename?: 'FiltersSuccess';
  filters: Array<Filter>;
};

export type FolderPoliciesError = {
  __typename?: 'FolderPoliciesError';
  errorCodes: Array<FolderPoliciesErrorCode>;
};

export enum FolderPoliciesErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type FolderPoliciesResult = FolderPoliciesError | FolderPoliciesSuccess;

export type FolderPoliciesSuccess = {
  __typename?: 'FolderPoliciesSuccess';
  policies: Array<FolderPolicy>;
};

export type FolderPolicy = {
  __typename?: 'FolderPolicy';
  action: FolderPolicyAction;
  afterDays: Scalars['Int'];
  createdAt: Scalars['Date'];
  folder: Scalars['String'];
  id: Scalars['ID'];
  updatedAt: Scalars['Date'];
};

export enum FolderPolicyAction {
  Archive = 'ARCHIVE',
  Delete = 'DELETE'
}

export type GenerateApiKeyError = {
  __typename?: 'GenerateApiKeyError';
  errorCodes: Array<GenerateApiKeyErrorCode>;
};

export enum GenerateApiKeyErrorCode {
  AlreadyExists = 'ALREADY_EXISTS',
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type GenerateApiKeyInput = {
  expiresAt: Scalars['Date'];
  name: Scalars['String'];
  scopes?: InputMaybe<Array<Scalars['String']>>;
};

export type GenerateApiKeyResult = GenerateApiKeyError | GenerateApiKeySuccess;

export type GenerateApiKeySuccess = {
  __typename?: 'GenerateApiKeySuccess';
  apiKey: ApiKey;
};

export type GetDiscoverFeedArticleError = {
  __typename?: 'GetDiscoverFeedArticleError';
  errorCodes: Array<GetDiscoverFeedArticleErrorCode>;
};

export enum GetDiscoverFeedArticleErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type GetDiscoverFeedArticleResults = GetDiscoverFeedArticleError | GetDiscoverFeedArticleSuccess;

export type GetDiscoverFeedArticleSuccess = {
  __typename?: 'GetDiscoverFeedArticleSuccess';
  discoverArticles?: Maybe<Array<Maybe<DiscoverFeedArticle>>>;
  pageInfo: PageInfo;
};

export type GetDiscoverTopicError = {
  __typename?: 'GetDiscoverTopicError';
  errorCodes: Array<GetDiscoverTopicErrorCode>;
};

export enum GetDiscoverTopicErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type GetDiscoverTopicResults = GetDiscoverTopicError | GetDiscoverTopicSuccess;

export type GetDiscoverTopicSuccess = {
  __typename?: 'GetDiscoverTopicSuccess';
  discoverTopics?: Maybe<Array<DiscoverTopic>>;
};

export type GetFollowersError = {
  __typename?: 'GetFollowersError';
  errorCodes: Array<GetFollowersErrorCode>;
};

export enum GetFollowersErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type GetFollowersResult = GetFollowersError | GetFollowersSuccess;

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

export type GetFollowingResult = GetFollowingError | GetFollowingSuccess;

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

export type GetUserPersonalizationResult = GetUserPersonalizationError | GetUserPersonalizationSuccess;

export type GetUserPersonalizationSuccess = {
  __typename?: 'GetUserPersonalizationSuccess';
  userPersonalization?: Maybe<UserPersonalization>;
};

export type GoogleLoginInput = {
  email: Scalars['String'];
  secret: Scalars['String'];
};

export type GoogleSignupError = {
  __typename?: 'GoogleSignupError';
  errorCodes: Array<Maybe<SignupErrorCode>>;
};

export type GoogleSignupInput = {
  bio?: InputMaybe<Scalars['String']>;
  email: Scalars['String'];
  name: Scalars['String'];
  pictureUrl: Scalars['String'];
  secret: Scalars['String'];
  sourceUserId: Scalars['String'];
  username: Scalars['String'];
};

export type GoogleSignupResult = GoogleSignupError | GoogleSignupSuccess;

export type GoogleSignupSuccess = {
  __typename?: 'GoogleSignupSuccess';
  me: User;
};

export type GroupsError = {
  __typename?: 'GroupsError';
  errorCodes: Array<GroupsErrorCode>;
};

export enum GroupsErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type GroupsResult = GroupsError | GroupsSuccess;

export type GroupsSuccess = {
  __typename?: 'GroupsSuccess';
  groups: Array<RecommendationGroup>;
};

export type HiddenHomeSectionError = {
  __typename?: 'HiddenHomeSectionError';
  errorCodes: Array<HiddenHomeSectionErrorCode>;
};

export enum HiddenHomeSectionErrorCode {
  BadRequest = 'BAD_REQUEST',
  Pending = 'PENDING',
  Unauthorized = 'UNAUTHORIZED'
}

export type HiddenHomeSectionResult = HiddenHomeSectionError | HiddenHomeSectionSuccess;

export type HiddenHomeSectionSuccess = {
  __typename?: 'HiddenHomeSectionSuccess';
  section?: Maybe<HomeSection>;
};

export type Highlight = {
  __typename?: 'Highlight';
  annotation?: Maybe<Scalars['String']>;
  color?: Maybe<Scalars['String']>;
  createdAt: Scalars['Date'];
  createdByMe: Scalars['Boolean'];
  highlightPositionAnchorIndex?: Maybe<Scalars['Int']>;
  highlightPositionPercent?: Maybe<Scalars['Float']>;
  html?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  labels?: Maybe<Array<Label>>;
  libraryItem: Article;
  patch?: Maybe<Scalars['String']>;
  prefix?: Maybe<Scalars['String']>;
  quote?: Maybe<Scalars['String']>;
  reactions: Array<Reaction>;
  replies: Array<HighlightReply>;
  representation: RepresentationType;
  sharedAt?: Maybe<Scalars['Date']>;
  shortId: Scalars['String'];
  suffix?: Maybe<Scalars['String']>;
  type: HighlightType;
  updatedAt?: Maybe<Scalars['Date']>;
  user: User;
};

export type HighlightEdge = {
  __typename?: 'HighlightEdge';
  cursor: Scalars['String'];
  node: Highlight;
};

export type HighlightReply = {
  __typename?: 'HighlightReply';
  createdAt: Scalars['Date'];
  highlight: Highlight;
  id: Scalars['ID'];
  text: Scalars['String'];
  updatedAt?: Maybe<Scalars['Date']>;
  user: User;
};

export type HighlightStats = {
  __typename?: 'HighlightStats';
  highlightCount: Scalars['Int'];
};

export enum HighlightType {
  Highlight = 'HIGHLIGHT',
  Note = 'NOTE',
  Redaction = 'REDACTION'
}

export type HighlightsError = {
  __typename?: 'HighlightsError';
  errorCodes: Array<HighlightsErrorCode>;
};

export enum HighlightsErrorCode {
  BadRequest = 'BAD_REQUEST'
}

export type HighlightsResult = HighlightsError | HighlightsSuccess;

export type HighlightsSuccess = {
  __typename?: 'HighlightsSuccess';
  edges: Array<HighlightEdge>;
  pageInfo: PageInfo;
};

export type HomeEdge = {
  __typename?: 'HomeEdge';
  cursor: Scalars['String'];
  node: HomeSection;
};

export type HomeError = {
  __typename?: 'HomeError';
  errorCodes: Array<HomeErrorCode>;
};

export enum HomeErrorCode {
  BadRequest = 'BAD_REQUEST',
  Pending = 'PENDING',
  Unauthorized = 'UNAUTHORIZED'
}

export type HomeItem = {
  __typename?: 'HomeItem';
  author?: Maybe<Scalars['String']>;
  broadcastCount?: Maybe<Scalars['Int']>;
  canArchive?: Maybe<Scalars['Boolean']>;
  canComment?: Maybe<Scalars['Boolean']>;
  canDelete?: Maybe<Scalars['Boolean']>;
  canMove?: Maybe<Scalars['Boolean']>;
  canSave?: Maybe<Scalars['Boolean']>;
  canShare?: Maybe<Scalars['Boolean']>;
  date: Scalars['Date'];
  dir?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  likeCount?: Maybe<Scalars['Int']>;
  previewContent?: Maybe<Scalars['String']>;
  saveCount?: Maybe<Scalars['Int']>;
  score?: Maybe<Scalars['Float']>;
  seen_at?: Maybe<Scalars['Date']>;
  slug?: Maybe<Scalars['String']>;
  source?: Maybe<HomeItemSource>;
  thumbnail?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  url: Scalars['String'];
  wordCount?: Maybe<Scalars['Int']>;
};

export type HomeItemSource = {
  __typename?: 'HomeItemSource';
  icon?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  type: HomeItemSourceType;
  url?: Maybe<Scalars['String']>;
};

export enum HomeItemSourceType {
  Library = 'LIBRARY',
  Newsletter = 'NEWSLETTER',
  Recommendation = 'RECOMMENDATION',
  Rss = 'RSS'
}

export type HomeResult = HomeError | HomeSuccess;

export type HomeSection = {
  __typename?: 'HomeSection';
  items: Array<HomeItem>;
  layout?: Maybe<Scalars['String']>;
  thumbnail?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type HomeSuccess = {
  __typename?: 'HomeSuccess';
  edges: Array<HomeEdge>;
  pageInfo: PageInfo;
};

export type ImportFromIntegrationError = {
  __typename?: 'ImportFromIntegrationError';
  errorCodes: Array<ImportFromIntegrationErrorCode>;
};

export enum ImportFromIntegrationErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type ImportFromIntegrationResult = ImportFromIntegrationError | ImportFromIntegrationSuccess;

export type ImportFromIntegrationSuccess = {
  __typename?: 'ImportFromIntegrationSuccess';
  success: Scalars['Boolean'];
};

export enum ImportItemState {
  All = 'ALL',
  Archived = 'ARCHIVED',
  Unarchived = 'UNARCHIVED',
  Unread = 'UNREAD'
}

export type Integration = {
  __typename?: 'Integration';
  createdAt: Scalars['Date'];
  enabled: Scalars['Boolean'];
  id: Scalars['ID'];
  name: Scalars['String'];
  settings?: Maybe<Scalars['JSON']>;
  taskName?: Maybe<Scalars['String']>;
  token: Scalars['String'];
  type: IntegrationType;
  updatedAt?: Maybe<Scalars['Date']>;
};

export type IntegrationError = {
  __typename?: 'IntegrationError';
  errorCodes: Array<IntegrationErrorCode>;
};

export enum IntegrationErrorCode {
  NotFound = 'NOT_FOUND'
}

export type IntegrationResult = IntegrationError | IntegrationSuccess;

export type IntegrationSuccess = {
  __typename?: 'IntegrationSuccess';
  integration: Integration;
};

export enum IntegrationType {
  Export = 'EXPORT',
  Import = 'IMPORT'
}

export type IntegrationsError = {
  __typename?: 'IntegrationsError';
  errorCodes: Array<IntegrationsErrorCode>;
};

export enum IntegrationsErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type IntegrationsResult = IntegrationsError | IntegrationsSuccess;

export type IntegrationsSuccess = {
  __typename?: 'IntegrationsSuccess';
  integrations: Array<Integration>;
};

export type JoinGroupError = {
  __typename?: 'JoinGroupError';
  errorCodes: Array<JoinGroupErrorCode>;
};

export enum JoinGroupErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type JoinGroupResult = JoinGroupError | JoinGroupSuccess;

export type JoinGroupSuccess = {
  __typename?: 'JoinGroupSuccess';
  group: RecommendationGroup;
};

export type Label = {
  __typename?: 'Label';
  color: Scalars['String'];
  createdAt?: Maybe<Scalars['Date']>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  internal?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  position?: Maybe<Scalars['Int']>;
  source?: Maybe<Scalars['String']>;
};

export type LabelsError = {
  __typename?: 'LabelsError';
  errorCodes: Array<LabelsErrorCode>;
};

export enum LabelsErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type LabelsResult = LabelsError | LabelsSuccess;

export type LabelsSuccess = {
  __typename?: 'LabelsSuccess';
  labels: Array<Label>;
};

export type LeaveGroupError = {
  __typename?: 'LeaveGroupError';
  errorCodes: Array<LeaveGroupErrorCode>;
};

export enum LeaveGroupErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type LeaveGroupResult = LeaveGroupError | LeaveGroupSuccess;

export type LeaveGroupSuccess = {
  __typename?: 'LeaveGroupSuccess';
  success: Scalars['Boolean'];
};

export type Link = {
  __typename?: 'Link';
  highlightStats: HighlightStats;
  id: Scalars['ID'];
  page: Page;
  postedByViewer: Scalars['Boolean'];
  readState: ReadState;
  savedAt: Scalars['Date'];
  savedBy: User;
  savedByViewer: Scalars['Boolean'];
  shareInfo: LinkShareInfo;
  shareStats: ShareStats;
  slug: Scalars['String'];
  updatedAt?: Maybe<Scalars['Date']>;
  url: Scalars['String'];
};

export type LinkShareInfo = {
  __typename?: 'LinkShareInfo';
  description: Scalars['String'];
  imageUrl: Scalars['String'];
  title: Scalars['String'];
};

export type LogOutError = {
  __typename?: 'LogOutError';
  errorCodes: Array<LogOutErrorCode>;
};

export enum LogOutErrorCode {
  LogOutFailed = 'LOG_OUT_FAILED'
}

export type LogOutResult = LogOutError | LogOutSuccess;

export type LogOutSuccess = {
  __typename?: 'LogOutSuccess';
  message?: Maybe<Scalars['String']>;
};

export type LoginError = {
  __typename?: 'LoginError';
  errorCodes: Array<LoginErrorCode>;
};

export enum LoginErrorCode {
  AccessDenied = 'ACCESS_DENIED',
  AuthFailed = 'AUTH_FAILED',
  InvalidCredentials = 'INVALID_CREDENTIALS',
  UserAlreadyExists = 'USER_ALREADY_EXISTS',
  UserNotFound = 'USER_NOT_FOUND',
  WrongSource = 'WRONG_SOURCE'
}

export type LoginResult = LoginError | LoginSuccess;

export type LoginSuccess = {
  __typename?: 'LoginSuccess';
  me: User;
};

export type MarkEmailAsItemError = {
  __typename?: 'MarkEmailAsItemError';
  errorCodes: Array<MarkEmailAsItemErrorCode>;
};

export enum MarkEmailAsItemErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type MarkEmailAsItemResult = MarkEmailAsItemError | MarkEmailAsItemSuccess;

export type MarkEmailAsItemSuccess = {
  __typename?: 'MarkEmailAsItemSuccess';
  success: Scalars['Boolean'];
};

export type MergeHighlightError = {
  __typename?: 'MergeHighlightError';
  errorCodes: Array<MergeHighlightErrorCode>;
};

export enum MergeHighlightErrorCode {
  AlreadyExists = 'ALREADY_EXISTS',
  BadData = 'BAD_DATA',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type MergeHighlightInput = {
  annotation?: InputMaybe<Scalars['String']>;
  articleId: Scalars['ID'];
  color?: InputMaybe<Scalars['String']>;
  highlightPositionAnchorIndex?: InputMaybe<Scalars['Int']>;
  highlightPositionPercent?: InputMaybe<Scalars['Float']>;
  html?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  overlapHighlightIdList: Array<Scalars['String']>;
  patch: Scalars['String'];
  prefix?: InputMaybe<Scalars['String']>;
  quote: Scalars['String'];
  representation?: InputMaybe<RepresentationType>;
  shortId: Scalars['ID'];
  suffix?: InputMaybe<Scalars['String']>;
};

export type MergeHighlightResult = MergeHighlightError | MergeHighlightSuccess;

export type MergeHighlightSuccess = {
  __typename?: 'MergeHighlightSuccess';
  highlight: Highlight;
  overlapHighlightIdList: Array<Scalars['String']>;
};

export type MoveFilterError = {
  __typename?: 'MoveFilterError';
  errorCodes: Array<MoveFilterErrorCode>;
};

export enum MoveFilterErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type MoveFilterInput = {
  afterFilterId?: InputMaybe<Scalars['ID']>;
  filterId: Scalars['ID'];
};

export type MoveFilterResult = MoveFilterError | MoveFilterSuccess;

export type MoveFilterSuccess = {
  __typename?: 'MoveFilterSuccess';
  filter: Filter;
};

export type MoveLabelError = {
  __typename?: 'MoveLabelError';
  errorCodes: Array<MoveLabelErrorCode>;
};

export enum MoveLabelErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type MoveLabelInput = {
  afterLabelId?: InputMaybe<Scalars['ID']>;
  labelId: Scalars['ID'];
};

export type MoveLabelResult = MoveLabelError | MoveLabelSuccess;

export type MoveLabelSuccess = {
  __typename?: 'MoveLabelSuccess';
  label: Label;
};

export type MoveToFolderError = {
  __typename?: 'MoveToFolderError';
  errorCodes: Array<MoveToFolderErrorCode>;
};

export enum MoveToFolderErrorCode {
  AlreadyExists = 'ALREADY_EXISTS',
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type MoveToFolderResult = MoveToFolderError | MoveToFolderSuccess;

export type MoveToFolderSuccess = {
  __typename?: 'MoveToFolderSuccess';
  success: Scalars['Boolean'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addDiscoverFeed: AddDiscoverFeedResult;
  addPopularRead: AddPopularReadResult;
  bulkAction: BulkActionResult;
  createArticle: CreateArticleResult;
  createArticleSavingRequest: CreateArticleSavingRequestResult;
  createFolderPolicy: CreateFolderPolicyResult;
  createGroup: CreateGroupResult;
  createHighlight: CreateHighlightResult;
  createLabel: CreateLabelResult;
  createNewsletterEmail: CreateNewsletterEmailResult;
  deleteAccount: DeleteAccountResult;
  deleteDiscoverArticle: DeleteDiscoverArticleResult;
  deleteDiscoverFeed: DeleteDiscoverFeedResult;
  deleteFilter: DeleteFilterResult;
  deleteFolderPolicy: DeleteFolderPolicyResult;
  deleteHighlight: DeleteHighlightResult;
  deleteIntegration: DeleteIntegrationResult;
  deleteLabel: DeleteLabelResult;
  deleteNewsletterEmail: DeleteNewsletterEmailResult;
  deleteRule: DeleteRuleResult;
  deleteWebhook: DeleteWebhookResult;
  editDiscoverFeed: EditDiscoverFeedResult;
  emptyTrash: EmptyTrashResult;
  exportToIntegration: ExportToIntegrationResult;
  fetchContent: FetchContentResult;
  generateApiKey: GenerateApiKeyResult;
  googleLogin: LoginResult;
  googleSignup: GoogleSignupResult;
  importFromIntegration: ImportFromIntegrationResult;
  joinGroup: JoinGroupResult;
  leaveGroup: LeaveGroupResult;
  logOut: LogOutResult;
  markEmailAsItem: MarkEmailAsItemResult;
  mergeHighlight: MergeHighlightResult;
  moveFilter: MoveFilterResult;
  moveLabel: MoveLabelResult;
  moveToFolder: MoveToFolderResult;
  optInFeature: OptInFeatureResult;
  recommend: RecommendResult;
  recommendHighlights: RecommendHighlightsResult;
  refreshHome: RefreshHomeResult;
  replyToEmail: ReplyToEmailResult;
  reportItem: ReportItemResult;
  revokeApiKey: RevokeApiKeyResult;
  saveArticleReadingProgress: SaveArticleReadingProgressResult;
  saveDiscoverArticle: SaveDiscoverArticleResult;
  saveFile: SaveResult;
  saveFilter: SaveFilterResult;
  savePage: SaveResult;
  saveUrl: SaveResult;
  setBookmarkArticle: SetBookmarkArticleResult;
  setDeviceToken: SetDeviceTokenResult;
  setFavoriteArticle: SetFavoriteArticleResult;
  setIntegration: SetIntegrationResult;
  setLabels: SetLabelsResult;
  setLabelsForHighlight: SetLabelsResult;
  setLinkArchived: ArchiveLinkResult;
  setRule: SetRuleResult;
  setUserPersonalization: SetUserPersonalizationResult;
  setWebhook: SetWebhookResult;
  subscribe: SubscribeResult;
  unsubscribe: UnsubscribeResult;
  updateEmail: UpdateEmailResult;
  updateFilter: UpdateFilterResult;
  updateFolderPolicy: UpdateFolderPolicyResult;
  updateHighlight: UpdateHighlightResult;
  updateLabel: UpdateLabelResult;
  updateNewsletterEmail: UpdateNewsletterEmailResult;
  updatePage: UpdatePageResult;
  updateSubscription: UpdateSubscriptionResult;
  updateUser: UpdateUserResult;
  updateUserProfile: UpdateUserProfileResult;
  uploadFileRequest: UploadFileRequestResult;
  uploadImportFile: UploadImportFileResult;
};


export type MutationAddDiscoverFeedArgs = {
  input: AddDiscoverFeedInput;
};


export type MutationAddPopularReadArgs = {
  name: Scalars['String'];
};


export type MutationBulkActionArgs = {
  action: BulkActionType;
  arguments?: InputMaybe<Scalars['JSON']>;
  async?: InputMaybe<Scalars['Boolean']>;
  expectedCount?: InputMaybe<Scalars['Int']>;
  labelIds?: InputMaybe<Array<Scalars['ID']>>;
  query: Scalars['String'];
};


export type MutationCreateArticleArgs = {
  input: CreateArticleInput;
};


export type MutationCreateArticleSavingRequestArgs = {
  input: CreateArticleSavingRequestInput;
};


export type MutationCreateFolderPolicyArgs = {
  input: CreateFolderPolicyInput;
};


export type MutationCreateGroupArgs = {
  input: CreateGroupInput;
};


export type MutationCreateHighlightArgs = {
  input: CreateHighlightInput;
};


export type MutationCreateLabelArgs = {
  input: CreateLabelInput;
};


export type MutationCreateNewsletterEmailArgs = {
  input?: InputMaybe<CreateNewsletterEmailInput>;
};


export type MutationDeleteAccountArgs = {
  userID: Scalars['ID'];
};


export type MutationDeleteDiscoverArticleArgs = {
  input: DeleteDiscoverArticleInput;
};


export type MutationDeleteDiscoverFeedArgs = {
  input: DeleteDiscoverFeedInput;
};


export type MutationDeleteFilterArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteFolderPolicyArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteHighlightArgs = {
  highlightId: Scalars['ID'];
};


export type MutationDeleteIntegrationArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteLabelArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteNewsletterEmailArgs = {
  newsletterEmailId: Scalars['ID'];
};


export type MutationDeleteRuleArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteWebhookArgs = {
  id: Scalars['ID'];
};


export type MutationEditDiscoverFeedArgs = {
  input: EditDiscoverFeedInput;
};


export type MutationExportToIntegrationArgs = {
  integrationId: Scalars['ID'];
};


export type MutationFetchContentArgs = {
  id: Scalars['ID'];
};


export type MutationGenerateApiKeyArgs = {
  input: GenerateApiKeyInput;
};


export type MutationGoogleLoginArgs = {
  input: GoogleLoginInput;
};


export type MutationGoogleSignupArgs = {
  input: GoogleSignupInput;
};


export type MutationImportFromIntegrationArgs = {
  integrationId: Scalars['ID'];
};


export type MutationJoinGroupArgs = {
  inviteCode: Scalars['String'];
};


export type MutationLeaveGroupArgs = {
  groupId: Scalars['ID'];
};


export type MutationMarkEmailAsItemArgs = {
  recentEmailId: Scalars['ID'];
};


export type MutationMergeHighlightArgs = {
  input: MergeHighlightInput;
};


export type MutationMoveFilterArgs = {
  input: MoveFilterInput;
};


export type MutationMoveLabelArgs = {
  input: MoveLabelInput;
};


export type MutationMoveToFolderArgs = {
  folder: Scalars['String'];
  id: Scalars['ID'];
};


export type MutationOptInFeatureArgs = {
  input: OptInFeatureInput;
};


export type MutationRecommendArgs = {
  input: RecommendInput;
};


export type MutationRecommendHighlightsArgs = {
  input: RecommendHighlightsInput;
};


export type MutationReplyToEmailArgs = {
  recentEmailId: Scalars['ID'];
  reply: AllowedReply;
};


export type MutationReportItemArgs = {
  input: ReportItemInput;
};


export type MutationRevokeApiKeyArgs = {
  id: Scalars['ID'];
};


export type MutationSaveArticleReadingProgressArgs = {
  input: SaveArticleReadingProgressInput;
};


export type MutationSaveDiscoverArticleArgs = {
  input: SaveDiscoverArticleInput;
};


export type MutationSaveFileArgs = {
  input: SaveFileInput;
};


export type MutationSaveFilterArgs = {
  input: SaveFilterInput;
};


export type MutationSavePageArgs = {
  input: SavePageInput;
};


export type MutationSaveUrlArgs = {
  input: SaveUrlInput;
};


export type MutationSetBookmarkArticleArgs = {
  input: SetBookmarkArticleInput;
};


export type MutationSetDeviceTokenArgs = {
  input: SetDeviceTokenInput;
};


export type MutationSetFavoriteArticleArgs = {
  id: Scalars['ID'];
};


export type MutationSetIntegrationArgs = {
  input: SetIntegrationInput;
};


export type MutationSetLabelsArgs = {
  input: SetLabelsInput;
};


export type MutationSetLabelsForHighlightArgs = {
  input: SetLabelsForHighlightInput;
};


export type MutationSetLinkArchivedArgs = {
  input: ArchiveLinkInput;
};


export type MutationSetRuleArgs = {
  input: SetRuleInput;
};


export type MutationSetUserPersonalizationArgs = {
  input: SetUserPersonalizationInput;
};


export type MutationSetWebhookArgs = {
  input: SetWebhookInput;
};


export type MutationSubscribeArgs = {
  input: SubscribeInput;
};


export type MutationUnsubscribeArgs = {
  name: Scalars['String'];
  subscriptionId?: InputMaybe<Scalars['ID']>;
};


export type MutationUpdateEmailArgs = {
  input: UpdateEmailInput;
};


export type MutationUpdateFilterArgs = {
  input: UpdateFilterInput;
};


export type MutationUpdateFolderPolicyArgs = {
  input: UpdateFolderPolicyInput;
};


export type MutationUpdateHighlightArgs = {
  input: UpdateHighlightInput;
};


export type MutationUpdateLabelArgs = {
  input: UpdateLabelInput;
};


export type MutationUpdateNewsletterEmailArgs = {
  input: UpdateNewsletterEmailInput;
};


export type MutationUpdatePageArgs = {
  input: UpdatePageInput;
};


export type MutationUpdateSubscriptionArgs = {
  input: UpdateSubscriptionInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationUpdateUserProfileArgs = {
  input: UpdateUserProfileInput;
};


export type MutationUploadFileRequestArgs = {
  input: UploadFileRequestInput;
};


export type MutationUploadImportFileArgs = {
  contentType: Scalars['String'];
  type: UploadImportFileType;
};

export type NewsletterEmail = {
  __typename?: 'NewsletterEmail';
  address: Scalars['String'];
  confirmationCode?: Maybe<Scalars['String']>;
  createdAt: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  folder: Scalars['String'];
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  subscriptionCount: Scalars['Int'];
};

export type NewsletterEmailsError = {
  __typename?: 'NewsletterEmailsError';
  errorCodes: Array<NewsletterEmailsErrorCode>;
};

export enum NewsletterEmailsErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type NewsletterEmailsResult = NewsletterEmailsError | NewsletterEmailsSuccess;

export type NewsletterEmailsSuccess = {
  __typename?: 'NewsletterEmailsSuccess';
  newsletterEmails: Array<NewsletterEmail>;
};

export type OptInFeatureError = {
  __typename?: 'OptInFeatureError';
  errorCodes: Array<OptInFeatureErrorCode>;
};

export enum OptInFeatureErrorCode {
  BadRequest = 'BAD_REQUEST',
  Ineligible = 'INELIGIBLE',
  NotFound = 'NOT_FOUND'
}

export type OptInFeatureInput = {
  name: Scalars['String'];
};

export type OptInFeatureResult = OptInFeatureError | OptInFeatureSuccess;

export type OptInFeatureSuccess = {
  __typename?: 'OptInFeatureSuccess';
  feature: Feature;
};

export type Page = {
  __typename?: 'Page';
  author?: Maybe<Scalars['String']>;
  createdAt: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  hash: Scalars['String'];
  id: Scalars['ID'];
  image: Scalars['String'];
  originalHtml: Scalars['String'];
  originalUrl: Scalars['String'];
  publishedAt?: Maybe<Scalars['Date']>;
  readableHtml: Scalars['String'];
  title: Scalars['String'];
  type: PageType;
  updatedAt?: Maybe<Scalars['Date']>;
  url: Scalars['String'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage: Scalars['Boolean'];
  hasPreviousPage: Scalars['Boolean'];
  startCursor?: Maybe<Scalars['String']>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type PageInfoInput = {
  author?: InputMaybe<Scalars['String']>;
  canonicalUrl?: InputMaybe<Scalars['String']>;
  contentType?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  previewImage?: InputMaybe<Scalars['String']>;
  publishedAt?: InputMaybe<Scalars['Date']>;
  title?: InputMaybe<Scalars['String']>;
};

export enum PageType {
  Article = 'ARTICLE',
  Book = 'BOOK',
  File = 'FILE',
  Highlights = 'HIGHLIGHTS',
  Image = 'IMAGE',
  Profile = 'PROFILE',
  Tweet = 'TWEET',
  Unknown = 'UNKNOWN',
  Video = 'VIDEO',
  Website = 'WEBSITE'
}

export type ParseResult = {
  byline?: InputMaybe<Scalars['String']>;
  content: Scalars['String'];
  dir?: InputMaybe<Scalars['String']>;
  excerpt: Scalars['String'];
  language?: InputMaybe<Scalars['String']>;
  length: Scalars['Int'];
  previewImage?: InputMaybe<Scalars['String']>;
  publishedDate?: InputMaybe<Scalars['Date']>;
  siteIcon?: InputMaybe<Scalars['String']>;
  siteName?: InputMaybe<Scalars['String']>;
  textContent: Scalars['String'];
  title: Scalars['String'];
};

export type PreparedDocumentInput = {
  document: Scalars['String'];
  pageInfo: PageInfoInput;
};

export type Profile = {
  __typename?: 'Profile';
  bio?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  pictureUrl?: Maybe<Scalars['String']>;
  private: Scalars['Boolean'];
  username: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  apiKeys: ApiKeysResult;
  article: ArticleResult;
  articleSavingRequest: ArticleSavingRequestResult;
  deviceTokens: DeviceTokensResult;
  discoverFeeds: DiscoverFeedResult;
  discoverTopics: GetDiscoverTopicResults;
  feeds: FeedsResult;
  filters: FiltersResult;
  folderPolicies: FolderPoliciesResult;
  getDiscoverFeedArticles: GetDiscoverFeedArticleResults;
  getUserPersonalization: GetUserPersonalizationResult;
  groups: GroupsResult;
  hello?: Maybe<Scalars['String']>;
  hiddenHomeSection: HiddenHomeSectionResult;
  highlights: HighlightsResult;
  home: HomeResult;
  integration: IntegrationResult;
  integrations: IntegrationsResult;
  labels: LabelsResult;
  me?: Maybe<User>;
  newsletterEmails: NewsletterEmailsResult;
  recentEmails: RecentEmailsResult;
  recentSearches: RecentSearchesResult;
  rules: RulesResult;
  scanFeeds: ScanFeedsResult;
  search: SearchResult;
  sendInstallInstructions: SendInstallInstructionsResult;
  subscription: SubscriptionResult;
  subscriptions: SubscriptionsResult;
  typeaheadSearch: TypeaheadSearchResult;
  updatesSince: UpdatesSinceResult;
  user: UserResult;
  users: UsersResult;
  validateUsername: Scalars['Boolean'];
  webhook: WebhookResult;
  webhooks: WebhooksResult;
};


export type QueryArticleArgs = {
  format?: InputMaybe<Scalars['String']>;
  slug: Scalars['String'];
  username: Scalars['String'];
};


export type QueryArticleSavingRequestArgs = {
  id?: InputMaybe<Scalars['ID']>;
  url?: InputMaybe<Scalars['String']>;
};


export type QueryFeedsArgs = {
  input: FeedsInput;
};


export type QueryGetDiscoverFeedArticlesArgs = {
  after?: InputMaybe<Scalars['String']>;
  discoverTopicId: Scalars['String'];
  feedId?: InputMaybe<Scalars['ID']>;
  first?: InputMaybe<Scalars['Int']>;
};


export type QueryHighlightsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  query?: InputMaybe<Scalars['String']>;
};


export type QueryHomeArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
};


export type QueryIntegrationArgs = {
  name: Scalars['String'];
};


export type QueryRulesArgs = {
  enabled?: InputMaybe<Scalars['Boolean']>;
};


export type QueryScanFeedsArgs = {
  input: ScanFeedsInput;
};


export type QuerySearchArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  format?: InputMaybe<Scalars['String']>;
  includeContent?: InputMaybe<Scalars['Boolean']>;
  query?: InputMaybe<Scalars['String']>;
};


export type QuerySubscriptionArgs = {
  id: Scalars['ID'];
};


export type QuerySubscriptionsArgs = {
  sort?: InputMaybe<SortParams>;
  type?: InputMaybe<SubscriptionType>;
};


export type QueryTypeaheadSearchArgs = {
  first?: InputMaybe<Scalars['Int']>;
  query: Scalars['String'];
};


export type QueryUpdatesSinceArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  folder?: InputMaybe<Scalars['String']>;
  since: Scalars['Date'];
  sort?: InputMaybe<SortParams>;
};


export type QueryUserArgs = {
  userId?: InputMaybe<Scalars['ID']>;
  username?: InputMaybe<Scalars['String']>;
};


export type QueryValidateUsernameArgs = {
  username: Scalars['String'];
};


export type QueryWebhookArgs = {
  id: Scalars['ID'];
};

export type Reaction = {
  __typename?: 'Reaction';
  code: ReactionType;
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  updatedAt?: Maybe<Scalars['Date']>;
  user: User;
};

export enum ReactionType {
  Crying = 'CRYING',
  Heart = 'HEART',
  Hushed = 'HUSHED',
  Like = 'LIKE',
  Pout = 'POUT',
  Smile = 'SMILE'
}

export type ReadState = {
  __typename?: 'ReadState';
  progressAnchorIndex: Scalars['Int'];
  progressPercent: Scalars['Float'];
  reading?: Maybe<Scalars['Boolean']>;
  readingTime?: Maybe<Scalars['Int']>;
};

export type RecentEmail = {
  __typename?: 'RecentEmail';
  createdAt: Scalars['Date'];
  from: Scalars['String'];
  html?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  reply?: Maybe<Scalars['String']>;
  replyTo?: Maybe<Scalars['String']>;
  subject: Scalars['String'];
  text: Scalars['String'];
  to: Scalars['String'];
  type: Scalars['String'];
};

export type RecentEmailsError = {
  __typename?: 'RecentEmailsError';
  errorCodes: Array<RecentEmailsErrorCode>;
};

export enum RecentEmailsErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type RecentEmailsResult = RecentEmailsError | RecentEmailsSuccess;

export type RecentEmailsSuccess = {
  __typename?: 'RecentEmailsSuccess';
  recentEmails: Array<RecentEmail>;
};

export type RecentSearch = {
  __typename?: 'RecentSearch';
  createdAt: Scalars['Date'];
  id: Scalars['ID'];
  term: Scalars['String'];
};

export type RecentSearchesError = {
  __typename?: 'RecentSearchesError';
  errorCodes: Array<RecentSearchesErrorCode>;
};

export enum RecentSearchesErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type RecentSearchesResult = RecentSearchesError | RecentSearchesSuccess;

export type RecentSearchesSuccess = {
  __typename?: 'RecentSearchesSuccess';
  searches: Array<RecentSearch>;
};

export type RecommendError = {
  __typename?: 'RecommendError';
  errorCodes: Array<RecommendErrorCode>;
};

export enum RecommendErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type RecommendHighlightsError = {
  __typename?: 'RecommendHighlightsError';
  errorCodes: Array<RecommendHighlightsErrorCode>;
};

export enum RecommendHighlightsErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type RecommendHighlightsInput = {
  groupIds: Array<Scalars['ID']>;
  highlightIds: Array<Scalars['ID']>;
  note?: InputMaybe<Scalars['String']>;
  pageId: Scalars['ID'];
};

export type RecommendHighlightsResult = RecommendHighlightsError | RecommendHighlightsSuccess;

export type RecommendHighlightsSuccess = {
  __typename?: 'RecommendHighlightsSuccess';
  success: Scalars['Boolean'];
};

export type RecommendInput = {
  groupIds: Array<Scalars['ID']>;
  note?: InputMaybe<Scalars['String']>;
  pageId: Scalars['ID'];
  recommendedWithHighlights?: InputMaybe<Scalars['Boolean']>;
};

export type RecommendResult = RecommendError | RecommendSuccess;

export type RecommendSuccess = {
  __typename?: 'RecommendSuccess';
  success: Scalars['Boolean'];
};

export type Recommendation = {
  __typename?: 'Recommendation';
  id: Scalars['ID'];
  name: Scalars['String'];
  note?: Maybe<Scalars['String']>;
  recommendedAt: Scalars['Date'];
  user?: Maybe<RecommendingUser>;
};

export type RecommendationGroup = {
  __typename?: 'RecommendationGroup';
  admins: Array<User>;
  canPost: Scalars['Boolean'];
  canSeeMembers: Scalars['Boolean'];
  createdAt: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  inviteUrl: Scalars['String'];
  members: Array<User>;
  name: Scalars['String'];
  topics?: Maybe<Array<Scalars['String']>>;
  updatedAt?: Maybe<Scalars['Date']>;
};

export type RecommendingUser = {
  __typename?: 'RecommendingUser';
  name: Scalars['String'];
  profileImageURL?: Maybe<Scalars['String']>;
  userId: Scalars['String'];
  username: Scalars['String'];
};

export type RefreshHomeError = {
  __typename?: 'RefreshHomeError';
  errorCodes: Array<RefreshHomeErrorCode>;
};

export enum RefreshHomeErrorCode {
  Pending = 'PENDING'
}

export type RefreshHomeResult = RefreshHomeError | RefreshHomeSuccess;

export type RefreshHomeSuccess = {
  __typename?: 'RefreshHomeSuccess';
  success: Scalars['Boolean'];
};

export type Reminder = {
  __typename?: 'Reminder';
  archiveUntil: Scalars['Boolean'];
  id: Scalars['ID'];
  remindAt: Scalars['Date'];
  sendNotification: Scalars['Boolean'];
};

export type ReminderError = {
  __typename?: 'ReminderError';
  errorCodes: Array<ReminderErrorCode>;
};

export enum ReminderErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type ReminderResult = ReminderError | ReminderSuccess;

export type ReminderSuccess = {
  __typename?: 'ReminderSuccess';
  reminder: Reminder;
};

export type ReplyToEmailError = {
  __typename?: 'ReplyToEmailError';
  errorCodes: Array<ReplyToEmailErrorCode>;
};

export enum ReplyToEmailErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type ReplyToEmailResult = ReplyToEmailError | ReplyToEmailSuccess;

export type ReplyToEmailSuccess = {
  __typename?: 'ReplyToEmailSuccess';
  success: Scalars['Boolean'];
};

export type ReportItemInput = {
  itemUrl: Scalars['String'];
  pageId: Scalars['ID'];
  reportComment: Scalars['String'];
  reportTypes: Array<ReportType>;
  sharedBy?: InputMaybe<Scalars['ID']>;
};

export type ReportItemResult = {
  __typename?: 'ReportItemResult';
  message: Scalars['String'];
};

export enum ReportType {
  Abusive = 'ABUSIVE',
  ContentDisplay = 'CONTENT_DISPLAY',
  ContentViolation = 'CONTENT_VIOLATION',
  Spam = 'SPAM'
}

export enum RepresentationType {
  Content = 'CONTENT',
  FeedContent = 'FEED_CONTENT'
}

export type RevokeApiKeyError = {
  __typename?: 'RevokeApiKeyError';
  errorCodes: Array<RevokeApiKeyErrorCode>;
};

export enum RevokeApiKeyErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type RevokeApiKeyResult = RevokeApiKeyError | RevokeApiKeySuccess;

export type RevokeApiKeySuccess = {
  __typename?: 'RevokeApiKeySuccess';
  apiKey: ApiKey;
};

export type Rule = {
  __typename?: 'Rule';
  actions: Array<RuleAction>;
  createdAt: Scalars['Date'];
  enabled: Scalars['Boolean'];
  eventTypes: Array<RuleEventType>;
  failedAt?: Maybe<Scalars['Date']>;
  filter: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  updatedAt?: Maybe<Scalars['Date']>;
};

export type RuleAction = {
  __typename?: 'RuleAction';
  params: Array<Scalars['String']>;
  type: RuleActionType;
};

export type RuleActionInput = {
  params: Array<Scalars['String']>;
  type: RuleActionType;
};

export enum RuleActionType {
  AddLabel = 'ADD_LABEL',
  Archive = 'ARCHIVE',
  Delete = 'DELETE',
  Export = 'EXPORT',
  MarkAsRead = 'MARK_AS_READ',
  SendNotification = 'SEND_NOTIFICATION',
  Webhook = 'WEBHOOK'
}

export enum RuleEventType {
  HighlightCreated = 'HIGHLIGHT_CREATED',
  HighlightUpdated = 'HIGHLIGHT_UPDATED',
  LabelCreated = 'LABEL_CREATED',
  PageCreated = 'PAGE_CREATED',
  PageUpdated = 'PAGE_UPDATED'
}

export type RulesError = {
  __typename?: 'RulesError';
  errorCodes: Array<RulesErrorCode>;
};

export enum RulesErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type RulesResult = RulesError | RulesSuccess;

export type RulesSuccess = {
  __typename?: 'RulesSuccess';
  rules: Array<Rule>;
};

export type SaveArticleReadingProgressError = {
  __typename?: 'SaveArticleReadingProgressError';
  errorCodes: Array<SaveArticleReadingProgressErrorCode>;
};

export enum SaveArticleReadingProgressErrorCode {
  BadData = 'BAD_DATA',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SaveArticleReadingProgressInput = {
  force?: InputMaybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  readingProgressAnchorIndex?: InputMaybe<Scalars['Int']>;
  readingProgressPercent: Scalars['Float'];
  readingProgressTopPercent?: InputMaybe<Scalars['Float']>;
};

export type SaveArticleReadingProgressResult = SaveArticleReadingProgressError | SaveArticleReadingProgressSuccess;

export type SaveArticleReadingProgressSuccess = {
  __typename?: 'SaveArticleReadingProgressSuccess';
  updatedArticle: Article;
};

export type SaveDiscoverArticleError = {
  __typename?: 'SaveDiscoverArticleError';
  errorCodes: Array<SaveDiscoverArticleErrorCode>;
};

export enum SaveDiscoverArticleErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SaveDiscoverArticleInput = {
  discoverArticleId: Scalars['ID'];
  locale?: InputMaybe<Scalars['String']>;
  timezone?: InputMaybe<Scalars['String']>;
};

export type SaveDiscoverArticleResult = SaveDiscoverArticleError | SaveDiscoverArticleSuccess;

export type SaveDiscoverArticleSuccess = {
  __typename?: 'SaveDiscoverArticleSuccess';
  saveId: Scalars['String'];
  url: Scalars['String'];
};

export type SaveError = {
  __typename?: 'SaveError';
  errorCodes: Array<SaveErrorCode>;
  message?: Maybe<Scalars['String']>;
};

export enum SaveErrorCode {
  EmbeddedHighlightFailed = 'EMBEDDED_HIGHLIGHT_FAILED',
  Unauthorized = 'UNAUTHORIZED',
  Unknown = 'UNKNOWN'
}

export type SaveFileInput = {
  clientRequestId: Scalars['ID'];
  folder?: InputMaybe<Scalars['String']>;
  labels?: InputMaybe<Array<CreateLabelInput>>;
  publishedAt?: InputMaybe<Scalars['Date']>;
  savedAt?: InputMaybe<Scalars['Date']>;
  source: Scalars['String'];
  state?: InputMaybe<ArticleSavingRequestStatus>;
  subscription?: InputMaybe<Scalars['String']>;
  uploadFileId: Scalars['ID'];
  url: Scalars['String'];
};

export type SaveFilterError = {
  __typename?: 'SaveFilterError';
  errorCodes: Array<SaveFilterErrorCode>;
};

export enum SaveFilterErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SaveFilterInput = {
  category?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  filter: Scalars['String'];
  folder?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  position?: InputMaybe<Scalars['Int']>;
};

export type SaveFilterResult = SaveFilterError | SaveFilterSuccess;

export type SaveFilterSuccess = {
  __typename?: 'SaveFilterSuccess';
  filter: Filter;
};

export type SavePageInput = {
  clientRequestId: Scalars['ID'];
  folder?: InputMaybe<Scalars['String']>;
  labels?: InputMaybe<Array<CreateLabelInput>>;
  originalContent: Scalars['String'];
  parseResult?: InputMaybe<ParseResult>;
  publishedAt?: InputMaybe<Scalars['Date']>;
  rssFeedUrl?: InputMaybe<Scalars['String']>;
  savedAt?: InputMaybe<Scalars['Date']>;
  source: Scalars['String'];
  state?: InputMaybe<ArticleSavingRequestStatus>;
  title?: InputMaybe<Scalars['String']>;
  url: Scalars['String'];
};

export type SaveResult = SaveError | SaveSuccess;

export type SaveSuccess = {
  __typename?: 'SaveSuccess';
  clientRequestId: Scalars['ID'];
  url: Scalars['String'];
};

export type SaveUrlInput = {
  clientRequestId: Scalars['ID'];
  folder?: InputMaybe<Scalars['String']>;
  labels?: InputMaybe<Array<CreateLabelInput>>;
  locale?: InputMaybe<Scalars['String']>;
  publishedAt?: InputMaybe<Scalars['Date']>;
  savedAt?: InputMaybe<Scalars['Date']>;
  source: Scalars['String'];
  state?: InputMaybe<ArticleSavingRequestStatus>;
  timezone?: InputMaybe<Scalars['String']>;
  url: Scalars['String'];
};

export type ScanFeedsError = {
  __typename?: 'ScanFeedsError';
  errorCodes: Array<ScanFeedsErrorCode>;
};

export enum ScanFeedsErrorCode {
  BadRequest = 'BAD_REQUEST'
}

export type ScanFeedsInput = {
  opml?: InputMaybe<Scalars['String']>;
  url?: InputMaybe<Scalars['String']>;
};

export type ScanFeedsResult = ScanFeedsError | ScanFeedsSuccess;

export type ScanFeedsSuccess = {
  __typename?: 'ScanFeedsSuccess';
  feeds: Array<Feed>;
};

export type SearchError = {
  __typename?: 'SearchError';
  errorCodes: Array<SearchErrorCode>;
};

export enum SearchErrorCode {
  QueryTooLong = 'QUERY_TOO_LONG',
  Unauthorized = 'UNAUTHORIZED'
}

export type SearchItem = {
  __typename?: 'SearchItem';
  aiSummary?: Maybe<Scalars['String']>;
  annotation?: Maybe<Scalars['String']>;
  archivedAt?: Maybe<Scalars['Date']>;
  author?: Maybe<Scalars['String']>;
  color?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
  contentReader: ContentReader;
  createdAt: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  directionality?: Maybe<DirectionalityType>;
  feedContent?: Maybe<Scalars['String']>;
  folder: Scalars['String'];
  format?: Maybe<Scalars['String']>;
  highlights?: Maybe<Array<Highlight>>;
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  isArchived: Scalars['Boolean'];
  labels?: Maybe<Array<Label>>;
  language?: Maybe<Scalars['String']>;
  links?: Maybe<Scalars['JSON']>;
  originalArticleUrl?: Maybe<Scalars['String']>;
  ownedByViewer?: Maybe<Scalars['Boolean']>;
  pageId?: Maybe<Scalars['ID']>;
  pageType: PageType;
  previewContentType?: Maybe<Scalars['String']>;
  publishedAt?: Maybe<Scalars['Date']>;
  quote?: Maybe<Scalars['String']>;
  readAt?: Maybe<Scalars['Date']>;
  readingProgressAnchorIndex: Scalars['Int'];
  readingProgressPercent: Scalars['Float'];
  readingProgressTopPercent?: Maybe<Scalars['Float']>;
  recommendations?: Maybe<Array<Recommendation>>;
  savedAt: Scalars['Date'];
  score?: Maybe<Scalars['Float']>;
  seenAt?: Maybe<Scalars['Date']>;
  shortId?: Maybe<Scalars['String']>;
  siteIcon?: Maybe<Scalars['String']>;
  siteName?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  state?: Maybe<ArticleSavingRequestStatus>;
  subscription?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  unsubHttpUrl?: Maybe<Scalars['String']>;
  unsubMailTo?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Date']>;
  uploadFileId?: Maybe<Scalars['ID']>;
  url: Scalars['String'];
  wordsCount?: Maybe<Scalars['Int']>;
};

export type SearchItemEdge = {
  __typename?: 'SearchItemEdge';
  cursor: Scalars['String'];
  node: SearchItem;
};

export type SearchResult = SearchError | SearchSuccess;

export type SearchSuccess = {
  __typename?: 'SearchSuccess';
  edges: Array<SearchItemEdge>;
  pageInfo: PageInfo;
};

export type SendInstallInstructionsError = {
  __typename?: 'SendInstallInstructionsError';
  errorCodes: Array<SendInstallInstructionsErrorCode>;
};

export enum SendInstallInstructionsErrorCode {
  BadRequest = 'BAD_REQUEST',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SendInstallInstructionsResult = SendInstallInstructionsError | SendInstallInstructionsSuccess;

export type SendInstallInstructionsSuccess = {
  __typename?: 'SendInstallInstructionsSuccess';
  sent: Scalars['Boolean'];
};

export type SetBookmarkArticleError = {
  __typename?: 'SetBookmarkArticleError';
  errorCodes: Array<SetBookmarkArticleErrorCode>;
};

export enum SetBookmarkArticleErrorCode {
  BookmarkExists = 'BOOKMARK_EXISTS',
  NotFound = 'NOT_FOUND'
}

export type SetBookmarkArticleInput = {
  articleID: Scalars['ID'];
  bookmark: Scalars['Boolean'];
};

export type SetBookmarkArticleResult = SetBookmarkArticleError | SetBookmarkArticleSuccess;

export type SetBookmarkArticleSuccess = {
  __typename?: 'SetBookmarkArticleSuccess';
  bookmarkedArticle: Article;
};

export type SetDeviceTokenError = {
  __typename?: 'SetDeviceTokenError';
  errorCodes: Array<SetDeviceTokenErrorCode>;
};

export enum SetDeviceTokenErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SetDeviceTokenInput = {
  id?: InputMaybe<Scalars['ID']>;
  token?: InputMaybe<Scalars['String']>;
};

export type SetDeviceTokenResult = SetDeviceTokenError | SetDeviceTokenSuccess;

export type SetDeviceTokenSuccess = {
  __typename?: 'SetDeviceTokenSuccess';
  deviceToken: DeviceToken;
};

export type SetFavoriteArticleError = {
  __typename?: 'SetFavoriteArticleError';
  errorCodes: Array<SetFavoriteArticleErrorCode>;
};

export enum SetFavoriteArticleErrorCode {
  AlreadyExists = 'ALREADY_EXISTS',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SetFavoriteArticleResult = SetFavoriteArticleError | SetFavoriteArticleSuccess;

export type SetFavoriteArticleSuccess = {
  __typename?: 'SetFavoriteArticleSuccess';
  success: Scalars['Boolean'];
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
  follow: Scalars['Boolean'];
  userId: Scalars['ID'];
};

export type SetFollowResult = SetFollowError | SetFollowSuccess;

export type SetFollowSuccess = {
  __typename?: 'SetFollowSuccess';
  updatedUser: User;
};

export type SetIntegrationError = {
  __typename?: 'SetIntegrationError';
  errorCodes: Array<SetIntegrationErrorCode>;
};

export enum SetIntegrationErrorCode {
  AlreadyExists = 'ALREADY_EXISTS',
  BadRequest = 'BAD_REQUEST',
  InvalidToken = 'INVALID_TOKEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SetIntegrationInput = {
  enabled: Scalars['Boolean'];
  id?: InputMaybe<Scalars['ID']>;
  importItemState?: InputMaybe<ImportItemState>;
  name: Scalars['String'];
  settings?: InputMaybe<Scalars['JSON']>;
  syncedAt?: InputMaybe<Scalars['Date']>;
  taskName?: InputMaybe<Scalars['String']>;
  token: Scalars['String'];
  type?: InputMaybe<IntegrationType>;
};

export type SetIntegrationResult = SetIntegrationError | SetIntegrationSuccess;

export type SetIntegrationSuccess = {
  __typename?: 'SetIntegrationSuccess';
  integration: Integration;
};

export type SetLabelsError = {
  __typename?: 'SetLabelsError';
  errorCodes: Array<SetLabelsErrorCode>;
};

export enum SetLabelsErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SetLabelsForHighlightInput = {
  highlightId: Scalars['ID'];
  labelIds?: InputMaybe<Array<Scalars['ID']>>;
  labels?: InputMaybe<Array<CreateLabelInput>>;
};

export type SetLabelsInput = {
  labelIds?: InputMaybe<Array<Scalars['ID']>>;
  labels?: InputMaybe<Array<CreateLabelInput>>;
  pageId: Scalars['ID'];
  source?: InputMaybe<Scalars['String']>;
};

export type SetLabelsResult = SetLabelsError | SetLabelsSuccess;

export type SetLabelsSuccess = {
  __typename?: 'SetLabelsSuccess';
  labels: Array<Label>;
};

export type SetRuleError = {
  __typename?: 'SetRuleError';
  errorCodes: Array<SetRuleErrorCode>;
};

export enum SetRuleErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SetRuleInput = {
  actions: Array<RuleActionInput>;
  description?: InputMaybe<Scalars['String']>;
  enabled: Scalars['Boolean'];
  eventTypes: Array<RuleEventType>;
  filter: Scalars['String'];
  id?: InputMaybe<Scalars['ID']>;
  name: Scalars['String'];
};

export type SetRuleResult = SetRuleError | SetRuleSuccess;

export type SetRuleSuccess = {
  __typename?: 'SetRuleSuccess';
  rule: Rule;
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
  sharedComment?: InputMaybe<Scalars['String']>;
  sharedWithHighlights?: InputMaybe<Scalars['Boolean']>;
};

export type SetShareArticleResult = SetShareArticleError | SetShareArticleSuccess;

export type SetShareArticleSuccess = {
  __typename?: 'SetShareArticleSuccess';
  updatedArticle: Article;
  updatedFeedArticle?: Maybe<FeedArticle>;
  updatedFeedArticleId?: Maybe<Scalars['String']>;
};

export type SetShareHighlightError = {
  __typename?: 'SetShareHighlightError';
  errorCodes: Array<SetShareHighlightErrorCode>;
};

export enum SetShareHighlightErrorCode {
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SetShareHighlightInput = {
  id: Scalars['ID'];
  share: Scalars['Boolean'];
};

export type SetShareHighlightResult = SetShareHighlightError | SetShareHighlightSuccess;

export type SetShareHighlightSuccess = {
  __typename?: 'SetShareHighlightSuccess';
  highlight: Highlight;
};

export type SetUserPersonalizationError = {
  __typename?: 'SetUserPersonalizationError';
  errorCodes: Array<SetUserPersonalizationErrorCode>;
};

export enum SetUserPersonalizationErrorCode {
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SetUserPersonalizationInput = {
  digestConfig?: InputMaybe<DigestConfigInput>;
  fields?: InputMaybe<Scalars['JSON']>;
  fontFamily?: InputMaybe<Scalars['String']>;
  fontSize?: InputMaybe<Scalars['Int']>;
  libraryLayoutType?: InputMaybe<Scalars['String']>;
  librarySortOrder?: InputMaybe<SortOrder>;
  margin?: InputMaybe<Scalars['Int']>;
  speechRate?: InputMaybe<Scalars['String']>;
  speechSecondaryVoice?: InputMaybe<Scalars['String']>;
  speechVoice?: InputMaybe<Scalars['String']>;
  speechVolume?: InputMaybe<Scalars['String']>;
  theme?: InputMaybe<Scalars['String']>;
};

export type SetUserPersonalizationResult = SetUserPersonalizationError | SetUserPersonalizationSuccess;

export type SetUserPersonalizationSuccess = {
  __typename?: 'SetUserPersonalizationSuccess';
  updatedUserPersonalization: UserPersonalization;
};

export type SetWebhookError = {
  __typename?: 'SetWebhookError';
  errorCodes: Array<SetWebhookErrorCode>;
};

export enum SetWebhookErrorCode {
  AlreadyExists = 'ALREADY_EXISTS',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SetWebhookInput = {
  contentType?: InputMaybe<Scalars['String']>;
  enabled?: InputMaybe<Scalars['Boolean']>;
  eventTypes: Array<WebhookEvent>;
  id?: InputMaybe<Scalars['ID']>;
  method?: InputMaybe<Scalars['String']>;
  url: Scalars['String'];
};

export type SetWebhookResult = SetWebhookError | SetWebhookSuccess;

export type SetWebhookSuccess = {
  __typename?: 'SetWebhookSuccess';
  webhook: Webhook;
};

export type ShareStats = {
  __typename?: 'ShareStats';
  readDuration: Scalars['Int'];
  saveCount: Scalars['Int'];
  viewCount: Scalars['Int'];
};

export type SharedArticleError = {
  __typename?: 'SharedArticleError';
  errorCodes: Array<SharedArticleErrorCode>;
};

export enum SharedArticleErrorCode {
  NotFound = 'NOT_FOUND'
}

export type SharedArticleResult = SharedArticleError | SharedArticleSuccess;

export type SharedArticleSuccess = {
  __typename?: 'SharedArticleSuccess';
  article: Article;
};

export enum SignupErrorCode {
  AccessDenied = 'ACCESS_DENIED',
  ExpiredToken = 'EXPIRED_TOKEN',
  GoogleAuthError = 'GOOGLE_AUTH_ERROR',
  InvalidEmail = 'INVALID_EMAIL',
  InvalidPassword = 'INVALID_PASSWORD',
  InvalidUsername = 'INVALID_USERNAME',
  Unknown = 'UNKNOWN',
  UserExists = 'USER_EXISTS'
}

export enum SortBy {
  PublishedAt = 'PUBLISHED_AT',
  SavedAt = 'SAVED_AT',
  Score = 'SCORE',
  UpdatedTime = 'UPDATED_TIME'
}

export enum SortOrder {
  Ascending = 'ASCENDING',
  Descending = 'DESCENDING'
}

export type SortParams = {
  by: SortBy;
  order?: InputMaybe<SortOrder>;
};

export type SubscribeError = {
  __typename?: 'SubscribeError';
  errorCodes: Array<SubscribeErrorCode>;
};

export enum SubscribeErrorCode {
  AlreadySubscribed = 'ALREADY_SUBSCRIBED',
  BadRequest = 'BAD_REQUEST',
  ExceededMaxSubscriptions = 'EXCEEDED_MAX_SUBSCRIPTIONS',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type SubscribeInput = {
  autoAddToLibrary?: InputMaybe<Scalars['Boolean']>;
  fetchContent?: InputMaybe<Scalars['Boolean']>;
  fetchContentType?: InputMaybe<FetchContentType>;
  folder?: InputMaybe<Scalars['String']>;
  isPrivate?: InputMaybe<Scalars['Boolean']>;
  subscriptionType?: InputMaybe<SubscriptionType>;
  url: Scalars['String'];
};

export type SubscribeResult = SubscribeError | SubscribeSuccess;

export type SubscribeSuccess = {
  __typename?: 'SubscribeSuccess';
  subscriptions: Array<Subscription>;
};

export type Subscription = {
  __typename?: 'Subscription';
  autoAddToLibrary?: Maybe<Scalars['Boolean']>;
  count: Scalars['Int'];
  createdAt: Scalars['Date'];
  description?: Maybe<Scalars['String']>;
  failedAt?: Maybe<Scalars['Date']>;
  fetchContent: Scalars['Boolean'];
  fetchContentType: FetchContentType;
  folder: Scalars['String'];
  icon?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  isPrivate?: Maybe<Scalars['Boolean']>;
  lastFetchedAt?: Maybe<Scalars['Date']>;
  mostRecentItemDate?: Maybe<Scalars['Date']>;
  name: Scalars['String'];
  newsletterEmail?: Maybe<Scalars['String']>;
  refreshedAt?: Maybe<Scalars['Date']>;
  status: SubscriptionStatus;
  type: SubscriptionType;
  unsubscribeHttpUrl?: Maybe<Scalars['String']>;
  unsubscribeMailTo?: Maybe<Scalars['String']>;
  updatedAt?: Maybe<Scalars['Date']>;
  url?: Maybe<Scalars['String']>;
};

export type SubscriptionError = {
  __typename?: 'SubscriptionError';
  errorCodes: Array<ErrorCode>;
};

export type SubscriptionResult = SubscriptionError | SubscriptionSuccess;

export type SubscriptionRootType = {
  __typename?: 'SubscriptionRootType';
  hello?: Maybe<Scalars['String']>;
};

export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Deleted = 'DELETED',
  Unsubscribed = 'UNSUBSCRIBED'
}

export type SubscriptionSuccess = {
  __typename?: 'SubscriptionSuccess';
  subscription: Subscription;
};

export enum SubscriptionType {
  Newsletter = 'NEWSLETTER',
  Rss = 'RSS'
}

export type SubscriptionsError = {
  __typename?: 'SubscriptionsError';
  errorCodes: Array<SubscriptionsErrorCode>;
};

export enum SubscriptionsErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type SubscriptionsResult = SubscriptionsError | SubscriptionsSuccess;

export type SubscriptionsSuccess = {
  __typename?: 'SubscriptionsSuccess';
  subscriptions: Array<Subscription>;
};

export type SyncUpdatedItemEdge = {
  __typename?: 'SyncUpdatedItemEdge';
  cursor: Scalars['String'];
  itemID: Scalars['ID'];
  node?: Maybe<SearchItem>;
  updateReason: UpdateReason;
};

export type Task = {
  __typename?: 'Task';
  cancellable?: Maybe<Scalars['Boolean']>;
  createdAt: Scalars['Date'];
  failedReason?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  progress?: Maybe<Scalars['Float']>;
  runningTime?: Maybe<Scalars['Int']>;
  state: TaskState;
};

export enum TaskState {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Running = 'RUNNING',
  Succeeded = 'SUCCEEDED'
}

export type TypeaheadSearchError = {
  __typename?: 'TypeaheadSearchError';
  errorCodes: Array<TypeaheadSearchErrorCode>;
};

export enum TypeaheadSearchErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type TypeaheadSearchItem = {
  __typename?: 'TypeaheadSearchItem';
  contentReader: ContentReader;
  id: Scalars['ID'];
  siteName?: Maybe<Scalars['String']>;
  slug: Scalars['String'];
  title: Scalars['String'];
};

export type TypeaheadSearchResult = TypeaheadSearchError | TypeaheadSearchSuccess;

export type TypeaheadSearchSuccess = {
  __typename?: 'TypeaheadSearchSuccess';
  items: Array<TypeaheadSearchItem>;
};

export type UnsubscribeError = {
  __typename?: 'UnsubscribeError';
  errorCodes: Array<UnsubscribeErrorCode>;
};

export enum UnsubscribeErrorCode {
  AlreadyUnsubscribed = 'ALREADY_UNSUBSCRIBED',
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
  UnsubscribeMethodNotFound = 'UNSUBSCRIBE_METHOD_NOT_FOUND'
}

export type UnsubscribeResult = UnsubscribeError | UnsubscribeSuccess;

export type UnsubscribeSuccess = {
  __typename?: 'UnsubscribeSuccess';
  subscription: Subscription;
};

export type UpdateEmailError = {
  __typename?: 'UpdateEmailError';
  errorCodes: Array<UpdateEmailErrorCode>;
};

export enum UpdateEmailErrorCode {
  BadRequest = 'BAD_REQUEST',
  EmailAlreadyExists = 'EMAIL_ALREADY_EXISTS',
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdateEmailInput = {
  email: Scalars['String'];
};

export type UpdateEmailResult = UpdateEmailError | UpdateEmailSuccess;

export type UpdateEmailSuccess = {
  __typename?: 'UpdateEmailSuccess';
  email: Scalars['String'];
  verificationEmailSent?: Maybe<Scalars['Boolean']>;
};

export type UpdateFilterError = {
  __typename?: 'UpdateFilterError';
  errorCodes: Array<UpdateFilterErrorCode>;
};

export enum UpdateFilterErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdateFilterInput = {
  category?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<Scalars['String']>;
  folder?: InputMaybe<Scalars['String']>;
  id: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  position?: InputMaybe<Scalars['Int']>;
  visible?: InputMaybe<Scalars['Boolean']>;
};

export type UpdateFilterResult = UpdateFilterError | UpdateFilterSuccess;

export type UpdateFilterSuccess = {
  __typename?: 'UpdateFilterSuccess';
  filter: Filter;
};

export type UpdateFolderPolicyError = {
  __typename?: 'UpdateFolderPolicyError';
  errorCodes: Array<UpdateFolderPolicyErrorCode>;
};

export enum UpdateFolderPolicyErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdateFolderPolicyInput = {
  action?: InputMaybe<FolderPolicyAction>;
  afterDays?: InputMaybe<Scalars['Int']>;
  id: Scalars['ID'];
};

export type UpdateFolderPolicyResult = UpdateFolderPolicyError | UpdateFolderPolicySuccess;

export type UpdateFolderPolicySuccess = {
  __typename?: 'UpdateFolderPolicySuccess';
  policy: FolderPolicy;
};

export type UpdateHighlightError = {
  __typename?: 'UpdateHighlightError';
  errorCodes: Array<UpdateHighlightErrorCode>;
};

export enum UpdateHighlightErrorCode {
  BadData = 'BAD_DATA',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdateHighlightInput = {
  annotation?: InputMaybe<Scalars['String']>;
  color?: InputMaybe<Scalars['String']>;
  highlightId: Scalars['ID'];
  html?: InputMaybe<Scalars['String']>;
  quote?: InputMaybe<Scalars['String']>;
  sharedAt?: InputMaybe<Scalars['Date']>;
};

export type UpdateHighlightReplyError = {
  __typename?: 'UpdateHighlightReplyError';
  errorCodes: Array<UpdateHighlightReplyErrorCode>;
};

export enum UpdateHighlightReplyErrorCode {
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdateHighlightReplyInput = {
  highlightReplyId: Scalars['ID'];
  text: Scalars['String'];
};

export type UpdateHighlightReplyResult = UpdateHighlightReplyError | UpdateHighlightReplySuccess;

export type UpdateHighlightReplySuccess = {
  __typename?: 'UpdateHighlightReplySuccess';
  highlightReply: HighlightReply;
};

export type UpdateHighlightResult = UpdateHighlightError | UpdateHighlightSuccess;

export type UpdateHighlightSuccess = {
  __typename?: 'UpdateHighlightSuccess';
  highlight: Highlight;
};

export type UpdateLabelError = {
  __typename?: 'UpdateLabelError';
  errorCodes: Array<UpdateLabelErrorCode>;
};

export enum UpdateLabelErrorCode {
  BadRequest = 'BAD_REQUEST',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdateLabelInput = {
  color: Scalars['String'];
  description?: InputMaybe<Scalars['String']>;
  labelId: Scalars['ID'];
  name: Scalars['String'];
};

export type UpdateLabelResult = UpdateLabelError | UpdateLabelSuccess;

export type UpdateLabelSuccess = {
  __typename?: 'UpdateLabelSuccess';
  label: Label;
};

export type UpdateLinkShareInfoError = {
  __typename?: 'UpdateLinkShareInfoError';
  errorCodes: Array<UpdateLinkShareInfoErrorCode>;
};

export enum UpdateLinkShareInfoErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdateLinkShareInfoInput = {
  description: Scalars['String'];
  linkId: Scalars['ID'];
  title: Scalars['String'];
};

export type UpdateLinkShareInfoResult = UpdateLinkShareInfoError | UpdateLinkShareInfoSuccess;

export type UpdateLinkShareInfoSuccess = {
  __typename?: 'UpdateLinkShareInfoSuccess';
  message: Scalars['String'];
};

export type UpdateNewsletterEmailError = {
  __typename?: 'UpdateNewsletterEmailError';
  errorCodes: Array<UpdateNewsletterEmailErrorCode>;
};

export enum UpdateNewsletterEmailErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdateNewsletterEmailInput = {
  description?: InputMaybe<Scalars['String']>;
  folder?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
};

export type UpdateNewsletterEmailResult = UpdateNewsletterEmailError | UpdateNewsletterEmailSuccess;

export type UpdateNewsletterEmailSuccess = {
  __typename?: 'UpdateNewsletterEmailSuccess';
  newsletterEmail: NewsletterEmail;
};

export type UpdatePageError = {
  __typename?: 'UpdatePageError';
  errorCodes: Array<UpdatePageErrorCode>;
};

export enum UpdatePageErrorCode {
  BadRequest = 'BAD_REQUEST',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED',
  UpdateFailed = 'UPDATE_FAILED'
}

export type UpdatePageInput = {
  byline?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  pageId: Scalars['ID'];
  previewImage?: InputMaybe<Scalars['String']>;
  publishedAt?: InputMaybe<Scalars['Date']>;
  savedAt?: InputMaybe<Scalars['Date']>;
  state?: InputMaybe<ArticleSavingRequestStatus>;
  title?: InputMaybe<Scalars['String']>;
};

export type UpdatePageResult = UpdatePageError | UpdatePageSuccess;

export type UpdatePageSuccess = {
  __typename?: 'UpdatePageSuccess';
  updatedPage: Article;
};

export enum UpdateReason {
  Created = 'CREATED',
  Deleted = 'DELETED',
  Updated = 'UPDATED'
}

export type UpdateReminderError = {
  __typename?: 'UpdateReminderError';
  errorCodes: Array<UpdateReminderErrorCode>;
};

export enum UpdateReminderErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdateReminderInput = {
  archiveUntil: Scalars['Boolean'];
  id: Scalars['ID'];
  remindAt: Scalars['Date'];
  sendNotification: Scalars['Boolean'];
};

export type UpdateReminderResult = UpdateReminderError | UpdateReminderSuccess;

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

export type UpdateSharedCommentResult = UpdateSharedCommentError | UpdateSharedCommentSuccess;

export type UpdateSharedCommentSuccess = {
  __typename?: 'UpdateSharedCommentSuccess';
  articleID: Scalars['ID'];
  sharedComment: Scalars['String'];
};

export type UpdateSubscriptionError = {
  __typename?: 'UpdateSubscriptionError';
  errorCodes: Array<UpdateSubscriptionErrorCode>;
};

export enum UpdateSubscriptionErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdateSubscriptionInput = {
  autoAddToLibrary?: InputMaybe<Scalars['Boolean']>;
  description?: InputMaybe<Scalars['String']>;
  failedAt?: InputMaybe<Scalars['Date']>;
  fetchContent?: InputMaybe<Scalars['Boolean']>;
  fetchContentType?: InputMaybe<FetchContentType>;
  folder?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  isPrivate?: InputMaybe<Scalars['Boolean']>;
  lastFetchedChecksum?: InputMaybe<Scalars['String']>;
  mostRecentItemDate?: InputMaybe<Scalars['Date']>;
  name?: InputMaybe<Scalars['String']>;
  refreshedAt?: InputMaybe<Scalars['Date']>;
  scheduledAt?: InputMaybe<Scalars['Date']>;
  status?: InputMaybe<SubscriptionStatus>;
};

export type UpdateSubscriptionResult = UpdateSubscriptionError | UpdateSubscriptionSuccess;

export type UpdateSubscriptionSuccess = {
  __typename?: 'UpdateSubscriptionSuccess';
  subscription: Subscription;
};

export type UpdateUserError = {
  __typename?: 'UpdateUserError';
  errorCodes: Array<UpdateUserErrorCode>;
};

export enum UpdateUserErrorCode {
  BioTooLong = 'BIO_TOO_LONG',
  EmptyName = 'EMPTY_NAME',
  Unauthorized = 'UNAUTHORIZED',
  UserNotFound = 'USER_NOT_FOUND'
}

export type UpdateUserInput = {
  bio?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
};

export type UpdateUserProfileError = {
  __typename?: 'UpdateUserProfileError';
  errorCodes: Array<UpdateUserProfileErrorCode>;
};

export enum UpdateUserProfileErrorCode {
  BadData = 'BAD_DATA',
  BadUsername = 'BAD_USERNAME',
  Forbidden = 'FORBIDDEN',
  Unauthorized = 'UNAUTHORIZED',
  UsernameExists = 'USERNAME_EXISTS'
}

export type UpdateUserProfileInput = {
  bio?: InputMaybe<Scalars['String']>;
  pictureUrl?: InputMaybe<Scalars['String']>;
  userId: Scalars['ID'];
  username?: InputMaybe<Scalars['String']>;
};

export type UpdateUserProfileResult = UpdateUserProfileError | UpdateUserProfileSuccess;

export type UpdateUserProfileSuccess = {
  __typename?: 'UpdateUserProfileSuccess';
  user: User;
};

export type UpdateUserResult = UpdateUserError | UpdateUserSuccess;

export type UpdateUserSuccess = {
  __typename?: 'UpdateUserSuccess';
  user: User;
};

export type UpdatesSinceError = {
  __typename?: 'UpdatesSinceError';
  errorCodes: Array<UpdatesSinceErrorCode>;
};

export enum UpdatesSinceErrorCode {
  Unauthorized = 'UNAUTHORIZED'
}

export type UpdatesSinceResult = UpdatesSinceError | UpdatesSinceSuccess;

export type UpdatesSinceSuccess = {
  __typename?: 'UpdatesSinceSuccess';
  edges: Array<SyncUpdatedItemEdge>;
  pageInfo: PageInfo;
};

export type UploadFileRequestError = {
  __typename?: 'UploadFileRequestError';
  errorCodes: Array<UploadFileRequestErrorCode>;
};

export enum UploadFileRequestErrorCode {
  BadInput = 'BAD_INPUT',
  FailedCreate = 'FAILED_CREATE',
  Unauthorized = 'UNAUTHORIZED'
}

export type UploadFileRequestInput = {
  clientRequestId?: InputMaybe<Scalars['String']>;
  contentType: Scalars['String'];
  createPageEntry?: InputMaybe<Scalars['Boolean']>;
  url: Scalars['String'];
};

export type UploadFileRequestResult = UploadFileRequestError | UploadFileRequestSuccess;

export type UploadFileRequestSuccess = {
  __typename?: 'UploadFileRequestSuccess';
  createdPageId?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  uploadFileId?: Maybe<Scalars['ID']>;
  uploadSignedUrl?: Maybe<Scalars['String']>;
};

export enum UploadFileStatus {
  Completed = 'COMPLETED',
  Initialized = 'INITIALIZED'
}

export type UploadImportFileError = {
  __typename?: 'UploadImportFileError';
  errorCodes: Array<UploadImportFileErrorCode>;
};

export enum UploadImportFileErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED',
  UploadDailyLimitExceeded = 'UPLOAD_DAILY_LIMIT_EXCEEDED'
}

export type UploadImportFileResult = UploadImportFileError | UploadImportFileSuccess;

export type UploadImportFileSuccess = {
  __typename?: 'UploadImportFileSuccess';
  uploadSignedUrl?: Maybe<Scalars['String']>;
};

export enum UploadImportFileType {
  Matter = 'MATTER',
  Pocket = 'POCKET',
  UrlList = 'URL_LIST'
}

export type User = {
  __typename?: 'User';
  email?: Maybe<Scalars['String']>;
  featureList?: Maybe<Array<Feature>>;
  features?: Maybe<Array<Maybe<Scalars['String']>>>;
  followersCount?: Maybe<Scalars['Int']>;
  friendsCount?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  intercomHash?: Maybe<Scalars['String']>;
  /** @deprecated isFriend has been replaced with viewerIsFollowing */
  isFriend?: Maybe<Scalars['Boolean']>;
  isFullUser?: Maybe<Scalars['Boolean']>;
  name: Scalars['String'];
  picture?: Maybe<Scalars['String']>;
  profile: Profile;
  sharedArticles: Array<FeedArticle>;
  sharedArticlesCount?: Maybe<Scalars['Int']>;
  sharedHighlightsCount?: Maybe<Scalars['Int']>;
  sharedNotesCount?: Maybe<Scalars['Int']>;
  source?: Maybe<Scalars['String']>;
  viewerIsFollowing?: Maybe<Scalars['Boolean']>;
};

export type UserError = {
  __typename?: 'UserError';
  errorCodes: Array<UserErrorCode>;
};

export enum UserErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED',
  UserNotFound = 'USER_NOT_FOUND'
}

export type UserPersonalization = {
  __typename?: 'UserPersonalization';
  digestConfig?: Maybe<DigestConfig>;
  fields?: Maybe<Scalars['JSON']>;
  fontFamily?: Maybe<Scalars['String']>;
  fontSize?: Maybe<Scalars['Int']>;
  id?: Maybe<Scalars['ID']>;
  libraryLayoutType?: Maybe<Scalars['String']>;
  librarySortOrder?: Maybe<SortOrder>;
  margin?: Maybe<Scalars['Int']>;
  speechRate?: Maybe<Scalars['String']>;
  speechSecondaryVoice?: Maybe<Scalars['String']>;
  speechVoice?: Maybe<Scalars['String']>;
  speechVolume?: Maybe<Scalars['String']>;
  theme?: Maybe<Scalars['String']>;
};

export type UserResult = UserError | UserSuccess;

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

export type UsersResult = UsersError | UsersSuccess;

export type UsersSuccess = {
  __typename?: 'UsersSuccess';
  users: Array<User>;
};

export type Webhook = {
  __typename?: 'Webhook';
  contentType: Scalars['String'];
  createdAt: Scalars['Date'];
  enabled: Scalars['Boolean'];
  eventTypes: Array<WebhookEvent>;
  id: Scalars['ID'];
  method: Scalars['String'];
  updatedAt?: Maybe<Scalars['Date']>;
  url: Scalars['String'];
};

export type WebhookError = {
  __typename?: 'WebhookError';
  errorCodes: Array<WebhookErrorCode>;
};

export enum WebhookErrorCode {
  BadRequest = 'BAD_REQUEST',
  NotFound = 'NOT_FOUND',
  Unauthorized = 'UNAUTHORIZED'
}

export enum WebhookEvent {
  HighlightCreated = 'HIGHLIGHT_CREATED',
  HighlightDeleted = 'HIGHLIGHT_DELETED',
  HighlightUpdated = 'HIGHLIGHT_UPDATED',
  LabelCreated = 'LABEL_CREATED',
  LabelDeleted = 'LABEL_DELETED',
  LabelUpdated = 'LABEL_UPDATED',
  PageCreated = 'PAGE_CREATED',
  PageDeleted = 'PAGE_DELETED',
  PageUpdated = 'PAGE_UPDATED'
}

export type WebhookResult = WebhookError | WebhookSuccess;

export type WebhookSuccess = {
  __typename?: 'WebhookSuccess';
  webhook: Webhook;
};

export type WebhooksError = {
  __typename?: 'WebhooksError';
  errorCodes: Array<WebhooksErrorCode>;
};

export enum WebhooksErrorCode {
  BadRequest = 'BAD_REQUEST',
  Unauthorized = 'UNAUTHORIZED'
}

export type WebhooksResult = WebhooksError | WebhooksSuccess;

export type WebhooksSuccess = {
  __typename?: 'WebhooksSuccess';
  webhooks: Array<Webhook>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

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
  AddDiscoverFeedError: ResolverTypeWrapper<AddDiscoverFeedError>;
  AddDiscoverFeedErrorCode: AddDiscoverFeedErrorCode;
  AddDiscoverFeedInput: AddDiscoverFeedInput;
  AddDiscoverFeedResult: ResolversTypes['AddDiscoverFeedError'] | ResolversTypes['AddDiscoverFeedSuccess'];
  AddDiscoverFeedSuccess: ResolverTypeWrapper<AddDiscoverFeedSuccess>;
  AddPopularReadError: ResolverTypeWrapper<AddPopularReadError>;
  AddPopularReadErrorCode: AddPopularReadErrorCode;
  AddPopularReadResult: ResolversTypes['AddPopularReadError'] | ResolversTypes['AddPopularReadSuccess'];
  AddPopularReadSuccess: ResolverTypeWrapper<AddPopularReadSuccess>;
  AllowedReply: AllowedReply;
  ApiKey: ResolverTypeWrapper<ApiKey>;
  ApiKeysError: ResolverTypeWrapper<ApiKeysError>;
  ApiKeysErrorCode: ApiKeysErrorCode;
  ApiKeysResult: ResolversTypes['ApiKeysError'] | ResolversTypes['ApiKeysSuccess'];
  ApiKeysSuccess: ResolverTypeWrapper<ApiKeysSuccess>;
  ArchiveLinkError: ResolverTypeWrapper<ArchiveLinkError>;
  ArchiveLinkErrorCode: ArchiveLinkErrorCode;
  ArchiveLinkInput: ArchiveLinkInput;
  ArchiveLinkResult: ResolversTypes['ArchiveLinkError'] | ResolversTypes['ArchiveLinkSuccess'];
  ArchiveLinkSuccess: ResolverTypeWrapper<ArchiveLinkSuccess>;
  Article: ResolverTypeWrapper<Article>;
  ArticleEdge: ResolverTypeWrapper<ArticleEdge>;
  ArticleError: ResolverTypeWrapper<ArticleError>;
  ArticleErrorCode: ArticleErrorCode;
  ArticleHighlightsInput: ArticleHighlightsInput;
  ArticleResult: ResolversTypes['ArticleError'] | ResolversTypes['ArticleSuccess'];
  ArticleSavingRequest: ResolverTypeWrapper<ArticleSavingRequest>;
  ArticleSavingRequestError: ResolverTypeWrapper<ArticleSavingRequestError>;
  ArticleSavingRequestErrorCode: ArticleSavingRequestErrorCode;
  ArticleSavingRequestResult: ResolversTypes['ArticleSavingRequestError'] | ResolversTypes['ArticleSavingRequestSuccess'];
  ArticleSavingRequestStatus: ArticleSavingRequestStatus;
  ArticleSavingRequestSuccess: ResolverTypeWrapper<ArticleSavingRequestSuccess>;
  ArticleSuccess: ResolverTypeWrapper<ArticleSuccess>;
  ArticlesError: ResolverTypeWrapper<ArticlesError>;
  ArticlesErrorCode: ArticlesErrorCode;
  ArticlesResult: ResolversTypes['ArticlesError'] | ResolversTypes['ArticlesSuccess'];
  ArticlesSuccess: ResolverTypeWrapper<ArticlesSuccess>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  BulkActionError: ResolverTypeWrapper<BulkActionError>;
  BulkActionErrorCode: BulkActionErrorCode;
  BulkActionResult: ResolversTypes['BulkActionError'] | ResolversTypes['BulkActionSuccess'];
  BulkActionSuccess: ResolverTypeWrapper<BulkActionSuccess>;
  BulkActionType: BulkActionType;
  ContentReader: ContentReader;
  CreateArticleError: ResolverTypeWrapper<CreateArticleError>;
  CreateArticleErrorCode: CreateArticleErrorCode;
  CreateArticleInput: CreateArticleInput;
  CreateArticleResult: ResolversTypes['CreateArticleError'] | ResolversTypes['CreateArticleSuccess'];
  CreateArticleSavingRequestError: ResolverTypeWrapper<CreateArticleSavingRequestError>;
  CreateArticleSavingRequestErrorCode: CreateArticleSavingRequestErrorCode;
  CreateArticleSavingRequestInput: CreateArticleSavingRequestInput;
  CreateArticleSavingRequestResult: ResolversTypes['CreateArticleSavingRequestError'] | ResolversTypes['CreateArticleSavingRequestSuccess'];
  CreateArticleSavingRequestSuccess: ResolverTypeWrapper<CreateArticleSavingRequestSuccess>;
  CreateArticleSuccess: ResolverTypeWrapper<CreateArticleSuccess>;
  CreateFolderPolicyError: ResolverTypeWrapper<CreateFolderPolicyError>;
  CreateFolderPolicyErrorCode: CreateFolderPolicyErrorCode;
  CreateFolderPolicyInput: CreateFolderPolicyInput;
  CreateFolderPolicyResult: ResolversTypes['CreateFolderPolicyError'] | ResolversTypes['CreateFolderPolicySuccess'];
  CreateFolderPolicySuccess: ResolverTypeWrapper<CreateFolderPolicySuccess>;
  CreateGroupError: ResolverTypeWrapper<CreateGroupError>;
  CreateGroupErrorCode: CreateGroupErrorCode;
  CreateGroupInput: CreateGroupInput;
  CreateGroupResult: ResolversTypes['CreateGroupError'] | ResolversTypes['CreateGroupSuccess'];
  CreateGroupSuccess: ResolverTypeWrapper<CreateGroupSuccess>;
  CreateHighlightError: ResolverTypeWrapper<CreateHighlightError>;
  CreateHighlightErrorCode: CreateHighlightErrorCode;
  CreateHighlightInput: CreateHighlightInput;
  CreateHighlightReplyError: ResolverTypeWrapper<CreateHighlightReplyError>;
  CreateHighlightReplyErrorCode: CreateHighlightReplyErrorCode;
  CreateHighlightReplyInput: CreateHighlightReplyInput;
  CreateHighlightReplyResult: ResolversTypes['CreateHighlightReplyError'] | ResolversTypes['CreateHighlightReplySuccess'];
  CreateHighlightReplySuccess: ResolverTypeWrapper<CreateHighlightReplySuccess>;
  CreateHighlightResult: ResolversTypes['CreateHighlightError'] | ResolversTypes['CreateHighlightSuccess'];
  CreateHighlightSuccess: ResolverTypeWrapper<CreateHighlightSuccess>;
  CreateLabelError: ResolverTypeWrapper<CreateLabelError>;
  CreateLabelErrorCode: CreateLabelErrorCode;
  CreateLabelInput: CreateLabelInput;
  CreateLabelResult: ResolversTypes['CreateLabelError'] | ResolversTypes['CreateLabelSuccess'];
  CreateLabelSuccess: ResolverTypeWrapper<CreateLabelSuccess>;
  CreateNewsletterEmailError: ResolverTypeWrapper<CreateNewsletterEmailError>;
  CreateNewsletterEmailErrorCode: CreateNewsletterEmailErrorCode;
  CreateNewsletterEmailInput: CreateNewsletterEmailInput;
  CreateNewsletterEmailResult: ResolversTypes['CreateNewsletterEmailError'] | ResolversTypes['CreateNewsletterEmailSuccess'];
  CreateNewsletterEmailSuccess: ResolverTypeWrapper<CreateNewsletterEmailSuccess>;
  CreateReactionError: ResolverTypeWrapper<CreateReactionError>;
  CreateReactionErrorCode: CreateReactionErrorCode;
  CreateReactionInput: CreateReactionInput;
  CreateReactionResult: ResolversTypes['CreateReactionError'] | ResolversTypes['CreateReactionSuccess'];
  CreateReactionSuccess: ResolverTypeWrapper<CreateReactionSuccess>;
  CreateReminderError: ResolverTypeWrapper<CreateReminderError>;
  CreateReminderErrorCode: CreateReminderErrorCode;
  CreateReminderInput: CreateReminderInput;
  CreateReminderResult: ResolversTypes['CreateReminderError'] | ResolversTypes['CreateReminderSuccess'];
  CreateReminderSuccess: ResolverTypeWrapper<CreateReminderSuccess>;
  Date: ResolverTypeWrapper<Scalars['Date']>;
  DeleteAccountError: ResolverTypeWrapper<DeleteAccountError>;
  DeleteAccountErrorCode: DeleteAccountErrorCode;
  DeleteAccountResult: ResolversTypes['DeleteAccountError'] | ResolversTypes['DeleteAccountSuccess'];
  DeleteAccountSuccess: ResolverTypeWrapper<DeleteAccountSuccess>;
  DeleteDiscoverArticleError: ResolverTypeWrapper<DeleteDiscoverArticleError>;
  DeleteDiscoverArticleErrorCode: DeleteDiscoverArticleErrorCode;
  DeleteDiscoverArticleInput: DeleteDiscoverArticleInput;
  DeleteDiscoverArticleResult: ResolversTypes['DeleteDiscoverArticleError'] | ResolversTypes['DeleteDiscoverArticleSuccess'];
  DeleteDiscoverArticleSuccess: ResolverTypeWrapper<DeleteDiscoverArticleSuccess>;
  DeleteDiscoverFeedError: ResolverTypeWrapper<DeleteDiscoverFeedError>;
  DeleteDiscoverFeedErrorCode: DeleteDiscoverFeedErrorCode;
  DeleteDiscoverFeedInput: DeleteDiscoverFeedInput;
  DeleteDiscoverFeedResult: ResolversTypes['DeleteDiscoverFeedError'] | ResolversTypes['DeleteDiscoverFeedSuccess'];
  DeleteDiscoverFeedSuccess: ResolverTypeWrapper<DeleteDiscoverFeedSuccess>;
  DeleteFilterError: ResolverTypeWrapper<DeleteFilterError>;
  DeleteFilterErrorCode: DeleteFilterErrorCode;
  DeleteFilterResult: ResolversTypes['DeleteFilterError'] | ResolversTypes['DeleteFilterSuccess'];
  DeleteFilterSuccess: ResolverTypeWrapper<DeleteFilterSuccess>;
  DeleteFolderPolicyError: ResolverTypeWrapper<DeleteFolderPolicyError>;
  DeleteFolderPolicyErrorCode: DeleteFolderPolicyErrorCode;
  DeleteFolderPolicyResult: ResolversTypes['DeleteFolderPolicyError'] | ResolversTypes['DeleteFolderPolicySuccess'];
  DeleteFolderPolicySuccess: ResolverTypeWrapper<DeleteFolderPolicySuccess>;
  DeleteHighlightError: ResolverTypeWrapper<DeleteHighlightError>;
  DeleteHighlightErrorCode: DeleteHighlightErrorCode;
  DeleteHighlightReplyError: ResolverTypeWrapper<DeleteHighlightReplyError>;
  DeleteHighlightReplyErrorCode: DeleteHighlightReplyErrorCode;
  DeleteHighlightReplyResult: ResolversTypes['DeleteHighlightReplyError'] | ResolversTypes['DeleteHighlightReplySuccess'];
  DeleteHighlightReplySuccess: ResolverTypeWrapper<DeleteHighlightReplySuccess>;
  DeleteHighlightResult: ResolversTypes['DeleteHighlightError'] | ResolversTypes['DeleteHighlightSuccess'];
  DeleteHighlightSuccess: ResolverTypeWrapper<DeleteHighlightSuccess>;
  DeleteIntegrationError: ResolverTypeWrapper<DeleteIntegrationError>;
  DeleteIntegrationErrorCode: DeleteIntegrationErrorCode;
  DeleteIntegrationResult: ResolversTypes['DeleteIntegrationError'] | ResolversTypes['DeleteIntegrationSuccess'];
  DeleteIntegrationSuccess: ResolverTypeWrapper<DeleteIntegrationSuccess>;
  DeleteLabelError: ResolverTypeWrapper<DeleteLabelError>;
  DeleteLabelErrorCode: DeleteLabelErrorCode;
  DeleteLabelResult: ResolversTypes['DeleteLabelError'] | ResolversTypes['DeleteLabelSuccess'];
  DeleteLabelSuccess: ResolverTypeWrapper<DeleteLabelSuccess>;
  DeleteNewsletterEmailError: ResolverTypeWrapper<DeleteNewsletterEmailError>;
  DeleteNewsletterEmailErrorCode: DeleteNewsletterEmailErrorCode;
  DeleteNewsletterEmailResult: ResolversTypes['DeleteNewsletterEmailError'] | ResolversTypes['DeleteNewsletterEmailSuccess'];
  DeleteNewsletterEmailSuccess: ResolverTypeWrapper<DeleteNewsletterEmailSuccess>;
  DeleteReactionError: ResolverTypeWrapper<DeleteReactionError>;
  DeleteReactionErrorCode: DeleteReactionErrorCode;
  DeleteReactionResult: ResolversTypes['DeleteReactionError'] | ResolversTypes['DeleteReactionSuccess'];
  DeleteReactionSuccess: ResolverTypeWrapper<DeleteReactionSuccess>;
  DeleteReminderError: ResolverTypeWrapper<DeleteReminderError>;
  DeleteReminderErrorCode: DeleteReminderErrorCode;
  DeleteReminderResult: ResolversTypes['DeleteReminderError'] | ResolversTypes['DeleteReminderSuccess'];
  DeleteReminderSuccess: ResolverTypeWrapper<DeleteReminderSuccess>;
  DeleteRuleError: ResolverTypeWrapper<DeleteRuleError>;
  DeleteRuleErrorCode: DeleteRuleErrorCode;
  DeleteRuleResult: ResolversTypes['DeleteRuleError'] | ResolversTypes['DeleteRuleSuccess'];
  DeleteRuleSuccess: ResolverTypeWrapper<DeleteRuleSuccess>;
  DeleteWebhookError: ResolverTypeWrapper<DeleteWebhookError>;
  DeleteWebhookErrorCode: DeleteWebhookErrorCode;
  DeleteWebhookResult: ResolversTypes['DeleteWebhookError'] | ResolversTypes['DeleteWebhookSuccess'];
  DeleteWebhookSuccess: ResolverTypeWrapper<DeleteWebhookSuccess>;
  DeviceToken: ResolverTypeWrapper<DeviceToken>;
  DeviceTokensError: ResolverTypeWrapper<DeviceTokensError>;
  DeviceTokensErrorCode: DeviceTokensErrorCode;
  DeviceTokensResult: ResolversTypes['DeviceTokensError'] | ResolversTypes['DeviceTokensSuccess'];
  DeviceTokensSuccess: ResolverTypeWrapper<DeviceTokensSuccess>;
  DigestConfig: ResolverTypeWrapper<DigestConfig>;
  DigestConfigInput: DigestConfigInput;
  DirectionalityType: DirectionalityType;
  DiscoverFeed: ResolverTypeWrapper<DiscoverFeed>;
  DiscoverFeedArticle: ResolverTypeWrapper<DiscoverFeedArticle>;
  DiscoverFeedError: ResolverTypeWrapper<DiscoverFeedError>;
  DiscoverFeedErrorCode: DiscoverFeedErrorCode;
  DiscoverFeedResult: ResolversTypes['DiscoverFeedError'] | ResolversTypes['DiscoverFeedSuccess'];
  DiscoverFeedSuccess: ResolverTypeWrapper<DiscoverFeedSuccess>;
  DiscoverTopic: ResolverTypeWrapper<DiscoverTopic>;
  EditDiscoverFeedError: ResolverTypeWrapper<EditDiscoverFeedError>;
  EditDiscoverFeedErrorCode: EditDiscoverFeedErrorCode;
  EditDiscoverFeedInput: EditDiscoverFeedInput;
  EditDiscoverFeedResult: ResolversTypes['EditDiscoverFeedError'] | ResolversTypes['EditDiscoverFeedSuccess'];
  EditDiscoverFeedSuccess: ResolverTypeWrapper<EditDiscoverFeedSuccess>;
  EmptyTrashError: ResolverTypeWrapper<EmptyTrashError>;
  EmptyTrashErrorCode: EmptyTrashErrorCode;
  EmptyTrashResult: ResolversTypes['EmptyTrashError'] | ResolversTypes['EmptyTrashSuccess'];
  EmptyTrashSuccess: ResolverTypeWrapper<EmptyTrashSuccess>;
  ErrorCode: ErrorCode;
  ExportToIntegrationError: ResolverTypeWrapper<ExportToIntegrationError>;
  ExportToIntegrationErrorCode: ExportToIntegrationErrorCode;
  ExportToIntegrationResult: ResolversTypes['ExportToIntegrationError'] | ResolversTypes['ExportToIntegrationSuccess'];
  ExportToIntegrationSuccess: ResolverTypeWrapper<ExportToIntegrationSuccess>;
  Feature: ResolverTypeWrapper<Feature>;
  Feed: ResolverTypeWrapper<Feed>;
  FeedArticle: ResolverTypeWrapper<FeedArticle>;
  FeedArticleEdge: ResolverTypeWrapper<FeedArticleEdge>;
  FeedArticlesError: ResolverTypeWrapper<FeedArticlesError>;
  FeedArticlesErrorCode: FeedArticlesErrorCode;
  FeedArticlesResult: ResolversTypes['FeedArticlesError'] | ResolversTypes['FeedArticlesSuccess'];
  FeedArticlesSuccess: ResolverTypeWrapper<FeedArticlesSuccess>;
  FeedEdge: ResolverTypeWrapper<FeedEdge>;
  FeedsError: ResolverTypeWrapper<FeedsError>;
  FeedsErrorCode: FeedsErrorCode;
  FeedsInput: FeedsInput;
  FeedsResult: ResolversTypes['FeedsError'] | ResolversTypes['FeedsSuccess'];
  FeedsSuccess: ResolverTypeWrapper<FeedsSuccess>;
  FetchContentError: ResolverTypeWrapper<FetchContentError>;
  FetchContentErrorCode: FetchContentErrorCode;
  FetchContentResult: ResolversTypes['FetchContentError'] | ResolversTypes['FetchContentSuccess'];
  FetchContentSuccess: ResolverTypeWrapper<FetchContentSuccess>;
  FetchContentType: FetchContentType;
  Filter: ResolverTypeWrapper<Filter>;
  FiltersError: ResolverTypeWrapper<FiltersError>;
  FiltersErrorCode: FiltersErrorCode;
  FiltersResult: ResolversTypes['FiltersError'] | ResolversTypes['FiltersSuccess'];
  FiltersSuccess: ResolverTypeWrapper<FiltersSuccess>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  FolderPoliciesError: ResolverTypeWrapper<FolderPoliciesError>;
  FolderPoliciesErrorCode: FolderPoliciesErrorCode;
  FolderPoliciesResult: ResolversTypes['FolderPoliciesError'] | ResolversTypes['FolderPoliciesSuccess'];
  FolderPoliciesSuccess: ResolverTypeWrapper<FolderPoliciesSuccess>;
  FolderPolicy: ResolverTypeWrapper<FolderPolicy>;
  FolderPolicyAction: FolderPolicyAction;
  GenerateApiKeyError: ResolverTypeWrapper<GenerateApiKeyError>;
  GenerateApiKeyErrorCode: GenerateApiKeyErrorCode;
  GenerateApiKeyInput: GenerateApiKeyInput;
  GenerateApiKeyResult: ResolversTypes['GenerateApiKeyError'] | ResolversTypes['GenerateApiKeySuccess'];
  GenerateApiKeySuccess: ResolverTypeWrapper<GenerateApiKeySuccess>;
  GetDiscoverFeedArticleError: ResolverTypeWrapper<GetDiscoverFeedArticleError>;
  GetDiscoverFeedArticleErrorCode: GetDiscoverFeedArticleErrorCode;
  GetDiscoverFeedArticleResults: ResolversTypes['GetDiscoverFeedArticleError'] | ResolversTypes['GetDiscoverFeedArticleSuccess'];
  GetDiscoverFeedArticleSuccess: ResolverTypeWrapper<GetDiscoverFeedArticleSuccess>;
  GetDiscoverTopicError: ResolverTypeWrapper<GetDiscoverTopicError>;
  GetDiscoverTopicErrorCode: GetDiscoverTopicErrorCode;
  GetDiscoverTopicResults: ResolversTypes['GetDiscoverTopicError'] | ResolversTypes['GetDiscoverTopicSuccess'];
  GetDiscoverTopicSuccess: ResolverTypeWrapper<GetDiscoverTopicSuccess>;
  GetFollowersError: ResolverTypeWrapper<GetFollowersError>;
  GetFollowersErrorCode: GetFollowersErrorCode;
  GetFollowersResult: ResolversTypes['GetFollowersError'] | ResolversTypes['GetFollowersSuccess'];
  GetFollowersSuccess: ResolverTypeWrapper<GetFollowersSuccess>;
  GetFollowingError: ResolverTypeWrapper<GetFollowingError>;
  GetFollowingErrorCode: GetFollowingErrorCode;
  GetFollowingResult: ResolversTypes['GetFollowingError'] | ResolversTypes['GetFollowingSuccess'];
  GetFollowingSuccess: ResolverTypeWrapper<GetFollowingSuccess>;
  GetUserPersonalizationError: ResolverTypeWrapper<GetUserPersonalizationError>;
  GetUserPersonalizationErrorCode: GetUserPersonalizationErrorCode;
  GetUserPersonalizationResult: ResolversTypes['GetUserPersonalizationError'] | ResolversTypes['GetUserPersonalizationSuccess'];
  GetUserPersonalizationSuccess: ResolverTypeWrapper<GetUserPersonalizationSuccess>;
  GoogleLoginInput: GoogleLoginInput;
  GoogleSignupError: ResolverTypeWrapper<GoogleSignupError>;
  GoogleSignupInput: GoogleSignupInput;
  GoogleSignupResult: ResolversTypes['GoogleSignupError'] | ResolversTypes['GoogleSignupSuccess'];
  GoogleSignupSuccess: ResolverTypeWrapper<GoogleSignupSuccess>;
  GroupsError: ResolverTypeWrapper<GroupsError>;
  GroupsErrorCode: GroupsErrorCode;
  GroupsResult: ResolversTypes['GroupsError'] | ResolversTypes['GroupsSuccess'];
  GroupsSuccess: ResolverTypeWrapper<GroupsSuccess>;
  HiddenHomeSectionError: ResolverTypeWrapper<HiddenHomeSectionError>;
  HiddenHomeSectionErrorCode: HiddenHomeSectionErrorCode;
  HiddenHomeSectionResult: ResolversTypes['HiddenHomeSectionError'] | ResolversTypes['HiddenHomeSectionSuccess'];
  HiddenHomeSectionSuccess: ResolverTypeWrapper<HiddenHomeSectionSuccess>;
  Highlight: ResolverTypeWrapper<Highlight>;
  HighlightEdge: ResolverTypeWrapper<HighlightEdge>;
  HighlightReply: ResolverTypeWrapper<HighlightReply>;
  HighlightStats: ResolverTypeWrapper<HighlightStats>;
  HighlightType: HighlightType;
  HighlightsError: ResolverTypeWrapper<HighlightsError>;
  HighlightsErrorCode: HighlightsErrorCode;
  HighlightsResult: ResolversTypes['HighlightsError'] | ResolversTypes['HighlightsSuccess'];
  HighlightsSuccess: ResolverTypeWrapper<HighlightsSuccess>;
  HomeEdge: ResolverTypeWrapper<HomeEdge>;
  HomeError: ResolverTypeWrapper<HomeError>;
  HomeErrorCode: HomeErrorCode;
  HomeItem: ResolverTypeWrapper<HomeItem>;
  HomeItemSource: ResolverTypeWrapper<HomeItemSource>;
  HomeItemSourceType: HomeItemSourceType;
  HomeResult: ResolversTypes['HomeError'] | ResolversTypes['HomeSuccess'];
  HomeSection: ResolverTypeWrapper<HomeSection>;
  HomeSuccess: ResolverTypeWrapper<HomeSuccess>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  ImportFromIntegrationError: ResolverTypeWrapper<ImportFromIntegrationError>;
  ImportFromIntegrationErrorCode: ImportFromIntegrationErrorCode;
  ImportFromIntegrationResult: ResolversTypes['ImportFromIntegrationError'] | ResolversTypes['ImportFromIntegrationSuccess'];
  ImportFromIntegrationSuccess: ResolverTypeWrapper<ImportFromIntegrationSuccess>;
  ImportItemState: ImportItemState;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Integration: ResolverTypeWrapper<Integration>;
  IntegrationError: ResolverTypeWrapper<IntegrationError>;
  IntegrationErrorCode: IntegrationErrorCode;
  IntegrationResult: ResolversTypes['IntegrationError'] | ResolversTypes['IntegrationSuccess'];
  IntegrationSuccess: ResolverTypeWrapper<IntegrationSuccess>;
  IntegrationType: IntegrationType;
  IntegrationsError: ResolverTypeWrapper<IntegrationsError>;
  IntegrationsErrorCode: IntegrationsErrorCode;
  IntegrationsResult: ResolversTypes['IntegrationsError'] | ResolversTypes['IntegrationsSuccess'];
  IntegrationsSuccess: ResolverTypeWrapper<IntegrationsSuccess>;
  JSON: ResolverTypeWrapper<Scalars['JSON']>;
  JoinGroupError: ResolverTypeWrapper<JoinGroupError>;
  JoinGroupErrorCode: JoinGroupErrorCode;
  JoinGroupResult: ResolversTypes['JoinGroupError'] | ResolversTypes['JoinGroupSuccess'];
  JoinGroupSuccess: ResolverTypeWrapper<JoinGroupSuccess>;
  Label: ResolverTypeWrapper<Label>;
  LabelsError: ResolverTypeWrapper<LabelsError>;
  LabelsErrorCode: LabelsErrorCode;
  LabelsResult: ResolversTypes['LabelsError'] | ResolversTypes['LabelsSuccess'];
  LabelsSuccess: ResolverTypeWrapper<LabelsSuccess>;
  LeaveGroupError: ResolverTypeWrapper<LeaveGroupError>;
  LeaveGroupErrorCode: LeaveGroupErrorCode;
  LeaveGroupResult: ResolversTypes['LeaveGroupError'] | ResolversTypes['LeaveGroupSuccess'];
  LeaveGroupSuccess: ResolverTypeWrapper<LeaveGroupSuccess>;
  Link: ResolverTypeWrapper<Link>;
  LinkShareInfo: ResolverTypeWrapper<LinkShareInfo>;
  LogOutError: ResolverTypeWrapper<LogOutError>;
  LogOutErrorCode: LogOutErrorCode;
  LogOutResult: ResolversTypes['LogOutError'] | ResolversTypes['LogOutSuccess'];
  LogOutSuccess: ResolverTypeWrapper<LogOutSuccess>;
  LoginError: ResolverTypeWrapper<LoginError>;
  LoginErrorCode: LoginErrorCode;
  LoginResult: ResolversTypes['LoginError'] | ResolversTypes['LoginSuccess'];
  LoginSuccess: ResolverTypeWrapper<LoginSuccess>;
  MarkEmailAsItemError: ResolverTypeWrapper<MarkEmailAsItemError>;
  MarkEmailAsItemErrorCode: MarkEmailAsItemErrorCode;
  MarkEmailAsItemResult: ResolversTypes['MarkEmailAsItemError'] | ResolversTypes['MarkEmailAsItemSuccess'];
  MarkEmailAsItemSuccess: ResolverTypeWrapper<MarkEmailAsItemSuccess>;
  MergeHighlightError: ResolverTypeWrapper<MergeHighlightError>;
  MergeHighlightErrorCode: MergeHighlightErrorCode;
  MergeHighlightInput: MergeHighlightInput;
  MergeHighlightResult: ResolversTypes['MergeHighlightError'] | ResolversTypes['MergeHighlightSuccess'];
  MergeHighlightSuccess: ResolverTypeWrapper<MergeHighlightSuccess>;
  MoveFilterError: ResolverTypeWrapper<MoveFilterError>;
  MoveFilterErrorCode: MoveFilterErrorCode;
  MoveFilterInput: MoveFilterInput;
  MoveFilterResult: ResolversTypes['MoveFilterError'] | ResolversTypes['MoveFilterSuccess'];
  MoveFilterSuccess: ResolverTypeWrapper<MoveFilterSuccess>;
  MoveLabelError: ResolverTypeWrapper<MoveLabelError>;
  MoveLabelErrorCode: MoveLabelErrorCode;
  MoveLabelInput: MoveLabelInput;
  MoveLabelResult: ResolversTypes['MoveLabelError'] | ResolversTypes['MoveLabelSuccess'];
  MoveLabelSuccess: ResolverTypeWrapper<MoveLabelSuccess>;
  MoveToFolderError: ResolverTypeWrapper<MoveToFolderError>;
  MoveToFolderErrorCode: MoveToFolderErrorCode;
  MoveToFolderResult: ResolversTypes['MoveToFolderError'] | ResolversTypes['MoveToFolderSuccess'];
  MoveToFolderSuccess: ResolverTypeWrapper<MoveToFolderSuccess>;
  Mutation: ResolverTypeWrapper<{}>;
  NewsletterEmail: ResolverTypeWrapper<NewsletterEmail>;
  NewsletterEmailsError: ResolverTypeWrapper<NewsletterEmailsError>;
  NewsletterEmailsErrorCode: NewsletterEmailsErrorCode;
  NewsletterEmailsResult: ResolversTypes['NewsletterEmailsError'] | ResolversTypes['NewsletterEmailsSuccess'];
  NewsletterEmailsSuccess: ResolverTypeWrapper<NewsletterEmailsSuccess>;
  OptInFeatureError: ResolverTypeWrapper<OptInFeatureError>;
  OptInFeatureErrorCode: OptInFeatureErrorCode;
  OptInFeatureInput: OptInFeatureInput;
  OptInFeatureResult: ResolversTypes['OptInFeatureError'] | ResolversTypes['OptInFeatureSuccess'];
  OptInFeatureSuccess: ResolverTypeWrapper<OptInFeatureSuccess>;
  Page: ResolverTypeWrapper<Page>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  PageInfoInput: PageInfoInput;
  PageType: PageType;
  ParseResult: ParseResult;
  PreparedDocumentInput: PreparedDocumentInput;
  Profile: ResolverTypeWrapper<Profile>;
  Query: ResolverTypeWrapper<{}>;
  Reaction: ResolverTypeWrapper<Reaction>;
  ReactionType: ReactionType;
  ReadState: ResolverTypeWrapper<ReadState>;
  RecentEmail: ResolverTypeWrapper<RecentEmail>;
  RecentEmailsError: ResolverTypeWrapper<RecentEmailsError>;
  RecentEmailsErrorCode: RecentEmailsErrorCode;
  RecentEmailsResult: ResolversTypes['RecentEmailsError'] | ResolversTypes['RecentEmailsSuccess'];
  RecentEmailsSuccess: ResolverTypeWrapper<RecentEmailsSuccess>;
  RecentSearch: ResolverTypeWrapper<RecentSearch>;
  RecentSearchesError: ResolverTypeWrapper<RecentSearchesError>;
  RecentSearchesErrorCode: RecentSearchesErrorCode;
  RecentSearchesResult: ResolversTypes['RecentSearchesError'] | ResolversTypes['RecentSearchesSuccess'];
  RecentSearchesSuccess: ResolverTypeWrapper<RecentSearchesSuccess>;
  RecommendError: ResolverTypeWrapper<RecommendError>;
  RecommendErrorCode: RecommendErrorCode;
  RecommendHighlightsError: ResolverTypeWrapper<RecommendHighlightsError>;
  RecommendHighlightsErrorCode: RecommendHighlightsErrorCode;
  RecommendHighlightsInput: RecommendHighlightsInput;
  RecommendHighlightsResult: ResolversTypes['RecommendHighlightsError'] | ResolversTypes['RecommendHighlightsSuccess'];
  RecommendHighlightsSuccess: ResolverTypeWrapper<RecommendHighlightsSuccess>;
  RecommendInput: RecommendInput;
  RecommendResult: ResolversTypes['RecommendError'] | ResolversTypes['RecommendSuccess'];
  RecommendSuccess: ResolverTypeWrapper<RecommendSuccess>;
  Recommendation: ResolverTypeWrapper<Recommendation>;
  RecommendationGroup: ResolverTypeWrapper<RecommendationGroup>;
  RecommendingUser: ResolverTypeWrapper<RecommendingUser>;
  RefreshHomeError: ResolverTypeWrapper<RefreshHomeError>;
  RefreshHomeErrorCode: RefreshHomeErrorCode;
  RefreshHomeResult: ResolversTypes['RefreshHomeError'] | ResolversTypes['RefreshHomeSuccess'];
  RefreshHomeSuccess: ResolverTypeWrapper<RefreshHomeSuccess>;
  Reminder: ResolverTypeWrapper<Reminder>;
  ReminderError: ResolverTypeWrapper<ReminderError>;
  ReminderErrorCode: ReminderErrorCode;
  ReminderResult: ResolversTypes['ReminderError'] | ResolversTypes['ReminderSuccess'];
  ReminderSuccess: ResolverTypeWrapper<ReminderSuccess>;
  ReplyToEmailError: ResolverTypeWrapper<ReplyToEmailError>;
  ReplyToEmailErrorCode: ReplyToEmailErrorCode;
  ReplyToEmailResult: ResolversTypes['ReplyToEmailError'] | ResolversTypes['ReplyToEmailSuccess'];
  ReplyToEmailSuccess: ResolverTypeWrapper<ReplyToEmailSuccess>;
  ReportItemInput: ReportItemInput;
  ReportItemResult: ResolverTypeWrapper<ReportItemResult>;
  ReportType: ReportType;
  RepresentationType: RepresentationType;
  RevokeApiKeyError: ResolverTypeWrapper<RevokeApiKeyError>;
  RevokeApiKeyErrorCode: RevokeApiKeyErrorCode;
  RevokeApiKeyResult: ResolversTypes['RevokeApiKeyError'] | ResolversTypes['RevokeApiKeySuccess'];
  RevokeApiKeySuccess: ResolverTypeWrapper<RevokeApiKeySuccess>;
  Rule: ResolverTypeWrapper<Rule>;
  RuleAction: ResolverTypeWrapper<RuleAction>;
  RuleActionInput: RuleActionInput;
  RuleActionType: RuleActionType;
  RuleEventType: RuleEventType;
  RulesError: ResolverTypeWrapper<RulesError>;
  RulesErrorCode: RulesErrorCode;
  RulesResult: ResolversTypes['RulesError'] | ResolversTypes['RulesSuccess'];
  RulesSuccess: ResolverTypeWrapper<RulesSuccess>;
  SaveArticleReadingProgressError: ResolverTypeWrapper<SaveArticleReadingProgressError>;
  SaveArticleReadingProgressErrorCode: SaveArticleReadingProgressErrorCode;
  SaveArticleReadingProgressInput: SaveArticleReadingProgressInput;
  SaveArticleReadingProgressResult: ResolversTypes['SaveArticleReadingProgressError'] | ResolversTypes['SaveArticleReadingProgressSuccess'];
  SaveArticleReadingProgressSuccess: ResolverTypeWrapper<SaveArticleReadingProgressSuccess>;
  SaveDiscoverArticleError: ResolverTypeWrapper<SaveDiscoverArticleError>;
  SaveDiscoverArticleErrorCode: SaveDiscoverArticleErrorCode;
  SaveDiscoverArticleInput: SaveDiscoverArticleInput;
  SaveDiscoverArticleResult: ResolversTypes['SaveDiscoverArticleError'] | ResolversTypes['SaveDiscoverArticleSuccess'];
  SaveDiscoverArticleSuccess: ResolverTypeWrapper<SaveDiscoverArticleSuccess>;
  SaveError: ResolverTypeWrapper<SaveError>;
  SaveErrorCode: SaveErrorCode;
  SaveFileInput: SaveFileInput;
  SaveFilterError: ResolverTypeWrapper<SaveFilterError>;
  SaveFilterErrorCode: SaveFilterErrorCode;
  SaveFilterInput: SaveFilterInput;
  SaveFilterResult: ResolversTypes['SaveFilterError'] | ResolversTypes['SaveFilterSuccess'];
  SaveFilterSuccess: ResolverTypeWrapper<SaveFilterSuccess>;
  SavePageInput: SavePageInput;
  SaveResult: ResolversTypes['SaveError'] | ResolversTypes['SaveSuccess'];
  SaveSuccess: ResolverTypeWrapper<SaveSuccess>;
  SaveUrlInput: SaveUrlInput;
  ScanFeedsError: ResolverTypeWrapper<ScanFeedsError>;
  ScanFeedsErrorCode: ScanFeedsErrorCode;
  ScanFeedsInput: ScanFeedsInput;
  ScanFeedsResult: ResolversTypes['ScanFeedsError'] | ResolversTypes['ScanFeedsSuccess'];
  ScanFeedsSuccess: ResolverTypeWrapper<ScanFeedsSuccess>;
  SearchError: ResolverTypeWrapper<SearchError>;
  SearchErrorCode: SearchErrorCode;
  SearchItem: ResolverTypeWrapper<SearchItem>;
  SearchItemEdge: ResolverTypeWrapper<SearchItemEdge>;
  SearchResult: ResolversTypes['SearchError'] | ResolversTypes['SearchSuccess'];
  SearchSuccess: ResolverTypeWrapper<SearchSuccess>;
  SendInstallInstructionsError: ResolverTypeWrapper<SendInstallInstructionsError>;
  SendInstallInstructionsErrorCode: SendInstallInstructionsErrorCode;
  SendInstallInstructionsResult: ResolversTypes['SendInstallInstructionsError'] | ResolversTypes['SendInstallInstructionsSuccess'];
  SendInstallInstructionsSuccess: ResolverTypeWrapper<SendInstallInstructionsSuccess>;
  SetBookmarkArticleError: ResolverTypeWrapper<SetBookmarkArticleError>;
  SetBookmarkArticleErrorCode: SetBookmarkArticleErrorCode;
  SetBookmarkArticleInput: SetBookmarkArticleInput;
  SetBookmarkArticleResult: ResolversTypes['SetBookmarkArticleError'] | ResolversTypes['SetBookmarkArticleSuccess'];
  SetBookmarkArticleSuccess: ResolverTypeWrapper<SetBookmarkArticleSuccess>;
  SetDeviceTokenError: ResolverTypeWrapper<SetDeviceTokenError>;
  SetDeviceTokenErrorCode: SetDeviceTokenErrorCode;
  SetDeviceTokenInput: SetDeviceTokenInput;
  SetDeviceTokenResult: ResolversTypes['SetDeviceTokenError'] | ResolversTypes['SetDeviceTokenSuccess'];
  SetDeviceTokenSuccess: ResolverTypeWrapper<SetDeviceTokenSuccess>;
  SetFavoriteArticleError: ResolverTypeWrapper<SetFavoriteArticleError>;
  SetFavoriteArticleErrorCode: SetFavoriteArticleErrorCode;
  SetFavoriteArticleResult: ResolversTypes['SetFavoriteArticleError'] | ResolversTypes['SetFavoriteArticleSuccess'];
  SetFavoriteArticleSuccess: ResolverTypeWrapper<SetFavoriteArticleSuccess>;
  SetFollowError: ResolverTypeWrapper<SetFollowError>;
  SetFollowErrorCode: SetFollowErrorCode;
  SetFollowInput: SetFollowInput;
  SetFollowResult: ResolversTypes['SetFollowError'] | ResolversTypes['SetFollowSuccess'];
  SetFollowSuccess: ResolverTypeWrapper<SetFollowSuccess>;
  SetIntegrationError: ResolverTypeWrapper<SetIntegrationError>;
  SetIntegrationErrorCode: SetIntegrationErrorCode;
  SetIntegrationInput: SetIntegrationInput;
  SetIntegrationResult: ResolversTypes['SetIntegrationError'] | ResolversTypes['SetIntegrationSuccess'];
  SetIntegrationSuccess: ResolverTypeWrapper<SetIntegrationSuccess>;
  SetLabelsError: ResolverTypeWrapper<SetLabelsError>;
  SetLabelsErrorCode: SetLabelsErrorCode;
  SetLabelsForHighlightInput: SetLabelsForHighlightInput;
  SetLabelsInput: SetLabelsInput;
  SetLabelsResult: ResolversTypes['SetLabelsError'] | ResolversTypes['SetLabelsSuccess'];
  SetLabelsSuccess: ResolverTypeWrapper<SetLabelsSuccess>;
  SetRuleError: ResolverTypeWrapper<SetRuleError>;
  SetRuleErrorCode: SetRuleErrorCode;
  SetRuleInput: SetRuleInput;
  SetRuleResult: ResolversTypes['SetRuleError'] | ResolversTypes['SetRuleSuccess'];
  SetRuleSuccess: ResolverTypeWrapper<SetRuleSuccess>;
  SetShareArticleError: ResolverTypeWrapper<SetShareArticleError>;
  SetShareArticleErrorCode: SetShareArticleErrorCode;
  SetShareArticleInput: SetShareArticleInput;
  SetShareArticleResult: ResolversTypes['SetShareArticleError'] | ResolversTypes['SetShareArticleSuccess'];
  SetShareArticleSuccess: ResolverTypeWrapper<SetShareArticleSuccess>;
  SetShareHighlightError: ResolverTypeWrapper<SetShareHighlightError>;
  SetShareHighlightErrorCode: SetShareHighlightErrorCode;
  SetShareHighlightInput: SetShareHighlightInput;
  SetShareHighlightResult: ResolversTypes['SetShareHighlightError'] | ResolversTypes['SetShareHighlightSuccess'];
  SetShareHighlightSuccess: ResolverTypeWrapper<SetShareHighlightSuccess>;
  SetUserPersonalizationError: ResolverTypeWrapper<SetUserPersonalizationError>;
  SetUserPersonalizationErrorCode: SetUserPersonalizationErrorCode;
  SetUserPersonalizationInput: SetUserPersonalizationInput;
  SetUserPersonalizationResult: ResolversTypes['SetUserPersonalizationError'] | ResolversTypes['SetUserPersonalizationSuccess'];
  SetUserPersonalizationSuccess: ResolverTypeWrapper<SetUserPersonalizationSuccess>;
  SetWebhookError: ResolverTypeWrapper<SetWebhookError>;
  SetWebhookErrorCode: SetWebhookErrorCode;
  SetWebhookInput: SetWebhookInput;
  SetWebhookResult: ResolversTypes['SetWebhookError'] | ResolversTypes['SetWebhookSuccess'];
  SetWebhookSuccess: ResolverTypeWrapper<SetWebhookSuccess>;
  ShareStats: ResolverTypeWrapper<ShareStats>;
  SharedArticleError: ResolverTypeWrapper<SharedArticleError>;
  SharedArticleErrorCode: SharedArticleErrorCode;
  SharedArticleResult: ResolversTypes['SharedArticleError'] | ResolversTypes['SharedArticleSuccess'];
  SharedArticleSuccess: ResolverTypeWrapper<SharedArticleSuccess>;
  SignupErrorCode: SignupErrorCode;
  SortBy: SortBy;
  SortOrder: SortOrder;
  SortParams: SortParams;
  String: ResolverTypeWrapper<Scalars['String']>;
  SubscribeError: ResolverTypeWrapper<SubscribeError>;
  SubscribeErrorCode: SubscribeErrorCode;
  SubscribeInput: SubscribeInput;
  SubscribeResult: ResolversTypes['SubscribeError'] | ResolversTypes['SubscribeSuccess'];
  SubscribeSuccess: ResolverTypeWrapper<SubscribeSuccess>;
  Subscription: ResolverTypeWrapper<Subscription>;
  SubscriptionError: ResolverTypeWrapper<SubscriptionError>;
  SubscriptionResult: ResolversTypes['SubscriptionError'] | ResolversTypes['SubscriptionSuccess'];
  SubscriptionRootType: ResolverTypeWrapper<{}>;
  SubscriptionStatus: SubscriptionStatus;
  SubscriptionSuccess: ResolverTypeWrapper<SubscriptionSuccess>;
  SubscriptionType: SubscriptionType;
  SubscriptionsError: ResolverTypeWrapper<SubscriptionsError>;
  SubscriptionsErrorCode: SubscriptionsErrorCode;
  SubscriptionsResult: ResolversTypes['SubscriptionsError'] | ResolversTypes['SubscriptionsSuccess'];
  SubscriptionsSuccess: ResolverTypeWrapper<SubscriptionsSuccess>;
  SyncUpdatedItemEdge: ResolverTypeWrapper<SyncUpdatedItemEdge>;
  Task: ResolverTypeWrapper<Task>;
  TaskState: TaskState;
  TypeaheadSearchError: ResolverTypeWrapper<TypeaheadSearchError>;
  TypeaheadSearchErrorCode: TypeaheadSearchErrorCode;
  TypeaheadSearchItem: ResolverTypeWrapper<TypeaheadSearchItem>;
  TypeaheadSearchResult: ResolversTypes['TypeaheadSearchError'] | ResolversTypes['TypeaheadSearchSuccess'];
  TypeaheadSearchSuccess: ResolverTypeWrapper<TypeaheadSearchSuccess>;
  UnsubscribeError: ResolverTypeWrapper<UnsubscribeError>;
  UnsubscribeErrorCode: UnsubscribeErrorCode;
  UnsubscribeResult: ResolversTypes['UnsubscribeError'] | ResolversTypes['UnsubscribeSuccess'];
  UnsubscribeSuccess: ResolverTypeWrapper<UnsubscribeSuccess>;
  UpdateEmailError: ResolverTypeWrapper<UpdateEmailError>;
  UpdateEmailErrorCode: UpdateEmailErrorCode;
  UpdateEmailInput: UpdateEmailInput;
  UpdateEmailResult: ResolversTypes['UpdateEmailError'] | ResolversTypes['UpdateEmailSuccess'];
  UpdateEmailSuccess: ResolverTypeWrapper<UpdateEmailSuccess>;
  UpdateFilterError: ResolverTypeWrapper<UpdateFilterError>;
  UpdateFilterErrorCode: UpdateFilterErrorCode;
  UpdateFilterInput: UpdateFilterInput;
  UpdateFilterResult: ResolversTypes['UpdateFilterError'] | ResolversTypes['UpdateFilterSuccess'];
  UpdateFilterSuccess: ResolverTypeWrapper<UpdateFilterSuccess>;
  UpdateFolderPolicyError: ResolverTypeWrapper<UpdateFolderPolicyError>;
  UpdateFolderPolicyErrorCode: UpdateFolderPolicyErrorCode;
  UpdateFolderPolicyInput: UpdateFolderPolicyInput;
  UpdateFolderPolicyResult: ResolversTypes['UpdateFolderPolicyError'] | ResolversTypes['UpdateFolderPolicySuccess'];
  UpdateFolderPolicySuccess: ResolverTypeWrapper<UpdateFolderPolicySuccess>;
  UpdateHighlightError: ResolverTypeWrapper<UpdateHighlightError>;
  UpdateHighlightErrorCode: UpdateHighlightErrorCode;
  UpdateHighlightInput: UpdateHighlightInput;
  UpdateHighlightReplyError: ResolverTypeWrapper<UpdateHighlightReplyError>;
  UpdateHighlightReplyErrorCode: UpdateHighlightReplyErrorCode;
  UpdateHighlightReplyInput: UpdateHighlightReplyInput;
  UpdateHighlightReplyResult: ResolversTypes['UpdateHighlightReplyError'] | ResolversTypes['UpdateHighlightReplySuccess'];
  UpdateHighlightReplySuccess: ResolverTypeWrapper<UpdateHighlightReplySuccess>;
  UpdateHighlightResult: ResolversTypes['UpdateHighlightError'] | ResolversTypes['UpdateHighlightSuccess'];
  UpdateHighlightSuccess: ResolverTypeWrapper<UpdateHighlightSuccess>;
  UpdateLabelError: ResolverTypeWrapper<UpdateLabelError>;
  UpdateLabelErrorCode: UpdateLabelErrorCode;
  UpdateLabelInput: UpdateLabelInput;
  UpdateLabelResult: ResolversTypes['UpdateLabelError'] | ResolversTypes['UpdateLabelSuccess'];
  UpdateLabelSuccess: ResolverTypeWrapper<UpdateLabelSuccess>;
  UpdateLinkShareInfoError: ResolverTypeWrapper<UpdateLinkShareInfoError>;
  UpdateLinkShareInfoErrorCode: UpdateLinkShareInfoErrorCode;
  UpdateLinkShareInfoInput: UpdateLinkShareInfoInput;
  UpdateLinkShareInfoResult: ResolversTypes['UpdateLinkShareInfoError'] | ResolversTypes['UpdateLinkShareInfoSuccess'];
  UpdateLinkShareInfoSuccess: ResolverTypeWrapper<UpdateLinkShareInfoSuccess>;
  UpdateNewsletterEmailError: ResolverTypeWrapper<UpdateNewsletterEmailError>;
  UpdateNewsletterEmailErrorCode: UpdateNewsletterEmailErrorCode;
  UpdateNewsletterEmailInput: UpdateNewsletterEmailInput;
  UpdateNewsletterEmailResult: ResolversTypes['UpdateNewsletterEmailError'] | ResolversTypes['UpdateNewsletterEmailSuccess'];
  UpdateNewsletterEmailSuccess: ResolverTypeWrapper<UpdateNewsletterEmailSuccess>;
  UpdatePageError: ResolverTypeWrapper<UpdatePageError>;
  UpdatePageErrorCode: UpdatePageErrorCode;
  UpdatePageInput: UpdatePageInput;
  UpdatePageResult: ResolversTypes['UpdatePageError'] | ResolversTypes['UpdatePageSuccess'];
  UpdatePageSuccess: ResolverTypeWrapper<UpdatePageSuccess>;
  UpdateReason: UpdateReason;
  UpdateReminderError: ResolverTypeWrapper<UpdateReminderError>;
  UpdateReminderErrorCode: UpdateReminderErrorCode;
  UpdateReminderInput: UpdateReminderInput;
  UpdateReminderResult: ResolversTypes['UpdateReminderError'] | ResolversTypes['UpdateReminderSuccess'];
  UpdateReminderSuccess: ResolverTypeWrapper<UpdateReminderSuccess>;
  UpdateSharedCommentError: ResolverTypeWrapper<UpdateSharedCommentError>;
  UpdateSharedCommentErrorCode: UpdateSharedCommentErrorCode;
  UpdateSharedCommentInput: UpdateSharedCommentInput;
  UpdateSharedCommentResult: ResolversTypes['UpdateSharedCommentError'] | ResolversTypes['UpdateSharedCommentSuccess'];
  UpdateSharedCommentSuccess: ResolverTypeWrapper<UpdateSharedCommentSuccess>;
  UpdateSubscriptionError: ResolverTypeWrapper<UpdateSubscriptionError>;
  UpdateSubscriptionErrorCode: UpdateSubscriptionErrorCode;
  UpdateSubscriptionInput: UpdateSubscriptionInput;
  UpdateSubscriptionResult: ResolversTypes['UpdateSubscriptionError'] | ResolversTypes['UpdateSubscriptionSuccess'];
  UpdateSubscriptionSuccess: ResolverTypeWrapper<UpdateSubscriptionSuccess>;
  UpdateUserError: ResolverTypeWrapper<UpdateUserError>;
  UpdateUserErrorCode: UpdateUserErrorCode;
  UpdateUserInput: UpdateUserInput;
  UpdateUserProfileError: ResolverTypeWrapper<UpdateUserProfileError>;
  UpdateUserProfileErrorCode: UpdateUserProfileErrorCode;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateUserProfileResult: ResolversTypes['UpdateUserProfileError'] | ResolversTypes['UpdateUserProfileSuccess'];
  UpdateUserProfileSuccess: ResolverTypeWrapper<UpdateUserProfileSuccess>;
  UpdateUserResult: ResolversTypes['UpdateUserError'] | ResolversTypes['UpdateUserSuccess'];
  UpdateUserSuccess: ResolverTypeWrapper<UpdateUserSuccess>;
  UpdatesSinceError: ResolverTypeWrapper<UpdatesSinceError>;
  UpdatesSinceErrorCode: UpdatesSinceErrorCode;
  UpdatesSinceResult: ResolversTypes['UpdatesSinceError'] | ResolversTypes['UpdatesSinceSuccess'];
  UpdatesSinceSuccess: ResolverTypeWrapper<UpdatesSinceSuccess>;
  UploadFileRequestError: ResolverTypeWrapper<UploadFileRequestError>;
  UploadFileRequestErrorCode: UploadFileRequestErrorCode;
  UploadFileRequestInput: UploadFileRequestInput;
  UploadFileRequestResult: ResolversTypes['UploadFileRequestError'] | ResolversTypes['UploadFileRequestSuccess'];
  UploadFileRequestSuccess: ResolverTypeWrapper<UploadFileRequestSuccess>;
  UploadFileStatus: UploadFileStatus;
  UploadImportFileError: ResolverTypeWrapper<UploadImportFileError>;
  UploadImportFileErrorCode: UploadImportFileErrorCode;
  UploadImportFileResult: ResolversTypes['UploadImportFileError'] | ResolversTypes['UploadImportFileSuccess'];
  UploadImportFileSuccess: ResolverTypeWrapper<UploadImportFileSuccess>;
  UploadImportFileType: UploadImportFileType;
  User: ResolverTypeWrapper<User>;
  UserError: ResolverTypeWrapper<UserError>;
  UserErrorCode: UserErrorCode;
  UserPersonalization: ResolverTypeWrapper<UserPersonalization>;
  UserResult: ResolversTypes['UserError'] | ResolversTypes['UserSuccess'];
  UserSuccess: ResolverTypeWrapper<UserSuccess>;
  UsersError: ResolverTypeWrapper<UsersError>;
  UsersErrorCode: UsersErrorCode;
  UsersResult: ResolversTypes['UsersError'] | ResolversTypes['UsersSuccess'];
  UsersSuccess: ResolverTypeWrapper<UsersSuccess>;
  Webhook: ResolverTypeWrapper<Webhook>;
  WebhookError: ResolverTypeWrapper<WebhookError>;
  WebhookErrorCode: WebhookErrorCode;
  WebhookEvent: WebhookEvent;
  WebhookResult: ResolversTypes['WebhookError'] | ResolversTypes['WebhookSuccess'];
  WebhookSuccess: ResolverTypeWrapper<WebhookSuccess>;
  WebhooksError: ResolverTypeWrapper<WebhooksError>;
  WebhooksErrorCode: WebhooksErrorCode;
  WebhooksResult: ResolversTypes['WebhooksError'] | ResolversTypes['WebhooksSuccess'];
  WebhooksSuccess: ResolverTypeWrapper<WebhooksSuccess>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AddDiscoverFeedError: AddDiscoverFeedError;
  AddDiscoverFeedInput: AddDiscoverFeedInput;
  AddDiscoverFeedResult: ResolversParentTypes['AddDiscoverFeedError'] | ResolversParentTypes['AddDiscoverFeedSuccess'];
  AddDiscoverFeedSuccess: AddDiscoverFeedSuccess;
  AddPopularReadError: AddPopularReadError;
  AddPopularReadResult: ResolversParentTypes['AddPopularReadError'] | ResolversParentTypes['AddPopularReadSuccess'];
  AddPopularReadSuccess: AddPopularReadSuccess;
  ApiKey: ApiKey;
  ApiKeysError: ApiKeysError;
  ApiKeysResult: ResolversParentTypes['ApiKeysError'] | ResolversParentTypes['ApiKeysSuccess'];
  ApiKeysSuccess: ApiKeysSuccess;
  ArchiveLinkError: ArchiveLinkError;
  ArchiveLinkInput: ArchiveLinkInput;
  ArchiveLinkResult: ResolversParentTypes['ArchiveLinkError'] | ResolversParentTypes['ArchiveLinkSuccess'];
  ArchiveLinkSuccess: ArchiveLinkSuccess;
  Article: Article;
  ArticleEdge: ArticleEdge;
  ArticleError: ArticleError;
  ArticleHighlightsInput: ArticleHighlightsInput;
  ArticleResult: ResolversParentTypes['ArticleError'] | ResolversParentTypes['ArticleSuccess'];
  ArticleSavingRequest: ArticleSavingRequest;
  ArticleSavingRequestError: ArticleSavingRequestError;
  ArticleSavingRequestResult: ResolversParentTypes['ArticleSavingRequestError'] | ResolversParentTypes['ArticleSavingRequestSuccess'];
  ArticleSavingRequestSuccess: ArticleSavingRequestSuccess;
  ArticleSuccess: ArticleSuccess;
  ArticlesError: ArticlesError;
  ArticlesResult: ResolversParentTypes['ArticlesError'] | ResolversParentTypes['ArticlesSuccess'];
  ArticlesSuccess: ArticlesSuccess;
  Boolean: Scalars['Boolean'];
  BulkActionError: BulkActionError;
  BulkActionResult: ResolversParentTypes['BulkActionError'] | ResolversParentTypes['BulkActionSuccess'];
  BulkActionSuccess: BulkActionSuccess;
  CreateArticleError: CreateArticleError;
  CreateArticleInput: CreateArticleInput;
  CreateArticleResult: ResolversParentTypes['CreateArticleError'] | ResolversParentTypes['CreateArticleSuccess'];
  CreateArticleSavingRequestError: CreateArticleSavingRequestError;
  CreateArticleSavingRequestInput: CreateArticleSavingRequestInput;
  CreateArticleSavingRequestResult: ResolversParentTypes['CreateArticleSavingRequestError'] | ResolversParentTypes['CreateArticleSavingRequestSuccess'];
  CreateArticleSavingRequestSuccess: CreateArticleSavingRequestSuccess;
  CreateArticleSuccess: CreateArticleSuccess;
  CreateFolderPolicyError: CreateFolderPolicyError;
  CreateFolderPolicyInput: CreateFolderPolicyInput;
  CreateFolderPolicyResult: ResolversParentTypes['CreateFolderPolicyError'] | ResolversParentTypes['CreateFolderPolicySuccess'];
  CreateFolderPolicySuccess: CreateFolderPolicySuccess;
  CreateGroupError: CreateGroupError;
  CreateGroupInput: CreateGroupInput;
  CreateGroupResult: ResolversParentTypes['CreateGroupError'] | ResolversParentTypes['CreateGroupSuccess'];
  CreateGroupSuccess: CreateGroupSuccess;
  CreateHighlightError: CreateHighlightError;
  CreateHighlightInput: CreateHighlightInput;
  CreateHighlightReplyError: CreateHighlightReplyError;
  CreateHighlightReplyInput: CreateHighlightReplyInput;
  CreateHighlightReplyResult: ResolversParentTypes['CreateHighlightReplyError'] | ResolversParentTypes['CreateHighlightReplySuccess'];
  CreateHighlightReplySuccess: CreateHighlightReplySuccess;
  CreateHighlightResult: ResolversParentTypes['CreateHighlightError'] | ResolversParentTypes['CreateHighlightSuccess'];
  CreateHighlightSuccess: CreateHighlightSuccess;
  CreateLabelError: CreateLabelError;
  CreateLabelInput: CreateLabelInput;
  CreateLabelResult: ResolversParentTypes['CreateLabelError'] | ResolversParentTypes['CreateLabelSuccess'];
  CreateLabelSuccess: CreateLabelSuccess;
  CreateNewsletterEmailError: CreateNewsletterEmailError;
  CreateNewsletterEmailInput: CreateNewsletterEmailInput;
  CreateNewsletterEmailResult: ResolversParentTypes['CreateNewsletterEmailError'] | ResolversParentTypes['CreateNewsletterEmailSuccess'];
  CreateNewsletterEmailSuccess: CreateNewsletterEmailSuccess;
  CreateReactionError: CreateReactionError;
  CreateReactionInput: CreateReactionInput;
  CreateReactionResult: ResolversParentTypes['CreateReactionError'] | ResolversParentTypes['CreateReactionSuccess'];
  CreateReactionSuccess: CreateReactionSuccess;
  CreateReminderError: CreateReminderError;
  CreateReminderInput: CreateReminderInput;
  CreateReminderResult: ResolversParentTypes['CreateReminderError'] | ResolversParentTypes['CreateReminderSuccess'];
  CreateReminderSuccess: CreateReminderSuccess;
  Date: Scalars['Date'];
  DeleteAccountError: DeleteAccountError;
  DeleteAccountResult: ResolversParentTypes['DeleteAccountError'] | ResolversParentTypes['DeleteAccountSuccess'];
  DeleteAccountSuccess: DeleteAccountSuccess;
  DeleteDiscoverArticleError: DeleteDiscoverArticleError;
  DeleteDiscoverArticleInput: DeleteDiscoverArticleInput;
  DeleteDiscoverArticleResult: ResolversParentTypes['DeleteDiscoverArticleError'] | ResolversParentTypes['DeleteDiscoverArticleSuccess'];
  DeleteDiscoverArticleSuccess: DeleteDiscoverArticleSuccess;
  DeleteDiscoverFeedError: DeleteDiscoverFeedError;
  DeleteDiscoverFeedInput: DeleteDiscoverFeedInput;
  DeleteDiscoverFeedResult: ResolversParentTypes['DeleteDiscoverFeedError'] | ResolversParentTypes['DeleteDiscoverFeedSuccess'];
  DeleteDiscoverFeedSuccess: DeleteDiscoverFeedSuccess;
  DeleteFilterError: DeleteFilterError;
  DeleteFilterResult: ResolversParentTypes['DeleteFilterError'] | ResolversParentTypes['DeleteFilterSuccess'];
  DeleteFilterSuccess: DeleteFilterSuccess;
  DeleteFolderPolicyError: DeleteFolderPolicyError;
  DeleteFolderPolicyResult: ResolversParentTypes['DeleteFolderPolicyError'] | ResolversParentTypes['DeleteFolderPolicySuccess'];
  DeleteFolderPolicySuccess: DeleteFolderPolicySuccess;
  DeleteHighlightError: DeleteHighlightError;
  DeleteHighlightReplyError: DeleteHighlightReplyError;
  DeleteHighlightReplyResult: ResolversParentTypes['DeleteHighlightReplyError'] | ResolversParentTypes['DeleteHighlightReplySuccess'];
  DeleteHighlightReplySuccess: DeleteHighlightReplySuccess;
  DeleteHighlightResult: ResolversParentTypes['DeleteHighlightError'] | ResolversParentTypes['DeleteHighlightSuccess'];
  DeleteHighlightSuccess: DeleteHighlightSuccess;
  DeleteIntegrationError: DeleteIntegrationError;
  DeleteIntegrationResult: ResolversParentTypes['DeleteIntegrationError'] | ResolversParentTypes['DeleteIntegrationSuccess'];
  DeleteIntegrationSuccess: DeleteIntegrationSuccess;
  DeleteLabelError: DeleteLabelError;
  DeleteLabelResult: ResolversParentTypes['DeleteLabelError'] | ResolversParentTypes['DeleteLabelSuccess'];
  DeleteLabelSuccess: DeleteLabelSuccess;
  DeleteNewsletterEmailError: DeleteNewsletterEmailError;
  DeleteNewsletterEmailResult: ResolversParentTypes['DeleteNewsletterEmailError'] | ResolversParentTypes['DeleteNewsletterEmailSuccess'];
  DeleteNewsletterEmailSuccess: DeleteNewsletterEmailSuccess;
  DeleteReactionError: DeleteReactionError;
  DeleteReactionResult: ResolversParentTypes['DeleteReactionError'] | ResolversParentTypes['DeleteReactionSuccess'];
  DeleteReactionSuccess: DeleteReactionSuccess;
  DeleteReminderError: DeleteReminderError;
  DeleteReminderResult: ResolversParentTypes['DeleteReminderError'] | ResolversParentTypes['DeleteReminderSuccess'];
  DeleteReminderSuccess: DeleteReminderSuccess;
  DeleteRuleError: DeleteRuleError;
  DeleteRuleResult: ResolversParentTypes['DeleteRuleError'] | ResolversParentTypes['DeleteRuleSuccess'];
  DeleteRuleSuccess: DeleteRuleSuccess;
  DeleteWebhookError: DeleteWebhookError;
  DeleteWebhookResult: ResolversParentTypes['DeleteWebhookError'] | ResolversParentTypes['DeleteWebhookSuccess'];
  DeleteWebhookSuccess: DeleteWebhookSuccess;
  DeviceToken: DeviceToken;
  DeviceTokensError: DeviceTokensError;
  DeviceTokensResult: ResolversParentTypes['DeviceTokensError'] | ResolversParentTypes['DeviceTokensSuccess'];
  DeviceTokensSuccess: DeviceTokensSuccess;
  DigestConfig: DigestConfig;
  DigestConfigInput: DigestConfigInput;
  DiscoverFeed: DiscoverFeed;
  DiscoverFeedArticle: DiscoverFeedArticle;
  DiscoverFeedError: DiscoverFeedError;
  DiscoverFeedResult: ResolversParentTypes['DiscoverFeedError'] | ResolversParentTypes['DiscoverFeedSuccess'];
  DiscoverFeedSuccess: DiscoverFeedSuccess;
  DiscoverTopic: DiscoverTopic;
  EditDiscoverFeedError: EditDiscoverFeedError;
  EditDiscoverFeedInput: EditDiscoverFeedInput;
  EditDiscoverFeedResult: ResolversParentTypes['EditDiscoverFeedError'] | ResolversParentTypes['EditDiscoverFeedSuccess'];
  EditDiscoverFeedSuccess: EditDiscoverFeedSuccess;
  EmptyTrashError: EmptyTrashError;
  EmptyTrashResult: ResolversParentTypes['EmptyTrashError'] | ResolversParentTypes['EmptyTrashSuccess'];
  EmptyTrashSuccess: EmptyTrashSuccess;
  ExportToIntegrationError: ExportToIntegrationError;
  ExportToIntegrationResult: ResolversParentTypes['ExportToIntegrationError'] | ResolversParentTypes['ExportToIntegrationSuccess'];
  ExportToIntegrationSuccess: ExportToIntegrationSuccess;
  Feature: Feature;
  Feed: Feed;
  FeedArticle: FeedArticle;
  FeedArticleEdge: FeedArticleEdge;
  FeedArticlesError: FeedArticlesError;
  FeedArticlesResult: ResolversParentTypes['FeedArticlesError'] | ResolversParentTypes['FeedArticlesSuccess'];
  FeedArticlesSuccess: FeedArticlesSuccess;
  FeedEdge: FeedEdge;
  FeedsError: FeedsError;
  FeedsInput: FeedsInput;
  FeedsResult: ResolversParentTypes['FeedsError'] | ResolversParentTypes['FeedsSuccess'];
  FeedsSuccess: FeedsSuccess;
  FetchContentError: FetchContentError;
  FetchContentResult: ResolversParentTypes['FetchContentError'] | ResolversParentTypes['FetchContentSuccess'];
  FetchContentSuccess: FetchContentSuccess;
  Filter: Filter;
  FiltersError: FiltersError;
  FiltersResult: ResolversParentTypes['FiltersError'] | ResolversParentTypes['FiltersSuccess'];
  FiltersSuccess: FiltersSuccess;
  Float: Scalars['Float'];
  FolderPoliciesError: FolderPoliciesError;
  FolderPoliciesResult: ResolversParentTypes['FolderPoliciesError'] | ResolversParentTypes['FolderPoliciesSuccess'];
  FolderPoliciesSuccess: FolderPoliciesSuccess;
  FolderPolicy: FolderPolicy;
  GenerateApiKeyError: GenerateApiKeyError;
  GenerateApiKeyInput: GenerateApiKeyInput;
  GenerateApiKeyResult: ResolversParentTypes['GenerateApiKeyError'] | ResolversParentTypes['GenerateApiKeySuccess'];
  GenerateApiKeySuccess: GenerateApiKeySuccess;
  GetDiscoverFeedArticleError: GetDiscoverFeedArticleError;
  GetDiscoverFeedArticleResults: ResolversParentTypes['GetDiscoverFeedArticleError'] | ResolversParentTypes['GetDiscoverFeedArticleSuccess'];
  GetDiscoverFeedArticleSuccess: GetDiscoverFeedArticleSuccess;
  GetDiscoverTopicError: GetDiscoverTopicError;
  GetDiscoverTopicResults: ResolversParentTypes['GetDiscoverTopicError'] | ResolversParentTypes['GetDiscoverTopicSuccess'];
  GetDiscoverTopicSuccess: GetDiscoverTopicSuccess;
  GetFollowersError: GetFollowersError;
  GetFollowersResult: ResolversParentTypes['GetFollowersError'] | ResolversParentTypes['GetFollowersSuccess'];
  GetFollowersSuccess: GetFollowersSuccess;
  GetFollowingError: GetFollowingError;
  GetFollowingResult: ResolversParentTypes['GetFollowingError'] | ResolversParentTypes['GetFollowingSuccess'];
  GetFollowingSuccess: GetFollowingSuccess;
  GetUserPersonalizationError: GetUserPersonalizationError;
  GetUserPersonalizationResult: ResolversParentTypes['GetUserPersonalizationError'] | ResolversParentTypes['GetUserPersonalizationSuccess'];
  GetUserPersonalizationSuccess: GetUserPersonalizationSuccess;
  GoogleLoginInput: GoogleLoginInput;
  GoogleSignupError: GoogleSignupError;
  GoogleSignupInput: GoogleSignupInput;
  GoogleSignupResult: ResolversParentTypes['GoogleSignupError'] | ResolversParentTypes['GoogleSignupSuccess'];
  GoogleSignupSuccess: GoogleSignupSuccess;
  GroupsError: GroupsError;
  GroupsResult: ResolversParentTypes['GroupsError'] | ResolversParentTypes['GroupsSuccess'];
  GroupsSuccess: GroupsSuccess;
  HiddenHomeSectionError: HiddenHomeSectionError;
  HiddenHomeSectionResult: ResolversParentTypes['HiddenHomeSectionError'] | ResolversParentTypes['HiddenHomeSectionSuccess'];
  HiddenHomeSectionSuccess: HiddenHomeSectionSuccess;
  Highlight: Highlight;
  HighlightEdge: HighlightEdge;
  HighlightReply: HighlightReply;
  HighlightStats: HighlightStats;
  HighlightsError: HighlightsError;
  HighlightsResult: ResolversParentTypes['HighlightsError'] | ResolversParentTypes['HighlightsSuccess'];
  HighlightsSuccess: HighlightsSuccess;
  HomeEdge: HomeEdge;
  HomeError: HomeError;
  HomeItem: HomeItem;
  HomeItemSource: HomeItemSource;
  HomeResult: ResolversParentTypes['HomeError'] | ResolversParentTypes['HomeSuccess'];
  HomeSection: HomeSection;
  HomeSuccess: HomeSuccess;
  ID: Scalars['ID'];
  ImportFromIntegrationError: ImportFromIntegrationError;
  ImportFromIntegrationResult: ResolversParentTypes['ImportFromIntegrationError'] | ResolversParentTypes['ImportFromIntegrationSuccess'];
  ImportFromIntegrationSuccess: ImportFromIntegrationSuccess;
  Int: Scalars['Int'];
  Integration: Integration;
  IntegrationError: IntegrationError;
  IntegrationResult: ResolversParentTypes['IntegrationError'] | ResolversParentTypes['IntegrationSuccess'];
  IntegrationSuccess: IntegrationSuccess;
  IntegrationsError: IntegrationsError;
  IntegrationsResult: ResolversParentTypes['IntegrationsError'] | ResolversParentTypes['IntegrationsSuccess'];
  IntegrationsSuccess: IntegrationsSuccess;
  JSON: Scalars['JSON'];
  JoinGroupError: JoinGroupError;
  JoinGroupResult: ResolversParentTypes['JoinGroupError'] | ResolversParentTypes['JoinGroupSuccess'];
  JoinGroupSuccess: JoinGroupSuccess;
  Label: Label;
  LabelsError: LabelsError;
  LabelsResult: ResolversParentTypes['LabelsError'] | ResolversParentTypes['LabelsSuccess'];
  LabelsSuccess: LabelsSuccess;
  LeaveGroupError: LeaveGroupError;
  LeaveGroupResult: ResolversParentTypes['LeaveGroupError'] | ResolversParentTypes['LeaveGroupSuccess'];
  LeaveGroupSuccess: LeaveGroupSuccess;
  Link: Link;
  LinkShareInfo: LinkShareInfo;
  LogOutError: LogOutError;
  LogOutResult: ResolversParentTypes['LogOutError'] | ResolversParentTypes['LogOutSuccess'];
  LogOutSuccess: LogOutSuccess;
  LoginError: LoginError;
  LoginResult: ResolversParentTypes['LoginError'] | ResolversParentTypes['LoginSuccess'];
  LoginSuccess: LoginSuccess;
  MarkEmailAsItemError: MarkEmailAsItemError;
  MarkEmailAsItemResult: ResolversParentTypes['MarkEmailAsItemError'] | ResolversParentTypes['MarkEmailAsItemSuccess'];
  MarkEmailAsItemSuccess: MarkEmailAsItemSuccess;
  MergeHighlightError: MergeHighlightError;
  MergeHighlightInput: MergeHighlightInput;
  MergeHighlightResult: ResolversParentTypes['MergeHighlightError'] | ResolversParentTypes['MergeHighlightSuccess'];
  MergeHighlightSuccess: MergeHighlightSuccess;
  MoveFilterError: MoveFilterError;
  MoveFilterInput: MoveFilterInput;
  MoveFilterResult: ResolversParentTypes['MoveFilterError'] | ResolversParentTypes['MoveFilterSuccess'];
  MoveFilterSuccess: MoveFilterSuccess;
  MoveLabelError: MoveLabelError;
  MoveLabelInput: MoveLabelInput;
  MoveLabelResult: ResolversParentTypes['MoveLabelError'] | ResolversParentTypes['MoveLabelSuccess'];
  MoveLabelSuccess: MoveLabelSuccess;
  MoveToFolderError: MoveToFolderError;
  MoveToFolderResult: ResolversParentTypes['MoveToFolderError'] | ResolversParentTypes['MoveToFolderSuccess'];
  MoveToFolderSuccess: MoveToFolderSuccess;
  Mutation: {};
  NewsletterEmail: NewsletterEmail;
  NewsletterEmailsError: NewsletterEmailsError;
  NewsletterEmailsResult: ResolversParentTypes['NewsletterEmailsError'] | ResolversParentTypes['NewsletterEmailsSuccess'];
  NewsletterEmailsSuccess: NewsletterEmailsSuccess;
  OptInFeatureError: OptInFeatureError;
  OptInFeatureInput: OptInFeatureInput;
  OptInFeatureResult: ResolversParentTypes['OptInFeatureError'] | ResolversParentTypes['OptInFeatureSuccess'];
  OptInFeatureSuccess: OptInFeatureSuccess;
  Page: Page;
  PageInfo: PageInfo;
  PageInfoInput: PageInfoInput;
  ParseResult: ParseResult;
  PreparedDocumentInput: PreparedDocumentInput;
  Profile: Profile;
  Query: {};
  Reaction: Reaction;
  ReadState: ReadState;
  RecentEmail: RecentEmail;
  RecentEmailsError: RecentEmailsError;
  RecentEmailsResult: ResolversParentTypes['RecentEmailsError'] | ResolversParentTypes['RecentEmailsSuccess'];
  RecentEmailsSuccess: RecentEmailsSuccess;
  RecentSearch: RecentSearch;
  RecentSearchesError: RecentSearchesError;
  RecentSearchesResult: ResolversParentTypes['RecentSearchesError'] | ResolversParentTypes['RecentSearchesSuccess'];
  RecentSearchesSuccess: RecentSearchesSuccess;
  RecommendError: RecommendError;
  RecommendHighlightsError: RecommendHighlightsError;
  RecommendHighlightsInput: RecommendHighlightsInput;
  RecommendHighlightsResult: ResolversParentTypes['RecommendHighlightsError'] | ResolversParentTypes['RecommendHighlightsSuccess'];
  RecommendHighlightsSuccess: RecommendHighlightsSuccess;
  RecommendInput: RecommendInput;
  RecommendResult: ResolversParentTypes['RecommendError'] | ResolversParentTypes['RecommendSuccess'];
  RecommendSuccess: RecommendSuccess;
  Recommendation: Recommendation;
  RecommendationGroup: RecommendationGroup;
  RecommendingUser: RecommendingUser;
  RefreshHomeError: RefreshHomeError;
  RefreshHomeResult: ResolversParentTypes['RefreshHomeError'] | ResolversParentTypes['RefreshHomeSuccess'];
  RefreshHomeSuccess: RefreshHomeSuccess;
  Reminder: Reminder;
  ReminderError: ReminderError;
  ReminderResult: ResolversParentTypes['ReminderError'] | ResolversParentTypes['ReminderSuccess'];
  ReminderSuccess: ReminderSuccess;
  ReplyToEmailError: ReplyToEmailError;
  ReplyToEmailResult: ResolversParentTypes['ReplyToEmailError'] | ResolversParentTypes['ReplyToEmailSuccess'];
  ReplyToEmailSuccess: ReplyToEmailSuccess;
  ReportItemInput: ReportItemInput;
  ReportItemResult: ReportItemResult;
  RevokeApiKeyError: RevokeApiKeyError;
  RevokeApiKeyResult: ResolversParentTypes['RevokeApiKeyError'] | ResolversParentTypes['RevokeApiKeySuccess'];
  RevokeApiKeySuccess: RevokeApiKeySuccess;
  Rule: Rule;
  RuleAction: RuleAction;
  RuleActionInput: RuleActionInput;
  RulesError: RulesError;
  RulesResult: ResolversParentTypes['RulesError'] | ResolversParentTypes['RulesSuccess'];
  RulesSuccess: RulesSuccess;
  SaveArticleReadingProgressError: SaveArticleReadingProgressError;
  SaveArticleReadingProgressInput: SaveArticleReadingProgressInput;
  SaveArticleReadingProgressResult: ResolversParentTypes['SaveArticleReadingProgressError'] | ResolversParentTypes['SaveArticleReadingProgressSuccess'];
  SaveArticleReadingProgressSuccess: SaveArticleReadingProgressSuccess;
  SaveDiscoverArticleError: SaveDiscoverArticleError;
  SaveDiscoverArticleInput: SaveDiscoverArticleInput;
  SaveDiscoverArticleResult: ResolversParentTypes['SaveDiscoverArticleError'] | ResolversParentTypes['SaveDiscoverArticleSuccess'];
  SaveDiscoverArticleSuccess: SaveDiscoverArticleSuccess;
  SaveError: SaveError;
  SaveFileInput: SaveFileInput;
  SaveFilterError: SaveFilterError;
  SaveFilterInput: SaveFilterInput;
  SaveFilterResult: ResolversParentTypes['SaveFilterError'] | ResolversParentTypes['SaveFilterSuccess'];
  SaveFilterSuccess: SaveFilterSuccess;
  SavePageInput: SavePageInput;
  SaveResult: ResolversParentTypes['SaveError'] | ResolversParentTypes['SaveSuccess'];
  SaveSuccess: SaveSuccess;
  SaveUrlInput: SaveUrlInput;
  ScanFeedsError: ScanFeedsError;
  ScanFeedsInput: ScanFeedsInput;
  ScanFeedsResult: ResolversParentTypes['ScanFeedsError'] | ResolversParentTypes['ScanFeedsSuccess'];
  ScanFeedsSuccess: ScanFeedsSuccess;
  SearchError: SearchError;
  SearchItem: SearchItem;
  SearchItemEdge: SearchItemEdge;
  SearchResult: ResolversParentTypes['SearchError'] | ResolversParentTypes['SearchSuccess'];
  SearchSuccess: SearchSuccess;
  SendInstallInstructionsError: SendInstallInstructionsError;
  SendInstallInstructionsResult: ResolversParentTypes['SendInstallInstructionsError'] | ResolversParentTypes['SendInstallInstructionsSuccess'];
  SendInstallInstructionsSuccess: SendInstallInstructionsSuccess;
  SetBookmarkArticleError: SetBookmarkArticleError;
  SetBookmarkArticleInput: SetBookmarkArticleInput;
  SetBookmarkArticleResult: ResolversParentTypes['SetBookmarkArticleError'] | ResolversParentTypes['SetBookmarkArticleSuccess'];
  SetBookmarkArticleSuccess: SetBookmarkArticleSuccess;
  SetDeviceTokenError: SetDeviceTokenError;
  SetDeviceTokenInput: SetDeviceTokenInput;
  SetDeviceTokenResult: ResolversParentTypes['SetDeviceTokenError'] | ResolversParentTypes['SetDeviceTokenSuccess'];
  SetDeviceTokenSuccess: SetDeviceTokenSuccess;
  SetFavoriteArticleError: SetFavoriteArticleError;
  SetFavoriteArticleResult: ResolversParentTypes['SetFavoriteArticleError'] | ResolversParentTypes['SetFavoriteArticleSuccess'];
  SetFavoriteArticleSuccess: SetFavoriteArticleSuccess;
  SetFollowError: SetFollowError;
  SetFollowInput: SetFollowInput;
  SetFollowResult: ResolversParentTypes['SetFollowError'] | ResolversParentTypes['SetFollowSuccess'];
  SetFollowSuccess: SetFollowSuccess;
  SetIntegrationError: SetIntegrationError;
  SetIntegrationInput: SetIntegrationInput;
  SetIntegrationResult: ResolversParentTypes['SetIntegrationError'] | ResolversParentTypes['SetIntegrationSuccess'];
  SetIntegrationSuccess: SetIntegrationSuccess;
  SetLabelsError: SetLabelsError;
  SetLabelsForHighlightInput: SetLabelsForHighlightInput;
  SetLabelsInput: SetLabelsInput;
  SetLabelsResult: ResolversParentTypes['SetLabelsError'] | ResolversParentTypes['SetLabelsSuccess'];
  SetLabelsSuccess: SetLabelsSuccess;
  SetRuleError: SetRuleError;
  SetRuleInput: SetRuleInput;
  SetRuleResult: ResolversParentTypes['SetRuleError'] | ResolversParentTypes['SetRuleSuccess'];
  SetRuleSuccess: SetRuleSuccess;
  SetShareArticleError: SetShareArticleError;
  SetShareArticleInput: SetShareArticleInput;
  SetShareArticleResult: ResolversParentTypes['SetShareArticleError'] | ResolversParentTypes['SetShareArticleSuccess'];
  SetShareArticleSuccess: SetShareArticleSuccess;
  SetShareHighlightError: SetShareHighlightError;
  SetShareHighlightInput: SetShareHighlightInput;
  SetShareHighlightResult: ResolversParentTypes['SetShareHighlightError'] | ResolversParentTypes['SetShareHighlightSuccess'];
  SetShareHighlightSuccess: SetShareHighlightSuccess;
  SetUserPersonalizationError: SetUserPersonalizationError;
  SetUserPersonalizationInput: SetUserPersonalizationInput;
  SetUserPersonalizationResult: ResolversParentTypes['SetUserPersonalizationError'] | ResolversParentTypes['SetUserPersonalizationSuccess'];
  SetUserPersonalizationSuccess: SetUserPersonalizationSuccess;
  SetWebhookError: SetWebhookError;
  SetWebhookInput: SetWebhookInput;
  SetWebhookResult: ResolversParentTypes['SetWebhookError'] | ResolversParentTypes['SetWebhookSuccess'];
  SetWebhookSuccess: SetWebhookSuccess;
  ShareStats: ShareStats;
  SharedArticleError: SharedArticleError;
  SharedArticleResult: ResolversParentTypes['SharedArticleError'] | ResolversParentTypes['SharedArticleSuccess'];
  SharedArticleSuccess: SharedArticleSuccess;
  SortParams: SortParams;
  String: Scalars['String'];
  SubscribeError: SubscribeError;
  SubscribeInput: SubscribeInput;
  SubscribeResult: ResolversParentTypes['SubscribeError'] | ResolversParentTypes['SubscribeSuccess'];
  SubscribeSuccess: SubscribeSuccess;
  Subscription: Subscription;
  SubscriptionError: SubscriptionError;
  SubscriptionResult: ResolversParentTypes['SubscriptionError'] | ResolversParentTypes['SubscriptionSuccess'];
  SubscriptionRootType: {};
  SubscriptionSuccess: SubscriptionSuccess;
  SubscriptionsError: SubscriptionsError;
  SubscriptionsResult: ResolversParentTypes['SubscriptionsError'] | ResolversParentTypes['SubscriptionsSuccess'];
  SubscriptionsSuccess: SubscriptionsSuccess;
  SyncUpdatedItemEdge: SyncUpdatedItemEdge;
  Task: Task;
  TypeaheadSearchError: TypeaheadSearchError;
  TypeaheadSearchItem: TypeaheadSearchItem;
  TypeaheadSearchResult: ResolversParentTypes['TypeaheadSearchError'] | ResolversParentTypes['TypeaheadSearchSuccess'];
  TypeaheadSearchSuccess: TypeaheadSearchSuccess;
  UnsubscribeError: UnsubscribeError;
  UnsubscribeResult: ResolversParentTypes['UnsubscribeError'] | ResolversParentTypes['UnsubscribeSuccess'];
  UnsubscribeSuccess: UnsubscribeSuccess;
  UpdateEmailError: UpdateEmailError;
  UpdateEmailInput: UpdateEmailInput;
  UpdateEmailResult: ResolversParentTypes['UpdateEmailError'] | ResolversParentTypes['UpdateEmailSuccess'];
  UpdateEmailSuccess: UpdateEmailSuccess;
  UpdateFilterError: UpdateFilterError;
  UpdateFilterInput: UpdateFilterInput;
  UpdateFilterResult: ResolversParentTypes['UpdateFilterError'] | ResolversParentTypes['UpdateFilterSuccess'];
  UpdateFilterSuccess: UpdateFilterSuccess;
  UpdateFolderPolicyError: UpdateFolderPolicyError;
  UpdateFolderPolicyInput: UpdateFolderPolicyInput;
  UpdateFolderPolicyResult: ResolversParentTypes['UpdateFolderPolicyError'] | ResolversParentTypes['UpdateFolderPolicySuccess'];
  UpdateFolderPolicySuccess: UpdateFolderPolicySuccess;
  UpdateHighlightError: UpdateHighlightError;
  UpdateHighlightInput: UpdateHighlightInput;
  UpdateHighlightReplyError: UpdateHighlightReplyError;
  UpdateHighlightReplyInput: UpdateHighlightReplyInput;
  UpdateHighlightReplyResult: ResolversParentTypes['UpdateHighlightReplyError'] | ResolversParentTypes['UpdateHighlightReplySuccess'];
  UpdateHighlightReplySuccess: UpdateHighlightReplySuccess;
  UpdateHighlightResult: ResolversParentTypes['UpdateHighlightError'] | ResolversParentTypes['UpdateHighlightSuccess'];
  UpdateHighlightSuccess: UpdateHighlightSuccess;
  UpdateLabelError: UpdateLabelError;
  UpdateLabelInput: UpdateLabelInput;
  UpdateLabelResult: ResolversParentTypes['UpdateLabelError'] | ResolversParentTypes['UpdateLabelSuccess'];
  UpdateLabelSuccess: UpdateLabelSuccess;
  UpdateLinkShareInfoError: UpdateLinkShareInfoError;
  UpdateLinkShareInfoInput: UpdateLinkShareInfoInput;
  UpdateLinkShareInfoResult: ResolversParentTypes['UpdateLinkShareInfoError'] | ResolversParentTypes['UpdateLinkShareInfoSuccess'];
  UpdateLinkShareInfoSuccess: UpdateLinkShareInfoSuccess;
  UpdateNewsletterEmailError: UpdateNewsletterEmailError;
  UpdateNewsletterEmailInput: UpdateNewsletterEmailInput;
  UpdateNewsletterEmailResult: ResolversParentTypes['UpdateNewsletterEmailError'] | ResolversParentTypes['UpdateNewsletterEmailSuccess'];
  UpdateNewsletterEmailSuccess: UpdateNewsletterEmailSuccess;
  UpdatePageError: UpdatePageError;
  UpdatePageInput: UpdatePageInput;
  UpdatePageResult: ResolversParentTypes['UpdatePageError'] | ResolversParentTypes['UpdatePageSuccess'];
  UpdatePageSuccess: UpdatePageSuccess;
  UpdateReminderError: UpdateReminderError;
  UpdateReminderInput: UpdateReminderInput;
  UpdateReminderResult: ResolversParentTypes['UpdateReminderError'] | ResolversParentTypes['UpdateReminderSuccess'];
  UpdateReminderSuccess: UpdateReminderSuccess;
  UpdateSharedCommentError: UpdateSharedCommentError;
  UpdateSharedCommentInput: UpdateSharedCommentInput;
  UpdateSharedCommentResult: ResolversParentTypes['UpdateSharedCommentError'] | ResolversParentTypes['UpdateSharedCommentSuccess'];
  UpdateSharedCommentSuccess: UpdateSharedCommentSuccess;
  UpdateSubscriptionError: UpdateSubscriptionError;
  UpdateSubscriptionInput: UpdateSubscriptionInput;
  UpdateSubscriptionResult: ResolversParentTypes['UpdateSubscriptionError'] | ResolversParentTypes['UpdateSubscriptionSuccess'];
  UpdateSubscriptionSuccess: UpdateSubscriptionSuccess;
  UpdateUserError: UpdateUserError;
  UpdateUserInput: UpdateUserInput;
  UpdateUserProfileError: UpdateUserProfileError;
  UpdateUserProfileInput: UpdateUserProfileInput;
  UpdateUserProfileResult: ResolversParentTypes['UpdateUserProfileError'] | ResolversParentTypes['UpdateUserProfileSuccess'];
  UpdateUserProfileSuccess: UpdateUserProfileSuccess;
  UpdateUserResult: ResolversParentTypes['UpdateUserError'] | ResolversParentTypes['UpdateUserSuccess'];
  UpdateUserSuccess: UpdateUserSuccess;
  UpdatesSinceError: UpdatesSinceError;
  UpdatesSinceResult: ResolversParentTypes['UpdatesSinceError'] | ResolversParentTypes['UpdatesSinceSuccess'];
  UpdatesSinceSuccess: UpdatesSinceSuccess;
  UploadFileRequestError: UploadFileRequestError;
  UploadFileRequestInput: UploadFileRequestInput;
  UploadFileRequestResult: ResolversParentTypes['UploadFileRequestError'] | ResolversParentTypes['UploadFileRequestSuccess'];
  UploadFileRequestSuccess: UploadFileRequestSuccess;
  UploadImportFileError: UploadImportFileError;
  UploadImportFileResult: ResolversParentTypes['UploadImportFileError'] | ResolversParentTypes['UploadImportFileSuccess'];
  UploadImportFileSuccess: UploadImportFileSuccess;
  User: User;
  UserError: UserError;
  UserPersonalization: UserPersonalization;
  UserResult: ResolversParentTypes['UserError'] | ResolversParentTypes['UserSuccess'];
  UserSuccess: UserSuccess;
  UsersError: UsersError;
  UsersResult: ResolversParentTypes['UsersError'] | ResolversParentTypes['UsersSuccess'];
  UsersSuccess: UsersSuccess;
  Webhook: Webhook;
  WebhookError: WebhookError;
  WebhookResult: ResolversParentTypes['WebhookError'] | ResolversParentTypes['WebhookSuccess'];
  WebhookSuccess: WebhookSuccess;
  WebhooksError: WebhooksError;
  WebhooksResult: ResolversParentTypes['WebhooksError'] | ResolversParentTypes['WebhooksSuccess'];
  WebhooksSuccess: WebhooksSuccess;
};

export type SanitizeDirectiveArgs = {
  allowedTags?: Maybe<Array<Maybe<Scalars['String']>>>;
  maxLength?: Maybe<Scalars['Int']>;
  minLength?: Maybe<Scalars['Int']>;
  pattern?: Maybe<Scalars['String']>;
};

export type SanitizeDirectiveResolver<Result, Parent, ContextType = ResolverContext, Args = SanitizeDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AddDiscoverFeedErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['AddDiscoverFeedError'] = ResolversParentTypes['AddDiscoverFeedError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['AddDiscoverFeedErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddDiscoverFeedResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['AddDiscoverFeedResult'] = ResolversParentTypes['AddDiscoverFeedResult']> = {
  __resolveType: TypeResolveFn<'AddDiscoverFeedError' | 'AddDiscoverFeedSuccess', ParentType, ContextType>;
};

export type AddDiscoverFeedSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['AddDiscoverFeedSuccess'] = ResolversParentTypes['AddDiscoverFeedSuccess']> = {
  feed?: Resolver<ResolversTypes['DiscoverFeed'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddPopularReadErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['AddPopularReadError'] = ResolversParentTypes['AddPopularReadError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['AddPopularReadErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AddPopularReadResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['AddPopularReadResult'] = ResolversParentTypes['AddPopularReadResult']> = {
  __resolveType: TypeResolveFn<'AddPopularReadError' | 'AddPopularReadSuccess', ParentType, ContextType>;
};

export type AddPopularReadSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['AddPopularReadSuccess'] = ResolversParentTypes['AddPopularReadSuccess']> = {
  pageId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ApiKeyResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ApiKey'] = ResolversParentTypes['ApiKey']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  expiresAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  key?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  scopes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  usedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ApiKeysErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ApiKeysError'] = ResolversParentTypes['ApiKeysError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['ApiKeysErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ApiKeysResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ApiKeysResult'] = ResolversParentTypes['ApiKeysResult']> = {
  __resolveType: TypeResolveFn<'ApiKeysError' | 'ApiKeysSuccess', ParentType, ContextType>;
};

export type ApiKeysSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ApiKeysSuccess'] = ResolversParentTypes['ApiKeysSuccess']> = {
  apiKeys?: Resolver<Array<ResolversTypes['ApiKey']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArchiveLinkErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArchiveLinkError'] = ResolversParentTypes['ArchiveLinkError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['ArchiveLinkErrorCode']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArchiveLinkResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArchiveLinkResult'] = ResolversParentTypes['ArchiveLinkResult']> = {
  __resolveType: TypeResolveFn<'ArchiveLinkError' | 'ArchiveLinkSuccess', ParentType, ContextType>;
};

export type ArchiveLinkSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArchiveLinkSuccess'] = ResolversParentTypes['ArchiveLinkSuccess']> = {
  linkId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticleResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Article'] = ResolversParentTypes['Article']> = {
  author?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  content?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  contentReader?: Resolver<ResolversTypes['ContentReader'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  directionality?: Resolver<Maybe<ResolversTypes['DirectionalityType']>, ParentType, ContextType>;
  feedContent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  folder?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasContent?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  highlights?: Resolver<Array<ResolversTypes['Highlight']>, ParentType, ContextType, Partial<ArticleHighlightsArgs>>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isArchived?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  labels?: Resolver<Maybe<Array<ResolversTypes['Label']>>, ParentType, ContextType>;
  language?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  linkId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  originalArticleUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  originalHtml?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  pageType?: Resolver<Maybe<ResolversTypes['PageType']>, ParentType, ContextType>;
  postedByViewer?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  readAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  readingProgressAnchorIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  readingProgressPercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  readingProgressTopPercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  recommendations?: Resolver<Maybe<Array<ResolversTypes['Recommendation']>>, ParentType, ContextType>;
  savedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  savedByViewer?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  shareInfo?: Resolver<Maybe<ResolversTypes['LinkShareInfo']>, ParentType, ContextType>;
  sharedComment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  siteIcon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  siteName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['ArticleSavingRequestStatus']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unsubHttpUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unsubMailTo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  uploadFileId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  wordsCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'ArticleError' | 'ArticleSuccess', ParentType, ContextType>;
};

export type ArticleSavingRequestResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticleSavingRequest'] = ResolversParentTypes['ArticleSavingRequest']> = {
  article?: Resolver<Maybe<ResolversTypes['Article']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  errorCode?: Resolver<Maybe<ResolversTypes['CreateArticleErrorCode']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ArticleSavingRequestStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticleSavingRequestErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticleSavingRequestError'] = ResolversParentTypes['ArticleSavingRequestError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['ArticleSavingRequestErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArticleSavingRequestResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticleSavingRequestResult'] = ResolversParentTypes['ArticleSavingRequestResult']> = {
  __resolveType: TypeResolveFn<'ArticleSavingRequestError' | 'ArticleSavingRequestSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'ArticlesError' | 'ArticlesSuccess', ParentType, ContextType>;
};

export type ArticlesSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ArticlesSuccess'] = ResolversParentTypes['ArticlesSuccess']> = {
  edges?: Resolver<Array<ResolversTypes['ArticleEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BulkActionErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['BulkActionError'] = ResolversParentTypes['BulkActionError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['BulkActionErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BulkActionResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['BulkActionResult'] = ResolversParentTypes['BulkActionResult']> = {
  __resolveType: TypeResolveFn<'BulkActionError' | 'BulkActionSuccess', ParentType, ContextType>;
};

export type BulkActionSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['BulkActionSuccess'] = ResolversParentTypes['BulkActionSuccess']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateArticleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateArticleError'] = ResolversParentTypes['CreateArticleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['CreateArticleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateArticleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateArticleResult'] = ResolversParentTypes['CreateArticleResult']> = {
  __resolveType: TypeResolveFn<'CreateArticleError' | 'CreateArticleSuccess', ParentType, ContextType>;
};

export type CreateArticleSavingRequestErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateArticleSavingRequestError'] = ResolversParentTypes['CreateArticleSavingRequestError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['CreateArticleSavingRequestErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateArticleSavingRequestResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateArticleSavingRequestResult'] = ResolversParentTypes['CreateArticleSavingRequestResult']> = {
  __resolveType: TypeResolveFn<'CreateArticleSavingRequestError' | 'CreateArticleSavingRequestSuccess', ParentType, ContextType>;
};

export type CreateArticleSavingRequestSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateArticleSavingRequestSuccess'] = ResolversParentTypes['CreateArticleSavingRequestSuccess']> = {
  articleSavingRequest?: Resolver<ResolversTypes['ArticleSavingRequest'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateArticleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateArticleSuccess'] = ResolversParentTypes['CreateArticleSuccess']> = {
  created?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdArticle?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateFolderPolicyErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateFolderPolicyError'] = ResolversParentTypes['CreateFolderPolicyError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['CreateFolderPolicyErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateFolderPolicyResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateFolderPolicyResult'] = ResolversParentTypes['CreateFolderPolicyResult']> = {
  __resolveType: TypeResolveFn<'CreateFolderPolicyError' | 'CreateFolderPolicySuccess', ParentType, ContextType>;
};

export type CreateFolderPolicySuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateFolderPolicySuccess'] = ResolversParentTypes['CreateFolderPolicySuccess']> = {
  policy?: Resolver<ResolversTypes['FolderPolicy'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateGroupErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateGroupError'] = ResolversParentTypes['CreateGroupError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['CreateGroupErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateGroupResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateGroupResult'] = ResolversParentTypes['CreateGroupResult']> = {
  __resolveType: TypeResolveFn<'CreateGroupError' | 'CreateGroupSuccess', ParentType, ContextType>;
};

export type CreateGroupSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateGroupSuccess'] = ResolversParentTypes['CreateGroupSuccess']> = {
  group?: Resolver<ResolversTypes['RecommendationGroup'], ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'CreateHighlightReplyError' | 'CreateHighlightReplySuccess', ParentType, ContextType>;
};

export type CreateHighlightReplySuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateHighlightReplySuccess'] = ResolversParentTypes['CreateHighlightReplySuccess']> = {
  highlightReply?: Resolver<ResolversTypes['HighlightReply'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreateHighlightResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateHighlightResult'] = ResolversParentTypes['CreateHighlightResult']> = {
  __resolveType: TypeResolveFn<'CreateHighlightError' | 'CreateHighlightSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'CreateLabelError' | 'CreateLabelSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'CreateNewsletterEmailError' | 'CreateNewsletterEmailSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'CreateReactionError' | 'CreateReactionSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'CreateReminderError' | 'CreateReminderSuccess', ParentType, ContextType>;
};

export type CreateReminderSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['CreateReminderSuccess'] = ResolversParentTypes['CreateReminderSuccess']> = {
  reminder?: Resolver<ResolversTypes['Reminder'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export type DeleteAccountErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteAccountError'] = ResolversParentTypes['DeleteAccountError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteAccountErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteAccountResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteAccountResult'] = ResolversParentTypes['DeleteAccountResult']> = {
  __resolveType: TypeResolveFn<'DeleteAccountError' | 'DeleteAccountSuccess', ParentType, ContextType>;
};

export type DeleteAccountSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteAccountSuccess'] = ResolversParentTypes['DeleteAccountSuccess']> = {
  userID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteDiscoverArticleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteDiscoverArticleError'] = ResolversParentTypes['DeleteDiscoverArticleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteDiscoverArticleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteDiscoverArticleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteDiscoverArticleResult'] = ResolversParentTypes['DeleteDiscoverArticleResult']> = {
  __resolveType: TypeResolveFn<'DeleteDiscoverArticleError' | 'DeleteDiscoverArticleSuccess', ParentType, ContextType>;
};

export type DeleteDiscoverArticleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteDiscoverArticleSuccess'] = ResolversParentTypes['DeleteDiscoverArticleSuccess']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteDiscoverFeedErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteDiscoverFeedError'] = ResolversParentTypes['DeleteDiscoverFeedError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteDiscoverFeedErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteDiscoverFeedResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteDiscoverFeedResult'] = ResolversParentTypes['DeleteDiscoverFeedResult']> = {
  __resolveType: TypeResolveFn<'DeleteDiscoverFeedError' | 'DeleteDiscoverFeedSuccess', ParentType, ContextType>;
};

export type DeleteDiscoverFeedSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteDiscoverFeedSuccess'] = ResolversParentTypes['DeleteDiscoverFeedSuccess']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteFilterErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteFilterError'] = ResolversParentTypes['DeleteFilterError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteFilterErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteFilterResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteFilterResult'] = ResolversParentTypes['DeleteFilterResult']> = {
  __resolveType: TypeResolveFn<'DeleteFilterError' | 'DeleteFilterSuccess', ParentType, ContextType>;
};

export type DeleteFilterSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteFilterSuccess'] = ResolversParentTypes['DeleteFilterSuccess']> = {
  filter?: Resolver<ResolversTypes['Filter'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteFolderPolicyErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteFolderPolicyError'] = ResolversParentTypes['DeleteFolderPolicyError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteFolderPolicyErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteFolderPolicyResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteFolderPolicyResult'] = ResolversParentTypes['DeleteFolderPolicyResult']> = {
  __resolveType: TypeResolveFn<'DeleteFolderPolicyError' | 'DeleteFolderPolicySuccess', ParentType, ContextType>;
};

export type DeleteFolderPolicySuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteFolderPolicySuccess'] = ResolversParentTypes['DeleteFolderPolicySuccess']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteHighlightErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteHighlightError'] = ResolversParentTypes['DeleteHighlightError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteHighlightErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteHighlightReplyErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteHighlightReplyError'] = ResolversParentTypes['DeleteHighlightReplyError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteHighlightReplyErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteHighlightReplyResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteHighlightReplyResult'] = ResolversParentTypes['DeleteHighlightReplyResult']> = {
  __resolveType: TypeResolveFn<'DeleteHighlightReplyError' | 'DeleteHighlightReplySuccess', ParentType, ContextType>;
};

export type DeleteHighlightReplySuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteHighlightReplySuccess'] = ResolversParentTypes['DeleteHighlightReplySuccess']> = {
  highlightReply?: Resolver<ResolversTypes['HighlightReply'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteHighlightResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteHighlightResult'] = ResolversParentTypes['DeleteHighlightResult']> = {
  __resolveType: TypeResolveFn<'DeleteHighlightError' | 'DeleteHighlightSuccess', ParentType, ContextType>;
};

export type DeleteHighlightSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteHighlightSuccess'] = ResolversParentTypes['DeleteHighlightSuccess']> = {
  highlight?: Resolver<ResolversTypes['Highlight'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteIntegrationErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteIntegrationError'] = ResolversParentTypes['DeleteIntegrationError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteIntegrationErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteIntegrationResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteIntegrationResult'] = ResolversParentTypes['DeleteIntegrationResult']> = {
  __resolveType: TypeResolveFn<'DeleteIntegrationError' | 'DeleteIntegrationSuccess', ParentType, ContextType>;
};

export type DeleteIntegrationSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteIntegrationSuccess'] = ResolversParentTypes['DeleteIntegrationSuccess']> = {
  integration?: Resolver<ResolversTypes['Integration'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteLabelErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteLabelError'] = ResolversParentTypes['DeleteLabelError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteLabelErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteLabelResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteLabelResult'] = ResolversParentTypes['DeleteLabelResult']> = {
  __resolveType: TypeResolveFn<'DeleteLabelError' | 'DeleteLabelSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'DeleteNewsletterEmailError' | 'DeleteNewsletterEmailSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'DeleteReactionError' | 'DeleteReactionSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'DeleteReminderError' | 'DeleteReminderSuccess', ParentType, ContextType>;
};

export type DeleteReminderSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteReminderSuccess'] = ResolversParentTypes['DeleteReminderSuccess']> = {
  reminder?: Resolver<ResolversTypes['Reminder'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteRuleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteRuleError'] = ResolversParentTypes['DeleteRuleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteRuleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteRuleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteRuleResult'] = ResolversParentTypes['DeleteRuleResult']> = {
  __resolveType: TypeResolveFn<'DeleteRuleError' | 'DeleteRuleSuccess', ParentType, ContextType>;
};

export type DeleteRuleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteRuleSuccess'] = ResolversParentTypes['DeleteRuleSuccess']> = {
  rule?: Resolver<ResolversTypes['Rule'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteWebhookErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteWebhookError'] = ResolversParentTypes['DeleteWebhookError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeleteWebhookErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeleteWebhookResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteWebhookResult'] = ResolversParentTypes['DeleteWebhookResult']> = {
  __resolveType: TypeResolveFn<'DeleteWebhookError' | 'DeleteWebhookSuccess', ParentType, ContextType>;
};

export type DeleteWebhookSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeleteWebhookSuccess'] = ResolversParentTypes['DeleteWebhookSuccess']> = {
  webhook?: Resolver<ResolversTypes['Webhook'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeviceTokenResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeviceToken'] = ResolversParentTypes['DeviceToken']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeviceTokensErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeviceTokensError'] = ResolversParentTypes['DeviceTokensError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DeviceTokensErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DeviceTokensResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeviceTokensResult'] = ResolversParentTypes['DeviceTokensResult']> = {
  __resolveType: TypeResolveFn<'DeviceTokensError' | 'DeviceTokensSuccess', ParentType, ContextType>;
};

export type DeviceTokensSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DeviceTokensSuccess'] = ResolversParentTypes['DeviceTokensSuccess']> = {
  deviceTokens?: Resolver<Array<ResolversTypes['DeviceToken']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DigestConfigResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DigestConfig'] = ResolversParentTypes['DigestConfig']> = {
  channels?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DiscoverFeedResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DiscoverFeed'] = ResolversParentTypes['DiscoverFeed']> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  link?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  visibleName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DiscoverFeedArticleResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DiscoverFeedArticle'] = ResolversParentTypes['DiscoverFeedArticle']> = {
  author?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  feed?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publishedDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  savedId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  savedLinkUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  siteName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DiscoverFeedErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DiscoverFeedError'] = ResolversParentTypes['DiscoverFeedError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['DiscoverFeedErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DiscoverFeedResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DiscoverFeedResult'] = ResolversParentTypes['DiscoverFeedResult']> = {
  __resolveType: TypeResolveFn<'DiscoverFeedError' | 'DiscoverFeedSuccess', ParentType, ContextType>;
};

export type DiscoverFeedSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DiscoverFeedSuccess'] = ResolversParentTypes['DiscoverFeedSuccess']> = {
  feeds?: Resolver<Array<Maybe<ResolversTypes['DiscoverFeed']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DiscoverTopicResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['DiscoverTopic'] = ResolversParentTypes['DiscoverTopic']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EditDiscoverFeedErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['EditDiscoverFeedError'] = ResolversParentTypes['EditDiscoverFeedError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['EditDiscoverFeedErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EditDiscoverFeedResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['EditDiscoverFeedResult'] = ResolversParentTypes['EditDiscoverFeedResult']> = {
  __resolveType: TypeResolveFn<'EditDiscoverFeedError' | 'EditDiscoverFeedSuccess', ParentType, ContextType>;
};

export type EditDiscoverFeedSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['EditDiscoverFeedSuccess'] = ResolversParentTypes['EditDiscoverFeedSuccess']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EmptyTrashErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['EmptyTrashError'] = ResolversParentTypes['EmptyTrashError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['EmptyTrashErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EmptyTrashResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['EmptyTrashResult'] = ResolversParentTypes['EmptyTrashResult']> = {
  __resolveType: TypeResolveFn<'EmptyTrashError' | 'EmptyTrashSuccess', ParentType, ContextType>;
};

export type EmptyTrashSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['EmptyTrashSuccess'] = ResolversParentTypes['EmptyTrashSuccess']> = {
  success?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExportToIntegrationErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ExportToIntegrationError'] = ResolversParentTypes['ExportToIntegrationError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['ExportToIntegrationErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ExportToIntegrationResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ExportToIntegrationResult'] = ResolversParentTypes['ExportToIntegrationResult']> = {
  __resolveType: TypeResolveFn<'ExportToIntegrationError' | 'ExportToIntegrationSuccess', ParentType, ContextType>;
};

export type ExportToIntegrationSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ExportToIntegrationSuccess'] = ResolversParentTypes['ExportToIntegrationSuccess']> = {
  task?: Resolver<ResolversTypes['Task'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeatureResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Feature'] = ResolversParentTypes['Feature']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  expiresAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  grantedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeedResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Feed'] = ResolversParentTypes['Feed']> = {
  author?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeedArticleResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FeedArticle'] = ResolversParentTypes['FeedArticle']> = {
  annotationsCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  article?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  highlight?: Resolver<Maybe<ResolversTypes['Highlight']>, ParentType, ContextType>;
  highlightsCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  reactions?: Resolver<Array<ResolversTypes['Reaction']>, ParentType, ContextType>;
  sharedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  sharedBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  sharedComment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sharedWithHighlights?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'FeedArticlesError' | 'FeedArticlesSuccess', ParentType, ContextType>;
};

export type FeedArticlesSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FeedArticlesSuccess'] = ResolversParentTypes['FeedArticlesSuccess']> = {
  edges?: Resolver<Array<ResolversTypes['FeedArticleEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeedEdgeResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FeedEdge'] = ResolversParentTypes['FeedEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Feed'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeedsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FeedsError'] = ResolversParentTypes['FeedsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['FeedsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FeedsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FeedsResult'] = ResolversParentTypes['FeedsResult']> = {
  __resolveType: TypeResolveFn<'FeedsError' | 'FeedsSuccess', ParentType, ContextType>;
};

export type FeedsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FeedsSuccess'] = ResolversParentTypes['FeedsSuccess']> = {
  edges?: Resolver<Array<ResolversTypes['FeedEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FetchContentErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FetchContentError'] = ResolversParentTypes['FetchContentError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['FetchContentErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FetchContentResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FetchContentResult'] = ResolversParentTypes['FetchContentResult']> = {
  __resolveType: TypeResolveFn<'FetchContentError' | 'FetchContentSuccess', ParentType, ContextType>;
};

export type FetchContentSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FetchContentSuccess'] = ResolversParentTypes['FetchContentSuccess']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FilterResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Filter'] = ResolversParentTypes['Filter']> = {
  category?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  defaultFilter?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  filter?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  folder?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  visible?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FiltersErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FiltersError'] = ResolversParentTypes['FiltersError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['FiltersErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FiltersResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FiltersResult'] = ResolversParentTypes['FiltersResult']> = {
  __resolveType: TypeResolveFn<'FiltersError' | 'FiltersSuccess', ParentType, ContextType>;
};

export type FiltersSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FiltersSuccess'] = ResolversParentTypes['FiltersSuccess']> = {
  filters?: Resolver<Array<ResolversTypes['Filter']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FolderPoliciesErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FolderPoliciesError'] = ResolversParentTypes['FolderPoliciesError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['FolderPoliciesErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FolderPoliciesResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FolderPoliciesResult'] = ResolversParentTypes['FolderPoliciesResult']> = {
  __resolveType: TypeResolveFn<'FolderPoliciesError' | 'FolderPoliciesSuccess', ParentType, ContextType>;
};

export type FolderPoliciesSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FolderPoliciesSuccess'] = ResolversParentTypes['FolderPoliciesSuccess']> = {
  policies?: Resolver<Array<ResolversTypes['FolderPolicy']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FolderPolicyResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['FolderPolicy'] = ResolversParentTypes['FolderPolicy']> = {
  action?: Resolver<ResolversTypes['FolderPolicyAction'], ParentType, ContextType>;
  afterDays?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  folder?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GenerateApiKeyErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GenerateApiKeyError'] = ResolversParentTypes['GenerateApiKeyError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['GenerateApiKeyErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GenerateApiKeyResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GenerateApiKeyResult'] = ResolversParentTypes['GenerateApiKeyResult']> = {
  __resolveType: TypeResolveFn<'GenerateApiKeyError' | 'GenerateApiKeySuccess', ParentType, ContextType>;
};

export type GenerateApiKeySuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GenerateApiKeySuccess'] = ResolversParentTypes['GenerateApiKeySuccess']> = {
  apiKey?: Resolver<ResolversTypes['ApiKey'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetDiscoverFeedArticleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetDiscoverFeedArticleError'] = ResolversParentTypes['GetDiscoverFeedArticleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['GetDiscoverFeedArticleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetDiscoverFeedArticleResultsResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetDiscoverFeedArticleResults'] = ResolversParentTypes['GetDiscoverFeedArticleResults']> = {
  __resolveType: TypeResolveFn<'GetDiscoverFeedArticleError' | 'GetDiscoverFeedArticleSuccess', ParentType, ContextType>;
};

export type GetDiscoverFeedArticleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetDiscoverFeedArticleSuccess'] = ResolversParentTypes['GetDiscoverFeedArticleSuccess']> = {
  discoverArticles?: Resolver<Maybe<Array<Maybe<ResolversTypes['DiscoverFeedArticle']>>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetDiscoverTopicErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetDiscoverTopicError'] = ResolversParentTypes['GetDiscoverTopicError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['GetDiscoverTopicErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetDiscoverTopicResultsResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetDiscoverTopicResults'] = ResolversParentTypes['GetDiscoverTopicResults']> = {
  __resolveType: TypeResolveFn<'GetDiscoverTopicError' | 'GetDiscoverTopicSuccess', ParentType, ContextType>;
};

export type GetDiscoverTopicSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetDiscoverTopicSuccess'] = ResolversParentTypes['GetDiscoverTopicSuccess']> = {
  discoverTopics?: Resolver<Maybe<Array<ResolversTypes['DiscoverTopic']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetFollowersErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetFollowersError'] = ResolversParentTypes['GetFollowersError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['GetFollowersErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GetFollowersResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GetFollowersResult'] = ResolversParentTypes['GetFollowersResult']> = {
  __resolveType: TypeResolveFn<'GetFollowersError' | 'GetFollowersSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'GetFollowingError' | 'GetFollowingSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'GetUserPersonalizationError' | 'GetUserPersonalizationSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'GoogleSignupError' | 'GoogleSignupSuccess', ParentType, ContextType>;
};

export type GoogleSignupSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GoogleSignupSuccess'] = ResolversParentTypes['GoogleSignupSuccess']> = {
  me?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GroupsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GroupsError'] = ResolversParentTypes['GroupsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['GroupsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GroupsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GroupsResult'] = ResolversParentTypes['GroupsResult']> = {
  __resolveType: TypeResolveFn<'GroupsError' | 'GroupsSuccess', ParentType, ContextType>;
};

export type GroupsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['GroupsSuccess'] = ResolversParentTypes['GroupsSuccess']> = {
  groups?: Resolver<Array<ResolversTypes['RecommendationGroup']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HiddenHomeSectionErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HiddenHomeSectionError'] = ResolversParentTypes['HiddenHomeSectionError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['HiddenHomeSectionErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HiddenHomeSectionResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HiddenHomeSectionResult'] = ResolversParentTypes['HiddenHomeSectionResult']> = {
  __resolveType: TypeResolveFn<'HiddenHomeSectionError' | 'HiddenHomeSectionSuccess', ParentType, ContextType>;
};

export type HiddenHomeSectionSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HiddenHomeSectionSuccess'] = ResolversParentTypes['HiddenHomeSectionSuccess']> = {
  section?: Resolver<Maybe<ResolversTypes['HomeSection']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HighlightResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Highlight'] = ResolversParentTypes['Highlight']> = {
  annotation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  createdByMe?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  highlightPositionAnchorIndex?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  highlightPositionPercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  html?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  labels?: Resolver<Maybe<Array<ResolversTypes['Label']>>, ParentType, ContextType>;
  libraryItem?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  patch?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  prefix?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  quote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reactions?: Resolver<Array<ResolversTypes['Reaction']>, ParentType, ContextType>;
  replies?: Resolver<Array<ResolversTypes['HighlightReply']>, ParentType, ContextType>;
  representation?: Resolver<ResolversTypes['RepresentationType'], ParentType, ContextType>;
  sharedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  shortId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  suffix?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['HighlightType'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HighlightEdgeResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HighlightEdge'] = ResolversParentTypes['HighlightEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Highlight'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HighlightReplyResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HighlightReply'] = ResolversParentTypes['HighlightReply']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  highlight?: Resolver<ResolversTypes['Highlight'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HighlightStatsResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HighlightStats'] = ResolversParentTypes['HighlightStats']> = {
  highlightCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HighlightsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HighlightsError'] = ResolversParentTypes['HighlightsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['HighlightsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HighlightsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HighlightsResult'] = ResolversParentTypes['HighlightsResult']> = {
  __resolveType: TypeResolveFn<'HighlightsError' | 'HighlightsSuccess', ParentType, ContextType>;
};

export type HighlightsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HighlightsSuccess'] = ResolversParentTypes['HighlightsSuccess']> = {
  edges?: Resolver<Array<ResolversTypes['HighlightEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HomeEdgeResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HomeEdge'] = ResolversParentTypes['HomeEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['HomeSection'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HomeErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HomeError'] = ResolversParentTypes['HomeError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['HomeErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HomeItemResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HomeItem'] = ResolversParentTypes['HomeItem']> = {
  author?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  broadcastCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  canArchive?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  canComment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  canDelete?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  canMove?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  canSave?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  canShare?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  dir?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  likeCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  previewContent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  saveCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  score?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  seen_at?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  slug?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes['HomeItemSource']>, ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  wordCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HomeItemSourceResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HomeItemSource'] = ResolversParentTypes['HomeItemSource']> = {
  icon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['HomeItemSourceType'], ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HomeResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HomeResult'] = ResolversParentTypes['HomeResult']> = {
  __resolveType: TypeResolveFn<'HomeError' | 'HomeSuccess', ParentType, ContextType>;
};

export type HomeSectionResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HomeSection'] = ResolversParentTypes['HomeSection']> = {
  items?: Resolver<Array<ResolversTypes['HomeItem']>, ParentType, ContextType>;
  layout?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HomeSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['HomeSuccess'] = ResolversParentTypes['HomeSuccess']> = {
  edges?: Resolver<Array<ResolversTypes['HomeEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImportFromIntegrationErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ImportFromIntegrationError'] = ResolversParentTypes['ImportFromIntegrationError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['ImportFromIntegrationErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImportFromIntegrationResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ImportFromIntegrationResult'] = ResolversParentTypes['ImportFromIntegrationResult']> = {
  __resolveType: TypeResolveFn<'ImportFromIntegrationError' | 'ImportFromIntegrationSuccess', ParentType, ContextType>;
};

export type ImportFromIntegrationSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ImportFromIntegrationSuccess'] = ResolversParentTypes['ImportFromIntegrationSuccess']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IntegrationResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Integration'] = ResolversParentTypes['Integration']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  settings?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  taskName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['IntegrationType'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IntegrationErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['IntegrationError'] = ResolversParentTypes['IntegrationError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['IntegrationErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IntegrationResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['IntegrationResult'] = ResolversParentTypes['IntegrationResult']> = {
  __resolveType: TypeResolveFn<'IntegrationError' | 'IntegrationSuccess', ParentType, ContextType>;
};

export type IntegrationSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['IntegrationSuccess'] = ResolversParentTypes['IntegrationSuccess']> = {
  integration?: Resolver<ResolversTypes['Integration'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IntegrationsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['IntegrationsError'] = ResolversParentTypes['IntegrationsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['IntegrationsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type IntegrationsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['IntegrationsResult'] = ResolversParentTypes['IntegrationsResult']> = {
  __resolveType: TypeResolveFn<'IntegrationsError' | 'IntegrationsSuccess', ParentType, ContextType>;
};

export type IntegrationsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['IntegrationsSuccess'] = ResolversParentTypes['IntegrationsSuccess']> = {
  integrations?: Resolver<Array<ResolversTypes['Integration']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type JoinGroupErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['JoinGroupError'] = ResolversParentTypes['JoinGroupError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['JoinGroupErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type JoinGroupResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['JoinGroupResult'] = ResolversParentTypes['JoinGroupResult']> = {
  __resolveType: TypeResolveFn<'JoinGroupError' | 'JoinGroupSuccess', ParentType, ContextType>;
};

export type JoinGroupSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['JoinGroupSuccess'] = ResolversParentTypes['JoinGroupSuccess']> = {
  group?: Resolver<ResolversTypes['RecommendationGroup'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LabelResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Label'] = ResolversParentTypes['Label']> = {
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  internal?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  position?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LabelsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LabelsError'] = ResolversParentTypes['LabelsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['LabelsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LabelsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LabelsResult'] = ResolversParentTypes['LabelsResult']> = {
  __resolveType: TypeResolveFn<'LabelsError' | 'LabelsSuccess', ParentType, ContextType>;
};

export type LabelsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LabelsSuccess'] = ResolversParentTypes['LabelsSuccess']> = {
  labels?: Resolver<Array<ResolversTypes['Label']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LeaveGroupErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LeaveGroupError'] = ResolversParentTypes['LeaveGroupError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['LeaveGroupErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LeaveGroupResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LeaveGroupResult'] = ResolversParentTypes['LeaveGroupResult']> = {
  __resolveType: TypeResolveFn<'LeaveGroupError' | 'LeaveGroupSuccess', ParentType, ContextType>;
};

export type LeaveGroupSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LeaveGroupSuccess'] = ResolversParentTypes['LeaveGroupSuccess']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LinkResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Link'] = ResolversParentTypes['Link']> = {
  highlightStats?: Resolver<ResolversTypes['HighlightStats'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  page?: Resolver<ResolversTypes['Page'], ParentType, ContextType>;
  postedByViewer?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  readState?: Resolver<ResolversTypes['ReadState'], ParentType, ContextType>;
  savedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  savedBy?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  savedByViewer?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  shareInfo?: Resolver<ResolversTypes['LinkShareInfo'], ParentType, ContextType>;
  shareStats?: Resolver<ResolversTypes['ShareStats'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LinkShareInfoResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LinkShareInfo'] = ResolversParentTypes['LinkShareInfo']> = {
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  imageUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LogOutErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LogOutError'] = ResolversParentTypes['LogOutError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['LogOutErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type LogOutResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LogOutResult'] = ResolversParentTypes['LogOutResult']> = {
  __resolveType: TypeResolveFn<'LogOutError' | 'LogOutSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'LoginError' | 'LoginSuccess', ParentType, ContextType>;
};

export type LoginSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['LoginSuccess'] = ResolversParentTypes['LoginSuccess']> = {
  me?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MarkEmailAsItemErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MarkEmailAsItemError'] = ResolversParentTypes['MarkEmailAsItemError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['MarkEmailAsItemErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MarkEmailAsItemResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MarkEmailAsItemResult'] = ResolversParentTypes['MarkEmailAsItemResult']> = {
  __resolveType: TypeResolveFn<'MarkEmailAsItemError' | 'MarkEmailAsItemSuccess', ParentType, ContextType>;
};

export type MarkEmailAsItemSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MarkEmailAsItemSuccess'] = ResolversParentTypes['MarkEmailAsItemSuccess']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MergeHighlightErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MergeHighlightError'] = ResolversParentTypes['MergeHighlightError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['MergeHighlightErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MergeHighlightResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MergeHighlightResult'] = ResolversParentTypes['MergeHighlightResult']> = {
  __resolveType: TypeResolveFn<'MergeHighlightError' | 'MergeHighlightSuccess', ParentType, ContextType>;
};

export type MergeHighlightSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MergeHighlightSuccess'] = ResolversParentTypes['MergeHighlightSuccess']> = {
  highlight?: Resolver<ResolversTypes['Highlight'], ParentType, ContextType>;
  overlapHighlightIdList?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MoveFilterErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MoveFilterError'] = ResolversParentTypes['MoveFilterError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['MoveFilterErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MoveFilterResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MoveFilterResult'] = ResolversParentTypes['MoveFilterResult']> = {
  __resolveType: TypeResolveFn<'MoveFilterError' | 'MoveFilterSuccess', ParentType, ContextType>;
};

export type MoveFilterSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MoveFilterSuccess'] = ResolversParentTypes['MoveFilterSuccess']> = {
  filter?: Resolver<ResolversTypes['Filter'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MoveLabelErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MoveLabelError'] = ResolversParentTypes['MoveLabelError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['MoveLabelErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MoveLabelResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MoveLabelResult'] = ResolversParentTypes['MoveLabelResult']> = {
  __resolveType: TypeResolveFn<'MoveLabelError' | 'MoveLabelSuccess', ParentType, ContextType>;
};

export type MoveLabelSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MoveLabelSuccess'] = ResolversParentTypes['MoveLabelSuccess']> = {
  label?: Resolver<ResolversTypes['Label'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MoveToFolderErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MoveToFolderError'] = ResolversParentTypes['MoveToFolderError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['MoveToFolderErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MoveToFolderResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MoveToFolderResult'] = ResolversParentTypes['MoveToFolderResult']> = {
  __resolveType: TypeResolveFn<'MoveToFolderError' | 'MoveToFolderSuccess', ParentType, ContextType>;
};

export type MoveToFolderSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['MoveToFolderSuccess'] = ResolversParentTypes['MoveToFolderSuccess']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addDiscoverFeed?: Resolver<ResolversTypes['AddDiscoverFeedResult'], ParentType, ContextType, RequireFields<MutationAddDiscoverFeedArgs, 'input'>>;
  addPopularRead?: Resolver<ResolversTypes['AddPopularReadResult'], ParentType, ContextType, RequireFields<MutationAddPopularReadArgs, 'name'>>;
  bulkAction?: Resolver<ResolversTypes['BulkActionResult'], ParentType, ContextType, RequireFields<MutationBulkActionArgs, 'action' | 'query'>>;
  createArticle?: Resolver<ResolversTypes['CreateArticleResult'], ParentType, ContextType, RequireFields<MutationCreateArticleArgs, 'input'>>;
  createArticleSavingRequest?: Resolver<ResolversTypes['CreateArticleSavingRequestResult'], ParentType, ContextType, RequireFields<MutationCreateArticleSavingRequestArgs, 'input'>>;
  createFolderPolicy?: Resolver<ResolversTypes['CreateFolderPolicyResult'], ParentType, ContextType, RequireFields<MutationCreateFolderPolicyArgs, 'input'>>;
  createGroup?: Resolver<ResolversTypes['CreateGroupResult'], ParentType, ContextType, RequireFields<MutationCreateGroupArgs, 'input'>>;
  createHighlight?: Resolver<ResolversTypes['CreateHighlightResult'], ParentType, ContextType, RequireFields<MutationCreateHighlightArgs, 'input'>>;
  createLabel?: Resolver<ResolversTypes['CreateLabelResult'], ParentType, ContextType, RequireFields<MutationCreateLabelArgs, 'input'>>;
  createNewsletterEmail?: Resolver<ResolversTypes['CreateNewsletterEmailResult'], ParentType, ContextType, Partial<MutationCreateNewsletterEmailArgs>>;
  deleteAccount?: Resolver<ResolversTypes['DeleteAccountResult'], ParentType, ContextType, RequireFields<MutationDeleteAccountArgs, 'userID'>>;
  deleteDiscoverArticle?: Resolver<ResolversTypes['DeleteDiscoverArticleResult'], ParentType, ContextType, RequireFields<MutationDeleteDiscoverArticleArgs, 'input'>>;
  deleteDiscoverFeed?: Resolver<ResolversTypes['DeleteDiscoverFeedResult'], ParentType, ContextType, RequireFields<MutationDeleteDiscoverFeedArgs, 'input'>>;
  deleteFilter?: Resolver<ResolversTypes['DeleteFilterResult'], ParentType, ContextType, RequireFields<MutationDeleteFilterArgs, 'id'>>;
  deleteFolderPolicy?: Resolver<ResolversTypes['DeleteFolderPolicyResult'], ParentType, ContextType, RequireFields<MutationDeleteFolderPolicyArgs, 'id'>>;
  deleteHighlight?: Resolver<ResolversTypes['DeleteHighlightResult'], ParentType, ContextType, RequireFields<MutationDeleteHighlightArgs, 'highlightId'>>;
  deleteIntegration?: Resolver<ResolversTypes['DeleteIntegrationResult'], ParentType, ContextType, RequireFields<MutationDeleteIntegrationArgs, 'id'>>;
  deleteLabel?: Resolver<ResolversTypes['DeleteLabelResult'], ParentType, ContextType, RequireFields<MutationDeleteLabelArgs, 'id'>>;
  deleteNewsletterEmail?: Resolver<ResolversTypes['DeleteNewsletterEmailResult'], ParentType, ContextType, RequireFields<MutationDeleteNewsletterEmailArgs, 'newsletterEmailId'>>;
  deleteRule?: Resolver<ResolversTypes['DeleteRuleResult'], ParentType, ContextType, RequireFields<MutationDeleteRuleArgs, 'id'>>;
  deleteWebhook?: Resolver<ResolversTypes['DeleteWebhookResult'], ParentType, ContextType, RequireFields<MutationDeleteWebhookArgs, 'id'>>;
  editDiscoverFeed?: Resolver<ResolversTypes['EditDiscoverFeedResult'], ParentType, ContextType, RequireFields<MutationEditDiscoverFeedArgs, 'input'>>;
  emptyTrash?: Resolver<ResolversTypes['EmptyTrashResult'], ParentType, ContextType>;
  exportToIntegration?: Resolver<ResolversTypes['ExportToIntegrationResult'], ParentType, ContextType, RequireFields<MutationExportToIntegrationArgs, 'integrationId'>>;
  fetchContent?: Resolver<ResolversTypes['FetchContentResult'], ParentType, ContextType, RequireFields<MutationFetchContentArgs, 'id'>>;
  generateApiKey?: Resolver<ResolversTypes['GenerateApiKeyResult'], ParentType, ContextType, RequireFields<MutationGenerateApiKeyArgs, 'input'>>;
  googleLogin?: Resolver<ResolversTypes['LoginResult'], ParentType, ContextType, RequireFields<MutationGoogleLoginArgs, 'input'>>;
  googleSignup?: Resolver<ResolversTypes['GoogleSignupResult'], ParentType, ContextType, RequireFields<MutationGoogleSignupArgs, 'input'>>;
  importFromIntegration?: Resolver<ResolversTypes['ImportFromIntegrationResult'], ParentType, ContextType, RequireFields<MutationImportFromIntegrationArgs, 'integrationId'>>;
  joinGroup?: Resolver<ResolversTypes['JoinGroupResult'], ParentType, ContextType, RequireFields<MutationJoinGroupArgs, 'inviteCode'>>;
  leaveGroup?: Resolver<ResolversTypes['LeaveGroupResult'], ParentType, ContextType, RequireFields<MutationLeaveGroupArgs, 'groupId'>>;
  logOut?: Resolver<ResolversTypes['LogOutResult'], ParentType, ContextType>;
  markEmailAsItem?: Resolver<ResolversTypes['MarkEmailAsItemResult'], ParentType, ContextType, RequireFields<MutationMarkEmailAsItemArgs, 'recentEmailId'>>;
  mergeHighlight?: Resolver<ResolversTypes['MergeHighlightResult'], ParentType, ContextType, RequireFields<MutationMergeHighlightArgs, 'input'>>;
  moveFilter?: Resolver<ResolversTypes['MoveFilterResult'], ParentType, ContextType, RequireFields<MutationMoveFilterArgs, 'input'>>;
  moveLabel?: Resolver<ResolversTypes['MoveLabelResult'], ParentType, ContextType, RequireFields<MutationMoveLabelArgs, 'input'>>;
  moveToFolder?: Resolver<ResolversTypes['MoveToFolderResult'], ParentType, ContextType, RequireFields<MutationMoveToFolderArgs, 'folder' | 'id'>>;
  optInFeature?: Resolver<ResolversTypes['OptInFeatureResult'], ParentType, ContextType, RequireFields<MutationOptInFeatureArgs, 'input'>>;
  recommend?: Resolver<ResolversTypes['RecommendResult'], ParentType, ContextType, RequireFields<MutationRecommendArgs, 'input'>>;
  recommendHighlights?: Resolver<ResolversTypes['RecommendHighlightsResult'], ParentType, ContextType, RequireFields<MutationRecommendHighlightsArgs, 'input'>>;
  refreshHome?: Resolver<ResolversTypes['RefreshHomeResult'], ParentType, ContextType>;
  replyToEmail?: Resolver<ResolversTypes['ReplyToEmailResult'], ParentType, ContextType, RequireFields<MutationReplyToEmailArgs, 'recentEmailId' | 'reply'>>;
  reportItem?: Resolver<ResolversTypes['ReportItemResult'], ParentType, ContextType, RequireFields<MutationReportItemArgs, 'input'>>;
  revokeApiKey?: Resolver<ResolversTypes['RevokeApiKeyResult'], ParentType, ContextType, RequireFields<MutationRevokeApiKeyArgs, 'id'>>;
  saveArticleReadingProgress?: Resolver<ResolversTypes['SaveArticleReadingProgressResult'], ParentType, ContextType, RequireFields<MutationSaveArticleReadingProgressArgs, 'input'>>;
  saveDiscoverArticle?: Resolver<ResolversTypes['SaveDiscoverArticleResult'], ParentType, ContextType, RequireFields<MutationSaveDiscoverArticleArgs, 'input'>>;
  saveFile?: Resolver<ResolversTypes['SaveResult'], ParentType, ContextType, RequireFields<MutationSaveFileArgs, 'input'>>;
  saveFilter?: Resolver<ResolversTypes['SaveFilterResult'], ParentType, ContextType, RequireFields<MutationSaveFilterArgs, 'input'>>;
  savePage?: Resolver<ResolversTypes['SaveResult'], ParentType, ContextType, RequireFields<MutationSavePageArgs, 'input'>>;
  saveUrl?: Resolver<ResolversTypes['SaveResult'], ParentType, ContextType, RequireFields<MutationSaveUrlArgs, 'input'>>;
  setBookmarkArticle?: Resolver<ResolversTypes['SetBookmarkArticleResult'], ParentType, ContextType, RequireFields<MutationSetBookmarkArticleArgs, 'input'>>;
  setDeviceToken?: Resolver<ResolversTypes['SetDeviceTokenResult'], ParentType, ContextType, RequireFields<MutationSetDeviceTokenArgs, 'input'>>;
  setFavoriteArticle?: Resolver<ResolversTypes['SetFavoriteArticleResult'], ParentType, ContextType, RequireFields<MutationSetFavoriteArticleArgs, 'id'>>;
  setIntegration?: Resolver<ResolversTypes['SetIntegrationResult'], ParentType, ContextType, RequireFields<MutationSetIntegrationArgs, 'input'>>;
  setLabels?: Resolver<ResolversTypes['SetLabelsResult'], ParentType, ContextType, RequireFields<MutationSetLabelsArgs, 'input'>>;
  setLabelsForHighlight?: Resolver<ResolversTypes['SetLabelsResult'], ParentType, ContextType, RequireFields<MutationSetLabelsForHighlightArgs, 'input'>>;
  setLinkArchived?: Resolver<ResolversTypes['ArchiveLinkResult'], ParentType, ContextType, RequireFields<MutationSetLinkArchivedArgs, 'input'>>;
  setRule?: Resolver<ResolversTypes['SetRuleResult'], ParentType, ContextType, RequireFields<MutationSetRuleArgs, 'input'>>;
  setUserPersonalization?: Resolver<ResolversTypes['SetUserPersonalizationResult'], ParentType, ContextType, RequireFields<MutationSetUserPersonalizationArgs, 'input'>>;
  setWebhook?: Resolver<ResolversTypes['SetWebhookResult'], ParentType, ContextType, RequireFields<MutationSetWebhookArgs, 'input'>>;
  subscribe?: Resolver<ResolversTypes['SubscribeResult'], ParentType, ContextType, RequireFields<MutationSubscribeArgs, 'input'>>;
  unsubscribe?: Resolver<ResolversTypes['UnsubscribeResult'], ParentType, ContextType, RequireFields<MutationUnsubscribeArgs, 'name'>>;
  updateEmail?: Resolver<ResolversTypes['UpdateEmailResult'], ParentType, ContextType, RequireFields<MutationUpdateEmailArgs, 'input'>>;
  updateFilter?: Resolver<ResolversTypes['UpdateFilterResult'], ParentType, ContextType, RequireFields<MutationUpdateFilterArgs, 'input'>>;
  updateFolderPolicy?: Resolver<ResolversTypes['UpdateFolderPolicyResult'], ParentType, ContextType, RequireFields<MutationUpdateFolderPolicyArgs, 'input'>>;
  updateHighlight?: Resolver<ResolversTypes['UpdateHighlightResult'], ParentType, ContextType, RequireFields<MutationUpdateHighlightArgs, 'input'>>;
  updateLabel?: Resolver<ResolversTypes['UpdateLabelResult'], ParentType, ContextType, RequireFields<MutationUpdateLabelArgs, 'input'>>;
  updateNewsletterEmail?: Resolver<ResolversTypes['UpdateNewsletterEmailResult'], ParentType, ContextType, RequireFields<MutationUpdateNewsletterEmailArgs, 'input'>>;
  updatePage?: Resolver<ResolversTypes['UpdatePageResult'], ParentType, ContextType, RequireFields<MutationUpdatePageArgs, 'input'>>;
  updateSubscription?: Resolver<ResolversTypes['UpdateSubscriptionResult'], ParentType, ContextType, RequireFields<MutationUpdateSubscriptionArgs, 'input'>>;
  updateUser?: Resolver<ResolversTypes['UpdateUserResult'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'input'>>;
  updateUserProfile?: Resolver<ResolversTypes['UpdateUserProfileResult'], ParentType, ContextType, RequireFields<MutationUpdateUserProfileArgs, 'input'>>;
  uploadFileRequest?: Resolver<ResolversTypes['UploadFileRequestResult'], ParentType, ContextType, RequireFields<MutationUploadFileRequestArgs, 'input'>>;
  uploadImportFile?: Resolver<ResolversTypes['UploadImportFileResult'], ParentType, ContextType, RequireFields<MutationUploadImportFileArgs, 'contentType' | 'type'>>;
};

export type NewsletterEmailResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['NewsletterEmail'] = ResolversParentTypes['NewsletterEmail']> = {
  address?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  confirmationCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  folder?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subscriptionCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NewsletterEmailsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['NewsletterEmailsError'] = ResolversParentTypes['NewsletterEmailsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['NewsletterEmailsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NewsletterEmailsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['NewsletterEmailsResult'] = ResolversParentTypes['NewsletterEmailsResult']> = {
  __resolveType: TypeResolveFn<'NewsletterEmailsError' | 'NewsletterEmailsSuccess', ParentType, ContextType>;
};

export type NewsletterEmailsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['NewsletterEmailsSuccess'] = ResolversParentTypes['NewsletterEmailsSuccess']> = {
  newsletterEmails?: Resolver<Array<ResolversTypes['NewsletterEmail']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OptInFeatureErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['OptInFeatureError'] = ResolversParentTypes['OptInFeatureError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['OptInFeatureErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OptInFeatureResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['OptInFeatureResult'] = ResolversParentTypes['OptInFeatureResult']> = {
  __resolveType: TypeResolveFn<'OptInFeatureError' | 'OptInFeatureSuccess', ParentType, ContextType>;
};

export type OptInFeatureSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['OptInFeatureSuccess'] = ResolversParentTypes['OptInFeatureSuccess']> = {
  feature?: Resolver<ResolversTypes['Feature'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Page'] = ResolversParentTypes['Page']> = {
  author?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hash?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  originalHtml?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  originalUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  readableHtml?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['PageType'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PageInfoResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  hasPreviousPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ProfileResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Profile'] = ResolversParentTypes['Profile']> = {
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  pictureUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  private?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  apiKeys?: Resolver<ResolversTypes['ApiKeysResult'], ParentType, ContextType>;
  article?: Resolver<ResolversTypes['ArticleResult'], ParentType, ContextType, RequireFields<QueryArticleArgs, 'slug' | 'username'>>;
  articleSavingRequest?: Resolver<ResolversTypes['ArticleSavingRequestResult'], ParentType, ContextType, Partial<QueryArticleSavingRequestArgs>>;
  deviceTokens?: Resolver<ResolversTypes['DeviceTokensResult'], ParentType, ContextType>;
  discoverFeeds?: Resolver<ResolversTypes['DiscoverFeedResult'], ParentType, ContextType>;
  discoverTopics?: Resolver<ResolversTypes['GetDiscoverTopicResults'], ParentType, ContextType>;
  feeds?: Resolver<ResolversTypes['FeedsResult'], ParentType, ContextType, RequireFields<QueryFeedsArgs, 'input'>>;
  filters?: Resolver<ResolversTypes['FiltersResult'], ParentType, ContextType>;
  folderPolicies?: Resolver<ResolversTypes['FolderPoliciesResult'], ParentType, ContextType>;
  getDiscoverFeedArticles?: Resolver<ResolversTypes['GetDiscoverFeedArticleResults'], ParentType, ContextType, RequireFields<QueryGetDiscoverFeedArticlesArgs, 'discoverTopicId'>>;
  getUserPersonalization?: Resolver<ResolversTypes['GetUserPersonalizationResult'], ParentType, ContextType>;
  groups?: Resolver<ResolversTypes['GroupsResult'], ParentType, ContextType>;
  hello?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hiddenHomeSection?: Resolver<ResolversTypes['HiddenHomeSectionResult'], ParentType, ContextType>;
  highlights?: Resolver<ResolversTypes['HighlightsResult'], ParentType, ContextType, Partial<QueryHighlightsArgs>>;
  home?: Resolver<ResolversTypes['HomeResult'], ParentType, ContextType, Partial<QueryHomeArgs>>;
  integration?: Resolver<ResolversTypes['IntegrationResult'], ParentType, ContextType, RequireFields<QueryIntegrationArgs, 'name'>>;
  integrations?: Resolver<ResolversTypes['IntegrationsResult'], ParentType, ContextType>;
  labels?: Resolver<ResolversTypes['LabelsResult'], ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  newsletterEmails?: Resolver<ResolversTypes['NewsletterEmailsResult'], ParentType, ContextType>;
  recentEmails?: Resolver<ResolversTypes['RecentEmailsResult'], ParentType, ContextType>;
  recentSearches?: Resolver<ResolversTypes['RecentSearchesResult'], ParentType, ContextType>;
  rules?: Resolver<ResolversTypes['RulesResult'], ParentType, ContextType, Partial<QueryRulesArgs>>;
  scanFeeds?: Resolver<ResolversTypes['ScanFeedsResult'], ParentType, ContextType, RequireFields<QueryScanFeedsArgs, 'input'>>;
  search?: Resolver<ResolversTypes['SearchResult'], ParentType, ContextType, Partial<QuerySearchArgs>>;
  sendInstallInstructions?: Resolver<ResolversTypes['SendInstallInstructionsResult'], ParentType, ContextType>;
  subscription?: Resolver<ResolversTypes['SubscriptionResult'], ParentType, ContextType, RequireFields<QuerySubscriptionArgs, 'id'>>;
  subscriptions?: Resolver<ResolversTypes['SubscriptionsResult'], ParentType, ContextType, Partial<QuerySubscriptionsArgs>>;
  typeaheadSearch?: Resolver<ResolversTypes['TypeaheadSearchResult'], ParentType, ContextType, RequireFields<QueryTypeaheadSearchArgs, 'query'>>;
  updatesSince?: Resolver<ResolversTypes['UpdatesSinceResult'], ParentType, ContextType, RequireFields<QueryUpdatesSinceArgs, 'since'>>;
  user?: Resolver<ResolversTypes['UserResult'], ParentType, ContextType, Partial<QueryUserArgs>>;
  users?: Resolver<ResolversTypes['UsersResult'], ParentType, ContextType>;
  validateUsername?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<QueryValidateUsernameArgs, 'username'>>;
  webhook?: Resolver<ResolversTypes['WebhookResult'], ParentType, ContextType, RequireFields<QueryWebhookArgs, 'id'>>;
  webhooks?: Resolver<ResolversTypes['WebhooksResult'], ParentType, ContextType>;
};

export type ReactionResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Reaction'] = ResolversParentTypes['Reaction']> = {
  code?: Resolver<ResolversTypes['ReactionType'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReadStateResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReadState'] = ResolversParentTypes['ReadState']> = {
  progressAnchorIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  progressPercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  reading?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  readingTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecentEmailResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecentEmail'] = ResolversParentTypes['RecentEmail']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  from?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  html?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  reply?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  replyTo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  subject?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  text?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecentEmailsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecentEmailsError'] = ResolversParentTypes['RecentEmailsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['RecentEmailsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecentEmailsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecentEmailsResult'] = ResolversParentTypes['RecentEmailsResult']> = {
  __resolveType: TypeResolveFn<'RecentEmailsError' | 'RecentEmailsSuccess', ParentType, ContextType>;
};

export type RecentEmailsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecentEmailsSuccess'] = ResolversParentTypes['RecentEmailsSuccess']> = {
  recentEmails?: Resolver<Array<ResolversTypes['RecentEmail']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecentSearchResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecentSearch'] = ResolversParentTypes['RecentSearch']> = {
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  term?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecentSearchesErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecentSearchesError'] = ResolversParentTypes['RecentSearchesError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['RecentSearchesErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecentSearchesResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecentSearchesResult'] = ResolversParentTypes['RecentSearchesResult']> = {
  __resolveType: TypeResolveFn<'RecentSearchesError' | 'RecentSearchesSuccess', ParentType, ContextType>;
};

export type RecentSearchesSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecentSearchesSuccess'] = ResolversParentTypes['RecentSearchesSuccess']> = {
  searches?: Resolver<Array<ResolversTypes['RecentSearch']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecommendErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecommendError'] = ResolversParentTypes['RecommendError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['RecommendErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecommendHighlightsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecommendHighlightsError'] = ResolversParentTypes['RecommendHighlightsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['RecommendHighlightsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecommendHighlightsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecommendHighlightsResult'] = ResolversParentTypes['RecommendHighlightsResult']> = {
  __resolveType: TypeResolveFn<'RecommendHighlightsError' | 'RecommendHighlightsSuccess', ParentType, ContextType>;
};

export type RecommendHighlightsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecommendHighlightsSuccess'] = ResolversParentTypes['RecommendHighlightsSuccess']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecommendResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecommendResult'] = ResolversParentTypes['RecommendResult']> = {
  __resolveType: TypeResolveFn<'RecommendError' | 'RecommendSuccess', ParentType, ContextType>;
};

export type RecommendSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecommendSuccess'] = ResolversParentTypes['RecommendSuccess']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecommendationResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Recommendation'] = ResolversParentTypes['Recommendation']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  note?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  recommendedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['RecommendingUser']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecommendationGroupResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecommendationGroup'] = ResolversParentTypes['RecommendationGroup']> = {
  admins?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  canPost?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  canSeeMembers?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  inviteUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  members?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  topics?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecommendingUserResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RecommendingUser'] = ResolversParentTypes['RecommendingUser']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  profileImageURL?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RefreshHomeErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RefreshHomeError'] = ResolversParentTypes['RefreshHomeError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['RefreshHomeErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RefreshHomeResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RefreshHomeResult'] = ResolversParentTypes['RefreshHomeResult']> = {
  __resolveType: TypeResolveFn<'RefreshHomeError' | 'RefreshHomeSuccess', ParentType, ContextType>;
};

export type RefreshHomeSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RefreshHomeSuccess'] = ResolversParentTypes['RefreshHomeSuccess']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReminderResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Reminder'] = ResolversParentTypes['Reminder']> = {
  archiveUntil?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  remindAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  sendNotification?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReminderErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReminderError'] = ResolversParentTypes['ReminderError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['ReminderErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReminderResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReminderResult'] = ResolversParentTypes['ReminderResult']> = {
  __resolveType: TypeResolveFn<'ReminderError' | 'ReminderSuccess', ParentType, ContextType>;
};

export type ReminderSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReminderSuccess'] = ResolversParentTypes['ReminderSuccess']> = {
  reminder?: Resolver<ResolversTypes['Reminder'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReplyToEmailErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReplyToEmailError'] = ResolversParentTypes['ReplyToEmailError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['ReplyToEmailErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReplyToEmailResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReplyToEmailResult'] = ResolversParentTypes['ReplyToEmailResult']> = {
  __resolveType: TypeResolveFn<'ReplyToEmailError' | 'ReplyToEmailSuccess', ParentType, ContextType>;
};

export type ReplyToEmailSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReplyToEmailSuccess'] = ResolversParentTypes['ReplyToEmailSuccess']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ReportItemResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ReportItemResult'] = ResolversParentTypes['ReportItemResult']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RevokeApiKeyErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RevokeApiKeyError'] = ResolversParentTypes['RevokeApiKeyError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['RevokeApiKeyErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RevokeApiKeyResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RevokeApiKeyResult'] = ResolversParentTypes['RevokeApiKeyResult']> = {
  __resolveType: TypeResolveFn<'RevokeApiKeyError' | 'RevokeApiKeySuccess', ParentType, ContextType>;
};

export type RevokeApiKeySuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RevokeApiKeySuccess'] = ResolversParentTypes['RevokeApiKeySuccess']> = {
  apiKey?: Resolver<ResolversTypes['ApiKey'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RuleResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Rule'] = ResolversParentTypes['Rule']> = {
  actions?: Resolver<Array<ResolversTypes['RuleAction']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  eventTypes?: Resolver<Array<ResolversTypes['RuleEventType']>, ParentType, ContextType>;
  failedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  filter?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RuleActionResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RuleAction'] = ResolversParentTypes['RuleAction']> = {
  params?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['RuleActionType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RulesErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RulesError'] = ResolversParentTypes['RulesError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['RulesErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RulesResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RulesResult'] = ResolversParentTypes['RulesResult']> = {
  __resolveType: TypeResolveFn<'RulesError' | 'RulesSuccess', ParentType, ContextType>;
};

export type RulesSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['RulesSuccess'] = ResolversParentTypes['RulesSuccess']> = {
  rules?: Resolver<Array<ResolversTypes['Rule']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SaveArticleReadingProgressErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveArticleReadingProgressError'] = ResolversParentTypes['SaveArticleReadingProgressError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SaveArticleReadingProgressErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SaveArticleReadingProgressResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveArticleReadingProgressResult'] = ResolversParentTypes['SaveArticleReadingProgressResult']> = {
  __resolveType: TypeResolveFn<'SaveArticleReadingProgressError' | 'SaveArticleReadingProgressSuccess', ParentType, ContextType>;
};

export type SaveArticleReadingProgressSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveArticleReadingProgressSuccess'] = ResolversParentTypes['SaveArticleReadingProgressSuccess']> = {
  updatedArticle?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SaveDiscoverArticleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveDiscoverArticleError'] = ResolversParentTypes['SaveDiscoverArticleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SaveDiscoverArticleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SaveDiscoverArticleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveDiscoverArticleResult'] = ResolversParentTypes['SaveDiscoverArticleResult']> = {
  __resolveType: TypeResolveFn<'SaveDiscoverArticleError' | 'SaveDiscoverArticleSuccess', ParentType, ContextType>;
};

export type SaveDiscoverArticleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveDiscoverArticleSuccess'] = ResolversParentTypes['SaveDiscoverArticleSuccess']> = {
  saveId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SaveErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveError'] = ResolversParentTypes['SaveError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SaveErrorCode']>, ParentType, ContextType>;
  message?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SaveFilterErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveFilterError'] = ResolversParentTypes['SaveFilterError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SaveFilterErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SaveFilterResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveFilterResult'] = ResolversParentTypes['SaveFilterResult']> = {
  __resolveType: TypeResolveFn<'SaveFilterError' | 'SaveFilterSuccess', ParentType, ContextType>;
};

export type SaveFilterSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveFilterSuccess'] = ResolversParentTypes['SaveFilterSuccess']> = {
  filter?: Resolver<ResolversTypes['Filter'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SaveResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveResult'] = ResolversParentTypes['SaveResult']> = {
  __resolveType: TypeResolveFn<'SaveError' | 'SaveSuccess', ParentType, ContextType>;
};

export type SaveSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SaveSuccess'] = ResolversParentTypes['SaveSuccess']> = {
  clientRequestId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ScanFeedsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ScanFeedsError'] = ResolversParentTypes['ScanFeedsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['ScanFeedsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ScanFeedsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ScanFeedsResult'] = ResolversParentTypes['ScanFeedsResult']> = {
  __resolveType: TypeResolveFn<'ScanFeedsError' | 'ScanFeedsSuccess', ParentType, ContextType>;
};

export type ScanFeedsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ScanFeedsSuccess'] = ResolversParentTypes['ScanFeedsSuccess']> = {
  feeds?: Resolver<Array<ResolversTypes['Feed']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SearchError'] = ResolversParentTypes['SearchError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SearchErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchItemResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SearchItem'] = ResolversParentTypes['SearchItem']> = {
  aiSummary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  annotation?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  archivedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  author?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  content?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  contentReader?: Resolver<ResolversTypes['ContentReader'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  directionality?: Resolver<Maybe<ResolversTypes['DirectionalityType']>, ParentType, ContextType>;
  feedContent?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  folder?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  format?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  highlights?: Resolver<Maybe<Array<ResolversTypes['Highlight']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isArchived?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  labels?: Resolver<Maybe<Array<ResolversTypes['Label']>>, ParentType, ContextType>;
  language?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  links?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  originalArticleUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ownedByViewer?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  pageId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  pageType?: Resolver<ResolversTypes['PageType'], ParentType, ContextType>;
  previewContentType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  publishedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  quote?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  readAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  readingProgressAnchorIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  readingProgressPercent?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  readingProgressTopPercent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  recommendations?: Resolver<Maybe<Array<ResolversTypes['Recommendation']>>, ParentType, ContextType>;
  savedAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  score?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  seenAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  shortId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  siteIcon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  siteName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['ArticleSavingRequestStatus']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unsubHttpUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unsubMailTo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  uploadFileId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  wordsCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchItemEdgeResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SearchItemEdge'] = ResolversParentTypes['SearchItemEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['SearchItem'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SearchResult'] = ResolversParentTypes['SearchResult']> = {
  __resolveType: TypeResolveFn<'SearchError' | 'SearchSuccess', ParentType, ContextType>;
};

export type SearchSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SearchSuccess'] = ResolversParentTypes['SearchSuccess']> = {
  edges?: Resolver<Array<ResolversTypes['SearchItemEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SendInstallInstructionsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SendInstallInstructionsError'] = ResolversParentTypes['SendInstallInstructionsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SendInstallInstructionsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SendInstallInstructionsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SendInstallInstructionsResult'] = ResolversParentTypes['SendInstallInstructionsResult']> = {
  __resolveType: TypeResolveFn<'SendInstallInstructionsError' | 'SendInstallInstructionsSuccess', ParentType, ContextType>;
};

export type SendInstallInstructionsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SendInstallInstructionsSuccess'] = ResolversParentTypes['SendInstallInstructionsSuccess']> = {
  sent?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetBookmarkArticleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetBookmarkArticleError'] = ResolversParentTypes['SetBookmarkArticleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetBookmarkArticleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetBookmarkArticleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetBookmarkArticleResult'] = ResolversParentTypes['SetBookmarkArticleResult']> = {
  __resolveType: TypeResolveFn<'SetBookmarkArticleError' | 'SetBookmarkArticleSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'SetDeviceTokenError' | 'SetDeviceTokenSuccess', ParentType, ContextType>;
};

export type SetDeviceTokenSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetDeviceTokenSuccess'] = ResolversParentTypes['SetDeviceTokenSuccess']> = {
  deviceToken?: Resolver<ResolversTypes['DeviceToken'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetFavoriteArticleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetFavoriteArticleError'] = ResolversParentTypes['SetFavoriteArticleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetFavoriteArticleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetFavoriteArticleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetFavoriteArticleResult'] = ResolversParentTypes['SetFavoriteArticleResult']> = {
  __resolveType: TypeResolveFn<'SetFavoriteArticleError' | 'SetFavoriteArticleSuccess', ParentType, ContextType>;
};

export type SetFavoriteArticleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetFavoriteArticleSuccess'] = ResolversParentTypes['SetFavoriteArticleSuccess']> = {
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetFollowErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetFollowError'] = ResolversParentTypes['SetFollowError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetFollowErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetFollowResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetFollowResult'] = ResolversParentTypes['SetFollowResult']> = {
  __resolveType: TypeResolveFn<'SetFollowError' | 'SetFollowSuccess', ParentType, ContextType>;
};

export type SetFollowSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetFollowSuccess'] = ResolversParentTypes['SetFollowSuccess']> = {
  updatedUser?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetIntegrationErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetIntegrationError'] = ResolversParentTypes['SetIntegrationError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetIntegrationErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetIntegrationResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetIntegrationResult'] = ResolversParentTypes['SetIntegrationResult']> = {
  __resolveType: TypeResolveFn<'SetIntegrationError' | 'SetIntegrationSuccess', ParentType, ContextType>;
};

export type SetIntegrationSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetIntegrationSuccess'] = ResolversParentTypes['SetIntegrationSuccess']> = {
  integration?: Resolver<ResolversTypes['Integration'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetLabelsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetLabelsError'] = ResolversParentTypes['SetLabelsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetLabelsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetLabelsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetLabelsResult'] = ResolversParentTypes['SetLabelsResult']> = {
  __resolveType: TypeResolveFn<'SetLabelsError' | 'SetLabelsSuccess', ParentType, ContextType>;
};

export type SetLabelsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetLabelsSuccess'] = ResolversParentTypes['SetLabelsSuccess']> = {
  labels?: Resolver<Array<ResolversTypes['Label']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetRuleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetRuleError'] = ResolversParentTypes['SetRuleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetRuleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetRuleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetRuleResult'] = ResolversParentTypes['SetRuleResult']> = {
  __resolveType: TypeResolveFn<'SetRuleError' | 'SetRuleSuccess', ParentType, ContextType>;
};

export type SetRuleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetRuleSuccess'] = ResolversParentTypes['SetRuleSuccess']> = {
  rule?: Resolver<ResolversTypes['Rule'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetShareArticleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetShareArticleError'] = ResolversParentTypes['SetShareArticleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetShareArticleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetShareArticleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetShareArticleResult'] = ResolversParentTypes['SetShareArticleResult']> = {
  __resolveType: TypeResolveFn<'SetShareArticleError' | 'SetShareArticleSuccess', ParentType, ContextType>;
};

export type SetShareArticleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetShareArticleSuccess'] = ResolversParentTypes['SetShareArticleSuccess']> = {
  updatedArticle?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  updatedFeedArticle?: Resolver<Maybe<ResolversTypes['FeedArticle']>, ParentType, ContextType>;
  updatedFeedArticleId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetShareHighlightErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetShareHighlightError'] = ResolversParentTypes['SetShareHighlightError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetShareHighlightErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetShareHighlightResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetShareHighlightResult'] = ResolversParentTypes['SetShareHighlightResult']> = {
  __resolveType: TypeResolveFn<'SetShareHighlightError' | 'SetShareHighlightSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'SetUserPersonalizationError' | 'SetUserPersonalizationSuccess', ParentType, ContextType>;
};

export type SetUserPersonalizationSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetUserPersonalizationSuccess'] = ResolversParentTypes['SetUserPersonalizationSuccess']> = {
  updatedUserPersonalization?: Resolver<ResolversTypes['UserPersonalization'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetWebhookErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetWebhookError'] = ResolversParentTypes['SetWebhookError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SetWebhookErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SetWebhookResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetWebhookResult'] = ResolversParentTypes['SetWebhookResult']> = {
  __resolveType: TypeResolveFn<'SetWebhookError' | 'SetWebhookSuccess', ParentType, ContextType>;
};

export type SetWebhookSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SetWebhookSuccess'] = ResolversParentTypes['SetWebhookSuccess']> = {
  webhook?: Resolver<ResolversTypes['Webhook'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShareStatsResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['ShareStats'] = ResolversParentTypes['ShareStats']> = {
  readDuration?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  saveCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  viewCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SharedArticleErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SharedArticleError'] = ResolversParentTypes['SharedArticleError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SharedArticleErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SharedArticleResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SharedArticleResult'] = ResolversParentTypes['SharedArticleResult']> = {
  __resolveType: TypeResolveFn<'SharedArticleError' | 'SharedArticleSuccess', ParentType, ContextType>;
};

export type SharedArticleSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SharedArticleSuccess'] = ResolversParentTypes['SharedArticleSuccess']> = {
  article?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscribeErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SubscribeError'] = ResolversParentTypes['SubscribeError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SubscribeErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscribeResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SubscribeResult'] = ResolversParentTypes['SubscribeResult']> = {
  __resolveType: TypeResolveFn<'SubscribeError' | 'SubscribeSuccess', ParentType, ContextType>;
};

export type SubscribeSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SubscribeSuccess'] = ResolversParentTypes['SubscribeSuccess']> = {
  subscriptions?: Resolver<Array<ResolversTypes['Subscription']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = {
  autoAddToLibrary?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  failedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  fetchContent?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  fetchContentType?: Resolver<ResolversTypes['FetchContentType'], ParentType, ContextType>;
  folder?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  icon?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isPrivate?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lastFetchedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  mostRecentItemDate?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  newsletterEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refreshedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SubscriptionStatus'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['SubscriptionType'], ParentType, ContextType>;
  unsubscribeHttpUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  unsubscribeMailTo?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SubscriptionError'] = ResolversParentTypes['SubscriptionError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['ErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SubscriptionResult'] = ResolversParentTypes['SubscriptionResult']> = {
  __resolveType: TypeResolveFn<'SubscriptionError' | 'SubscriptionSuccess', ParentType, ContextType>;
};

export type SubscriptionRootTypeResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SubscriptionRootType'] = ResolversParentTypes['SubscriptionRootType']> = {
  hello?: SubscriptionResolver<Maybe<ResolversTypes['String']>, "hello", ParentType, ContextType>;
};

export type SubscriptionSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SubscriptionSuccess'] = ResolversParentTypes['SubscriptionSuccess']> = {
  subscription?: Resolver<ResolversTypes['Subscription'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionsErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SubscriptionsError'] = ResolversParentTypes['SubscriptionsError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['SubscriptionsErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubscriptionsResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SubscriptionsResult'] = ResolversParentTypes['SubscriptionsResult']> = {
  __resolveType: TypeResolveFn<'SubscriptionsError' | 'SubscriptionsSuccess', ParentType, ContextType>;
};

export type SubscriptionsSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SubscriptionsSuccess'] = ResolversParentTypes['SubscriptionsSuccess']> = {
  subscriptions?: Resolver<Array<ResolversTypes['Subscription']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SyncUpdatedItemEdgeResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['SyncUpdatedItemEdge'] = ResolversParentTypes['SyncUpdatedItemEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  itemID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  node?: Resolver<Maybe<ResolversTypes['SearchItem']>, ParentType, ContextType>;
  updateReason?: Resolver<ResolversTypes['UpdateReason'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TaskResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Task'] = ResolversParentTypes['Task']> = {
  cancellable?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  failedReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  progress?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  runningTime?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  state?: Resolver<ResolversTypes['TaskState'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TypeaheadSearchErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['TypeaheadSearchError'] = ResolversParentTypes['TypeaheadSearchError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['TypeaheadSearchErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TypeaheadSearchItemResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['TypeaheadSearchItem'] = ResolversParentTypes['TypeaheadSearchItem']> = {
  contentReader?: Resolver<ResolversTypes['ContentReader'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  siteName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TypeaheadSearchResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['TypeaheadSearchResult'] = ResolversParentTypes['TypeaheadSearchResult']> = {
  __resolveType: TypeResolveFn<'TypeaheadSearchError' | 'TypeaheadSearchSuccess', ParentType, ContextType>;
};

export type TypeaheadSearchSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['TypeaheadSearchSuccess'] = ResolversParentTypes['TypeaheadSearchSuccess']> = {
  items?: Resolver<Array<ResolversTypes['TypeaheadSearchItem']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UnsubscribeErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UnsubscribeError'] = ResolversParentTypes['UnsubscribeError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UnsubscribeErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UnsubscribeResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UnsubscribeResult'] = ResolversParentTypes['UnsubscribeResult']> = {
  __resolveType: TypeResolveFn<'UnsubscribeError' | 'UnsubscribeSuccess', ParentType, ContextType>;
};

export type UnsubscribeSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UnsubscribeSuccess'] = ResolversParentTypes['UnsubscribeSuccess']> = {
  subscription?: Resolver<ResolversTypes['Subscription'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateEmailErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateEmailError'] = ResolversParentTypes['UpdateEmailError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateEmailErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateEmailResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateEmailResult'] = ResolversParentTypes['UpdateEmailResult']> = {
  __resolveType: TypeResolveFn<'UpdateEmailError' | 'UpdateEmailSuccess', ParentType, ContextType>;
};

export type UpdateEmailSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateEmailSuccess'] = ResolversParentTypes['UpdateEmailSuccess']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  verificationEmailSent?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateFilterErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateFilterError'] = ResolversParentTypes['UpdateFilterError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateFilterErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateFilterResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateFilterResult'] = ResolversParentTypes['UpdateFilterResult']> = {
  __resolveType: TypeResolveFn<'UpdateFilterError' | 'UpdateFilterSuccess', ParentType, ContextType>;
};

export type UpdateFilterSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateFilterSuccess'] = ResolversParentTypes['UpdateFilterSuccess']> = {
  filter?: Resolver<ResolversTypes['Filter'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateFolderPolicyErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateFolderPolicyError'] = ResolversParentTypes['UpdateFolderPolicyError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateFolderPolicyErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateFolderPolicyResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateFolderPolicyResult'] = ResolversParentTypes['UpdateFolderPolicyResult']> = {
  __resolveType: TypeResolveFn<'UpdateFolderPolicyError' | 'UpdateFolderPolicySuccess', ParentType, ContextType>;
};

export type UpdateFolderPolicySuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateFolderPolicySuccess'] = ResolversParentTypes['UpdateFolderPolicySuccess']> = {
  policy?: Resolver<ResolversTypes['FolderPolicy'], ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'UpdateHighlightReplyError' | 'UpdateHighlightReplySuccess', ParentType, ContextType>;
};

export type UpdateHighlightReplySuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateHighlightReplySuccess'] = ResolversParentTypes['UpdateHighlightReplySuccess']> = {
  highlightReply?: Resolver<ResolversTypes['HighlightReply'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateHighlightResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateHighlightResult'] = ResolversParentTypes['UpdateHighlightResult']> = {
  __resolveType: TypeResolveFn<'UpdateHighlightError' | 'UpdateHighlightSuccess', ParentType, ContextType>;
};

export type UpdateHighlightSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateHighlightSuccess'] = ResolversParentTypes['UpdateHighlightSuccess']> = {
  highlight?: Resolver<ResolversTypes['Highlight'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateLabelErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateLabelError'] = ResolversParentTypes['UpdateLabelError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateLabelErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateLabelResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateLabelResult'] = ResolversParentTypes['UpdateLabelResult']> = {
  __resolveType: TypeResolveFn<'UpdateLabelError' | 'UpdateLabelSuccess', ParentType, ContextType>;
};

export type UpdateLabelSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateLabelSuccess'] = ResolversParentTypes['UpdateLabelSuccess']> = {
  label?: Resolver<ResolversTypes['Label'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateLinkShareInfoErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateLinkShareInfoError'] = ResolversParentTypes['UpdateLinkShareInfoError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateLinkShareInfoErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateLinkShareInfoResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateLinkShareInfoResult'] = ResolversParentTypes['UpdateLinkShareInfoResult']> = {
  __resolveType: TypeResolveFn<'UpdateLinkShareInfoError' | 'UpdateLinkShareInfoSuccess', ParentType, ContextType>;
};

export type UpdateLinkShareInfoSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateLinkShareInfoSuccess'] = ResolversParentTypes['UpdateLinkShareInfoSuccess']> = {
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateNewsletterEmailErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateNewsletterEmailError'] = ResolversParentTypes['UpdateNewsletterEmailError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateNewsletterEmailErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateNewsletterEmailResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateNewsletterEmailResult'] = ResolversParentTypes['UpdateNewsletterEmailResult']> = {
  __resolveType: TypeResolveFn<'UpdateNewsletterEmailError' | 'UpdateNewsletterEmailSuccess', ParentType, ContextType>;
};

export type UpdateNewsletterEmailSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateNewsletterEmailSuccess'] = ResolversParentTypes['UpdateNewsletterEmailSuccess']> = {
  newsletterEmail?: Resolver<ResolversTypes['NewsletterEmail'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatePageErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdatePageError'] = ResolversParentTypes['UpdatePageError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdatePageErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatePageResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdatePageResult'] = ResolversParentTypes['UpdatePageResult']> = {
  __resolveType: TypeResolveFn<'UpdatePageError' | 'UpdatePageSuccess', ParentType, ContextType>;
};

export type UpdatePageSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdatePageSuccess'] = ResolversParentTypes['UpdatePageSuccess']> = {
  updatedPage?: Resolver<ResolversTypes['Article'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateReminderErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateReminderError'] = ResolversParentTypes['UpdateReminderError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateReminderErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateReminderResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateReminderResult'] = ResolversParentTypes['UpdateReminderResult']> = {
  __resolveType: TypeResolveFn<'UpdateReminderError' | 'UpdateReminderSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'UpdateSharedCommentError' | 'UpdateSharedCommentSuccess', ParentType, ContextType>;
};

export type UpdateSharedCommentSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateSharedCommentSuccess'] = ResolversParentTypes['UpdateSharedCommentSuccess']> = {
  articleID?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  sharedComment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateSubscriptionErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateSubscriptionError'] = ResolversParentTypes['UpdateSubscriptionError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdateSubscriptionErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateSubscriptionResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateSubscriptionResult'] = ResolversParentTypes['UpdateSubscriptionResult']> = {
  __resolveType: TypeResolveFn<'UpdateSubscriptionError' | 'UpdateSubscriptionSuccess', ParentType, ContextType>;
};

export type UpdateSubscriptionSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateSubscriptionSuccess'] = ResolversParentTypes['UpdateSubscriptionSuccess']> = {
  subscription?: Resolver<ResolversTypes['Subscription'], ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'UpdateUserProfileError' | 'UpdateUserProfileSuccess', ParentType, ContextType>;
};

export type UpdateUserProfileSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateUserProfileSuccess'] = ResolversParentTypes['UpdateUserProfileSuccess']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdateUserResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateUserResult'] = ResolversParentTypes['UpdateUserResult']> = {
  __resolveType: TypeResolveFn<'UpdateUserError' | 'UpdateUserSuccess', ParentType, ContextType>;
};

export type UpdateUserSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdateUserSuccess'] = ResolversParentTypes['UpdateUserSuccess']> = {
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatesSinceErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdatesSinceError'] = ResolversParentTypes['UpdatesSinceError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UpdatesSinceErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UpdatesSinceResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdatesSinceResult'] = ResolversParentTypes['UpdatesSinceResult']> = {
  __resolveType: TypeResolveFn<'UpdatesSinceError' | 'UpdatesSinceSuccess', ParentType, ContextType>;
};

export type UpdatesSinceSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UpdatesSinceSuccess'] = ResolversParentTypes['UpdatesSinceSuccess']> = {
  edges?: Resolver<Array<ResolversTypes['SyncUpdatedItemEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UploadFileRequestErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UploadFileRequestError'] = ResolversParentTypes['UploadFileRequestError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UploadFileRequestErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UploadFileRequestResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UploadFileRequestResult'] = ResolversParentTypes['UploadFileRequestResult']> = {
  __resolveType: TypeResolveFn<'UploadFileRequestError' | 'UploadFileRequestSuccess', ParentType, ContextType>;
};

export type UploadFileRequestSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UploadFileRequestSuccess'] = ResolversParentTypes['UploadFileRequestSuccess']> = {
  createdPageId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  uploadFileId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  uploadSignedUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UploadImportFileErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UploadImportFileError'] = ResolversParentTypes['UploadImportFileError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UploadImportFileErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UploadImportFileResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UploadImportFileResult'] = ResolversParentTypes['UploadImportFileResult']> = {
  __resolveType: TypeResolveFn<'UploadImportFileError' | 'UploadImportFileSuccess', ParentType, ContextType>;
};

export type UploadImportFileSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UploadImportFileSuccess'] = ResolversParentTypes['UploadImportFileSuccess']> = {
  uploadSignedUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  featureList?: Resolver<Maybe<Array<ResolversTypes['Feature']>>, ParentType, ContextType>;
  features?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  followersCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  friendsCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  intercomHash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isFriend?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isFullUser?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  picture?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  profile?: Resolver<ResolversTypes['Profile'], ParentType, ContextType>;
  sharedArticles?: Resolver<Array<ResolversTypes['FeedArticle']>, ParentType, ContextType>;
  sharedArticlesCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sharedHighlightsCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sharedNotesCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  viewerIsFollowing?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UserError'] = ResolversParentTypes['UserError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['UserErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserPersonalizationResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UserPersonalization'] = ResolversParentTypes['UserPersonalization']> = {
  digestConfig?: Resolver<Maybe<ResolversTypes['DigestConfig']>, ParentType, ContextType>;
  fields?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  fontFamily?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  fontSize?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  libraryLayoutType?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  librarySortOrder?: Resolver<Maybe<ResolversTypes['SortOrder']>, ParentType, ContextType>;
  margin?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  speechRate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  speechSecondaryVoice?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  speechVoice?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  speechVolume?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  theme?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UserResult'] = ResolversParentTypes['UserResult']> = {
  __resolveType: TypeResolveFn<'UserError' | 'UserSuccess', ParentType, ContextType>;
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
  __resolveType: TypeResolveFn<'UsersError' | 'UsersSuccess', ParentType, ContextType>;
};

export type UsersSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['UsersSuccess'] = ResolversParentTypes['UsersSuccess']> = {
  users?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WebhookResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['Webhook'] = ResolversParentTypes['Webhook']> = {
  contentType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['Date'], ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  eventTypes?: Resolver<Array<ResolversTypes['WebhookEvent']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  method?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['Date']>, ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WebhookErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['WebhookError'] = ResolversParentTypes['WebhookError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['WebhookErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WebhookResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['WebhookResult'] = ResolversParentTypes['WebhookResult']> = {
  __resolveType: TypeResolveFn<'WebhookError' | 'WebhookSuccess', ParentType, ContextType>;
};

export type WebhookSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['WebhookSuccess'] = ResolversParentTypes['WebhookSuccess']> = {
  webhook?: Resolver<ResolversTypes['Webhook'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WebhooksErrorResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['WebhooksError'] = ResolversParentTypes['WebhooksError']> = {
  errorCodes?: Resolver<Array<ResolversTypes['WebhooksErrorCode']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WebhooksResultResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['WebhooksResult'] = ResolversParentTypes['WebhooksResult']> = {
  __resolveType: TypeResolveFn<'WebhooksError' | 'WebhooksSuccess', ParentType, ContextType>;
};

export type WebhooksSuccessResolvers<ContextType = ResolverContext, ParentType extends ResolversParentTypes['WebhooksSuccess'] = ResolversParentTypes['WebhooksSuccess']> = {
  webhooks?: Resolver<Array<ResolversTypes['Webhook']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = ResolverContext> = {
  AddDiscoverFeedError?: AddDiscoverFeedErrorResolvers<ContextType>;
  AddDiscoverFeedResult?: AddDiscoverFeedResultResolvers<ContextType>;
  AddDiscoverFeedSuccess?: AddDiscoverFeedSuccessResolvers<ContextType>;
  AddPopularReadError?: AddPopularReadErrorResolvers<ContextType>;
  AddPopularReadResult?: AddPopularReadResultResolvers<ContextType>;
  AddPopularReadSuccess?: AddPopularReadSuccessResolvers<ContextType>;
  ApiKey?: ApiKeyResolvers<ContextType>;
  ApiKeysError?: ApiKeysErrorResolvers<ContextType>;
  ApiKeysResult?: ApiKeysResultResolvers<ContextType>;
  ApiKeysSuccess?: ApiKeysSuccessResolvers<ContextType>;
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
  BulkActionError?: BulkActionErrorResolvers<ContextType>;
  BulkActionResult?: BulkActionResultResolvers<ContextType>;
  BulkActionSuccess?: BulkActionSuccessResolvers<ContextType>;
  CreateArticleError?: CreateArticleErrorResolvers<ContextType>;
  CreateArticleResult?: CreateArticleResultResolvers<ContextType>;
  CreateArticleSavingRequestError?: CreateArticleSavingRequestErrorResolvers<ContextType>;
  CreateArticleSavingRequestResult?: CreateArticleSavingRequestResultResolvers<ContextType>;
  CreateArticleSavingRequestSuccess?: CreateArticleSavingRequestSuccessResolvers<ContextType>;
  CreateArticleSuccess?: CreateArticleSuccessResolvers<ContextType>;
  CreateFolderPolicyError?: CreateFolderPolicyErrorResolvers<ContextType>;
  CreateFolderPolicyResult?: CreateFolderPolicyResultResolvers<ContextType>;
  CreateFolderPolicySuccess?: CreateFolderPolicySuccessResolvers<ContextType>;
  CreateGroupError?: CreateGroupErrorResolvers<ContextType>;
  CreateGroupResult?: CreateGroupResultResolvers<ContextType>;
  CreateGroupSuccess?: CreateGroupSuccessResolvers<ContextType>;
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
  DeleteAccountError?: DeleteAccountErrorResolvers<ContextType>;
  DeleteAccountResult?: DeleteAccountResultResolvers<ContextType>;
  DeleteAccountSuccess?: DeleteAccountSuccessResolvers<ContextType>;
  DeleteDiscoverArticleError?: DeleteDiscoverArticleErrorResolvers<ContextType>;
  DeleteDiscoverArticleResult?: DeleteDiscoverArticleResultResolvers<ContextType>;
  DeleteDiscoverArticleSuccess?: DeleteDiscoverArticleSuccessResolvers<ContextType>;
  DeleteDiscoverFeedError?: DeleteDiscoverFeedErrorResolvers<ContextType>;
  DeleteDiscoverFeedResult?: DeleteDiscoverFeedResultResolvers<ContextType>;
  DeleteDiscoverFeedSuccess?: DeleteDiscoverFeedSuccessResolvers<ContextType>;
  DeleteFilterError?: DeleteFilterErrorResolvers<ContextType>;
  DeleteFilterResult?: DeleteFilterResultResolvers<ContextType>;
  DeleteFilterSuccess?: DeleteFilterSuccessResolvers<ContextType>;
  DeleteFolderPolicyError?: DeleteFolderPolicyErrorResolvers<ContextType>;
  DeleteFolderPolicyResult?: DeleteFolderPolicyResultResolvers<ContextType>;
  DeleteFolderPolicySuccess?: DeleteFolderPolicySuccessResolvers<ContextType>;
  DeleteHighlightError?: DeleteHighlightErrorResolvers<ContextType>;
  DeleteHighlightReplyError?: DeleteHighlightReplyErrorResolvers<ContextType>;
  DeleteHighlightReplyResult?: DeleteHighlightReplyResultResolvers<ContextType>;
  DeleteHighlightReplySuccess?: DeleteHighlightReplySuccessResolvers<ContextType>;
  DeleteHighlightResult?: DeleteHighlightResultResolvers<ContextType>;
  DeleteHighlightSuccess?: DeleteHighlightSuccessResolvers<ContextType>;
  DeleteIntegrationError?: DeleteIntegrationErrorResolvers<ContextType>;
  DeleteIntegrationResult?: DeleteIntegrationResultResolvers<ContextType>;
  DeleteIntegrationSuccess?: DeleteIntegrationSuccessResolvers<ContextType>;
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
  DeleteRuleError?: DeleteRuleErrorResolvers<ContextType>;
  DeleteRuleResult?: DeleteRuleResultResolvers<ContextType>;
  DeleteRuleSuccess?: DeleteRuleSuccessResolvers<ContextType>;
  DeleteWebhookError?: DeleteWebhookErrorResolvers<ContextType>;
  DeleteWebhookResult?: DeleteWebhookResultResolvers<ContextType>;
  DeleteWebhookSuccess?: DeleteWebhookSuccessResolvers<ContextType>;
  DeviceToken?: DeviceTokenResolvers<ContextType>;
  DeviceTokensError?: DeviceTokensErrorResolvers<ContextType>;
  DeviceTokensResult?: DeviceTokensResultResolvers<ContextType>;
  DeviceTokensSuccess?: DeviceTokensSuccessResolvers<ContextType>;
  DigestConfig?: DigestConfigResolvers<ContextType>;
  DiscoverFeed?: DiscoverFeedResolvers<ContextType>;
  DiscoverFeedArticle?: DiscoverFeedArticleResolvers<ContextType>;
  DiscoverFeedError?: DiscoverFeedErrorResolvers<ContextType>;
  DiscoverFeedResult?: DiscoverFeedResultResolvers<ContextType>;
  DiscoverFeedSuccess?: DiscoverFeedSuccessResolvers<ContextType>;
  DiscoverTopic?: DiscoverTopicResolvers<ContextType>;
  EditDiscoverFeedError?: EditDiscoverFeedErrorResolvers<ContextType>;
  EditDiscoverFeedResult?: EditDiscoverFeedResultResolvers<ContextType>;
  EditDiscoverFeedSuccess?: EditDiscoverFeedSuccessResolvers<ContextType>;
  EmptyTrashError?: EmptyTrashErrorResolvers<ContextType>;
  EmptyTrashResult?: EmptyTrashResultResolvers<ContextType>;
  EmptyTrashSuccess?: EmptyTrashSuccessResolvers<ContextType>;
  ExportToIntegrationError?: ExportToIntegrationErrorResolvers<ContextType>;
  ExportToIntegrationResult?: ExportToIntegrationResultResolvers<ContextType>;
  ExportToIntegrationSuccess?: ExportToIntegrationSuccessResolvers<ContextType>;
  Feature?: FeatureResolvers<ContextType>;
  Feed?: FeedResolvers<ContextType>;
  FeedArticle?: FeedArticleResolvers<ContextType>;
  FeedArticleEdge?: FeedArticleEdgeResolvers<ContextType>;
  FeedArticlesError?: FeedArticlesErrorResolvers<ContextType>;
  FeedArticlesResult?: FeedArticlesResultResolvers<ContextType>;
  FeedArticlesSuccess?: FeedArticlesSuccessResolvers<ContextType>;
  FeedEdge?: FeedEdgeResolvers<ContextType>;
  FeedsError?: FeedsErrorResolvers<ContextType>;
  FeedsResult?: FeedsResultResolvers<ContextType>;
  FeedsSuccess?: FeedsSuccessResolvers<ContextType>;
  FetchContentError?: FetchContentErrorResolvers<ContextType>;
  FetchContentResult?: FetchContentResultResolvers<ContextType>;
  FetchContentSuccess?: FetchContentSuccessResolvers<ContextType>;
  Filter?: FilterResolvers<ContextType>;
  FiltersError?: FiltersErrorResolvers<ContextType>;
  FiltersResult?: FiltersResultResolvers<ContextType>;
  FiltersSuccess?: FiltersSuccessResolvers<ContextType>;
  FolderPoliciesError?: FolderPoliciesErrorResolvers<ContextType>;
  FolderPoliciesResult?: FolderPoliciesResultResolvers<ContextType>;
  FolderPoliciesSuccess?: FolderPoliciesSuccessResolvers<ContextType>;
  FolderPolicy?: FolderPolicyResolvers<ContextType>;
  GenerateApiKeyError?: GenerateApiKeyErrorResolvers<ContextType>;
  GenerateApiKeyResult?: GenerateApiKeyResultResolvers<ContextType>;
  GenerateApiKeySuccess?: GenerateApiKeySuccessResolvers<ContextType>;
  GetDiscoverFeedArticleError?: GetDiscoverFeedArticleErrorResolvers<ContextType>;
  GetDiscoverFeedArticleResults?: GetDiscoverFeedArticleResultsResolvers<ContextType>;
  GetDiscoverFeedArticleSuccess?: GetDiscoverFeedArticleSuccessResolvers<ContextType>;
  GetDiscoverTopicError?: GetDiscoverTopicErrorResolvers<ContextType>;
  GetDiscoverTopicResults?: GetDiscoverTopicResultsResolvers<ContextType>;
  GetDiscoverTopicSuccess?: GetDiscoverTopicSuccessResolvers<ContextType>;
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
  GroupsError?: GroupsErrorResolvers<ContextType>;
  GroupsResult?: GroupsResultResolvers<ContextType>;
  GroupsSuccess?: GroupsSuccessResolvers<ContextType>;
  HiddenHomeSectionError?: HiddenHomeSectionErrorResolvers<ContextType>;
  HiddenHomeSectionResult?: HiddenHomeSectionResultResolvers<ContextType>;
  HiddenHomeSectionSuccess?: HiddenHomeSectionSuccessResolvers<ContextType>;
  Highlight?: HighlightResolvers<ContextType>;
  HighlightEdge?: HighlightEdgeResolvers<ContextType>;
  HighlightReply?: HighlightReplyResolvers<ContextType>;
  HighlightStats?: HighlightStatsResolvers<ContextType>;
  HighlightsError?: HighlightsErrorResolvers<ContextType>;
  HighlightsResult?: HighlightsResultResolvers<ContextType>;
  HighlightsSuccess?: HighlightsSuccessResolvers<ContextType>;
  HomeEdge?: HomeEdgeResolvers<ContextType>;
  HomeError?: HomeErrorResolvers<ContextType>;
  HomeItem?: HomeItemResolvers<ContextType>;
  HomeItemSource?: HomeItemSourceResolvers<ContextType>;
  HomeResult?: HomeResultResolvers<ContextType>;
  HomeSection?: HomeSectionResolvers<ContextType>;
  HomeSuccess?: HomeSuccessResolvers<ContextType>;
  ImportFromIntegrationError?: ImportFromIntegrationErrorResolvers<ContextType>;
  ImportFromIntegrationResult?: ImportFromIntegrationResultResolvers<ContextType>;
  ImportFromIntegrationSuccess?: ImportFromIntegrationSuccessResolvers<ContextType>;
  Integration?: IntegrationResolvers<ContextType>;
  IntegrationError?: IntegrationErrorResolvers<ContextType>;
  IntegrationResult?: IntegrationResultResolvers<ContextType>;
  IntegrationSuccess?: IntegrationSuccessResolvers<ContextType>;
  IntegrationsError?: IntegrationsErrorResolvers<ContextType>;
  IntegrationsResult?: IntegrationsResultResolvers<ContextType>;
  IntegrationsSuccess?: IntegrationsSuccessResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  JoinGroupError?: JoinGroupErrorResolvers<ContextType>;
  JoinGroupResult?: JoinGroupResultResolvers<ContextType>;
  JoinGroupSuccess?: JoinGroupSuccessResolvers<ContextType>;
  Label?: LabelResolvers<ContextType>;
  LabelsError?: LabelsErrorResolvers<ContextType>;
  LabelsResult?: LabelsResultResolvers<ContextType>;
  LabelsSuccess?: LabelsSuccessResolvers<ContextType>;
  LeaveGroupError?: LeaveGroupErrorResolvers<ContextType>;
  LeaveGroupResult?: LeaveGroupResultResolvers<ContextType>;
  LeaveGroupSuccess?: LeaveGroupSuccessResolvers<ContextType>;
  Link?: LinkResolvers<ContextType>;
  LinkShareInfo?: LinkShareInfoResolvers<ContextType>;
  LogOutError?: LogOutErrorResolvers<ContextType>;
  LogOutResult?: LogOutResultResolvers<ContextType>;
  LogOutSuccess?: LogOutSuccessResolvers<ContextType>;
  LoginError?: LoginErrorResolvers<ContextType>;
  LoginResult?: LoginResultResolvers<ContextType>;
  LoginSuccess?: LoginSuccessResolvers<ContextType>;
  MarkEmailAsItemError?: MarkEmailAsItemErrorResolvers<ContextType>;
  MarkEmailAsItemResult?: MarkEmailAsItemResultResolvers<ContextType>;
  MarkEmailAsItemSuccess?: MarkEmailAsItemSuccessResolvers<ContextType>;
  MergeHighlightError?: MergeHighlightErrorResolvers<ContextType>;
  MergeHighlightResult?: MergeHighlightResultResolvers<ContextType>;
  MergeHighlightSuccess?: MergeHighlightSuccessResolvers<ContextType>;
  MoveFilterError?: MoveFilterErrorResolvers<ContextType>;
  MoveFilterResult?: MoveFilterResultResolvers<ContextType>;
  MoveFilterSuccess?: MoveFilterSuccessResolvers<ContextType>;
  MoveLabelError?: MoveLabelErrorResolvers<ContextType>;
  MoveLabelResult?: MoveLabelResultResolvers<ContextType>;
  MoveLabelSuccess?: MoveLabelSuccessResolvers<ContextType>;
  MoveToFolderError?: MoveToFolderErrorResolvers<ContextType>;
  MoveToFolderResult?: MoveToFolderResultResolvers<ContextType>;
  MoveToFolderSuccess?: MoveToFolderSuccessResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  NewsletterEmail?: NewsletterEmailResolvers<ContextType>;
  NewsletterEmailsError?: NewsletterEmailsErrorResolvers<ContextType>;
  NewsletterEmailsResult?: NewsletterEmailsResultResolvers<ContextType>;
  NewsletterEmailsSuccess?: NewsletterEmailsSuccessResolvers<ContextType>;
  OptInFeatureError?: OptInFeatureErrorResolvers<ContextType>;
  OptInFeatureResult?: OptInFeatureResultResolvers<ContextType>;
  OptInFeatureSuccess?: OptInFeatureSuccessResolvers<ContextType>;
  Page?: PageResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Profile?: ProfileResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Reaction?: ReactionResolvers<ContextType>;
  ReadState?: ReadStateResolvers<ContextType>;
  RecentEmail?: RecentEmailResolvers<ContextType>;
  RecentEmailsError?: RecentEmailsErrorResolvers<ContextType>;
  RecentEmailsResult?: RecentEmailsResultResolvers<ContextType>;
  RecentEmailsSuccess?: RecentEmailsSuccessResolvers<ContextType>;
  RecentSearch?: RecentSearchResolvers<ContextType>;
  RecentSearchesError?: RecentSearchesErrorResolvers<ContextType>;
  RecentSearchesResult?: RecentSearchesResultResolvers<ContextType>;
  RecentSearchesSuccess?: RecentSearchesSuccessResolvers<ContextType>;
  RecommendError?: RecommendErrorResolvers<ContextType>;
  RecommendHighlightsError?: RecommendHighlightsErrorResolvers<ContextType>;
  RecommendHighlightsResult?: RecommendHighlightsResultResolvers<ContextType>;
  RecommendHighlightsSuccess?: RecommendHighlightsSuccessResolvers<ContextType>;
  RecommendResult?: RecommendResultResolvers<ContextType>;
  RecommendSuccess?: RecommendSuccessResolvers<ContextType>;
  Recommendation?: RecommendationResolvers<ContextType>;
  RecommendationGroup?: RecommendationGroupResolvers<ContextType>;
  RecommendingUser?: RecommendingUserResolvers<ContextType>;
  RefreshHomeError?: RefreshHomeErrorResolvers<ContextType>;
  RefreshHomeResult?: RefreshHomeResultResolvers<ContextType>;
  RefreshHomeSuccess?: RefreshHomeSuccessResolvers<ContextType>;
  Reminder?: ReminderResolvers<ContextType>;
  ReminderError?: ReminderErrorResolvers<ContextType>;
  ReminderResult?: ReminderResultResolvers<ContextType>;
  ReminderSuccess?: ReminderSuccessResolvers<ContextType>;
  ReplyToEmailError?: ReplyToEmailErrorResolvers<ContextType>;
  ReplyToEmailResult?: ReplyToEmailResultResolvers<ContextType>;
  ReplyToEmailSuccess?: ReplyToEmailSuccessResolvers<ContextType>;
  ReportItemResult?: ReportItemResultResolvers<ContextType>;
  RevokeApiKeyError?: RevokeApiKeyErrorResolvers<ContextType>;
  RevokeApiKeyResult?: RevokeApiKeyResultResolvers<ContextType>;
  RevokeApiKeySuccess?: RevokeApiKeySuccessResolvers<ContextType>;
  Rule?: RuleResolvers<ContextType>;
  RuleAction?: RuleActionResolvers<ContextType>;
  RulesError?: RulesErrorResolvers<ContextType>;
  RulesResult?: RulesResultResolvers<ContextType>;
  RulesSuccess?: RulesSuccessResolvers<ContextType>;
  SaveArticleReadingProgressError?: SaveArticleReadingProgressErrorResolvers<ContextType>;
  SaveArticleReadingProgressResult?: SaveArticleReadingProgressResultResolvers<ContextType>;
  SaveArticleReadingProgressSuccess?: SaveArticleReadingProgressSuccessResolvers<ContextType>;
  SaveDiscoverArticleError?: SaveDiscoverArticleErrorResolvers<ContextType>;
  SaveDiscoverArticleResult?: SaveDiscoverArticleResultResolvers<ContextType>;
  SaveDiscoverArticleSuccess?: SaveDiscoverArticleSuccessResolvers<ContextType>;
  SaveError?: SaveErrorResolvers<ContextType>;
  SaveFilterError?: SaveFilterErrorResolvers<ContextType>;
  SaveFilterResult?: SaveFilterResultResolvers<ContextType>;
  SaveFilterSuccess?: SaveFilterSuccessResolvers<ContextType>;
  SaveResult?: SaveResultResolvers<ContextType>;
  SaveSuccess?: SaveSuccessResolvers<ContextType>;
  ScanFeedsError?: ScanFeedsErrorResolvers<ContextType>;
  ScanFeedsResult?: ScanFeedsResultResolvers<ContextType>;
  ScanFeedsSuccess?: ScanFeedsSuccessResolvers<ContextType>;
  SearchError?: SearchErrorResolvers<ContextType>;
  SearchItem?: SearchItemResolvers<ContextType>;
  SearchItemEdge?: SearchItemEdgeResolvers<ContextType>;
  SearchResult?: SearchResultResolvers<ContextType>;
  SearchSuccess?: SearchSuccessResolvers<ContextType>;
  SendInstallInstructionsError?: SendInstallInstructionsErrorResolvers<ContextType>;
  SendInstallInstructionsResult?: SendInstallInstructionsResultResolvers<ContextType>;
  SendInstallInstructionsSuccess?: SendInstallInstructionsSuccessResolvers<ContextType>;
  SetBookmarkArticleError?: SetBookmarkArticleErrorResolvers<ContextType>;
  SetBookmarkArticleResult?: SetBookmarkArticleResultResolvers<ContextType>;
  SetBookmarkArticleSuccess?: SetBookmarkArticleSuccessResolvers<ContextType>;
  SetDeviceTokenError?: SetDeviceTokenErrorResolvers<ContextType>;
  SetDeviceTokenResult?: SetDeviceTokenResultResolvers<ContextType>;
  SetDeviceTokenSuccess?: SetDeviceTokenSuccessResolvers<ContextType>;
  SetFavoriteArticleError?: SetFavoriteArticleErrorResolvers<ContextType>;
  SetFavoriteArticleResult?: SetFavoriteArticleResultResolvers<ContextType>;
  SetFavoriteArticleSuccess?: SetFavoriteArticleSuccessResolvers<ContextType>;
  SetFollowError?: SetFollowErrorResolvers<ContextType>;
  SetFollowResult?: SetFollowResultResolvers<ContextType>;
  SetFollowSuccess?: SetFollowSuccessResolvers<ContextType>;
  SetIntegrationError?: SetIntegrationErrorResolvers<ContextType>;
  SetIntegrationResult?: SetIntegrationResultResolvers<ContextType>;
  SetIntegrationSuccess?: SetIntegrationSuccessResolvers<ContextType>;
  SetLabelsError?: SetLabelsErrorResolvers<ContextType>;
  SetLabelsResult?: SetLabelsResultResolvers<ContextType>;
  SetLabelsSuccess?: SetLabelsSuccessResolvers<ContextType>;
  SetRuleError?: SetRuleErrorResolvers<ContextType>;
  SetRuleResult?: SetRuleResultResolvers<ContextType>;
  SetRuleSuccess?: SetRuleSuccessResolvers<ContextType>;
  SetShareArticleError?: SetShareArticleErrorResolvers<ContextType>;
  SetShareArticleResult?: SetShareArticleResultResolvers<ContextType>;
  SetShareArticleSuccess?: SetShareArticleSuccessResolvers<ContextType>;
  SetShareHighlightError?: SetShareHighlightErrorResolvers<ContextType>;
  SetShareHighlightResult?: SetShareHighlightResultResolvers<ContextType>;
  SetShareHighlightSuccess?: SetShareHighlightSuccessResolvers<ContextType>;
  SetUserPersonalizationError?: SetUserPersonalizationErrorResolvers<ContextType>;
  SetUserPersonalizationResult?: SetUserPersonalizationResultResolvers<ContextType>;
  SetUserPersonalizationSuccess?: SetUserPersonalizationSuccessResolvers<ContextType>;
  SetWebhookError?: SetWebhookErrorResolvers<ContextType>;
  SetWebhookResult?: SetWebhookResultResolvers<ContextType>;
  SetWebhookSuccess?: SetWebhookSuccessResolvers<ContextType>;
  ShareStats?: ShareStatsResolvers<ContextType>;
  SharedArticleError?: SharedArticleErrorResolvers<ContextType>;
  SharedArticleResult?: SharedArticleResultResolvers<ContextType>;
  SharedArticleSuccess?: SharedArticleSuccessResolvers<ContextType>;
  SubscribeError?: SubscribeErrorResolvers<ContextType>;
  SubscribeResult?: SubscribeResultResolvers<ContextType>;
  SubscribeSuccess?: SubscribeSuccessResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  SubscriptionError?: SubscriptionErrorResolvers<ContextType>;
  SubscriptionResult?: SubscriptionResultResolvers<ContextType>;
  SubscriptionRootType?: SubscriptionRootTypeResolvers<ContextType>;
  SubscriptionSuccess?: SubscriptionSuccessResolvers<ContextType>;
  SubscriptionsError?: SubscriptionsErrorResolvers<ContextType>;
  SubscriptionsResult?: SubscriptionsResultResolvers<ContextType>;
  SubscriptionsSuccess?: SubscriptionsSuccessResolvers<ContextType>;
  SyncUpdatedItemEdge?: SyncUpdatedItemEdgeResolvers<ContextType>;
  Task?: TaskResolvers<ContextType>;
  TypeaheadSearchError?: TypeaheadSearchErrorResolvers<ContextType>;
  TypeaheadSearchItem?: TypeaheadSearchItemResolvers<ContextType>;
  TypeaheadSearchResult?: TypeaheadSearchResultResolvers<ContextType>;
  TypeaheadSearchSuccess?: TypeaheadSearchSuccessResolvers<ContextType>;
  UnsubscribeError?: UnsubscribeErrorResolvers<ContextType>;
  UnsubscribeResult?: UnsubscribeResultResolvers<ContextType>;
  UnsubscribeSuccess?: UnsubscribeSuccessResolvers<ContextType>;
  UpdateEmailError?: UpdateEmailErrorResolvers<ContextType>;
  UpdateEmailResult?: UpdateEmailResultResolvers<ContextType>;
  UpdateEmailSuccess?: UpdateEmailSuccessResolvers<ContextType>;
  UpdateFilterError?: UpdateFilterErrorResolvers<ContextType>;
  UpdateFilterResult?: UpdateFilterResultResolvers<ContextType>;
  UpdateFilterSuccess?: UpdateFilterSuccessResolvers<ContextType>;
  UpdateFolderPolicyError?: UpdateFolderPolicyErrorResolvers<ContextType>;
  UpdateFolderPolicyResult?: UpdateFolderPolicyResultResolvers<ContextType>;
  UpdateFolderPolicySuccess?: UpdateFolderPolicySuccessResolvers<ContextType>;
  UpdateHighlightError?: UpdateHighlightErrorResolvers<ContextType>;
  UpdateHighlightReplyError?: UpdateHighlightReplyErrorResolvers<ContextType>;
  UpdateHighlightReplyResult?: UpdateHighlightReplyResultResolvers<ContextType>;
  UpdateHighlightReplySuccess?: UpdateHighlightReplySuccessResolvers<ContextType>;
  UpdateHighlightResult?: UpdateHighlightResultResolvers<ContextType>;
  UpdateHighlightSuccess?: UpdateHighlightSuccessResolvers<ContextType>;
  UpdateLabelError?: UpdateLabelErrorResolvers<ContextType>;
  UpdateLabelResult?: UpdateLabelResultResolvers<ContextType>;
  UpdateLabelSuccess?: UpdateLabelSuccessResolvers<ContextType>;
  UpdateLinkShareInfoError?: UpdateLinkShareInfoErrorResolvers<ContextType>;
  UpdateLinkShareInfoResult?: UpdateLinkShareInfoResultResolvers<ContextType>;
  UpdateLinkShareInfoSuccess?: UpdateLinkShareInfoSuccessResolvers<ContextType>;
  UpdateNewsletterEmailError?: UpdateNewsletterEmailErrorResolvers<ContextType>;
  UpdateNewsletterEmailResult?: UpdateNewsletterEmailResultResolvers<ContextType>;
  UpdateNewsletterEmailSuccess?: UpdateNewsletterEmailSuccessResolvers<ContextType>;
  UpdatePageError?: UpdatePageErrorResolvers<ContextType>;
  UpdatePageResult?: UpdatePageResultResolvers<ContextType>;
  UpdatePageSuccess?: UpdatePageSuccessResolvers<ContextType>;
  UpdateReminderError?: UpdateReminderErrorResolvers<ContextType>;
  UpdateReminderResult?: UpdateReminderResultResolvers<ContextType>;
  UpdateReminderSuccess?: UpdateReminderSuccessResolvers<ContextType>;
  UpdateSharedCommentError?: UpdateSharedCommentErrorResolvers<ContextType>;
  UpdateSharedCommentResult?: UpdateSharedCommentResultResolvers<ContextType>;
  UpdateSharedCommentSuccess?: UpdateSharedCommentSuccessResolvers<ContextType>;
  UpdateSubscriptionError?: UpdateSubscriptionErrorResolvers<ContextType>;
  UpdateSubscriptionResult?: UpdateSubscriptionResultResolvers<ContextType>;
  UpdateSubscriptionSuccess?: UpdateSubscriptionSuccessResolvers<ContextType>;
  UpdateUserError?: UpdateUserErrorResolvers<ContextType>;
  UpdateUserProfileError?: UpdateUserProfileErrorResolvers<ContextType>;
  UpdateUserProfileResult?: UpdateUserProfileResultResolvers<ContextType>;
  UpdateUserProfileSuccess?: UpdateUserProfileSuccessResolvers<ContextType>;
  UpdateUserResult?: UpdateUserResultResolvers<ContextType>;
  UpdateUserSuccess?: UpdateUserSuccessResolvers<ContextType>;
  UpdatesSinceError?: UpdatesSinceErrorResolvers<ContextType>;
  UpdatesSinceResult?: UpdatesSinceResultResolvers<ContextType>;
  UpdatesSinceSuccess?: UpdatesSinceSuccessResolvers<ContextType>;
  UploadFileRequestError?: UploadFileRequestErrorResolvers<ContextType>;
  UploadFileRequestResult?: UploadFileRequestResultResolvers<ContextType>;
  UploadFileRequestSuccess?: UploadFileRequestSuccessResolvers<ContextType>;
  UploadImportFileError?: UploadImportFileErrorResolvers<ContextType>;
  UploadImportFileResult?: UploadImportFileResultResolvers<ContextType>;
  UploadImportFileSuccess?: UploadImportFileSuccessResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserError?: UserErrorResolvers<ContextType>;
  UserPersonalization?: UserPersonalizationResolvers<ContextType>;
  UserResult?: UserResultResolvers<ContextType>;
  UserSuccess?: UserSuccessResolvers<ContextType>;
  UsersError?: UsersErrorResolvers<ContextType>;
  UsersResult?: UsersResultResolvers<ContextType>;
  UsersSuccess?: UsersSuccessResolvers<ContextType>;
  Webhook?: WebhookResolvers<ContextType>;
  WebhookError?: WebhookErrorResolvers<ContextType>;
  WebhookResult?: WebhookResultResolvers<ContextType>;
  WebhookSuccess?: WebhookSuccessResolvers<ContextType>;
  WebhooksError?: WebhooksErrorResolvers<ContextType>;
  WebhooksResult?: WebhooksResultResolvers<ContextType>;
  WebhooksSuccess?: WebhooksSuccessResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = ResolverContext> = {
  sanitize?: SanitizeDirectiveResolver<any, any, ContextType>;
};
