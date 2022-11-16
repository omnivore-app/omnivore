import gql from 'graphql-tag'

const schema = gql`
  # Scalars

  scalar Date

  directive @sanitize(
    allowedTags: [String]
    maxLength: Int
    pattern: String
  ) on INPUT_FIELD_DEFINITION

  enum SortOrder {
    ASCENDING
    DESCENDING
  }

  enum ReactionType {
    LIKE
    HEART
    SMILE
    HUSHED
    CRYING
    POUT
  }

  enum SortBy {
    UPDATED_TIME
    SCORE
    SAVED_AT
    PUBLISHED_AT
  }

  enum ContentReader {
    WEB
    PDF
  }

  input SortParams {
    order: SortOrder
    by: SortBy!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
    totalCount: Int
  }

  type ArticleEdge {
    cursor: String!
    node: Article!
  }

  type FeedArticleEdge {
    cursor: String!
    node: FeedArticle!
  }

  type ArticlesSuccess {
    edges: [ArticleEdge!]!
    pageInfo: PageInfo!
  }

  # User
  type User {
    id: ID!
    name: String!
    isFullUser: Boolean
    viewerIsFollowing: Boolean
    isFriend: Boolean
      @deprecated(reason: "isFriend has been replaced with viewerIsFollowing")
    # temporary; same as profile.pictureUrl for backward compatibility purposes
    picture: String
    profile: Profile!
    sharedArticles: [FeedArticle!]!
    sharedArticlesCount: Int
    sharedHighlightsCount: Int
    sharedNotesCount: Int
    friendsCount: Int
    followersCount: Int
  }

  type Profile {
    id: ID!
    username: String!
    private: Boolean!
    bio: String
    pictureUrl: String
  }

  # Query: User
  union UserResult = UserSuccess | UserError
  enum UserErrorCode {
    UNAUTHORIZED
    USER_NOT_FOUND
    BAD_REQUEST
  }
  type UserError {
    errorCodes: [UserErrorCode!]!
  }
  type UserSuccess {
    user: User!
  }

  # Query: Users
  union UsersResult = UsersSuccess | UsersError
  enum UsersErrorCode {
    UNAUTHORIZED
  }
  type UsersError {
    errorCodes: [UsersErrorCode!]!
  }
  type UsersSuccess {
    users: [User!]!
  }

  # Mutations: googleLogin
  union LoginResult = LoginSuccess | LoginError
  type LoginSuccess {
    me: User!
  }
  type LoginError {
    errorCodes: [LoginErrorCode!]!
  }
  enum LoginErrorCode {
    # Authorization failed due to 3rd party errors
    AUTH_FAILED
    # User already exists
    USER_ALREADY_EXISTS
    # Invalid credentials provided
    INVALID_CREDENTIALS
    # User not found
    USER_NOT_FOUND
    # Mismatching source
    WRONG_SOURCE
    # Access denied
    ACCESS_DENIED
  }

  input GoogleLoginInput {
    secret: String!
    email: String!
  }

  input GoogleSignupInput {
    secret: String!
    email: String!
    username: String!
    name: String!
    pictureUrl: String!
    sourceUserId: String!
    bio: String
  }

  type GoogleSignupSuccess {
    me: User!
  }

  enum SignupErrorCode {
    UNKNOWN
    ACCESS_DENIED
    GOOGLE_AUTH_ERROR
    INVALID_USERNAME
    USER_EXISTS
    EXPIRED_TOKEN
    INVALID_PASSWORD
    INVALID_EMAIL
  }

  type GoogleSignupError {
    errorCodes: [SignupErrorCode]!
  }

  union GoogleSignupResult = GoogleSignupSuccess | GoogleSignupError

  # Mutation: logOut
  union LogOutResult = LogOutSuccess | LogOutError

  enum LogOutErrorCode {
    LOG_OUT_FAILED
  }
  type LogOutError {
    errorCodes: [LogOutErrorCode!]!
  }
  type LogOutSuccess {
    message: String
  }

  enum DeleteAccountErrorCode {
    USER_NOT_FOUND
    UNAUTHORIZED
    FORBIDDEN
  }

  type DeleteAccountError {
    errorCodes: [DeleteAccountErrorCode!]!
  }

  type DeleteAccountSuccess {
    userID: ID!
  }

  union DeleteAccountResult = DeleteAccountSuccess | DeleteAccountError

  union UpdateUserResult = UpdateUserSuccess | UpdateUserError
  input UpdateUserInput {
    name: String! @sanitize(maxLength: 50)
    bio: String @sanitize(maxLength: 400)
  }

  enum UpdateUserErrorCode {
    EMPTY_NAME
    BIO_TOO_LONG
    USER_NOT_FOUND
    UNAUTHORIZED
  }
  type UpdateUserError {
    errorCodes: [UpdateUserErrorCode!]!
  }
  type UpdateUserSuccess {
    user: User!
  }

  # Mutation: updateUserProfile
  union UpdateUserProfileResult =
      UpdateUserProfileSuccess
    | UpdateUserProfileError
  input UpdateUserProfileInput {
    userId: ID!
    username: String @sanitize(maxLength: 15)
    bio: String @sanitize(maxLength: 400)
    pictureUrl: String @sanitize
  }

  type UpdateUserProfileSuccess {
    user: User!
  }

  enum UpdateUserProfileErrorCode {
    UNAUTHORIZED
    FORBIDDEN
    BAD_DATA
    BAD_USERNAME
    USERNAME_EXISTS
  }

  type UpdateUserProfileError {
    errorCodes: [UpdateUserProfileErrorCode!]!
  }

  # Article
  input ArticleHighlightsInput {
    includeFriends: Boolean
  }

  type ReadState {
    reading: Boolean
    readingTime: Int

    progressPercent: Float!
    progressAnchorIndex: Int!
  }

  type HighlightStats {
    highlightCount: Int!
  }

  type ShareStats {
    viewCount: Int!
    saveCount: Int!
    readDuration: Int!
  }

  type LinkShareInfo {
    title: String!
    description: String!
    imageUrl: String!
  }

  type Link {
    id: ID!
    url: String!
    slug: String!
    savedBy: User!
    savedAt: Date!
    updatedAt: Date!
    savedByViewer: Boolean!
    postedByViewer: Boolean!

    readState: ReadState!
    highlightStats: HighlightStats!

    shareInfo: LinkShareInfo!
    shareStats: ShareStats!

    page: Page!
  }

  enum PageType {
    ARTICLE
    BOOK
    FILE
    PROFILE
    WEBSITE
    HIGHLIGHTS
    UNKNOWN
  }

  type Page {
    id: ID!
    url: String!
    hash: String!
    originalUrl: String!

    type: PageType!
    image: String!
    title: String!
    author: String
    description: String
    publishedAt: Date

    originalHtml: String!
    readableHtml: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type Article {
    id: ID!
    title: String!
    slug: String!
    # for uploaded file articles (PDFs), the URL here is the saved omnivore link in GCS
    url: String!
    hash: String!
    content: String!
    pageType: PageType
    contentReader: ContentReader!
    hasContent: Boolean
    author: String
    image: String
    description: String
    originalHtml: String
    createdAt: Date!
    savedAt: Date!
    updatedAt: Date!
    publishedAt: Date
    readingProgressPercent: Float!
    readingProgressAnchorIndex: Int!
    sharedComment: String
    savedByViewer: Boolean
    postedByViewer: Boolean
    # for uploaded file articles (PDFs), we track the original article URL separately!
    originalArticleUrl: String
    highlights(input: ArticleHighlightsInput): [Highlight!]!
    shareInfo: LinkShareInfo
    isArchived: Boolean!
    linkId: ID
    labels: [Label!]
    uploadFileId: ID
    siteName: String
    siteIcon: String
    subscription: String
    unsubMailTo: String
    unsubHttpUrl: String
    state: ArticleSavingRequestStatus
    language: String
    readAt: Date
  }

  # Query: article
  union ArticleResult = ArticleSuccess | ArticleError
  enum ArticleErrorCode {
    NOT_FOUND
    BAD_DATA
    UNAUTHORIZED
  }
  type ArticleError {
    errorCodes: [ArticleErrorCode!]!
  }
  type ArticleSuccess {
    article: Article!
  }

  # Query: sharedArticle
  union SharedArticleResult = SharedArticleSuccess | SharedArticleError

  enum SharedArticleErrorCode {
    NOT_FOUND
  }

  type SharedArticleError {
    errorCodes: [SharedArticleErrorCode!]!
  }

  type SharedArticleSuccess {
    article: Article!
  }

  # Query: articles
  union ArticlesResult = ArticlesSuccess | ArticlesError
  enum ArticlesErrorCode {
    UNAUTHORIZED
  }
  type ArticlesError {
    errorCodes: [ArticlesErrorCode!]!
  }

  # PageInfo
  input PageInfoInput {
    title: String
    author: String @sanitize
    description: String @sanitize
    previewImage: String @sanitize
    canonicalUrl: String @sanitize
    publishedAt: Date
    contentType: String
  }

  input PreparedDocumentInput {
    document: String!
    pageInfo: PageInfoInput!
  }

  # Mutation: uploadFileRequest
  enum UploadFileStatus {
    INITIALIZED
    COMPLETED
  }
  union UploadFileRequestResult =
      UploadFileRequestSuccess
    | UploadFileRequestError

  input UploadFileRequestInput {
    url: String!
    contentType: String!
    createPageEntry: Boolean
    clientRequestId: String
  }

  enum UploadFileRequestErrorCode {
    UNAUTHORIZED
    BAD_INPUT
    FAILED_CREATE
  }
  type UploadFileRequestError {
    errorCodes: [UploadFileRequestErrorCode!]!
  }
  type UploadFileRequestSuccess {
    id: ID!
    uploadSignedUrl: String
    uploadFileId: ID
    createdPageId: String
  }

  # Mutation: createArticle
  union CreateArticleResult = CreateArticleSuccess | CreateArticleError
  input CreateArticleInput {
    url: String!
    # can be used for saving an article without triggering puppeteer (for instance, from a browser extension)
    preparedDocument: PreparedDocumentInput
    articleSavingRequestId: ID
    uploadFileId: ID
    skipParsing: Boolean
    source: String
  }
  enum CreateArticleErrorCode {
    UNABLE_TO_FETCH
    UNABLE_TO_PARSE
    UNAUTHORIZED
    NOT_ALLOWED_TO_PARSE
    PAYLOAD_TOO_LARGE
    UPLOAD_FILE_MISSING
    ELASTIC_ERROR
  }
  type CreateArticleError {
    errorCodes: [CreateArticleErrorCode!]!
  }
  type CreateArticleSuccess {
    createdArticle: Article!
    # user that saved the article
    user: User!
    created: Boolean! # Indicates if an article has been created or updated
  }

  # Used for all save operations
  enum SaveErrorCode {
    UNKNOWN
    UNAUTHORIZED
  }

  type SaveError {
    errorCodes: [SaveErrorCode!]!
    message: String
  }

  type SaveSuccess {
    url: String!
    clientRequestId: ID!
  }

  input SaveFileInput {
    url: String!
    source: String!
    clientRequestId: ID!
    uploadFileId: ID!
  }

  input SavePageInput {
    url: String!
    source: String!
    clientRequestId: ID!
    title: String
    originalContent: String!
  }

  input SaveUrlInput {
    url: String!
    source: String!
    clientRequestId: ID!
  }

  union SaveResult = SaveSuccess | SaveError

  input UpdatePageInput {
    pageId: ID!
    title: String
    description: String
  }

  type UpdatePageSuccess {
    updatedPage: Article!
  }

  enum UpdatePageErrorCode {
    UPDATE_FAILED
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
    FORBIDDEN
  }

  type UpdatePageError {
    errorCodes: [UpdatePageErrorCode!]!
  }

  union UpdatePageResult = UpdatePageSuccess | UpdatePageError

  # Mutation: setFollow
  union SetFollowResult = SetFollowSuccess | SetFollowError
  input SetFollowInput {
    userId: ID!
    follow: Boolean!
  }
  enum SetFollowErrorCode {
    NOT_FOUND
    UNAUTHORIZED
  }
  type SetFollowError {
    errorCodes: [SetFollowErrorCode!]!
  }
  type SetFollowSuccess {
    updatedUser: User!
  }

  # Mutation: saveArticleReadingProgress
  union SaveArticleReadingProgressResult =
      SaveArticleReadingProgressSuccess
    | SaveArticleReadingProgressError
  input SaveArticleReadingProgressInput {
    id: ID!
    readingProgressPercent: Float!
    readingProgressAnchorIndex: Int!
  }
  enum SaveArticleReadingProgressErrorCode {
    NOT_FOUND
    BAD_DATA
    UNAUTHORIZED
  }
  type SaveArticleReadingProgressError {
    errorCodes: [SaveArticleReadingProgressErrorCode!]!
  }
  type SaveArticleReadingProgressSuccess {
    updatedArticle: Article!
  }

  # Mutation: setBookmark
  union SetBookmarkArticleResult =
      SetBookmarkArticleSuccess
    | SetBookmarkArticleError
  input SetBookmarkArticleInput {
    articleID: ID!
    bookmark: Boolean!
  }
  enum SetBookmarkArticleErrorCode {
    NOT_FOUND
    BOOKMARK_EXISTS
  }
  type SetBookmarkArticleError {
    errorCodes: [SetBookmarkArticleErrorCode!]!
  }
  type SetBookmarkArticleSuccess {
    bookmarkedArticle: Article!
  }

  # Feed Article
  type FeedArticle {
    id: ID!
    article: Article!
    sharedBy: User!
    sharedAt: Date!
    sharedComment: String
    sharedWithHighlights: Boolean
    highlightsCount: Int
    annotationsCount: Int
    highlight: Highlight
    reactions: [Reaction!]!
  }

  # Highlight
  type Highlight {
    id: ID!
    # used for simplified url format
    shortId: String!
    user: User!
    quote: String!
    # piece of content before the quote
    prefix: String
    # piece of content after the quote
    suffix: String
    patch: String!
    annotation: String
    replies: [HighlightReply!]!
    sharedAt: Date
    createdAt: Date!
    updatedAt: Date!
    reactions: [Reaction!]!
    createdByMe: Boolean!
    highlightPositionPercent: Float
    highlightPositionAnchorIndex: Int
  }

  input CreateHighlightInput {
    id: ID!
    shortId: String!
    articleId: ID!
    patch: String!
    quote: String! @sanitize(maxLength: 2000)
    prefix: String @sanitize
    suffix: String @sanitize
    annotation: String @sanitize(maxLength: 4000)
    sharedAt: Date
    highlightPositionPercent: Float
    highlightPositionAnchorIndex: Int
  }

  type CreateHighlightSuccess {
    highlight: Highlight!
  }

  enum CreateHighlightErrorCode {
    UNAUTHORIZED
    FORBIDDEN
    BAD_DATA
    NOT_FOUND
    ALREADY_EXISTS
  }

  type CreateHighlightError {
    errorCodes: [CreateHighlightErrorCode!]!
  }

  union CreateHighlightResult = CreateHighlightSuccess | CreateHighlightError

  input MergeHighlightInput {
    id: ID!
    shortId: ID!
    articleId: ID!
    patch: String!
    quote: String! @sanitize(maxLength: 2000)
    prefix: String @sanitize
    suffix: String @sanitize
    annotation: String @sanitize(maxLength: 8000)
    overlapHighlightIdList: [String!]!
    highlightPositionPercent: Float
    highlightPositionAnchorIndex: Int
  }

  type MergeHighlightSuccess {
    highlight: Highlight!
    overlapHighlightIdList: [String!]!
  }

  enum MergeHighlightErrorCode {
    UNAUTHORIZED
    FORBIDDEN
    BAD_DATA
    NOT_FOUND
    ALREADY_EXISTS
  }

  type MergeHighlightError {
    errorCodes: [MergeHighlightErrorCode!]!
  }

  union MergeHighlightResult = MergeHighlightSuccess | MergeHighlightError

  input UpdateHighlightInput {
    highlightId: ID!
    annotation: String @sanitize
    sharedAt: Date
  }

  type UpdateHighlightSuccess {
    highlight: Highlight!
  }

  enum UpdateHighlightErrorCode {
    UNAUTHORIZED
    FORBIDDEN
    NOT_FOUND
    BAD_DATA
  }

  type UpdateHighlightError {
    errorCodes: [UpdateHighlightErrorCode!]!
  }

  union UpdateHighlightResult = UpdateHighlightSuccess | UpdateHighlightError

  type DeleteHighlightSuccess {
    highlight: Highlight!
  }

  enum DeleteHighlightErrorCode {
    UNAUTHORIZED
    FORBIDDEN
    NOT_FOUND
  }

  type DeleteHighlightError {
    errorCodes: [DeleteHighlightErrorCode!]!
  }

  union DeleteHighlightResult = DeleteHighlightSuccess | DeleteHighlightError

  # HighlightReply
  type HighlightReply {
    id: ID!
    user: User!
    highlight: Highlight!
    text: String!
    createdAt: Date!
    updatedAt: Date!
  }

  input CreateHighlightReplyInput {
    highlightId: ID!
    text: String!
  }

  type CreateHighlightReplySuccess {
    highlightReply: HighlightReply!
  }

  enum CreateHighlightReplyErrorCode {
    UNAUTHORIZED
    FORBIDDEN
    NOT_FOUND
    EMPTY_ANNOTATION
  }

  type CreateHighlightReplyError {
    errorCodes: [CreateHighlightReplyErrorCode!]!
  }

  union CreateHighlightReplyResult =
      CreateHighlightReplySuccess
    | CreateHighlightReplyError

  input UpdateHighlightReplyInput {
    highlightReplyId: ID!
    text: String!
  }

  type UpdateHighlightReplySuccess {
    highlightReply: HighlightReply!
  }

  enum UpdateHighlightReplyErrorCode {
    UNAUTHORIZED
    FORBIDDEN
    NOT_FOUND
  }

  type UpdateHighlightReplyError {
    errorCodes: [UpdateHighlightReplyErrorCode!]!
  }

  union UpdateHighlightReplyResult =
      UpdateHighlightReplySuccess
    | UpdateHighlightReplyError

  type DeleteHighlightReplySuccess {
    highlightReply: HighlightReply!
  }

  enum DeleteHighlightReplyErrorCode {
    UNAUTHORIZED
    FORBIDDEN
    NOT_FOUND
  }

  type DeleteHighlightReplyError {
    errorCodes: [DeleteHighlightReplyErrorCode!]!
  }

  union DeleteHighlightReplyResult =
      DeleteHighlightReplySuccess
    | DeleteHighlightReplyError

  # Reaction
  type Reaction {
    id: ID!
    user: User!
    code: ReactionType!
    createdAt: Date!
    updatedAt: Date
  }

  input CreateReactionInput {
    highlightId: ID
    userArticleId: ID
    code: ReactionType!
  }

  type CreateReactionSuccess {
    reaction: Reaction!
  }

  enum CreateReactionErrorCode {
    UNAUTHORIZED
    FORBIDDEN
    BAD_TARGET
    BAD_CODE
    NOT_FOUND
  }

  type CreateReactionError {
    errorCodes: [CreateReactionErrorCode!]!
  }

  union CreateReactionResult = CreateReactionSuccess | CreateReactionError

  type DeleteReactionSuccess {
    reaction: Reaction!
  }

  enum DeleteReactionErrorCode {
    UNAUTHORIZED
    FORBIDDEN
    NOT_FOUND
  }

  type DeleteReactionError {
    errorCodes: [DeleteReactionErrorCode!]!
  }

  union DeleteReactionResult = DeleteReactionSuccess | DeleteReactionError

  # Query: Feed
  union FeedArticlesResult = FeedArticlesSuccess | FeedArticlesError
  enum FeedArticlesErrorCode {
    UNAUTHORIZED
  }
  type FeedArticlesError {
    errorCodes: [FeedArticlesErrorCode!]!
  }

  type FeedArticlesSuccess {
    edges: [FeedArticleEdge!]!
    pageInfo: PageInfo!
  }

  #  Mutation: setShareArticle
  enum SetShareArticleErrorCode {
    NOT_FOUND
    UNAUTHORIZED
  }

  type SetShareArticleSuccess {
    updatedFeedArticleId: String
    updatedFeedArticle: FeedArticle
    updatedArticle: Article!
  }

  type SetShareArticleError {
    errorCodes: [SetShareArticleErrorCode!]!
  }

  union SetShareArticleResult = SetShareArticleSuccess | SetShareArticleError
  input SetShareArticleInput {
    articleID: ID!
    share: Boolean!
    sharedComment: String @sanitize(maxLength: 4000)
    sharedWithHighlights: Boolean
  }

  #  Mutation: updateSharedComment
  enum UpdateSharedCommentErrorCode {
    NOT_FOUND
    UNAUTHORIZED
  }

  type UpdateSharedCommentSuccess {
    articleID: ID!
    sharedComment: String!
  }

  type UpdateSharedCommentError {
    errorCodes: [UpdateSharedCommentErrorCode!]!
  }

  union UpdateSharedCommentResult =
      UpdateSharedCommentSuccess
    | UpdateSharedCommentError
  input UpdateSharedCommentInput {
    articleID: ID!
    sharedComment: String! @sanitize(maxLength: 4000)
  }

  # Query: Followers
  union GetFollowersResult = GetFollowersSuccess | GetFollowersError
  enum GetFollowersErrorCode {
    UNAUTHORIZED
  }
  type GetFollowersError {
    errorCodes: [GetFollowersErrorCode!]!
  }
  type GetFollowersSuccess {
    followers: [User!]!
  }

  union GetFollowingResult = GetFollowingSuccess | GetFollowingError
  enum GetFollowingErrorCode {
    UNAUTHORIZED
  }
  type GetFollowingError {
    errorCodes: [GetFollowingErrorCode!]!
  }
  type GetFollowingSuccess {
    following: [User!]!
  }

  type UserPersonalization {
    id: ID
    theme: String
    fontSize: Int
    fontFamily: String
    margin: Int
    libraryLayoutType: String
    librarySortOrder: SortOrder
    speechVoice: String
    speechSecondaryVoice: String
    speechRate: String
    speechVolume: String
  }

  # Query: UserPersonalization
  union GetUserPersonalizationResult =
      GetUserPersonalizationSuccess
    | GetUserPersonalizationError
  enum GetUserPersonalizationErrorCode {
    UNAUTHORIZED
  }
  type GetUserPersonalizationError {
    errorCodes: [GetUserPersonalizationErrorCode!]!
  }
  type GetUserPersonalizationSuccess {
    userPersonalization: UserPersonalization
  }

  # Mutation: SetUserPersonalizationResult
  union SetUserPersonalizationResult =
      SetUserPersonalizationSuccess
    | SetUserPersonalizationError
  enum SetUserPersonalizationErrorCode {
    UNAUTHORIZED
    NOT_FOUND
  }
  type SetUserPersonalizationError {
    errorCodes: [SetUserPersonalizationErrorCode!]!
  }
  type SetUserPersonalizationSuccess {
    updatedUserPersonalization: UserPersonalization!
  }
  input SetUserPersonalizationInput {
    theme: String @sanitize
    fontSize: Int
    fontFamily: String @sanitize
    margin: Int
    libraryLayoutType: String @sanitize
    librarySortOrder: SortOrder
    speechVoice: String
    speechSecondaryVoice: String
    speechRate: String
    speechVolume: String
  }

  # Type: ArticleSavingRequest
  enum ArticleSavingRequestStatus {
    PROCESSING
    SUCCEEDED
    FAILED
    DELETED
  }

  type ArticleSavingRequest {
    id: ID!
    userId: ID! @deprecated(reason: "userId has been replaced with user")
    user: User!
    article: Article @deprecated(reason: "article has been replaced with slug")
    slug: String!
    status: ArticleSavingRequestStatus!
    errorCode: CreateArticleErrorCode
    createdAt: Date!
    updatedAt: Date!
  }

  # Query: ArticleSavingRequest
  union ArticleSavingRequestResult =
      ArticleSavingRequestSuccess
    | ArticleSavingRequestError
  enum ArticleSavingRequestErrorCode {
    UNAUTHORIZED
    NOT_FOUND
  }
  type ArticleSavingRequestError {
    errorCodes: [ArticleSavingRequestErrorCode!]!
  }
  type ArticleSavingRequestSuccess {
    articleSavingRequest: ArticleSavingRequest!
  }

  # Mutation: CreateArticleSavingRequest
  union CreateArticleSavingRequestResult =
      CreateArticleSavingRequestSuccess
    | CreateArticleSavingRequestError
  enum CreateArticleSavingRequestErrorCode {
    UNAUTHORIZED
    BAD_DATA
  }
  type CreateArticleSavingRequestError {
    errorCodes: [CreateArticleSavingRequestErrorCode!]!
  }
  type CreateArticleSavingRequestSuccess {
    articleSavingRequest: ArticleSavingRequest!
  }
  input CreateArticleSavingRequestInput {
    url: String!
  }

  # Mutation: SetShareHighlightRequest
  union SetShareHighlightResult =
      SetShareHighlightSuccess
    | SetShareHighlightError
  enum SetShareHighlightErrorCode {
    UNAUTHORIZED
    NOT_FOUND
    FORBIDDEN
  }
  type SetShareHighlightError {
    errorCodes: [SetShareHighlightErrorCode!]!
  }
  type SetShareHighlightSuccess {
    highlight: Highlight!
  }
  input SetShareHighlightInput {
    id: ID!
    share: Boolean!
  }

  enum ReportType {
    SPAM
    ABUSIVE
    CONTENT_DISPLAY
    CONTENT_VIOLATION
  }

  input ReportItemInput {
    pageId: ID!
    itemUrl: String!
    sharedBy: ID
    reportTypes: [ReportType!]!
    reportComment: String!
  }

  type ReportItemResult {
    message: String!
  }

  input UpdateLinkShareInfoInput {
    linkId: ID!
    title: String! @sanitize(maxLength: 95)
    description: String! @sanitize(maxLength: 300)
  }

  union UpdateLinkShareInfoResult =
      UpdateLinkShareInfoSuccess
    | UpdateLinkShareInfoError
  enum UpdateLinkShareInfoErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  type UpdateLinkShareInfoError {
    errorCodes: [UpdateLinkShareInfoErrorCode!]!
  }

  type UpdateLinkShareInfoSuccess {
    message: String!
  }

  input ArchiveLinkInput {
    linkId: ID!
    archived: Boolean!
  }

  enum ArchiveLinkErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  type ArchiveLinkError {
    message: String!
    errorCodes: [ArchiveLinkErrorCode!]!
  }

  type ArchiveLinkSuccess {
    linkId: String!
    message: String!
  }
  union ArchiveLinkResult = ArchiveLinkSuccess | ArchiveLinkError

  # Query: NewsletterEmails
  enum NewsletterEmailsErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  type NewsletterEmail {
    id: ID!
    address: String!
    confirmationCode: String
  }

  type NewsletterEmailsSuccess {
    newsletterEmails: [NewsletterEmail!]!
  }

  type NewsletterEmailsError {
    errorCodes: [NewsletterEmailsErrorCode!]!
  }

  union NewsletterEmailsResult = NewsletterEmailsSuccess | NewsletterEmailsError

  # Mutation: CreateNewsletterEmail
  enum CreateNewsletterEmailErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  type CreateNewsletterEmailSuccess {
    newsletterEmail: NewsletterEmail!
  }

  type CreateNewsletterEmailError {
    errorCodes: [CreateNewsletterEmailErrorCode!]!
  }

  union CreateNewsletterEmailResult =
      CreateNewsletterEmailSuccess
    | CreateNewsletterEmailError

  # Mutation: DeleteNewsletterEmail
  enum DeleteNewsletterEmailErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  type DeleteNewsletterEmailSuccess {
    newsletterEmail: NewsletterEmail!
  }

  type DeleteNewsletterEmailError {
    errorCodes: [DeleteNewsletterEmailErrorCode!]!
  }

  union DeleteNewsletterEmailResult =
      DeleteNewsletterEmailSuccess
    | DeleteNewsletterEmailError

  # Query: Reminder

  type Reminder {
    id: ID!
    archiveUntil: Boolean!
    sendNotification: Boolean!
    remindAt: Date!
  }

  type ReminderSuccess {
    reminder: Reminder!
  }

  enum ReminderErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  type ReminderError {
    errorCodes: [ReminderErrorCode!]!
  }

  union ReminderResult = ReminderSuccess | ReminderError

  # Mutation: CreateReminder
  input CreateReminderInput {
    linkId: ID
    clientRequestId: ID
    archiveUntil: Boolean!
    sendNotification: Boolean!
    remindAt: Date!
  }

  type CreateReminderSuccess {
    reminder: Reminder!
  }

  enum CreateReminderErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  type CreateReminderError {
    errorCodes: [CreateReminderErrorCode!]!
  }

  union CreateReminderResult = CreateReminderSuccess | CreateReminderError

  input UpdateReminderInput {
    id: ID!
    archiveUntil: Boolean!
    sendNotification: Boolean!
    remindAt: Date!
  }

  union UpdateReminderResult = UpdateReminderSuccess | UpdateReminderError

  type UpdateReminderSuccess {
    reminder: Reminder!
  }

  enum UpdateReminderErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  type UpdateReminderError {
    errorCodes: [UpdateReminderErrorCode!]!
  }

  union DeleteReminderResult = DeleteReminderSuccess | DeleteReminderError

  type DeleteReminderSuccess {
    reminder: Reminder!
  }

  enum DeleteReminderErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  type DeleteReminderError {
    errorCodes: [DeleteReminderErrorCode!]!
  }

  type SendInstallInstructionsSuccess {
    sent: Boolean!
  }

  enum SendInstallInstructionsErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
    FORBIDDEN
  }

  type SendInstallInstructionsError {
    errorCodes: [SendInstallInstructionsErrorCode!]!
  }

  union SendInstallInstructionsResult =
      SendInstallInstructionsSuccess
    | SendInstallInstructionsError

  input SetDeviceTokenInput {
    id: ID
    token: String
  }

  type DeviceToken {
    id: ID!
    token: String!
    createdAt: Date!
  }

  type SetDeviceTokenSuccess {
    deviceToken: DeviceToken!
  }

  enum SetDeviceTokenErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  type SetDeviceTokenError {
    errorCodes: [SetDeviceTokenErrorCode!]!
  }

  union SetDeviceTokenResult = SetDeviceTokenSuccess | SetDeviceTokenError

  type Label {
    id: ID!
    name: String!
    color: String!
    description: String
    createdAt: Date
    position: Int
  }

  type LabelsSuccess {
    labels: [Label!]!
  }

  enum LabelsErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  type LabelsError {
    errorCodes: [LabelsErrorCode!]!
  }

  union LabelsResult = LabelsSuccess | LabelsError

  input CreateLabelInput {
    name: String! @sanitize(maxLength: 64)
    color: String! @sanitize(pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
    description: String @sanitize(maxLength: 100)
  }

  type CreateLabelSuccess {
    label: Label!
  }

  enum CreateLabelErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
    LABEL_ALREADY_EXISTS
  }

  type CreateLabelError {
    errorCodes: [CreateLabelErrorCode!]!
  }

  union CreateLabelResult = CreateLabelSuccess | CreateLabelError

  type DeleteLabelSuccess {
    label: Label!
  }

  enum DeleteLabelErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  type DeleteLabelError {
    errorCodes: [DeleteLabelErrorCode!]!
  }

  union DeleteLabelResult = DeleteLabelSuccess | DeleteLabelError

  input UpdateLabelInput {
    labelId: ID!
    color: String!
    description: String
    name: String!
  }

  type UpdateLabelSuccess {
    label: Label!
  }

  enum UpdateLabelErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
    FORBIDDEN
  }

  type UpdateLabelError {
    errorCodes: [UpdateLabelErrorCode!]!
  }

  union UpdateLabelResult = UpdateLabelSuccess | UpdateLabelError

  input SetLabelsInput {
    pageId: ID!
    labelIds: [ID!]!
  }

  union SetLabelsResult = SetLabelsSuccess | SetLabelsError

  type SetLabelsSuccess {
    labels: [Label!]!
  }

  type SetLabelsError {
    errorCodes: [SetLabelsErrorCode!]!
  }

  enum SetLabelsErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  input GenerateApiKeyInput {
    name: String!
    scopes: [String!]
    expiresAt: Date!
  }

  union GenerateApiKeyResult = GenerateApiKeySuccess | GenerateApiKeyError

  type GenerateApiKeySuccess {
    apiKey: ApiKey!
  }

  type GenerateApiKeyError {
    errorCodes: [GenerateApiKeyErrorCode!]!
  }

  enum GenerateApiKeyErrorCode {
    BAD_REQUEST
    ALREADY_EXISTS
    UNAUTHORIZED
  }

  # Query: search
  union SearchResult = SearchSuccess | SearchError

  type SearchItem {
    # used for pages
    id: ID!
    title: String!
    slug: String!
    # for uploaded file articles (PDFs), the URL here is the saved omnivore link in GCS
    url: String!
    pageType: PageType!
    contentReader: ContentReader!
    createdAt: Date!
    updatedAt: Date
    isArchived: Boolean!
    readingProgressPercent: Float!
    readingProgressAnchorIndex: Int!
    author: String
    image: String
    description: String
    publishedAt: Date
    ownedByViewer: Boolean
    # for uploaded file articles (PDFs), we track the original article URL separately!
    originalArticleUrl: String
    uploadFileId: ID
    # used for highlights
    pageId: ID
    shortId: String
    quote: String
    annotation: String
    labels: [Label!]
    subscription: String
    unsubMailTo: String
    unsubHttpUrl: String
    state: ArticleSavingRequestStatus
    siteName: String
    language: String
    readAt: Date
    savedAt: Date!
    highlights: [Highlight!]
    siteIcon: String
  }

  type SearchItemEdge {
    cursor: String!
    node: SearchItem!
  }

  type SearchSuccess {
    edges: [SearchItemEdge!]!
    pageInfo: PageInfo!
  }

  enum SearchErrorCode {
    UNAUTHORIZED
  }

  type SearchError {
    errorCodes: [SearchErrorCode!]!
  }

  union SubscriptionsResult = SubscriptionsSuccess | SubscriptionsError

  type SubscriptionsSuccess {
    subscriptions: [Subscription!]!
  }

  type Subscription {
    id: ID!
    name: String!
    newsletterEmail: String!
    url: String
    description: String
    status: SubscriptionStatus!
    unsubscribeMailTo: String
    unsubscribeHttpUrl: String
    icon: String
    createdAt: Date!
    updatedAt: Date!
  }

  enum SubscriptionStatus {
    ACTIVE
    UNSUBSCRIBED
    DELETED
  }

  type SubscriptionsError {
    errorCodes: [SubscriptionsErrorCode!]!
  }

  enum SubscriptionsErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  union UnsubscribeResult = UnsubscribeSuccess | UnsubscribeError

  type UnsubscribeSuccess {
    subscription: Subscription!
  }

  type UnsubscribeError {
    errorCodes: [UnsubscribeErrorCode!]!
  }

  enum UnsubscribeErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
    ALREADY_UNSUBSCRIBED
    UNSUBSCRIBE_METHOD_NOT_FOUND
  }

  union SubscribeResult = SubscribeSuccess | SubscribeError

  type SubscribeSuccess {
    subscriptions: [Subscription!]!
  }

  type SubscribeError {
    errorCodes: [SubscribeErrorCode!]!
  }

  enum SubscribeErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
    ALREADY_SUBSCRIBED
  }

  union AddPopularReadResult = AddPopularReadSuccess | AddPopularReadError

  type AddPopularReadSuccess {
    pageId: String!
  }

  type AddPopularReadError {
    errorCodes: [AddPopularReadErrorCode!]!
  }

  enum AddPopularReadErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  input SetWebhookInput {
    id: ID
    url: String!
    eventTypes: [WebhookEvent!]!
    contentType: String
    method: String
    enabled: Boolean
  }

  enum WebhookEvent {
    PAGE_CREATED
    PAGE_UPDATED
    PAGE_DELETED
    HIGHLIGHT_CREATED
    HIGHLIGHT_UPDATED
    HIGHLIGHT_DELETED
    LABEL_CREATED
    LABEL_UPDATED
    LABEL_DELETED
  }

  union SetWebhookResult = SetWebhookSuccess | SetWebhookError

  type SetWebhookSuccess {
    webhook: Webhook!
  }

  type Webhook {
    id: ID!
    url: String!
    eventTypes: [WebhookEvent!]!
    contentType: String!
    method: String!
    enabled: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  type SetWebhookError {
    errorCodes: [SetWebhookErrorCode!]!
  }

  enum SetWebhookErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    ALREADY_EXISTS
    NOT_FOUND
  }

  union DeleteWebhookResult = DeleteWebhookSuccess | DeleteWebhookError

  type DeleteWebhookSuccess {
    webhook: Webhook!
  }

  type DeleteWebhookError {
    errorCodes: [DeleteWebhookErrorCode!]!
  }

  enum DeleteWebhookErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  union WebhookResult = WebhookSuccess | WebhookError

  type WebhookSuccess {
    webhook: Webhook!
  }

  type WebhookError {
    errorCodes: [WebhookErrorCode!]!
  }

  enum WebhookErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  union WebhooksResult = WebhooksSuccess | WebhooksError

  type WebhooksSuccess {
    webhooks: [Webhook!]!
  }

  type WebhooksError {
    errorCodes: [WebhooksErrorCode!]!
  }

  enum WebhooksErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  union ApiKeysResult = ApiKeysSuccess | ApiKeysError

  type ApiKeysSuccess {
    apiKeys: [ApiKey!]!
  }

  type ApiKey {
    id: ID!
    name: String!
    key: String
    scopes: [String!]
    createdAt: Date!
    expiresAt: Date!
    usedAt: Date
  }

  type ApiKeysError {
    errorCodes: [ApiKeysErrorCode!]!
  }

  enum ApiKeysErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  union RevokeApiKeyResult = RevokeApiKeySuccess | RevokeApiKeyError

  type RevokeApiKeySuccess {
    apiKey: ApiKey!
  }

  type RevokeApiKeyError {
    errorCodes: [RevokeApiKeyErrorCode!]!
  }

  enum RevokeApiKeyErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  input SetLabelsForHighlightInput {
    highlightId: ID!
    labelIds: [ID!]!
  }

  union TypeaheadSearchResult = TypeaheadSearchSuccess | TypeaheadSearchError

  type TypeaheadSearchSuccess {
    items: [TypeaheadSearchItem!]!
  }

  type TypeaheadSearchError {
    errorCodes: [TypeaheadSearchErrorCode!]!
  }

  enum TypeaheadSearchErrorCode {
    UNAUTHORIZED
  }

  type TypeaheadSearchItem {
    id: ID!
    title: String!
    slug: String!
    siteName: String
  }

  union UpdatesSinceResult = UpdatesSinceSuccess | UpdatesSinceError

  type UpdatesSinceSuccess {
    edges: [SyncUpdatedItemEdge!]!
    pageInfo: PageInfo!
  }

  type SyncUpdatedItemEdge {
    cursor: String!
    updateReason: UpdateReason!
    itemID: ID!
    node: SearchItem # for created or updated items, null for deletions */
  }

  enum UpdateReason {
    CREATED
    UPDATED
    DELETED
  }

  type UpdatesSinceError {
    errorCodes: [UpdatesSinceErrorCode!]!
  }

  enum UpdatesSinceErrorCode {
    UNAUTHORIZED
  }

  input MoveLabelInput {
    labelId: ID!
    afterLabelId: ID # null to move to the top
  }

  union MoveLabelResult = MoveLabelSuccess | MoveLabelError

  type MoveLabelSuccess {
    label: Label!
  }

  type MoveLabelError {
    errorCodes: [MoveLabelErrorCode!]!
  }

  enum MoveLabelErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  union SetIntegrationResult = SetIntegrationSuccess | SetIntegrationError

  type SetIntegrationSuccess {
    integration: Integration!
  }

  type Integration {
    id: ID!
    type: IntegrationType!
    token: String!
    enabled: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  enum IntegrationType {
    READWISE
  }

  type SetIntegrationError {
    errorCodes: [SetIntegrationErrorCode!]!
  }

  enum SetIntegrationErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
    INVALID_TOKEN
    ALREADY_EXISTS
  }

  input SetIntegrationInput {
    id: ID
    type: IntegrationType!
    token: String!
    enabled: Boolean!
  }

  union IntegrationsResult = IntegrationsSuccess | IntegrationsError

  type IntegrationsSuccess {
    integrations: [Integration!]!
  }

  type IntegrationsError {
    errorCodes: [IntegrationsErrorCode!]!
  }

  enum IntegrationsErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  union DeleteIntegrationResult =
      DeleteIntegrationSuccess
    | DeleteIntegrationError

  type DeleteIntegrationSuccess {
    integration: Integration!
  }

  type DeleteIntegrationError {
    errorCodes: [DeleteIntegrationErrorCode!]!
  }

  enum DeleteIntegrationErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  union RecentSearchesResult = RecentSearchesSuccess | RecentSearchesError

  type RecentSearchesSuccess {
    searches: [RecentSearch!]!
  }

  type RecentSearch {
    id: ID!
    term: String!
    createdAt: Date!
  }

  type RecentSearchesError {
    errorCodes: [RecentSearchesErrorCode!]!
  }

  enum RecentSearchesErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  input OptInFeatureInput {
    name: String!
  }

  union OptInFeatureResult = OptInFeatureSuccess | OptInFeatureError

  type OptInFeatureSuccess {
    feature: Feature!
  }

  type Feature {
    id: ID!
    name: String!
    token: String!
    createdAt: Date!
    updatedAt: Date!
    grantedAt: Date
    expiresAt: Date
  }

  type OptInFeatureError {
    errorCodes: [OptInFeatureErrorCode!]!
  }

  enum OptInFeatureErrorCode {
    BAD_REQUEST
    NOT_FOUND
  }

  union RulesResult = RulesSuccess | RulesError

  type RulesSuccess {
    rules: [Rule!]!
  }

  type Rule {
    id: ID!
    name: String
    query: String!
    actions: [RuleAction!]!
    enabled: Boolean!
    createdAt: Date!
    updatedAt: Date!
  }

  type RuleAction {
    type: RuleActionType!
    value: String
  }

  enum RuleActionType {
    ADD_LABEL
    ARCHIVE
    MARK_AS_READ
    SEND_NOTIFICATION
  }

  type RulesError {
    errorCodes: [RulesErrorCode!]!
  }

  enum RulesErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  input SetRuleInput {
    id: ID
    name: String
    query: String!
    actions: [RuleActionInput!]!
    enabled: Boolean!
  }

  input RuleActionInput {
    type: RuleActionType!
    value: String
  }

  union SetRuleResult = SetRuleSuccess | SetRuleError

  type SetRuleSuccess {
    rule: Rule!
  }

  type SetRuleError {
    errorCodes: [SetRuleErrorCode!]!
  }

  enum SetRuleErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  union DeleteRuleResult = DeleteRuleSuccess | DeleteRuleError

  type DeleteRuleSuccess {
    rule: Rule!
  }

  type DeleteRuleError {
    errorCodes: [DeleteRuleErrorCode!]!
  }

  enum DeleteRuleErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  # Mutations
  type Mutation {
    googleLogin(input: GoogleLoginInput!): LoginResult!
    googleSignup(input: GoogleSignupInput!): GoogleSignupResult!
    logOut: LogOutResult!
    deleteAccount(userID: ID!): DeleteAccountResult!
    updateUser(input: UpdateUserInput!): UpdateUserResult!
    updateUserProfile(input: UpdateUserProfileInput!): UpdateUserProfileResult!
    createArticle(input: CreateArticleInput!): CreateArticleResult!
    createHighlight(input: CreateHighlightInput!): CreateHighlightResult!
    mergeHighlight(input: MergeHighlightInput!): MergeHighlightResult!
    updateHighlight(input: UpdateHighlightInput!): UpdateHighlightResult!
    deleteHighlight(highlightId: ID!): DeleteHighlightResult!
    createHighlightReply(
      input: CreateHighlightReplyInput!
    ): CreateHighlightReplyResult!
    updateHighlightReply(
      input: UpdateHighlightReplyInput!
    ): UpdateHighlightReplyResult!
    deleteHighlightReply(highlightReplyId: ID!): DeleteHighlightReplyResult!
    createReaction(input: CreateReactionInput!): CreateReactionResult!
    deleteReaction(id: ID!): DeleteReactionResult!
    uploadFileRequest(input: UploadFileRequestInput!): UploadFileRequestResult!
    saveArticleReadingProgress(
      input: SaveArticleReadingProgressInput!
    ): SaveArticleReadingProgressResult!
    setShareArticle(input: SetShareArticleInput!): SetShareArticleResult!
    updateSharedComment(
      input: UpdateSharedCommentInput!
    ): UpdateSharedCommentResult!
    setFollow(input: SetFollowInput!): SetFollowResult!
    setBookmarkArticle(
      input: SetBookmarkArticleInput!
    ): SetBookmarkArticleResult!
    setUserPersonalization(
      input: SetUserPersonalizationInput!
    ): SetUserPersonalizationResult!
    createArticleSavingRequest(
      input: CreateArticleSavingRequestInput!
    ): CreateArticleSavingRequestResult!
    setShareHighlight(input: SetShareHighlightInput!): SetShareHighlightResult!
    reportItem(input: ReportItemInput!): ReportItemResult!
    updateLinkShareInfo(
      input: UpdateLinkShareInfoInput!
    ): UpdateLinkShareInfoResult!
    setLinkArchived(input: ArchiveLinkInput!): ArchiveLinkResult!
    createNewsletterEmail: CreateNewsletterEmailResult!
    deleteNewsletterEmail(newsletterEmailId: ID!): DeleteNewsletterEmailResult!
    saveUrl(input: SaveUrlInput!): SaveResult!
    savePage(input: SavePageInput!): SaveResult!
    updatePage(input: UpdatePageInput!): UpdatePageResult!
    saveFile(input: SaveFileInput!): SaveResult!
    createReminder(input: CreateReminderInput!): CreateReminderResult!
    updateReminder(input: UpdateReminderInput!): UpdateReminderResult!
    deleteReminder(id: ID!): DeleteReminderResult!
    setDeviceToken(input: SetDeviceTokenInput!): SetDeviceTokenResult!
    createLabel(input: CreateLabelInput!): CreateLabelResult!
    updateLabel(input: UpdateLabelInput!): UpdateLabelResult!
    deleteLabel(id: ID!): DeleteLabelResult!
    setLabels(input: SetLabelsInput!): SetLabelsResult!
    generateApiKey(input: GenerateApiKeyInput!): GenerateApiKeyResult!
    unsubscribe(name: String!): UnsubscribeResult!
    subscribe(name: String!): SubscribeResult!
    addPopularRead(name: String!): AddPopularReadResult!
    setWebhook(input: SetWebhookInput!): SetWebhookResult!
    deleteWebhook(id: ID!): DeleteWebhookResult!
    revokeApiKey(id: ID!): RevokeApiKeyResult!
    setLabelsForHighlight(input: SetLabelsForHighlightInput!): SetLabelsResult!
    moveLabel(input: MoveLabelInput!): MoveLabelResult!
    setIntegration(input: SetIntegrationInput!): SetIntegrationResult!
    deleteIntegration(id: ID!): DeleteIntegrationResult!
    optInFeature(input: OptInFeatureInput!): OptInFeatureResult!
    setRule(input: SetRuleInput!): SetRuleResult!
    deleteRule(id: ID!): DeleteRuleResult!
  }

  # FIXME: remove sort from feedArticles after all cached tabs are closed
  # FIXME: sharedOnly is legacy
  type Query {
    hello: String
    me: User
    user(userId: ID, username: String): UserResult!
    articles(
      sharedOnly: Boolean
      sort: SortParams
      after: String
      first: Int
      query: String
      includePending: Boolean
    ): ArticlesResult!
    article(username: String!, slug: String!): ArticleResult!
    sharedArticle(
      username: String!
      slug: String!
      selectedHighlightId: String
    ): SharedArticleResult!
    feedArticles(
      after: String
      first: Int
      sort: SortParams
      sharedByUser: ID
    ): FeedArticlesResult!
    users: UsersResult!
    validateUsername(username: String!): Boolean!
    getFollowers(userId: ID): GetFollowersResult!
    getFollowing(userId: ID): GetFollowingResult!
    getUserPersonalization: GetUserPersonalizationResult!
    articleSavingRequest(id: ID!): ArticleSavingRequestResult!
    newsletterEmails: NewsletterEmailsResult!
    reminder(linkId: ID!): ReminderResult!
    labels: LabelsResult!
    search(after: String, first: Int, query: String): SearchResult!
    subscriptions(sort: SortParams): SubscriptionsResult!
    sendInstallInstructions: SendInstallInstructionsResult!
    webhooks: WebhooksResult!
    webhook(id: ID!): WebhookResult!
    apiKeys: ApiKeysResult!
    typeaheadSearch(query: String!, first: Int): TypeaheadSearchResult!
    updatesSince(after: String, first: Int, since: Date!): UpdatesSinceResult!
    integrations: IntegrationsResult!
    recentSearches: RecentSearchesResult!
    rules: RulesResult!
  }
`

export default schema
