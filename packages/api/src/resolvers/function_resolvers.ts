/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Subscription } from '../entity/subscription'
import { Article, PageType, SearchItem } from '../generated/graphql'
import { findUploadFileById } from '../services/upload_file'
import { validatedDate, wordsCount } from '../utils/helpers'
import { createImageProxyUrl } from '../utils/imageproxy'
import {
  generateDownloadSignedUrl,
  generateUploadFilePathName,
} from '../utils/uploads'
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
  integrationsResolver,
  joinGroupResolver,
  labelsResolver,
  leaveGroupResolver,
  logOutResolver,
  mergeHighlightResolver,
  moveFilterResolver,
  moveLabelResolver,
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
import { markEmailAsItemResolver, recentEmailsResolver } from './recent_emails'
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
  },
  Query: {
    me: getMeUserResolver,
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
  },
  // User: {
  //   async sharedArticles(
  //     user: User,
  //     __: Record<string, unknown>,
  //     ctx: WithDataSourcesContext
  //   ) {
  //     return ctx.models.userArticle.getUserSharedArticles(user.id, ctx.kx)
  //   },
  //   async sharedArticlesCount(
  //     user: { id: string; sharedArticlesCount?: number },
  //     __: Record<string, unknown>,
  //     ctx: WithDataSourcesContext
  //   ) {
  //     if (user.sharedArticlesCount) return user.sharedArticlesCount
  //     return ctx.models.userArticle.getSharedArticlesCount(user.id, ctx.kx)
  //   },
  //   async sharedHighlightsCount(
  //     user: { id: string; sharedHighlightsCount?: number },
  //     _: unknown,
  //     ctx: WithDataSourcesContext
  //   ) {
  //     // #TODO: restructure highlightStats and sharedArticlesCount in order to get it within a single query
  //     if (user.sharedHighlightsCount) return user.sharedHighlightsCount
  //     const { sharedHighlightsCount } =
  //       await ctx.models.user.getSharedHighlightsStats(user.id)
  //     return sharedHighlightsCount
  //   },
  //   async sharedNotesCount(
  //     user: User,
  //     _: unknown,
  //     ctx: WithDataSourcesContext
  //   ) {
  //     if (user.sharedNotesCount) return user.sharedNotesCount
  //     const { sharedNotesCount } =
  //       await ctx.models.user.getSharedHighlightsStats(user.id)
  //     return sharedNotesCount
  //   },
  // },
  // FeedArticle: {
  //   async article(
  //     feedArticle: { articleId: string; userId: string; article?: Article },
  //     __: unknown,
  //     ctx: WithDataSourcesContext
  //   ) {
  //     if (feedArticle.article) return feedArticle.article

  //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //     let a: any

  //     const savedArticle =
  //       ctx.claims?.uid &&
  //       (await ctx.models.userArticle.getForUser(
  //         ctx.claims?.uid,
  //         feedArticle.articleId,
  //         ctx.kx
  //       ))

  //     if (savedArticle) {
  //       // If user has saved the article, use his version (slug) then
  //       a = {
  //         ...savedArticle,
  //         savedByViewer: true,
  //         postedByViewer: !!savedArticle.sharedAt,
  //       }
  //     } else {
  //       a = await ctx.models.userArticle.getForUser(
  //         feedArticle.userId,
  //         feedArticle.articleId,
  //         ctx.kx
  //       )
  //     }

  //     if (a && a.image) {
  //       a.image = createImageProxyUrl(a.image, 0, 180)
  //     } else {
  //       logger.info(
  //         'error getting article for feedItem',
  //         feedArticle.userId,
  //         feedArticle.articleId
  //       )
  //     }

  //     return a
  //   },
  //   async sharedBy(
  //     feedArticle: { userId: string; sharedBy?: User },
  //     __: unknown,
  //     ctx: WithDataSourcesContext
  //   ) {
  //     if (feedArticle.sharedBy) return feedArticle.sharedBy
  //     return userDataToUser(await ctx.models.user.get(feedArticle.userId))
  //   },
  //   async highlight(
  //     feedArticle: { highlightId?: string; highlight?: Highlight },
  //     _: unknown,
  //     ctx: WithDataSourcesContext
  //   ) {
  //     if (feedArticle.highlight) return feedArticle.highlight
  //     return feedArticle.highlightId
  //       ? await ctx.models.highlight.get(feedArticle.highlightId)
  //       : null
  //   },
  //   async reactions(
  //     feedArticle: { id: string; reactions?: Reaction[] },
  //     _: unknown,
  //     ctx: WithDataSourcesContext
  //   ) {
  //     const { reactions, id } = feedArticle
  //     if (reactions) return reactions

  //     return await ctx.models.reaction.batchGetFromArticle(id)
  //   },
  //   async highlightsCount(
  //     feedArticle: { id: string; highlightsCount?: number },
  //     _: unknown,
  //     ctx: WithDataSourcesContext
  //   ) {
  //     if (feedArticle.highlightsCount) return feedArticle.highlightsCount
  //     const { highlightsCount } = await ctx.models.userArticle.getStats(
  //       feedArticle.id
  //     )
  //     return highlightsCount
  //   },
  //   async annotationsCount(
  //     feedArticle: { id: string; annotationsCount?: number },
  //     _: unknown,
  //     ctx: WithDataSourcesContext
  //   ) {
  //     if (feedArticle.annotationsCount) return feedArticle.annotationsCount
  //     const { annotationsCount } = await ctx.models.userArticle.getStats(
  //       feedArticle.id
  //     )
  //     return annotationsCount
  //   },
  // },
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
    // async shareInfo(
    //   article: { id: string; sharedBy?: User; shareInfo?: LinkShareInfo },
    //   __: unknown,
    //   ctx: WithDataSourcesContext
    // ): Promise<LinkShareInfo | undefined> {
    //   if (article.shareInfo) return article.shareInfo
    //   if (!ctx.claims?.uid) return undefined
    //   return getShareInfoForArticle(
    //     ctx.kx,
    //     ctx.claims?.uid,
    //     article.id,
    //     ctx.models
    //   )
    // },
    image(article: { image?: string }): string | undefined {
      return article.image && createImageProxyUrl(article.image, 320, 320)
    },
    wordsCount(article: { wordsCount?: number; content?: string }) {
      if (article.wordsCount) return article.wordsCount
      return article.content ? wordsCount(article.content) : undefined
    },
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
    async createdByMe(
      highlight: { userId: string; createdByMe?: boolean },
      __: unknown,
      ctx: WithDataSourcesContext
    ) {
      return highlight.createdByMe ?? highlight.userId === ctx.uid
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
        ctx.uid &&
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
}
