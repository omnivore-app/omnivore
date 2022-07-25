/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createReactionResolver, deleteReactionResolver } from './reaction'
import { Claims, WithDataSourcesContext } from './types'
import { createImageProxyUrl } from './../utils/imageproxy'
import { userDataToUser, validatedDate } from './../utils/helpers'

import {
  Article,
  ArticleHighlightsInput,
  ContentReader,
  Highlight,
  LinkShareInfo,
  PageType,
  Reaction,
  SearchItem,
  User,
} from './../generated/graphql'

import {
  addPopularReadResolver,
  apiKeysResolver,
  articleSavingRequestResolver,
  createArticleResolver,
  createArticleSavingRequestResolver,
  createHighlightResolver,
  createLabelResolver,
  createNewsletterEmailResolver,
  createReminderResolver,
  deleteAccountResolver,
  deleteHighlightResolver,
  deleteLabelResolver,
  deleteNewsletterEmailResolver,
  deleteReminderResolver,
  deleteWebhookResolver,
  generateApiKeyResolver,
  getAllUsersResolver,
  getArticleResolver,
  getArticlesResolver,
  getFollowersResolver,
  getFollowingResolver,
  getMeUserResolver,
  getSharedArticleResolver,
  getUserFeedArticlesResolver,
  getUserPersonalizationResolver,
  getUserResolver,
  googleLoginResolver,
  googleSignupResolver,
  labelsResolver,
  logOutResolver,
  mergeHighlightResolver,
  newsletterEmailsResolver,
  reminderResolver,
  reportItemResolver,
  revokeApiKeyResolver,
  saveArticleReadingProgressResolver,
  saveFileResolver,
  savePageResolver,
  saveUrlResolver,
  searchResolver,
  sendInstallInstructionsResolver,
  setBookmarkArticleResolver,
  setDeviceTokenResolver,
  setFollowResolver,
  setLabelsForHighlightResolver,
  setLabelsResolver,
  setLinkArchivedResolver,
  setShareArticleResolver,
  setShareHighlightResolver,
  setUserPersonalizationResolver,
  setWebhookResolver,
  subscribeResolver,
  subscriptionsResolver,
  typeaheadSearchResolver,
  unsubscribeResolver,
  updateHighlightResolver,
  updateLabelResolver,
  updateLinkShareInfoResolver,
  updatePageResolver,
  updateReminderResolver,
  updateSharedCommentResolver,
  updateUserProfileResolver,
  updateUserResolver,
  uploadFileRequestResolver,
  validateUsernameResolver,
  webhookResolver,
  webhooksResolver,
} from './index'
import { getShareInfoForArticle } from '../datalayer/links/share_info'
import {
  generateDownloadSignedUrl,
  generateUploadFilePathName,
} from '../utils/uploads'
import { getPageByParam } from '../elastic/pages'

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
    createReaction: createReactionResolver,
    deleteReaction: deleteReactionResolver,
    mergeHighlight: mergeHighlightResolver,
    updateHighlight: updateHighlightResolver,
    deleteHighlight: deleteHighlightResolver,
    uploadFileRequest: uploadFileRequestResolver,
    setShareArticle: setShareArticleResolver,
    updateSharedComment: updateSharedCommentResolver,
    setFollow: setFollowResolver,
    setBookmarkArticle: setBookmarkArticleResolver,
    setUserPersonalization: setUserPersonalizationResolver,
    createArticleSavingRequest: createArticleSavingRequestResolver,
    setShareHighlight: setShareHighlightResolver,
    reportItem: reportItemResolver,
    updateLinkShareInfo: updateLinkShareInfoResolver,
    setLinkArchived: setLinkArchivedResolver,
    createNewsletterEmail: createNewsletterEmailResolver,
    deleteNewsletterEmail: deleteNewsletterEmailResolver,
    saveUrl: saveUrlResolver,
    savePage: savePageResolver,
    saveFile: saveFileResolver,
    createReminder: createReminderResolver,
    updateReminder: updateReminderResolver,
    deleteReminder: deleteReminderResolver,
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
  },
  Query: {
    me: getMeUserResolver,
    user: getUserResolver,
    users: getAllUsersResolver,
    validateUsername: validateUsernameResolver,
    article: getArticleResolver,
    sharedArticle: getSharedArticleResolver,
    articles: getArticlesResolver,
    feedArticles: getUserFeedArticlesResolver,
    getFollowers: getFollowersResolver,
    getFollowing: getFollowingResolver,
    getUserPersonalization: getUserPersonalizationResolver,
    articleSavingRequest: articleSavingRequestResolver,
    newsletterEmails: newsletterEmailsResolver,
    reminder: reminderResolver,
    labels: labelsResolver,
    search: searchResolver,
    subscriptions: subscriptionsResolver,
    sendInstallInstructions: sendInstallInstructionsResolver,
    webhooks: webhooksResolver,
    webhook: webhookResolver,
    apiKeys: apiKeysResolver,
    typeaheadSearch: typeaheadSearchResolver,
  },
  User: {
    async sharedArticles(
      user: User,
      __: Record<string, unknown>,
      ctx: WithDataSourcesContext
    ) {
      return ctx.models.userArticle.getUserSharedArticles(user.id, ctx.kx)
    },
    async sharedArticlesCount(
      user: { id: string; sharedArticlesCount?: number },
      __: Record<string, unknown>,
      ctx: WithDataSourcesContext
    ) {
      if (user.sharedArticlesCount) return user.sharedArticlesCount
      return ctx.models.userArticle.getSharedArticlesCount(user.id, ctx.kx)
    },
    async sharedHighlightsCount(
      user: { id: string; sharedHighlightsCount?: number },
      _: unknown,
      ctx: WithDataSourcesContext
    ) {
      // #TODO: restructure highlightStats and sharedArticlesCount in order to get it within a single query
      if (user.sharedHighlightsCount) return user.sharedHighlightsCount
      const { sharedHighlightsCount } =
        await ctx.models.user.getSharedHighlightsStats(user.id)
      return sharedHighlightsCount
    },
    async sharedNotesCount(
      user: User,
      _: unknown,
      ctx: WithDataSourcesContext
    ) {
      if (user.sharedNotesCount) return user.sharedNotesCount
      const { sharedNotesCount } =
        await ctx.models.user.getSharedHighlightsStats(user.id)
      return sharedNotesCount
    },
  },
  FeedArticle: {
    async article(
      feedArticle: { articleId: string; userId: string; article?: Article },
      __: unknown,
      ctx: WithDataSourcesContext
    ) {
      if (feedArticle.article) return feedArticle.article

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let a: any

      const savedArticle =
        ctx.claims?.uid &&
        (await ctx.models.userArticle.getForUser(
          ctx.claims?.uid,
          feedArticle.articleId,
          ctx.kx
        ))

      if (savedArticle) {
        // If user has saved the article, use his version (slug) then
        a = {
          ...savedArticle,
          savedByViewer: true,
          postedByViewer: !!savedArticle.sharedAt,
        }
      } else {
        a = await ctx.models.userArticle.getForUser(
          feedArticle.userId,
          feedArticle.articleId,
          ctx.kx
        )
      }

      if (a && a.image) {
        a.image = createImageProxyUrl(a.image, 0, 180)
      } else {
        console.log(
          'error getting article for feedItem',
          feedArticle.userId,
          feedArticle.articleId
        )
      }

      return a
    },
    async sharedBy(
      feedArticle: { userId: string; sharedBy?: User },
      __: unknown,
      ctx: WithDataSourcesContext
    ) {
      if (feedArticle.sharedBy) return feedArticle.sharedBy
      return userDataToUser(await ctx.models.user.get(feedArticle.userId))
    },
    async highlight(
      feedArticle: { highlightId?: string; highlight?: Highlight },
      _: unknown,
      ctx: WithDataSourcesContext
    ) {
      if (feedArticle.highlight) return feedArticle.highlight
      return feedArticle.highlightId
        ? await ctx.models.highlight.get(feedArticle.highlightId)
        : null
    },
    async reactions(
      feedArticle: { id: string; reactions?: Reaction[] },
      _: unknown,
      ctx: WithDataSourcesContext
    ) {
      const { reactions, id } = feedArticle
      if (reactions) return reactions

      return await ctx.models.reaction.batchGetFromArticle(id)
    },
    async highlightsCount(
      feedArticle: { id: string; highlightsCount?: number },
      _: unknown,
      ctx: WithDataSourcesContext
    ) {
      if (feedArticle.highlightsCount) return feedArticle.highlightsCount
      const { highlightsCount } = await ctx.models.userArticle.getStats(
        feedArticle.id
      )
      return highlightsCount
    },
    async annotationsCount(
      feedArticle: { id: string; annotationsCount?: number },
      _: unknown,
      ctx: WithDataSourcesContext
    ) {
      if (feedArticle.annotationsCount) return feedArticle.annotationsCount
      const { annotationsCount } = await ctx.models.userArticle.getStats(
        feedArticle.id
      )
      return annotationsCount
    },
  },
  Article: {
    async url(article: Article, _: unknown, ctx: WithDataSourcesContext) {
      if (
        article.pageType == PageType.File &&
        ctx.claims &&
        article.uploadFileId
      ) {
        const upload = await ctx.models.uploadFile.get(article.uploadFileId)
        if (!upload || !upload.fileName) {
          return undefined
        }
        const filePath = generateUploadFilePathName(upload.id, upload.fileName)
        const url = await generateDownloadSignedUrl(filePath)
        return url
      }
      return article.url
    },
    async originalArticleUrl(article: { url: string }) {
      return article.url
    },
    async savedByViewer(
      article: { id: string; savedByViewer?: boolean },
      __: unknown,
      ctx: WithDataSourcesContext & { claims: Claims }
    ) {
      if (article.savedByViewer) {
        return article.savedByViewer
      }
      if (!ctx.claims?.uid) return undefined
      const page = await getPageByParam({
        userId: ctx.claims.uid,
        _id: article.id,
      })
      return !!page
    },
    async postedByViewer(
      article: { id: string; postedByViewer?: boolean },
      __: unknown,
      ctx: WithDataSourcesContext & { claims: Claims }
    ) {
      if (article.postedByViewer) {
        return article.postedByViewer
      }
      if (!ctx.claims?.uid) return false
      const page = await getPageByParam({
        userId: ctx.claims.uid,
        _id: article.id,
      })
      return !!page?.sharedAt
    },
    async savedAt(
      article: { id: string; savedAt?: Date; createdAt?: Date },
      __: unknown,
      ctx: WithDataSourcesContext & { claims: Claims }
    ) {
      if (!ctx.claims?.uid) return new Date()
      if (article.savedAt) return article.savedAt
      return (
        (
          await getPageByParam({
            userId: ctx.claims.uid,
            _id: article.id,
          })
        )?.savedAt ||
        article.createdAt ||
        new Date()
      )
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
    async isArchived(
      article: {
        id: string
        isArchived?: boolean | null
        archivedAt?: Date | undefined
      },
      __: unknown,
      ctx: WithDataSourcesContext & { claims: Claims }
    ) {
      if ('isArchived' in article) return article.isArchived
      if ('archivedAt' in article) return !!article.archivedAt
      if (!ctx.claims?.uid) return false
      const page = await getPageByParam({
        userId: ctx.claims.uid,
        _id: article.id,
      })
      return !!page?.archivedAt || false
    },
    contentReader(article: { pageType: PageType }) {
      return article.pageType === PageType.File
        ? ContentReader.Pdf
        : ContentReader.Web
    },
    async highlights(
      article: { id: string; userId?: string; highlights?: Highlight[] },
      _: { input: ArticleHighlightsInput },
      ctx: WithDataSourcesContext
    ) {
      // const includeFriends = false
      // // TODO: this is a temporary solution until we figure out how collaborative approach would look like
      // // article has userId only if it's returned by getSharedArticle resolver
      // if (article.userId) {
      //   const result = await ctx.models.highlight.getForUserArticle(
      //     article.userId,
      //     article.id
      //   )
      //   return result
      // }
      //
      // const friendsIds =
      //   ctx.claims?.uid && includeFriends
      //     ? await ctx.models.userFriends.getFriends(ctx.claims?.uid)
      //     : []
      //
      // // FIXME: Move this filtering logic to the datalayer
      // return (await ctx.models.highlight.batchGet(article.id)).filter((h) =>
      //   [...(includeFriends ? friendsIds : []), ctx.claims?.uid || ''].some(
      //     (u) => u === h.userId
      //   )
      // )
      return article.highlights || []
    },
    async shareInfo(
      article: { id: string; sharedBy?: User; shareInfo?: LinkShareInfo },
      __: unknown,
      ctx: WithDataSourcesContext
    ): Promise<LinkShareInfo | undefined> {
      if (article.shareInfo) return article.shareInfo
      if (!ctx.claims?.uid) return undefined
      return getShareInfoForArticle(
        ctx.kx,
        ctx.claims?.uid,
        article.id,
        ctx.models
      )
    },
  },
  ArticleSavingRequest: {
    async article(request: { userId: string; articleId: string }, __: unknown) {
      if (!request.userId || !request.articleId) return undefined

      return getPageByParam({
        userId: request.userId,
        _id: request.articleId,
      })
    },
  },
  Highlight: {
    async user(
      highlight: { userId: string },
      __: unknown,
      ctx: WithDataSourcesContext
    ) {
      return userDataToUser(await ctx.models.user.get(highlight.userId))
    },
    async reactions(
      highlight: { id: string; reactions?: Reaction[] },
      _: unknown,
      ctx: WithDataSourcesContext
    ) {
      const { reactions, id } = highlight
      if (reactions) return reactions

      return await ctx.models.reaction.batchGetFromHighlight(id)
    },
    async createdByMe(
      highlight: { userId: string; createdByMe?: boolean },
      __: unknown,
      ctx: WithDataSourcesContext
    ) {
      return highlight.createdByMe ?? highlight.userId === ctx.claims?.uid
    },
  },
  Reaction: {
    async user(
      reaction: { userId: string },
      __: unknown,
      ctx: WithDataSourcesContext
    ) {
      return userDataToUser(await ctx.models.user.get(reaction.userId))
    },
  },
  SearchItem: {
    async url(item: SearchItem, _: unknown, ctx: WithDataSourcesContext) {
      if (item.pageType == PageType.File && ctx.claims && item.uploadFileId) {
        const upload = await ctx.models.uploadFile.get(item.uploadFileId)
        if (!upload || !upload.fileName) {
          return undefined
        }
        const filePath = generateUploadFilePathName(upload.id, upload.fileName)
        return generateDownloadSignedUrl(filePath)
      }
      return item.url
    },
  },
  ...resultResolveTypeResolver('Login'),
  ...resultResolveTypeResolver('LogOut'),
  ...resultResolveTypeResolver('GoogleSignup'),
  ...resultResolveTypeResolver('UpdateUser'),
  ...resultResolveTypeResolver('UpdateUserProfile'),
  ...resultResolveTypeResolver('Article'),
  ...resultResolveTypeResolver('SharedArticle'),
  ...resultResolveTypeResolver('Articles'),
  ...resultResolveTypeResolver('User'),
  ...resultResolveTypeResolver('Users'),
  ...resultResolveTypeResolver('SaveArticleReadingProgress'),
  ...resultResolveTypeResolver('FeedArticles'),
  ...resultResolveTypeResolver('CreateArticle'),
  ...resultResolveTypeResolver('CreateHighlight'),
  ...resultResolveTypeResolver('CreateReaction'),
  ...resultResolveTypeResolver('DeleteReaction'),
  ...resultResolveTypeResolver('MergeHighlight'),
  ...resultResolveTypeResolver('UpdateHighlight'),
  ...resultResolveTypeResolver('DeleteHighlight'),
  ...resultResolveTypeResolver('UploadFileRequest'),
  ...resultResolveTypeResolver('SetShareArticle'),
  ...resultResolveTypeResolver('UpdateSharedComment'),
  ...resultResolveTypeResolver('SetBookmarkArticle'),
  ...resultResolveTypeResolver('SetFollow'),
  ...resultResolveTypeResolver('GetFollowers'),
  ...resultResolveTypeResolver('GetFollowing'),
  ...resultResolveTypeResolver('GetUserPersonalization'),
  ...resultResolveTypeResolver('SetUserPersonalization'),
  ...resultResolveTypeResolver('ArticleSavingRequest'),
  ...resultResolveTypeResolver('CreateArticleSavingRequest'),
  ...resultResolveTypeResolver('SetShareHighlight'),
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
}
