import gql from 'graphql-tag'

const schema = gql`
  # Scalars

  scalar Date

  directive @sanitize(
    allowedTags: [String]
    maxLength: Int
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
    author: String!
    description: String!
    publishedAt: Date

    originalHtml: String!
    readableHtml: String!
    createdAt: Date!
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
    article: Article!
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
  }

  # Type: ArticleSavingRequest
  enum ArticleSavingRequestStatus {
    PROCESSING
    SUCCEEDED
    FAILED
  }

  type ArticleSavingRequest {
    id: ID!
    userId: ID! @deprecated(reason: "userId has been replaced with user")
    user: User!
    article: Article
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
    color: String!
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

  input LoginInput {
    password: String!
    email: String!
  }

  input SignupInput {
    email: String!
    password: String! @sanitize(maxLength: 40)
    username: String!
    name: String!
    pictureUrl: String
    bio: String
  }

  type SignupSuccess {
    me: User!
  }

  type SignupError {
    errorCodes: [SignupErrorCode]!
  }

  union SignupResult = SignupSuccess | SignupError

  input SetLabelsInput {
    linkId: ID!
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

  # Mutations
  type Mutation {
    googleLogin(input: GoogleLoginInput!): LoginResult!
    googleSignup(input: GoogleSignupInput!): GoogleSignupResult!
    logOut: LogOutResult!
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
    saveFile(input: SaveFileInput!): SaveResult!
    createReminder(input: CreateReminderInput!): CreateReminderResult!
    updateReminder(input: UpdateReminderInput!): UpdateReminderResult!
    deleteReminder(id: ID!): DeleteReminderResult!
    setDeviceToken(input: SetDeviceTokenInput!): SetDeviceTokenResult!
    createLabel(input: CreateLabelInput!): CreateLabelResult!
    updateLabel(input: UpdateLabelInput!): UpdateLabelResult!
    deleteLabel(id: ID!): DeleteLabelResult!
    login(input: LoginInput!): LoginResult!
    signup(input: SignupInput!): SignupResult!
    setLabels(input: SetLabelsInput!): SetLabelsResult!
  }

  # FIXME: remove sort from feedArticles after all cahced tabs are closed
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
  }
`

export default schema
