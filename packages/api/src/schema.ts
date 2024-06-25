import gql from 'graphql-tag'

const schema = gql`
  # Scalars

  scalar Date
  scalar JSON

  directive @sanitize(
    allowedTags: [String]
    maxLength: Int
    minLength: Int
    pattern: String
  ) on INPUT_FIELD_DEFINITION

  # default error code
  enum ErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
    FORBIDDEN
  }

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
    EPUB
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
    email: String
    source: String
    intercomHash: String
    features: [String]
    featureList: [Feature!]
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
    updatedAt: Date
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
    TWEET
    VIDEO
    IMAGE
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
    updatedAt: Date
  }

  type RecommendingUser {
    userId: String!
    name: String!
    username: String!
    profileImageURL: String
  }

  type Recommendation {
    id: ID!
    name: String!
    user: RecommendingUser
    recommendedAt: Date!
    note: String
  }

  enum DirectionalityType {
    LTR
    RTL
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
    updatedAt: Date
    publishedAt: Date
    readingProgressTopPercent: Float
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
    recommendations: [Recommendation!]
    wordsCount: Int
    folder: String!
    feedContent: String
    directionality: DirectionalityType
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
    state: ArticleSavingRequestStatus
    labels: [CreateLabelInput!]
    folder: String
    rssFeedUrl: String
    savedAt: Date
    publishedAt: Date
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
    EMBEDDED_HIGHLIGHT_FAILED
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
    state: ArticleSavingRequestStatus
    labels: [CreateLabelInput!]
    folder: String
    savedAt: Date
    publishedAt: Date
    subscription: String
  }

  input ParseResult {
    title: String!
    byline: String
    dir: String
    content: String!
    textContent: String!
    length: Int!
    excerpt: String!
    siteName: String
    siteIcon: String
    previewImage: String
    publishedDate: Date
    language: String
  }

  input SavePageInput {
    url: String!
    source: String!
    clientRequestId: ID!
    title: String
    originalContent: String!
    parseResult: ParseResult
    state: ArticleSavingRequestStatus
    labels: [CreateLabelInput!]
    rssFeedUrl: String
    savedAt: Date
    publishedAt: Date
    folder: String
  }

  input SaveUrlInput {
    url: String!
    source: String!
    clientRequestId: ID!
    state: ArticleSavingRequestStatus
    labels: [CreateLabelInput!]
    locale: String
    timezone: String
    savedAt: Date
    publishedAt: Date
    folder: String
  }

  union SaveResult = SaveSuccess | SaveError

  input UpdatePageInput {
    pageId: ID!
    title: String
    description: String
    byline: String
    savedAt: Date
    publishedAt: Date
    previewImage: String @sanitize
    state: ArticleSavingRequestStatus
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
    readingProgressTopPercent: Float
    readingProgressPercent: Float!
    readingProgressAnchorIndex: Int
    force: Boolean
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

  enum HighlightType {
    HIGHLIGHT
    REDACTION
    NOTE
  }

  enum RepresentationType {
    CONTENT
    FEED_CONTENT
  }

  # Highlight
  type Highlight {
    id: ID!
    # used for simplified url format
    shortId: String!
    user: User!
    quote: String
    # piece of content before the quote
    prefix: String
    # piece of content after the quote
    suffix: String
    patch: String
    annotation: String
    replies: [HighlightReply!]!
    sharedAt: Date
    createdAt: Date!
    updatedAt: Date
    reactions: [Reaction!]!
    createdByMe: Boolean!
    highlightPositionPercent: Float
    highlightPositionAnchorIndex: Int
    labels: [Label!]
    type: HighlightType!
    html: String
    color: String
    representation: RepresentationType!
    libraryItem: Article!
  }

  input CreateHighlightInput {
    id: ID!
    shortId: String!
    articleId: ID!
    patch: String
    quote: String @sanitize(maxLength: 12000, minLength: 1)
    prefix: String @sanitize
    suffix: String @sanitize
    annotation: String @sanitize(maxLength: 4000)
    sharedAt: Date
    highlightPositionPercent: Float
    highlightPositionAnchorIndex: Int
    type: HighlightType
    html: String
    color: String
    representation: RepresentationType
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
    quote: String! @sanitize(maxLength: 12000, minLength: 1)
    prefix: String @sanitize
    suffix: String @sanitize
    annotation: String @sanitize(maxLength: 4000)
    overlapHighlightIdList: [String!]!
    highlightPositionPercent: Float
    highlightPositionAnchorIndex: Int
    html: String
    color: String
    representation: RepresentationType
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
    annotation: String @sanitize(maxLength: 4000)
    sharedAt: Date
    quote: String @sanitize(maxLength: 12000, minLength: 1)
    html: String
    color: String
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
    updatedAt: Date
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

  type DigestConfig {
    channels: [String]
  }

  input DigestConfigInput {
    channels: [String]
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
    fields: JSON
    digestConfig: DigestConfig
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
    fields: JSON
    digestConfig: DigestConfigInput
  }

  # Type: ArticleSavingRequest
  enum ArticleSavingRequestStatus {
    PROCESSING
    SUCCEEDED
    FAILED
    DELETED
    ARCHIVED
    CONTENT_NOT_FETCHED
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
    updatedAt: Date
    url: String!
  }

  # Query: ArticleSavingRequest
  union ArticleSavingRequestResult =
      ArticleSavingRequestSuccess
    | ArticleSavingRequestError
  enum ArticleSavingRequestErrorCode {
    UNAUTHORIZED
    NOT_FOUND
    BAD_DATA
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
    createdAt: Date!
    subscriptionCount: Int!
    folder: String!
    name: String
    description: String
  }

  type NewsletterEmailsSuccess {
    newsletterEmails: [NewsletterEmail!]!
  }

  type NewsletterEmailsError {
    errorCodes: [NewsletterEmailsErrorCode!]!
  }

  union NewsletterEmailsResult = NewsletterEmailsSuccess | NewsletterEmailsError

  input CreateNewsletterEmailInput {
    name: String
    description: String
    folder: String
  }

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
    internal: Boolean
    source: String
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
    color: String @sanitize(pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
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
    FORBIDDEN
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
    labelIds: [ID!]
    labels: [CreateLabelInput!]
    source: String
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
    readingProgressTopPercent: Float
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
    color: String
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
    recommendations: [Recommendation!]
    wordsCount: Int
    content: String
    archivedAt: Date
    feedContent: String
    previewContentType: String
    links: JSON
    folder: String!
    aiSummary: String
    directionality: DirectionalityType
    format: String
    score: Float
    seenAt: Date
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
    QUERY_TOO_LONG
  }

  type SearchError {
    errorCodes: [SearchErrorCode!]!
  }

  union SubscriptionsResult = SubscriptionsSuccess | SubscriptionsError

  type SubscriptionsSuccess {
    subscriptions: [Subscription!]!
  }

  enum SubscriptionType {
    RSS
    NEWSLETTER
  }

  enum FetchContentType {
    ALWAYS
    NEVER
    WHEN_EMPTY
  }

  type Subscription {
    id: ID!
    name: String!
    newsletterEmail: String
    url: String
    description: String
    status: SubscriptionStatus!
    unsubscribeMailTo: String
    unsubscribeHttpUrl: String
    icon: String
    type: SubscriptionType!
    count: Int!
    lastFetchedAt: Date
    createdAt: Date!
    updatedAt: Date
    isPrivate: Boolean
    autoAddToLibrary: Boolean
    fetchContent: Boolean!
    fetchContentType: FetchContentType!
    folder: String!
    mostRecentItemDate: Date
    refreshedAt: Date
    failedAt: Date
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
    EXCEEDED_MAX_SUBSCRIPTIONS
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
    updatedAt: Date
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
    labelIds: [ID!]
    labels: [CreateLabelInput!]
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
    contentReader: ContentReader!
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
    name: String!
    type: IntegrationType!
    token: String!
    enabled: Boolean!
    createdAt: Date!
    updatedAt: Date
    taskName: String
    settings: JSON
  }

  enum IntegrationType {
    EXPORT
    IMPORT
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

  enum ImportItemState {
    UNREAD
    UNARCHIVED
    ARCHIVED
    ALL
  }

  input SetIntegrationInput {
    id: ID
    name: String!
    type: IntegrationType
    token: String!
    enabled: Boolean!
    syncedAt: Date
    importItemState: ImportItemState
    taskName: String
    settings: JSON
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
    updatedAt: Date
    grantedAt: Date
    expiresAt: Date
  }

  type OptInFeatureError {
    errorCodes: [OptInFeatureErrorCode!]!
  }

  enum OptInFeatureErrorCode {
    BAD_REQUEST
    NOT_FOUND
    INELIGIBLE
  }

  union RulesResult = RulesSuccess | RulesError

  type RulesSuccess {
    rules: [Rule!]!
  }

  type Rule {
    id: ID!
    name: String!
    filter: String!
    actions: [RuleAction!]!
    enabled: Boolean!
    createdAt: Date!
    updatedAt: Date
    eventTypes: [RuleEventType!]!
    failedAt: Date
  }

  type RuleAction {
    type: RuleActionType!
    params: [String!]!
  }

  enum RuleActionType {
    ADD_LABEL
    ARCHIVE
    DELETE
    MARK_AS_READ
    SEND_NOTIFICATION
    WEBHOOK
    EXPORT
  }

  type RulesError {
    errorCodes: [RulesErrorCode!]!
  }

  enum RulesErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  enum RuleEventType {
    PAGE_CREATED
    PAGE_UPDATED
    LABEL_CREATED
    HIGHLIGHT_CREATED
    HIGHLIGHT_UPDATED
  }

  input SetRuleInput {
    id: ID
    name: String!
    description: String
    filter: String!
    actions: [RuleActionInput!]!
    enabled: Boolean!
    eventTypes: [RuleEventType!]!
  }

  input RuleActionInput {
    type: RuleActionType!
    params: [String!]!
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

  union DeviceTokensResult = DeviceTokensSuccess | DeviceTokensError

  type DeviceTokensSuccess {
    deviceTokens: [DeviceToken!]!
  }

  type DeviceTokensError {
    errorCodes: [DeviceTokensErrorCode!]!
  }

  enum DeviceTokensErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  input SaveFilterInput {
    name: String!
    filter: String!
    folder: String
    description: String
    position: Int
    category: String
  }

  union SaveFilterResult = SaveFilterSuccess | SaveFilterError

  type SaveFilterSuccess {
    filter: Filter!
  }

  type Filter {
    id: ID!
    name: String!
    filter: String!
    position: Int!
    folder: String
    description: String
    createdAt: Date!
    updatedAt: Date
    defaultFilter: Boolean
    visible: Boolean
    category: String
  }

  type SaveFilterError {
    errorCodes: [SaveFilterErrorCode!]!
  }

  enum SaveFilterErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  union FiltersResult = FiltersSuccess | FiltersError

  type FiltersSuccess {
    filters: [Filter!]!
  }

  type FiltersError {
    errorCodes: [FiltersErrorCode!]!
  }

  enum FiltersErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  union DeleteFilterResult = DeleteFilterSuccess | DeleteFilterError

  type DeleteFilterSuccess {
    filter: Filter!
  }

  type DeleteFilterError {
    errorCodes: [DeleteFilterErrorCode!]!
  }

  enum DeleteFilterErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  input UpdateFilterInput {
    id: String!
    name: String
    filter: String
    position: Int
    folder: String
    description: String
    visible: Boolean
    category: String
  }

  enum UpdateFilterErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  union UpdateFilterResult = UpdateFilterSuccess | UpdateFilterError

  type UpdateFilterSuccess {
    filter: Filter!
  }

  type UpdateFilterError {
    errorCodes: [UpdateFilterErrorCode!]!
  }

  input MoveFilterInput {
    filterId: ID!
    afterFilterId: ID # null to move to the top
  }

  union MoveFilterResult = MoveFilterSuccess | MoveFilterError

  type MoveFilterSuccess {
    filter: Filter!
  }

  type MoveFilterError {
    errorCodes: [MoveFilterErrorCode!]!
  }

  enum MoveFilterErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  input CreateGroupInput {
    name: String! @sanitize(maxLength: 140)
    maxMembers: Int
    expiresInDays: Int
    description: String
    topics: [String!]
    onlyAdminCanPost: Boolean
    onlyAdminCanSeeMembers: Boolean
  }

  union CreateGroupResult = CreateGroupSuccess | CreateGroupError

  type CreateGroupSuccess {
    group: RecommendationGroup!
  }

  type RecommendationGroup {
    id: ID!
    name: String!
    inviteUrl: String!
    admins: [User!]!
    members: [User!]!
    createdAt: Date!
    updatedAt: Date
    canPost: Boolean!
    description: String
    topics: [String!]
    canSeeMembers: Boolean!
  }

  type CreateGroupError {
    errorCodes: [CreateGroupErrorCode!]!
  }

  enum CreateGroupErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  union GroupsResult = GroupsSuccess | GroupsError

  type GroupsSuccess {
    groups: [RecommendationGroup!]!
  }

  type GroupsError {
    errorCodes: [GroupsErrorCode!]!
  }

  enum GroupsErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  input RecommendInput {
    pageId: ID!
    groupIds: [ID!]!
    note: String
    recommendedWithHighlights: Boolean
  }

  union RecommendResult = RecommendSuccess | RecommendError

  type RecommendSuccess {
    success: Boolean!
  }

  type RecommendError {
    errorCodes: [RecommendErrorCode!]!
  }

  enum RecommendErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  union JoinGroupResult = JoinGroupSuccess | JoinGroupError

  type JoinGroupSuccess {
    group: RecommendationGroup!
  }

  type JoinGroupError {
    errorCodes: [JoinGroupErrorCode!]!
  }

  enum JoinGroupErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  input RecommendHighlightsInput {
    pageId: ID!
    highlightIds: [ID!]!
    groupIds: [ID!]!
    note: String
  }

  union RecommendHighlightsResult =
      RecommendHighlightsSuccess
    | RecommendHighlightsError

  type RecommendHighlightsSuccess {
    success: Boolean!
  }

  type RecommendHighlightsError {
    errorCodes: [RecommendHighlightsErrorCode!]!
  }

  enum RecommendHighlightsErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  union LeaveGroupResult = LeaveGroupSuccess | LeaveGroupError

  type LeaveGroupSuccess {
    success: Boolean!
  }

  type LeaveGroupError {
    errorCodes: [LeaveGroupErrorCode!]!
  }

  enum LeaveGroupErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  enum UploadImportFileType {
    URL_LIST
    POCKET
    MATTER
  }

  enum UploadImportFileErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    UPLOAD_DAILY_LIMIT_EXCEEDED
  }

  union UploadImportFileResult = UploadImportFileSuccess | UploadImportFileError

  type UploadImportFileError {
    errorCodes: [UploadImportFileErrorCode!]!
  }

  type UploadImportFileSuccess {
    uploadSignedUrl: String
  }

  union RecentEmailsResult = RecentEmailsSuccess | RecentEmailsError

  type RecentEmailsSuccess {
    recentEmails: [RecentEmail!]!
  }

  type RecentEmailsError {
    errorCodes: [RecentEmailsErrorCode!]!
  }

  enum RecentEmailsErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  type RecentEmail {
    id: ID!
    from: String!
    to: String!
    subject: String!
    type: String!
    text: String!
    html: String
    replyTo: String
    reply: String
    createdAt: Date!
  }

  union MarkEmailAsItemResult = MarkEmailAsItemSuccess | MarkEmailAsItemError

  type MarkEmailAsItemSuccess {
    success: Boolean!
  }

  type MarkEmailAsItemError {
    errorCodes: [MarkEmailAsItemErrorCode!]!
  }

  enum MarkEmailAsItemErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  enum BulkActionType {
    DELETE
    ARCHIVE
    MARK_AS_READ
    ADD_LABELS
    MOVE_TO_FOLDER
    MARK_AS_SEEN
  }

  union BulkActionResult = BulkActionSuccess | BulkActionError

  type BulkActionSuccess {
    success: Boolean!
  }

  type BulkActionError {
    errorCodes: [BulkActionErrorCode!]!
  }

  enum BulkActionErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  union ImportFromIntegrationResult =
      ImportFromIntegrationSuccess
    | ImportFromIntegrationError

  type ImportFromIntegrationSuccess {
    success: Boolean!
  }

  type ImportFromIntegrationError {
    errorCodes: [ImportFromIntegrationErrorCode!]!
  }

  enum ImportFromIntegrationErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  union SetFavoriteArticleResult =
      SetFavoriteArticleSuccess
    | SetFavoriteArticleError

  type SetFavoriteArticleSuccess {
    success: Boolean!
  }

  type SetFavoriteArticleError {
    errorCodes: [SetFavoriteArticleErrorCode!]!
  }

  enum SetFavoriteArticleErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
    ALREADY_EXISTS
  }

  input SubscribeInput {
    url: String!
    subscriptionType: SubscriptionType
    isPrivate: Boolean
    autoAddToLibrary: Boolean
    fetchContent: Boolean
    fetchContentType: FetchContentType
    folder: String
  }

  input UpdateSubscriptionInput {
    id: ID!
    name: String
    description: String
    lastFetchedChecksum: String
    status: SubscriptionStatus
    scheduledAt: Date
    isPrivate: Boolean
    autoAddToLibrary: Boolean
    fetchContent: Boolean
    fetchContentType: FetchContentType
    folder: String
    refreshedAt: Date
    mostRecentItemDate: Date
    failedAt: Date
  }

  union UpdateSubscriptionResult =
      UpdateSubscriptionSuccess
    | UpdateSubscriptionError

  type UpdateSubscriptionSuccess {
    subscription: Subscription!
  }

  type UpdateSubscriptionError {
    errorCodes: [UpdateSubscriptionErrorCode!]!
  }

  enum UpdateSubscriptionErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  union UpdateEmailResult = UpdateEmailSuccess | UpdateEmailError

  type UpdateEmailSuccess {
    email: String!
    verificationEmailSent: Boolean
  }

  type UpdateEmailError {
    errorCodes: [UpdateEmailErrorCode!]!
  }

  enum UpdateEmailErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    EMAIL_ALREADY_EXISTS
  }

  input UpdateEmailInput {
    email: String!
  }

  # Query: GetDiscoverTopic
  union GetDiscoverTopicResults =
      GetDiscoverTopicSuccess
    | GetDiscoverTopicError

  enum GetDiscoverTopicErrorCode {
    UNAUTHORIZED
  }

  type GetDiscoverTopicError {
    errorCodes: [GetDiscoverTopicErrorCode!]!
  }

  type GetDiscoverTopicSuccess {
    discoverTopics: [DiscoverTopic!]
  }

  type DiscoverTopic {
    name: String!
    description: String!
  }

  # Query: GetDiscoverFeedArticle
  union GetDiscoverFeedArticleResults =
      GetDiscoverFeedArticleSuccess
    | GetDiscoverFeedArticleError

  enum GetDiscoverFeedArticleErrorCode {
    UNAUTHORIZED
    NOT_FOUND
    BAD_REQUEST
  }

  type GetDiscoverFeedArticleError {
    errorCodes: [GetDiscoverFeedArticleErrorCode!]!
  }

  type GetDiscoverFeedArticleSuccess {
    discoverArticles: [DiscoverFeedArticle]
    pageInfo: PageInfo!
  }

  type DiscoverFeedArticle {
    id: ID!
    feed: String!
    title: String!
    url: String!
    image: String
    publishedDate: Date
    description: String!
    siteName: String
    slug: String!
    author: String
    savedLinkUrl: String
    savedId: String
  }

  # Mutation: SaveDiscoverArticle
  input SaveDiscoverArticleInput {
    discoverArticleId: ID!
    locale: String
    timezone: String
  }

  union SaveDiscoverArticleResult =
      SaveDiscoverArticleSuccess
    | SaveDiscoverArticleError

  type SaveDiscoverArticleSuccess {
    url: String!
    saveId: String!
  }

  type SaveDiscoverArticleError {
    errorCodes: [SaveDiscoverArticleErrorCode!]!
  }

  enum SaveDiscoverArticleErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  # Mutation: DeleteDiscoverArticle
  input DeleteDiscoverArticleInput {
    discoverArticleId: ID!
  }

  union DeleteDiscoverArticleResult =
      DeleteDiscoverArticleSuccess
    | DeleteDiscoverArticleError

  type DeleteDiscoverArticleSuccess {
    id: ID!
  }

  type DeleteDiscoverArticleError {
    errorCodes: [DeleteDiscoverArticleErrorCode!]!
  }

  enum DeleteDiscoverArticleErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  input FeedsInput {
    after: String
    first: Int
    query: String @sanitize(maxLength: 255)
    sort: SortParams
  }

  union FeedsResult = FeedsSuccess | FeedsError

  type FeedsSuccess {
    edges: [FeedEdge!]!
    pageInfo: PageInfo!
  }

  type FeedEdge {
    cursor: String!
    node: Feed!
  }

  type FeedsError {
    errorCodes: [FeedsErrorCode!]!
  }

  enum FeedsErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  type Feed {
    id: ID
    title: String!
    url: String!
    description: String
    image: String
    createdAt: Date
    updatedAt: Date
    publishedAt: Date
    author: String
    type: String
  }

  union MoveToFolderResult = MoveToFolderSuccess | MoveToFolderError

  type MoveToFolderSuccess {
    success: Boolean!
  }

  type MoveToFolderError {
    errorCodes: [MoveToFolderErrorCode!]!
  }

  enum MoveToFolderErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    ALREADY_EXISTS
  }

  input ScanFeedsInput {
    url: String
    opml: String
  }

  union ScanFeedsResult = ScanFeedsSuccess | ScanFeedsError

  type ScanFeedsSuccess {
    feeds: [Feed!]!
  }

  type ScanFeedsError {
    errorCodes: [ScanFeedsErrorCode!]!
  }

  enum ScanFeedsErrorCode {
    BAD_REQUEST
  }

  union FetchContentResult = FetchContentSuccess | FetchContentError

  type FetchContentSuccess {
    success: Boolean!
  }

  type FetchContentError {
    errorCodes: [FetchContentErrorCode!]!
  }

  enum FetchContentErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  input UpdateNewsletterEmailInput {
    id: ID!
    name: String
    description: String
    folder: String
  }

  union UpdateNewsletterEmailResult =
      UpdateNewsletterEmailSuccess
    | UpdateNewsletterEmailError

  type UpdateNewsletterEmailSuccess {
    newsletterEmail: NewsletterEmail!
  }

  type UpdateNewsletterEmailError {
    errorCodes: [UpdateNewsletterEmailErrorCode!]!
  }

  enum UpdateNewsletterEmailErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  union EmptyTrashResult = EmptyTrashSuccess | EmptyTrashError

  type EmptyTrashSuccess {
    success: Boolean
  }

  type EmptyTrashError {
    errorCodes: [EmptyTrashErrorCode!]!
  }

  enum EmptyTrashErrorCode {
    UNAUTHORIZED
  }

  type DiscoverFeed {
    id: ID!
    title: String!
    link: String!
    description: String
    image: String
    type: String!
    visibleName: String
  }

  union DiscoverFeedResult = DiscoverFeedSuccess | DiscoverFeedError

  type DiscoverFeedSuccess {
    feeds: [DiscoverFeed]!
  }

  type DiscoverFeedError {
    errorCodes: [DiscoverFeedErrorCode!]!
  }

  enum DiscoverFeedErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  input AddDiscoverFeedInput {
    url: String!
  }

  union AddDiscoverFeedResult = AddDiscoverFeedSuccess | AddDiscoverFeedError

  type AddDiscoverFeedSuccess {
    feed: DiscoverFeed!
  }

  type AddDiscoverFeedError {
    errorCodes: [AddDiscoverFeedErrorCode!]!
  }

  enum AddDiscoverFeedErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    CONFLICT
    NOT_FOUND
  }

  union DeleteDiscoverFeedResult =
      DeleteDiscoverFeedSuccess
    | DeleteDiscoverFeedError

  type DeleteDiscoverFeedSuccess {
    id: String!
  }

  type DeleteDiscoverFeedError {
    errorCodes: [DeleteDiscoverFeedErrorCode!]!
  }

  enum DeleteDiscoverFeedErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    CONFLICT
    NOT_FOUND
  }

  input DeleteDiscoverFeedInput {
    feedId: ID!
  }

  union EditDiscoverFeedResult = EditDiscoverFeedSuccess | EditDiscoverFeedError

  type EditDiscoverFeedSuccess {
    id: ID!
  }

  type EditDiscoverFeedError {
    errorCodes: [EditDiscoverFeedErrorCode!]!
  }

  enum EditDiscoverFeedErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    NOT_FOUND
  }

  input EditDiscoverFeedInput {
    feedId: ID!
    name: String!
  }

  union IntegrationResult = IntegrationSuccess | IntegrationError

  type IntegrationSuccess {
    integration: Integration!
  }

  type IntegrationError {
    errorCodes: [IntegrationErrorCode!]!
  }

  enum IntegrationErrorCode {
    NOT_FOUND
  }

  union ExportToIntegrationResult =
      ExportToIntegrationSuccess
    | ExportToIntegrationError

  type ExportToIntegrationSuccess {
    task: Task!
  }

  type Task {
    id: ID!
    name: String!
    state: TaskState!
    createdAt: Date!
    runningTime: Int # in milliseconds
    cancellable: Boolean
    progress: Float
    failedReason: String
  }

  enum TaskState {
    PENDING
    RUNNING
    SUCCEEDED
    FAILED
    CANCELLED
  }

  type ExportToIntegrationError {
    errorCodes: [ExportToIntegrationErrorCode!]!
  }

  enum ExportToIntegrationErrorCode {
    UNAUTHORIZED
    FAILED_TO_CREATE_TASK
  }

  union ReplyToEmailResult = ReplyToEmailSuccess | ReplyToEmailError

  type ReplyToEmailSuccess {
    success: Boolean!
  }

  type ReplyToEmailError {
    errorCodes: [ReplyToEmailErrorCode!]!
  }

  enum ReplyToEmailErrorCode {
    UNAUTHORIZED
  }

  enum AllowedReply {
    YES
    OKAY
    CONFIRM
    SUBSCRIBE
  }

  enum HomeItemSourceType {
    RSS
    NEWSLETTER
    RECOMMENDATION
    LIBRARY
  }

  type HomeItemSource {
    id: ID
    name: String
    url: String
    icon: String
    type: HomeItemSourceType!
  }

  type HomeItem {
    id: ID!
    title: String!
    url: String!
    thumbnail: String
    previewContent: String
    saveCount: Int
    likeCount: Int
    broadcastCount: Int
    date: Date!
    slug: String
    author: String
    dir: String
    seen_at: Date
    wordCount: Int
    source: HomeItemSource
    canSave: Boolean
    canComment: Boolean
    canShare: Boolean
    canArchive: Boolean
    canDelete: Boolean
    score: Float
    canMove: Boolean
  }

  type HomeSection {
    title: String
    layout: String
    items: [HomeItem!]!
    thumbnail: String
  }

  type HomeEdge {
    cursor: String!
    node: HomeSection!
  }

  type HomeSuccess {
    edges: [HomeEdge!]!
    pageInfo: PageInfo!
  }

  enum HomeErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    PENDING
  }

  type HomeError {
    errorCodes: [HomeErrorCode!]!
  }

  union HomeResult = HomeSuccess | HomeError

  type SubscriptionRootType {
    hello: String # for testing only
  }

  type SubscriptionSuccess {
    subscription: Subscription!
  }

  type SubscriptionError {
    errorCodes: [ErrorCode!]!
  }

  union SubscriptionResult = SubscriptionSuccess | SubscriptionError

  type RefreshHomeSuccess {
    success: Boolean!
  }

  enum RefreshHomeErrorCode {
    PENDING
  }

  type RefreshHomeError {
    errorCodes: [RefreshHomeErrorCode!]!
  }

  union RefreshHomeResult = RefreshHomeSuccess | RefreshHomeError

  union HiddenHomeSectionResult =
      HiddenHomeSectionSuccess
    | HiddenHomeSectionError

  type HiddenHomeSectionSuccess {
    section: HomeSection
  }

  type HiddenHomeSectionError {
    errorCodes: [HiddenHomeSectionErrorCode!]!
  }

  enum HiddenHomeSectionErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
    PENDING
  }

  union HighlightsResult = HighlightsSuccess | HighlightsError

  type HighlightsSuccess {
    edges: [HighlightEdge!]!
    pageInfo: PageInfo!
  }

  type HighlightEdge {
    cursor: String!
    node: Highlight!
  }

  type HighlightsError {
    errorCodes: [HighlightsErrorCode!]!
  }

  enum HighlightsErrorCode {
    BAD_REQUEST
  }

  type FolderPolicy {
    id: ID!
    folder: String!
    action: FolderPolicyAction!
    afterDays: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  enum FolderPolicyAction {
    ARCHIVE
    DELETE
  }

  union FolderPoliciesResult = FolderPoliciesSuccess | FolderPoliciesError

  type FolderPoliciesSuccess {
    policies: [FolderPolicy!]!
  }

  type FolderPoliciesError {
    errorCodes: [FolderPoliciesErrorCode!]!
  }

  enum FolderPoliciesErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  input CreateFolderPolicyInput {
    folder: String! @sanitize(minLength: 1, maxLength: 255)
    action: FolderPolicyAction!
    afterDays: Int!
  }

  union CreateFolderPolicyResult =
      CreateFolderPolicySuccess
    | CreateFolderPolicyError

  type CreateFolderPolicySuccess {
    policy: FolderPolicy!
  }

  type CreateFolderPolicyError {
    errorCodes: [CreateFolderPolicyErrorCode!]!
  }

  enum CreateFolderPolicyErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  union DeleteFolderPolicyResult =
      DeleteFolderPolicySuccess
    | DeleteFolderPolicyError

  type DeleteFolderPolicySuccess {
    success: Boolean!
  }

  type DeleteFolderPolicyError {
    errorCodes: [DeleteFolderPolicyErrorCode!]!
  }

  enum DeleteFolderPolicyErrorCode {
    UNAUTHORIZED
  }

  union UpdateFolderPolicyResult =
      UpdateFolderPolicySuccess
    | UpdateFolderPolicyError

  type UpdateFolderPolicySuccess {
    policy: FolderPolicy!
  }

  type UpdateFolderPolicyError {
    errorCodes: [UpdateFolderPolicyErrorCode!]!
  }

  enum UpdateFolderPolicyErrorCode {
    UNAUTHORIZED
    BAD_REQUEST
  }

  input UpdateFolderPolicyInput {
    id: ID!
    action: FolderPolicyAction
    afterDays: Int
  }

  # Mutations
  type Mutation {
    googleLogin(input: GoogleLoginInput!): LoginResult!
    googleSignup(input: GoogleSignupInput!): GoogleSignupResult!
    logOut: LogOutResult!
    deleteAccount(userID: ID!): DeleteAccountResult!
    updateUser(input: UpdateUserInput!): UpdateUserResult!
    updateUserProfile(input: UpdateUserProfileInput!): UpdateUserProfileResult!
    updateEmail(input: UpdateEmailInput!): UpdateEmailResult!
    createArticle(input: CreateArticleInput!): CreateArticleResult!
    createHighlight(input: CreateHighlightInput!): CreateHighlightResult!
    mergeHighlight(input: MergeHighlightInput!): MergeHighlightResult!
    updateHighlight(input: UpdateHighlightInput!): UpdateHighlightResult!
    deleteHighlight(highlightId: ID!): DeleteHighlightResult!
    # createHighlightReply(
    #   input: CreateHighlightReplyInput!
    # ): CreateHighlightReplyResult!
    # updateHighlightReply(
    #   input: UpdateHighlightReplyInput!
    # ): UpdateHighlightReplyResult!
    # deleteHighlightReply(highlightReplyId: ID!): DeleteHighlightReplyResult!
    # createReaction(input: CreateReactionInput!): CreateReactionResult!
    # deleteReaction(id: ID!): DeleteReactionResult!
    uploadFileRequest(input: UploadFileRequestInput!): UploadFileRequestResult!
    saveArticleReadingProgress(
      input: SaveArticleReadingProgressInput!
    ): SaveArticleReadingProgressResult!
    # setShareArticle(input: SetShareArticleInput!): SetShareArticleResult!
    # updateSharedComment(
    #   input: UpdateSharedCommentInput!
    # ): UpdateSharedCommentResult!
    # setFollow(input: SetFollowInput!): SetFollowResult!
    setBookmarkArticle(
      input: SetBookmarkArticleInput!
    ): SetBookmarkArticleResult!
    setUserPersonalization(
      input: SetUserPersonalizationInput!
    ): SetUserPersonalizationResult!
    createArticleSavingRequest(
      input: CreateArticleSavingRequestInput!
    ): CreateArticleSavingRequestResult!
    # setShareHighlight(input: SetShareHighlightInput!): SetShareHighlightResult!
    reportItem(input: ReportItemInput!): ReportItemResult!
    # updateLinkShareInfo(
    #   input: UpdateLinkShareInfoInput!
    # ): UpdateLinkShareInfoResult!
    setLinkArchived(input: ArchiveLinkInput!): ArchiveLinkResult!
    createNewsletterEmail(
      input: CreateNewsletterEmailInput
    ): CreateNewsletterEmailResult!
    deleteNewsletterEmail(newsletterEmailId: ID!): DeleteNewsletterEmailResult!
    saveUrl(input: SaveUrlInput!): SaveResult!
    savePage(input: SavePageInput!): SaveResult!
    updatePage(input: UpdatePageInput!): UpdatePageResult!
    saveFile(input: SaveFileInput!): SaveResult!
    # createReminder(input: CreateReminderInput!): CreateReminderResult!
    # updateReminder(input: UpdateReminderInput!): UpdateReminderResult!
    # deleteReminder(id: ID!): DeleteReminderResult!
    setDeviceToken(input: SetDeviceTokenInput!): SetDeviceTokenResult!
    createLabel(input: CreateLabelInput!): CreateLabelResult!
    updateLabel(input: UpdateLabelInput!): UpdateLabelResult!
    deleteLabel(id: ID!): DeleteLabelResult!
    setLabels(input: SetLabelsInput!): SetLabelsResult!
    generateApiKey(input: GenerateApiKeyInput!): GenerateApiKeyResult!
    unsubscribe(name: String!, subscriptionId: ID): UnsubscribeResult!
    subscribe(input: SubscribeInput!): SubscribeResult!
    addPopularRead(name: String!): AddPopularReadResult!
    saveDiscoverArticle(
      input: SaveDiscoverArticleInput!
    ): SaveDiscoverArticleResult!
    deleteDiscoverArticle(
      input: DeleteDiscoverArticleInput!
    ): DeleteDiscoverArticleResult!
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
    saveFilter(input: SaveFilterInput!): SaveFilterResult!
    deleteFilter(id: ID!): DeleteFilterResult!
    moveFilter(input: MoveFilterInput!): MoveFilterResult!
    updateFilter(input: UpdateFilterInput!): UpdateFilterResult!
    createGroup(input: CreateGroupInput!): CreateGroupResult!
    recommend(input: RecommendInput!): RecommendResult!
    joinGroup(inviteCode: String!): JoinGroupResult!
    recommendHighlights(
      input: RecommendHighlightsInput!
    ): RecommendHighlightsResult!
    leaveGroup(groupId: ID!): LeaveGroupResult!
    uploadImportFile(
      type: UploadImportFileType!
      contentType: String!
    ): UploadImportFileResult!
    markEmailAsItem(recentEmailId: ID!): MarkEmailAsItemResult!
    replyToEmail(recentEmailId: ID!, reply: AllowedReply!): ReplyToEmailResult!
    bulkAction(
      query: String!
      action: BulkActionType!
      labelIds: [ID!]
      expectedCount: Int # max number of items to process
      async: Boolean # if true, return immediately and process in the background
      arguments: JSON # additional arguments for the action
    ): BulkActionResult!
    importFromIntegration(integrationId: ID!): ImportFromIntegrationResult!
    exportToIntegration(integrationId: ID!): ExportToIntegrationResult!
    setFavoriteArticle(id: ID!): SetFavoriteArticleResult!
    updateSubscription(
      input: UpdateSubscriptionInput!
    ): UpdateSubscriptionResult!
    moveToFolder(id: ID!, folder: String!): MoveToFolderResult!
    fetchContent(id: ID!): FetchContentResult!
    updateNewsletterEmail(
      input: UpdateNewsletterEmailInput!
    ): UpdateNewsletterEmailResult!
    addDiscoverFeed(input: AddDiscoverFeedInput!): AddDiscoverFeedResult!
    deleteDiscoverFeed(
      input: DeleteDiscoverFeedInput!
    ): DeleteDiscoverFeedResult!
    editDiscoverFeed(input: EditDiscoverFeedInput!): EditDiscoverFeedResult!
    emptyTrash: EmptyTrashResult!
    refreshHome: RefreshHomeResult!
    createFolderPolicy(
      input: CreateFolderPolicyInput!
    ): CreateFolderPolicyResult!
    updateFolderPolicy(
      input: UpdateFolderPolicyInput!
    ): UpdateFolderPolicyResult!
    deleteFolderPolicy(id: ID!): DeleteFolderPolicyResult!
  }

  # FIXME: remove sort from feedArticles after all cached tabs are closed
  # FIXME: sharedOnly is legacy
  type Query {
    hello: String
    me: User
    user(userId: ID, username: String): UserResult!
    article(username: String!, slug: String!, format: String): ArticleResult!
    # sharedArticle(
    #   username: String!
    #   slug: String!
    #   selectedHighlightId: String
    # ): SharedArticleResult!
    # feedArticles(
    #   after: String
    #   first: Int
    #   sort: SortParams
    #   sharedByUser: ID
    # ): FeedArticlesResult!
    users: UsersResult!
    validateUsername(username: String!): Boolean!
    # getFollowers(userId: ID): GetFollowersResult!
    # getFollowing(userId: ID): GetFollowingResult!
    getUserPersonalization: GetUserPersonalizationResult!
    articleSavingRequest(id: ID, url: String): ArticleSavingRequestResult!
    newsletterEmails: NewsletterEmailsResult!
    # reminder(linkId: ID!): ReminderResult!
    labels: LabelsResult!
    search(
      after: String
      first: Int
      query: String
      includeContent: Boolean
      format: String
    ): SearchResult!
    getDiscoverFeedArticles(
      discoverTopicId: String!
      feedId: ID
      after: String
      first: Int
    ): GetDiscoverFeedArticleResults!
    discoverTopics: GetDiscoverTopicResults!
    subscriptions(
      sort: SortParams
      type: SubscriptionType
    ): SubscriptionsResult!
    sendInstallInstructions: SendInstallInstructionsResult!
    webhooks: WebhooksResult!
    webhook(id: ID!): WebhookResult!
    apiKeys: ApiKeysResult!
    typeaheadSearch(query: String!, first: Int): TypeaheadSearchResult!
    updatesSince(
      after: String
      first: Int
      since: Date!
      sort: SortParams
      folder: String
    ): UpdatesSinceResult!
    integration(name: String!): IntegrationResult!
    integrations: IntegrationsResult!
    recentSearches: RecentSearchesResult!
    rules(enabled: Boolean): RulesResult!
    deviceTokens: DeviceTokensResult!
    filters: FiltersResult!
    groups: GroupsResult!
    recentEmails: RecentEmailsResult!
    feeds(input: FeedsInput!): FeedsResult!
    discoverFeeds: DiscoverFeedResult!
    scanFeeds(input: ScanFeedsInput!): ScanFeedsResult!
    home(first: Int, after: String): HomeResult!
    subscription(id: ID!): SubscriptionResult!
    hiddenHomeSection: HiddenHomeSectionResult!
    highlights(after: String, first: Int, query: String): HighlightsResult!
    folderPolicies: FolderPoliciesResult!
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: SubscriptionRootType
  }
`

export default schema
