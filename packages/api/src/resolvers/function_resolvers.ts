/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createHmac } from 'crypto'
import {
  EXISTING_NEWSLETTER_FOLDER,
  NewsletterEmail,
} from '../entity/newsletter_email'
import {
  DEFAULT_SUBSCRIPTION_FOLDER,
  Subscription,
} from '../entity/subscription'
import { env } from '../env'
import {
  Article,
  Highlight,
  Label,
  PageType,
  Recommendation,
  SearchItem,
  User,
} from '../generated/graphql'
import { getAISummary } from '../services/ai-summaries'
import { findUserFeatures } from '../services/features'
import { findHighlightsByLibraryItemId } from '../services/highlights'
import { findLabelsByLibraryItemId } from '../services/labels'
import { findRecommendationsByLibraryItemId } from '../services/recommendation'
import { findUploadFileById } from '../services/upload_file'
import {
  highlightDataToHighlight,
  isBase64Image,
  recommandationDataToRecommendation,
  validatedDate,
  wordsCount,
} from '../utils/helpers'
import { createImageProxyUrl } from '../utils/imageproxy'
import {
  generateDownloadSignedUrl,
  generateUploadFilePathName,
} from '../utils/uploads'
import { emptyTrashResolver, fetchContentResolver } from './article'
import {
  addDiscoverFeedResolver,
  deleteDiscoverArticleResolver,
  deleteDiscoverFeedsResolver,
  editDiscoverFeedsResolver,
  getDiscoverFeedArticlesResolver,
  getDiscoverFeedsResolver,
  saveDiscoverArticleResolver,
} from './discover_feeds'
import { optInFeatureResolver } from './features'
import { uploadImportFileResolver } from './importers/uploadImportFileResolver'
import {
  addPopularReadResolver,
  apiKeysResolver,
  articleSavingRequestResolver,
  bulkActionResolver,
  createArticleResolver,
  createArticleSavingRequestResolver,
  createGroupResolver,
  createHighlightResolver,
  createLabelResolver,
  createNewsletterEmailResolver,
  // createReminderResolver,
  deleteAccountResolver,
  deleteFilterResolver,
  deleteHighlightResolver,
  deleteIntegrationResolver,
  deleteLabelResolver,
  deleteNewsletterEmailResolver,
  // deleteReminderResolver,
  deleteRuleResolver,
  deleteWebhookResolver,
  deviceTokensResolver,
  exportToIntegrationResolver,
  feedsResolver,
  filtersResolver,
  generateApiKeyResolver,
  getAllUsersResolver,
  getArticleResolver,
  // getFollowersResolver,
  // getFollowingResolver,
  getMeUserResolver,
  // getSharedArticleResolver,
  // getUserFeedArticlesResolver,
  getUserPersonalizationResolver,
  getUserResolver,
  googleLoginResolver,
  googleSignupResolver,
  groupsResolver,
  importFromIntegrationResolver,
  integrationResolver,
  integrationsResolver,
  joinGroupResolver,
  labelsResolver,
  leaveGroupResolver,
  logOutResolver,
  mergeHighlightResolver,
  moveFilterResolver,
  moveLabelResolver,
  moveToFolderResolver,
  newsletterEmailsResolver,
  recommendHighlightsResolver,
  recommendResolver,
  // reminderResolver,
  reportItemResolver,
  revokeApiKeyResolver,
  rulesResolver,
  saveArticleReadingProgressResolver,
  saveFileResolver,
  saveFilterResolver,
  savePageResolver,
  saveUrlResolver,
  scanFeedsResolver,
  searchResolver,
  sendInstallInstructionsResolver,
  setBookmarkArticleResolver,
  setDeviceTokenResolver,
  setFavoriteArticleResolver,
  // setFollowResolver,
  setIntegrationResolver,
  setLabelsForHighlightResolver,
  setLabelsResolver,
  setLinkArchivedResolver,
  setRuleResolver,
  // setShareArticleResolver,
  // setShareHighlightResolver,
  setUserPersonalizationResolver,
  setWebhookResolver,
  subscribeResolver,
  subscriptionsResolver,
  typeaheadSearchResolver,
  unsubscribeResolver,
  updateFilterResolver,
  updateHighlightResolver,
  updateLabelResolver,
  updateNewsletterEmailResolver,
  // updateLinkShareInfoResolver,
  updatePageResolver,
  // updateReminderResolver,
  // updateSharedCommentResolver,
  updatesSinceResolver,
  updateSubscriptionResolver,
  updateUserProfileResolver,
  updateUserResolver,
  uploadFileRequestResolver,
  validateUsernameResolver,
  webhookResolver,
  webhooksResolver,
} from './index'
import {
  markEmailAsItemResolver,
  recentEmailsResolver,
  replyToEmailResolver,
} from './recent_emails'
import { recentSearchesResolver } from './recent_searches'
import { WithDataSourcesContext } from './types'
import { updateEmailResolver } from './user'

/* eslint-disable @typescript-eslint/naming-convention */
type ResultResolveType = {
  [x: string]: {
    __resolveType: (obj: { errorCodes: string[] | undefined }) => string
  }
}

const resultResolveTypeResolver = (
  resolverName: string
): ResultResolveType => ({
  [`${resolverName}Result`]: {
    __resolveType: (obj) =>
      obj.errorCodes ? `${resolverName}Error` : `${resolverName}Success`,
  },
})

const readingProgressHandlers = {
  async readingProgressPercent(
    article: { id: string; readingProgressPercent?: number },
    _: unknown,
    ctx: WithDataSourcesContext
  ) {
    if (ctx.claims?.uid) {
      const readingProgress =
        await ctx.dataSources.readingProgress.getReadingProgress(
          ctx.claims?.uid,
          article.id
        )
      if (readingProgress) {
        return Math.max(
          article.readingProgressPercent ?? 0,
          readingProgress.readingProgressPercent
        )
      }
    }
    return article.readingProgressPercent
  },
  async readingProgressAnchorIndex(
    article: { id: string; readingProgressAnchorIndex?: number },
    _: unknown,
    ctx: WithDataSourcesContext
  ) {
    if (ctx.claims?.uid) {
      const readingProgress =
        await ctx.dataSources.readingProgress.getReadingProgress(
          ctx.claims?.uid,
          article.id
        )
      if (readingProgress && readingProgress.readingProgressAnchorIndex) {
        return Math.max(
          article.readingProgressAnchorIndex ?? 0,
          readingProgress.readingProgressAnchorIndex
        )
      }
    }
    return article.readingProgressAnchorIndex
  },
  async readingProgressTopPercent(
    article: { id: string; readingProgressTopPercent?: number },
    _: unknown,
    ctx: WithDataSourcesContext
  ) {
    if (ctx.claims?.uid) {
      const readingProgress =
        await ctx.dataSources.readingProgress.getReadingProgress(
          ctx.claims?.uid,
          article.id
        )
      if (readingProgress && readingProgress.readingProgressTopPercent) {
        return Math.max(
          article.readingProgressTopPercent ?? 0,
          readingProgress.readingProgressTopPercent
        )
      }
    }
    return article.readingProgressTopPercent
  },
}

// Provide resolver functions for your schema fields
export const functionResolvers = {
  Mutation: {
    googleLogin: googleLoginResolver,
    googleSignup: googleSignupResolver,
    logOut: logOutResolver,
    deleteAccount: deleteAccountResolver,
    saveArticleReadingProgress: saveArticleReadingProgressResolver,
    updateUser: updateUserResolver,
    updateUserProfile: updateUserProfileResolver,
    createArticle: createArticleResolver,
    createHighlight: createHighlightResolver,
    // createReaction: createReactionResolver,
    // deleteReaction: deleteReactionResolver,
    mergeHighlight: mergeHighlightResolver,
    updateHighlight: updateHighlightResolver,
    deleteHighlight: deleteHighlightResolver,
    uploadFileRequest: uploadFileRequestResolver,
    // setShareArticle: setShareArticleResolver,
    // updateSharedComment: updateSharedCommentResolver,
    // setFollow: setFollowResolver,
    setBookmarkArticle: setBookmarkArticleResolver,
    setUserPersonalization: setUserPersonalizationResolver,
    createArticleSavingRequest: createArticleSavingRequestResolver,
    // setShareHighlight: setShareHighlightResolver,
    reportItem: reportItemResolver,
    // updateLinkShareInfo: updateLinkShareInfoResolver,
    setLinkArchived: setLinkArchivedResolver,
    createNewsletterEmail: createNewsletterEmailResolver,
    deleteNewsletterEmail: deleteNewsletterEmailResolver,
    saveUrl: saveUrlResolver,
    savePage: savePageResolver,
    saveFile: saveFileResolver,
    // createReminder: createReminderResolver,
    // updateReminder: updateReminderResolver,
    // deleteReminder: deleteReminderResolver,
    setDeviceToken: setDeviceTokenResolver,
    createLabel: createLabelResolver,
    updateLabel: updateLabelResolver,
    deleteLabel: deleteLabelResolver,
    setLabels: setLabelsResolver,
    generateApiKey: generateApiKeyResolver,
    unsubscribe: unsubscribeResolver,
    updatePage: updatePageResolver,
    subscribe: subscribeResolver,
    addPopularRead: addPopularReadResolver,
    setWebhook: setWebhookResolver,
    deleteWebhook: deleteWebhookResolver,
    revokeApiKey: revokeApiKeyResolver,
    setLabelsForHighlight: setLabelsForHighlightResolver,
    moveLabel: moveLabelResolver,
    setIntegration: setIntegrationResolver,
    deleteIntegration: deleteIntegrationResolver,
    optInFeature: optInFeatureResolver,
    setRule: setRuleResolver,
    deleteRule: deleteRuleResolver,
    saveFilter: saveFilterResolver,
    deleteFilter: deleteFilterResolver,
    moveFilter: moveFilterResolver,
    createGroup: createGroupResolver,
    recommend: recommendResolver,
    joinGroup: joinGroupResolver,
    recommendHighlights: recommendHighlightsResolver,
    leaveGroup: leaveGroupResolver,
    uploadImportFile: uploadImportFileResolver,
    markEmailAsItem: markEmailAsItemResolver,
    bulkAction: bulkActionResolver,
    importFromIntegration: importFromIntegrationResolver,
    setFavoriteArticle: setFavoriteArticleResolver,
    updateSubscription: updateSubscriptionResolver,
    updateFilter: updateFilterResolver,
    updateEmail: updateEmailResolver,
    saveDiscoverArticle: saveDiscoverArticleResolver,
    deleteDiscoverArticle: deleteDiscoverArticleResolver,
    moveToFolder: moveToFolderResolver,
    updateNewsletterEmail: updateNewsletterEmailResolver,
    addDiscoverFeed: addDiscoverFeedResolver,
    deleteDiscoverFeed: deleteDiscoverFeedsResolver,
    editDiscoverFeed: editDiscoverFeedsResolver,
    emptyTrash: emptyTrashResolver,
    fetchContent: fetchContentResolver,
    exportToIntegration: exportToIntegrationResolver,
    replyToEmail: replyToEmailResolver,
  },
  Query: {
    me: getMeUserResolver,
    getDiscoverFeedArticles: getDiscoverFeedArticlesResolver,
    discoverFeeds: getDiscoverFeedsResolver,
    user: getUserResolver,
    users: getAllUsersResolver,
    validateUsername: validateUsernameResolver,
    article: getArticleResolver,
    // sharedArticle: getSharedArticleResolver,
    // feedArticles: getUserFeedArticlesResolver,
    // getFollowers: getFollowersResolver,
    // getFollowing: getFollowingResolver,
    getUserPersonalization: getUserPersonalizationResolver,
    articleSavingRequest: articleSavingRequestResolver,
    newsletterEmails: newsletterEmailsResolver,
    // reminder: reminderResolver,
    labels: labelsResolver,
    search: searchResolver,
    subscriptions: subscriptionsResolver,
    sendInstallInstructions: sendInstallInstructionsResolver,
    webhooks: webhooksResolver,
    webhook: webhookResolver,
    apiKeys: apiKeysResolver,
    typeaheadSearch: typeaheadSearchResolver,
    updatesSince: updatesSinceResolver,
    integrations: integrationsResolver,
    recentSearches: recentSearchesResolver,
    rules: rulesResolver,
    deviceTokens: deviceTokensResolver,
    filters: filtersResolver,
    groups: groupsResolver,
    recentEmails: recentEmailsResolver,
    feeds: feedsResolver,
    scanFeeds: scanFeedsResolver,
    integration: integrationResolver,
  },
  User: {
    async intercomHash(
      user: User,
      __: Record<string, unknown>,
      ctx: WithDataSourcesContext
    ) {
      if (env.intercom.secretKey) {
        const userIdentifier = user.id.toString()

        return createHmac('sha256', env.intercom.secretKey)
          .update(userIdentifier)
          .digest('hex')
      }
      return undefined
    },
    async features(
      _: User,
      __: Record<string, unknown>,
      ctx: WithDataSourcesContext
    ) {
      if (!ctx.claims?.uid) {
        return undefined
      }

      return []
    },
    async featureList(
      _: User,
      __: Record<string, unknown>,
      ctx: WithDataSourcesContext
    ) {
      if (!ctx.claims?.uid) {
        return undefined
      }

      return findUserFeatures(ctx.claims.uid)
    },
  },
  Article: {
    async url(article: Article, _: unknown, ctx: WithDataSourcesContext) {
      if (
        (article.pageType == PageType.File ||
          article.pageType == PageType.Book) &&
        ctx.claims &&
        article.uploadFileId
      ) {
        const upload = await findUploadFileById(article.uploadFileId)
        if (!upload || !upload.fileName) {
          return undefined
        }
        const filePath = generateUploadFilePathName(upload.id, upload.fileName)
        return generateDownloadSignedUrl(filePath)
      }
      return article.url
    },
    originalArticleUrl(article: { url: string }) {
      return article.url
    },
    hasContent(article: {
      content: string | null
      originalHtml: string | null
    }) {
      return !!article.originalHtml && !!article.content
    },
    publishedAt(article: { publishedAt: Date }) {
      return validatedDate(article.publishedAt)
    },
    image(article: { image?: string }): string | undefined {
      return article.image && createImageProxyUrl(article.image, 320, 320)
    },
    wordsCount(article: { wordCount?: number; content?: string }) {
      if (article.wordCount) return article.wordCount
      return article.content ? wordsCount(article.content) : undefined
    },
    async labels(
      article: { id: string; labels?: Label[] },
      _: unknown,
      ctx: WithDataSourcesContext
    ) {
      if (article.labels) return article.labels

      return findLabelsByLibraryItemId(article.id, ctx.uid)
    },
    ...readingProgressHandlers,
  },
  Highlight: {
    // async reactions(
    //   highlight: { id: string; reactions?: Reaction[] },
    //   _: unknown,
    //   ctx: WithDataSourcesContext
    // ) {
    //   const { reactions, id } = highlight
    //   if (reactions) return reactions

    //   return await ctx.models.reaction.batchGetFromHighlight(id)
    // },
    createdByMe(
      highlight: { user: { id: string } },
      __: unknown,
      ctx: WithDataSourcesContext
    ) {
      return highlight.user.id === ctx.uid
    },
  },
  // Reaction: {
  //   async user(
  //     reaction: { userId: string },
  //     __: unknown,
  //     ctx: WithDataSourcesContext
  //   ) {
  //     return userDataToUser(await ctx.models.user.get(reaction.userId))
  //   },
  // },
  SearchItem: {
    async url(item: SearchItem, _: unknown, ctx: WithDataSourcesContext) {
      if (
        (item.pageType == PageType.File || item.pageType == PageType.Book) &&
        ctx.claims &&
        item.uploadFileId
      ) {
        const upload = await findUploadFileById(item.uploadFileId)
        if (!upload || !upload.fileName) {
          return undefined
        }
        const filePath = generateUploadFilePathName(upload.id, upload.fileName)
        return generateDownloadSignedUrl(filePath)
      }
      return item.url
    },
    image(item: SearchItem) {
      return item.image && createImageProxyUrl(item.image, 320, 320)
    },
    originalArticleUrl(item: { url: string }) {
      return item.url
    },
    wordsCount(item: { wordCount?: number; content?: string }) {
      if (item.wordCount) return item.wordCount
      return item.content ? wordsCount(item.content) : undefined
    },
    siteIcon(item: { siteIcon?: string }) {
      if (item.siteIcon && !isBase64Image(item.siteIcon)) {
        return createImageProxyUrl(item.siteIcon, 128, 128)
      }

      return item.siteIcon
    },
    async labels(
      item: { id: string; labels?: Label[] },
      _: unknown,
      ctx: WithDataSourcesContext
    ) {
      if (item.labels) return item.labels

      return findLabelsByLibraryItemId(item.id, ctx.uid)
    },
    async recommendations(
      item: {
        id: string
        recommendations?: Recommendation[]
        recommenderNames?: string[] | null
      },
      _: unknown,
      ctx: WithDataSourcesContext
    ) {
      if (item.recommendations) return item.recommendations

      if (item.recommenderNames && item.recommenderNames.length > 0) {
        const recommendations = await findRecommendationsByLibraryItemId(
          item.id,
          ctx.uid
        )
        return recommendations.map(recommandationDataToRecommendation)
      }

      return []
    },
    async aiSummary(item: SearchItem, _: unknown, ctx: WithDataSourcesContext) {
      return (
        await getAISummary({
          userId: ctx.uid,
          libraryItemId: item.id,
          idx: 'latest',
        })
      )?.summary
    },
    async highlights(
      item: {
        id: string
        highlights?: Highlight[]
      },
      _: unknown,
      ctx: WithDataSourcesContext
    ) {
      if (item.highlights) return item.highlights

      const highlights = await findHighlightsByLibraryItemId(item.id, ctx.uid)
      return highlights.map(highlightDataToHighlight)
    },
    ...readingProgressHandlers,
  },
  Subscription: {
    newsletterEmail(subscription: Subscription) {
      return subscription.newsletterEmail?.address
    },
    icon(subscription: Subscription) {
      return (
        subscription.icon && createImageProxyUrl(subscription.icon, 128, 128)
      )
    },
    folder(subscription: Subscription) {
      return (
        subscription.folder ||
        subscription.newsletterEmail?.folder ||
        DEFAULT_SUBSCRIPTION_FOLDER
      )
    },
    // for campability with old clients
    lastFetchedAt(subscription: Subscription) {
      return subscription.refreshedAt
    },
  },
  NewsletterEmail: {
    subscriptionCount(newsletterEmail: NewsletterEmail) {
      return newsletterEmail.subscriptions?.length || 0
    },
    folder(newsletterEmail: NewsletterEmail) {
      return newsletterEmail.folder || EXISTING_NEWSLETTER_FOLDER
    },
  },
  ...resultResolveTypeResolver('Login'),
  ...resultResolveTypeResolver('LogOut'),
  ...resultResolveTypeResolver('GoogleSignup'),
  ...resultResolveTypeResolver('UpdateUser'),
  ...resultResolveTypeResolver('UpdateUserProfile'),
  ...resultResolveTypeResolver('Article'),
  // ...resultResolveTypeResolver('SharedArticle'),
  ...resultResolveTypeResolver('Articles'),
  ...resultResolveTypeResolver('User'),
  ...resultResolveTypeResolver('Users'),
  ...resultResolveTypeResolver('SaveArticleReadingProgress'),
  // ...resultResolveTypeResolver('FeedArticles'),
  ...resultResolveTypeResolver('CreateArticle'),
  ...resultResolveTypeResolver('CreateHighlight'),
  // ...resultResolveTypeResolver('CreateReaction'),
  // ...resultResolveTypeResolver('DeleteReaction'),
  ...resultResolveTypeResolver('MergeHighlight'),
  ...resultResolveTypeResolver('UpdateHighlight'),
  ...resultResolveTypeResolver('DeleteHighlight'),
  ...resultResolveTypeResolver('UploadFileRequest'),
  // ...resultResolveTypeResolver('SetShareArticle'),
  // ...resultResolveTypeResolver('UpdateSharedComment'),
  ...resultResolveTypeResolver('SetBookmarkArticle'),
  // ...resultResolveTypeResolver('SetFollow'),
  // ...resultResolveTypeResolver('GetFollowers'),
  // ...resultResolveTypeResolver('GetFollowing'),
  ...resultResolveTypeResolver('GetUserPersonalization'),
  ...resultResolveTypeResolver('SetUserPersonalization'),
  ...resultResolveTypeResolver('ArticleSavingRequest'),
  ...resultResolveTypeResolver('CreateArticleSavingRequest'),
  // ...resultResolveTypeResolver('SetShareHighlight'),
  ...resultResolveTypeResolver('ArchiveLink'),
  ...resultResolveTypeResolver('CreateNewsletterEmail'),
  ...resultResolveTypeResolver('NewsletterEmails'),
  ...resultResolveTypeResolver('DeleteNewsletterEmail'),
  ...resultResolveTypeResolver('CreateReminder'),
  ...resultResolveTypeResolver('Reminder'),
  ...resultResolveTypeResolver('UpdateReminder'),
  ...resultResolveTypeResolver('DeleteReminder'),
  ...resultResolveTypeResolver('SetDeviceToken'),
  ...resultResolveTypeResolver('Save'),
  ...resultResolveTypeResolver('Labels'),
  ...resultResolveTypeResolver('CreateLabel'),
  ...resultResolveTypeResolver('DeleteLabel'),
  ...resultResolveTypeResolver('SetLabels'),
  ...resultResolveTypeResolver('GenerateApiKey'),
  ...resultResolveTypeResolver('Search'),
  ...resultResolveTypeResolver('Subscriptions'),
  ...resultResolveTypeResolver('Unsubscribe'),
  ...resultResolveTypeResolver('UpdateLabel'),
  ...resultResolveTypeResolver('SendInstallInstructions'),
  ...resultResolveTypeResolver('UpdatePage'),
  ...resultResolveTypeResolver('Subscribe'),
  ...resultResolveTypeResolver('AddPopularRead'),
  ...resultResolveTypeResolver('SetWebhook'),
  ...resultResolveTypeResolver('Webhooks'),
  ...resultResolveTypeResolver('DeleteWebhook'),
  ...resultResolveTypeResolver('Webhook'),
  ...resultResolveTypeResolver('ApiKeys'),
  ...resultResolveTypeResolver('RevokeApiKey'),
  ...resultResolveTypeResolver('DeleteAccount'),
  ...resultResolveTypeResolver('TypeaheadSearch'),
  ...resultResolveTypeResolver('UpdatesSince'),
  ...resultResolveTypeResolver('MoveLabel'),
  ...resultResolveTypeResolver('SetIntegration'),
  ...resultResolveTypeResolver('Integrations'),
  ...resultResolveTypeResolver('DeleteIntegration'),
  ...resultResolveTypeResolver('RecentSearches'),
  ...resultResolveTypeResolver('OptInFeature'),
  ...resultResolveTypeResolver('SetRule'),
  ...resultResolveTypeResolver('Rules'),
  ...resultResolveTypeResolver('DeviceTokens'),
  ...resultResolveTypeResolver('DeleteRule'),
  ...resultResolveTypeResolver('SaveFilter'),
  ...resultResolveTypeResolver('Filters'),
  ...resultResolveTypeResolver('DeleteFilter'),
  ...resultResolveTypeResolver('MoveFilter'),
  ...resultResolveTypeResolver('CreateGroup'),
  ...resultResolveTypeResolver('Groups'),
  ...resultResolveTypeResolver('Recommend'),
  ...resultResolveTypeResolver('JoinGroup'),
  ...resultResolveTypeResolver('RecommendHighlights'),
  ...resultResolveTypeResolver('LeaveGroup'),
  ...resultResolveTypeResolver('UploadImportFile'),
  ...resultResolveTypeResolver('RecentEmails'),
  ...resultResolveTypeResolver('MarkEmailAsItem'),
  ...resultResolveTypeResolver('BulkAction'),
  ...resultResolveTypeResolver('ImportFromIntegration'),
  ...resultResolveTypeResolver('SetFavoriteArticle'),
  ...resultResolveTypeResolver('UpdateSubscription'),
  ...resultResolveTypeResolver('UpdateEmail'),
  ...resultResolveTypeResolver('ScanFeeds'),
  ...resultResolveTypeResolver('MoveToFolder'),
  ...resultResolveTypeResolver('UpdateNewsletterEmail'),
  ...resultResolveTypeResolver('EmptyTrash'),
  ...resultResolveTypeResolver('FetchContent'),
  ...resultResolveTypeResolver('Integration'),
  ...resultResolveTypeResolver('ExportToIntegration'),
  ...resultResolveTypeResolver('ReplyToEmail'),
}
