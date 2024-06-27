/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { createHmac } from 'crypto'
import { isError } from 'lodash'
import { Highlight } from '../entity/highlight'
import { LibraryItem, LibraryItemState } from '../entity/library_item'
import {
  EXISTING_NEWSLETTER_FOLDER,
  NewsletterEmail,
} from '../entity/newsletter_email'
import { PublicItem } from '../entity/public_item'
import { Recommendation } from '../entity/recommendation'
import {
  DEFAULT_SUBSCRIPTION_FOLDER,
  Subscription,
} from '../entity/subscription'
import { User as UserEntity } from '../entity/user'
import { env } from '../env'
import {
  HomeItem,
  HomeItemSource,
  HomeItemSourceType,
  PageType,
  User,
} from '../generated/graphql'
import { getAISummary } from '../services/ai-summaries'
import { findUserFeatures } from '../services/features'
import { Merge } from '../util'
import { isBase64Image, validatedDate, wordsCount } from '../utils/helpers'
import { createImageProxyUrl } from '../utils/imageproxy'
import { contentConverter } from '../utils/parser'
import {
  generateDownloadSignedUrl,
  generateUploadFilePathName,
} from '../utils/uploads'
import {
  ArticleFormat,
  emptyTrashResolver,
  fetchContentResolver,
  PartialLibraryItem,
} from './article'
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
import {
  createFolderPolicyResolver,
  deleteFolderPolicyResolver,
  folderPoliciesResolver,
  updateFolderPolicyResolver,
} from './folder_policy'
import { highlightsResolver } from './highlight'
import {
  hiddenHomeSectionResolver,
  homeResolver,
  refreshHomeResolver,
} from './home'
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
  deleteAccountResolver,
  deleteFilterResolver,
  deleteHighlightResolver,
  deleteIntegrationResolver,
  deleteLabelResolver,
  deleteNewsletterEmailResolver,
  deleteRuleResolver,
  deleteWebhookResolver,
  deviceTokensResolver,
  exportToIntegrationResolver,
  feedsResolver,
  filtersResolver,
  generateApiKeyResolver,
  getAllUsersResolver,
  getArticleResolver,
  getMeUserResolver,
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
  setIntegrationResolver,
  setLabelsForHighlightResolver,
  setLabelsResolver,
  setLinkArchivedResolver,
  setRuleResolver,
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
  updatePageResolver,
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
import { subscriptionResolver } from './subscriptions'
import { ResolverContext } from './types'
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
    article: LibraryItem,
    _: unknown,
    ctx: ResolverContext
  ) {
    if (ctx.claims?.uid) {
      const readingProgress =
        await ctx.dataSources.readingProgress.getReadingProgress(
          ctx.claims?.uid,
          article.id
        )
      if (readingProgress) {
        return Math.max(
          article.readingProgressBottomPercent ?? 0,
          readingProgress.readingProgressPercent
        )
      }
    }
    return article.readingProgressBottomPercent
  },
  async readingProgressAnchorIndex(
    article: LibraryItem,
    _: unknown,
    ctx: ResolverContext
  ) {
    if (ctx.claims?.uid) {
      const readingProgress =
        await ctx.dataSources.readingProgress.getReadingProgress(
          ctx.claims?.uid,
          article.id
        )
      if (readingProgress && readingProgress.readingProgressAnchorIndex) {
        return Math.max(
          article.readingProgressHighestReadAnchor ?? 0,
          readingProgress.readingProgressAnchorIndex
        )
      }
    }
    return article.readingProgressHighestReadAnchor
  },
  async readingProgressTopPercent(
    article: LibraryItem,
    _: unknown,
    ctx: ResolverContext
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
    mergeHighlight: mergeHighlightResolver,
    updateHighlight: updateHighlightResolver,
    deleteHighlight: deleteHighlightResolver,
    uploadFileRequest: uploadFileRequestResolver,
    setBookmarkArticle: setBookmarkArticleResolver,
    setUserPersonalization: setUserPersonalizationResolver,
    createArticleSavingRequest: createArticleSavingRequestResolver,
    reportItem: reportItemResolver,
    setLinkArchived: setLinkArchivedResolver,
    createNewsletterEmail: createNewsletterEmailResolver,
    deleteNewsletterEmail: deleteNewsletterEmailResolver,
    saveUrl: saveUrlResolver,
    savePage: savePageResolver,
    saveFile: saveFileResolver,
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
    refreshHome: refreshHomeResolver,
    createFolderPolicy: createFolderPolicyResolver,
    updateFolderPolicy: updateFolderPolicyResolver,
    deleteFolderPolicy: deleteFolderPolicyResolver,
  },
  Query: {
    me: getMeUserResolver,
    getDiscoverFeedArticles: getDiscoverFeedArticlesResolver,
    discoverFeeds: getDiscoverFeedsResolver,
    user: getUserResolver,
    users: getAllUsersResolver,
    validateUsername: validateUsernameResolver,
    article: getArticleResolver,
    getUserPersonalization: getUserPersonalizationResolver,
    articleSavingRequest: articleSavingRequestResolver,
    newsletterEmails: newsletterEmailsResolver,
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
    home: homeResolver,
    subscription: subscriptionResolver,
    hiddenHomeSection: hiddenHomeSectionResolver,
    highlights: highlightsResolver,
    folderPolicies: folderPoliciesResolver,
  },
  User: {
    async intercomHash(user: User) {
      if (env.intercom.secretKey) {
        const userIdentifier = user.id.toString()

        return createHmac('sha256', env.intercom.secretKey)
          .update(userIdentifier)
          .digest('hex')
      }
      return undefined
    },
    async features(_: User, __: Record<string, unknown>, ctx: ResolverContext) {
      if (!ctx.claims?.uid) {
        return undefined
      }

      return []
    },
    async featureList(
      _: User,
      __: Record<string, unknown>,
      ctx: ResolverContext
    ) {
      if (!ctx.claims?.uid) {
        return undefined
      }

      return findUserFeatures(ctx.claims.uid)
    },
    picture: (user: UserEntity) => user.profile.pictureUrl,
    // not implemented yet
    friendsCount: () => 0,
    followersCount: () => 0,
    isFullUser: () => true,
    viewerIsFollowing: () => false,
    sharedArticles: () => [],
    sharedArticlesCount: () => 0,
    sharedHighlightsCount: () => 0,
    sharedNotesCount: () => 0,
  },
  Article: {
    async url(article: LibraryItem, _: unknown, ctx: ResolverContext) {
      if (
        (article.itemType == PageType.File ||
          article.itemType == PageType.Book) &&
        ctx.claims &&
        article.uploadFileId
      ) {
        const upload = await ctx.dataLoaders.uploadFiles.load(
          article.uploadFileId
        )
        if (!upload || !upload.fileName) {
          return undefined
        }
        const filePath = generateUploadFilePathName(upload.id, upload.fileName)
        return generateDownloadSignedUrl(filePath)
      }
      return article.originalUrl
    },
    originalArticleUrl(article: LibraryItem) {
      return article.originalUrl
    },
    hasContent(article: LibraryItem) {
      return !!article.originalContent && !!article.readableContent
    },
    publishedAt(article: LibraryItem) {
      return validatedDate(article.publishedAt || undefined)
    },
    image(article: LibraryItem): string | undefined {
      if (article.thumbnail) {
        return createImageProxyUrl(article.thumbnail, 320, 320)
      }

      return undefined
    },
    wordsCount(article: LibraryItem): number | undefined {
      if (article.wordCount) return article.wordCount

      return article.readableContent
        ? wordsCount(article.readableContent)
        : undefined
    },
    async labels(article: LibraryItem, _: unknown, ctx: ResolverContext) {
      if (article.labels) return article.labels

      return ctx.dataLoaders.labels.load(article.id)
    },
    async highlights(article: LibraryItem, _: unknown, ctx: ResolverContext) {
      if (article.highlights) return article.highlights

      return ctx.dataLoaders.highlights.load(article.id)
    },
    content: (item: LibraryItem) => item.readableContent,
    hash: (item: LibraryItem) => item.textContentHash || '',
    isArchived: (item: LibraryItem) => !!item.archivedAt,
    uploadFileId: (item: LibraryItem) => item.uploadFile?.id,
    pageType: (item: LibraryItem) => item.itemType,
    ...readingProgressHandlers,
  },
  Highlight: {
    reactions: () => [],
    replies: () => [],
    type: (highlight: Highlight) => highlight.highlightType,
    async user(highlight: Highlight, __: unknown, ctx: ResolverContext) {
      return ctx.dataLoaders.users.load(highlight.userId)
    },
    createdByMe(highlight: Highlight, __: unknown, ctx: ResolverContext) {
      return highlight.userId === ctx.claims?.uid
    },
    libraryItem(highlight: Highlight, _: unknown, ctx: ResolverContext) {
      if (highlight.libraryItem) {
        return highlight.libraryItem
      }

      return ctx.dataLoaders.libraryItems.load(highlight.libraryItemId)
    },
    labels: async (highlight: Highlight, _: unknown, ctx: ResolverContext) => {
      return (
        highlight.labels || ctx.dataLoaders.highlightLabels.load(highlight.id)
      )
    },
  },
  SearchItem: {
    async url(item: LibraryItem, _: unknown, ctx: ResolverContext) {
      if (
        (item.itemType == PageType.File || item.itemType == PageType.Book) &&
        ctx.claims &&
        item.uploadFileId
      ) {
        const upload = await ctx.dataLoaders.uploadFiles.load(item.uploadFileId)
        if (!upload || !upload.fileName) {
          return undefined
        }
        const filePath = generateUploadFilePathName(upload.id, upload.fileName)
        return generateDownloadSignedUrl(filePath)
      }
      return item.originalUrl
    },
    image(item: LibraryItem) {
      return item.thumbnail && createImageProxyUrl(item.thumbnail, 320, 320)
    },
    originalArticleUrl(item: LibraryItem) {
      return item.originalUrl
    },
    wordsCount(item: LibraryItem) {
      if (item.wordCount) return item.wordCount
      return item.readableContent ? wordsCount(item.readableContent) : undefined
    },
    siteIcon(item: LibraryItem) {
      if (item.siteIcon && !isBase64Image(item.siteIcon)) {
        return createImageProxyUrl(item.siteIcon, 128, 128)
      }

      return item.siteIcon
    },
    async labels(item: LibraryItem, _: unknown, ctx: ResolverContext) {
      if (item.labels) return item.labels

      return ctx.dataLoaders.labels.load(item.id)
    },
    async recommendations(item: LibraryItem, _: unknown, ctx: ResolverContext) {
      if (item.recommendations) return item.recommendations

      return ctx.dataLoaders.recommendations.load(item.id)
    },
    async aiSummary(item: LibraryItem, _: unknown, ctx: ResolverContext) {
      if (!ctx.claims) return undefined

      return (
        await getAISummary({
          userId: ctx.claims.uid,
          libraryItemId: item.id,
          idx: 'latest',
        })
      )?.summary
    },
    async highlights(item: LibraryItem, _: unknown, ctx: ResolverContext) {
      if (item.highlights) return item.highlights

      return ctx.dataLoaders.highlights.load(item.id)
    },
    async content(item: PartialLibraryItem, _: unknown, ctx: ResolverContext) {
      // convert html to the requested format if requested
      if (
        item.format &&
        item.format !== ArticleFormat.Html &&
        item.readableContent
      ) {
        let highlights: Highlight[] = []
        // load highlights if needed
        if (
          item.format === ArticleFormat.HighlightedMarkdown &&
          item.highlightAnnotations?.length
        ) {
          highlights = await ctx.dataLoaders.highlights.load(item.id)
        }

        try {
          ctx.log.info(`Converting content to: ${item.format}`)

          // convert html to the requested format
          const converter = contentConverter(item.format)
          if (converter) {
            return converter(item.readableContent, highlights)
          }
        } catch (error) {
          ctx.log.error('Error converting content', error)
        }
      }

      return item.readableContent
    },
    isArchived: (item: LibraryItem) => !!item.archivedAt,
    pageType: (item: LibraryItem) => item.itemType,
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
  HomeSection: {
    title: (section: { title?: string; layout: string }) => {
      if (section.title) return section.title

      switch (section.layout) {
        case 'just_added':
          return 'Recently Added'
        case 'top_picks':
          return 'Top Picks'
        case 'quick_links':
          return 'Quick Links'
        case 'hidden':
          return 'Hidden Gems'
        default:
          return ''
      }
    },
    async items(
      section: {
        items: Array<{
          id: string
          type: 'library_item' | 'public_item'
          score: number
        }>
      },
      _: unknown,
      ctx: ResolverContext
    ) {
      const items = section.items

      const libraryItemIds = items
        .filter((item) => item.type === 'library_item')
        .map((item) => item.id)
      const libraryItems = (
        await ctx.dataLoaders.libraryItems.loadMany(libraryItemIds)
      ).filter(
        (libraryItem) =>
          !!libraryItem &&
          !isError(libraryItem) &&
          [
            LibraryItemState.Succeeded,
            LibraryItemState.ContentNotFetched,
          ].includes(libraryItem.state) &&
          !libraryItem.seenAt
      ) as Array<LibraryItem>

      const publicItemIds = section.items
        .filter((item) => item.type === 'public_item')
        .map((item) => item.id)
      const publicItems = (
        await ctx.dataLoaders.publicItems.loadMany(publicItemIds)
      ).filter((publicItem) => !isError(publicItem)) as Array<PublicItem>

      return items
        .map((item) => {
          const libraryItem = libraryItems.find(
            (libraryItem) => item.id === libraryItem.id
          )
          if (libraryItem) {
            return {
              id: libraryItem.id,
              title: libraryItem.title,
              author: libraryItem.author,
              thumbnail: libraryItem.thumbnail,
              wordCount: libraryItem.wordCount,
              date: libraryItem.savedAt,
              url: libraryItem.originalUrl,
              canArchive: !libraryItem.archivedAt,
              canDelete: !libraryItem.deletedAt,
              canSave: false,
              canComment: false,
              canShare: true,
              dir: libraryItem.directionality,
              previewContent:
                libraryItem.previewContent || libraryItem.description,
              subscription: libraryItem.subscription,
              siteName: libraryItem.siteName,
              siteIcon: libraryItem.siteIcon,
              slug: libraryItem.slug,
              score: item.score,
              canMove: libraryItem.folder === 'following',
            }
          }

          const publicItem = publicItems.find(
            (publicItem) => item.id === publicItem.id
          )
          if (publicItem) {
            return {
              id: publicItem.id,
              title: publicItem.title,
              author: publicItem.author,
              dir: publicItem.dir,
              previewContent: publicItem.previewContent,
              thumbnail: publicItem.thumbnail,
              wordCount: publicItem.wordCount,
              date: publicItem.createdAt,
              url: publicItem.url,
              canArchive: false,
              canDelete: false,
              canSave: true,
              canComment: true,
              canShare: true,
              broadcastCount: publicItem.stats.broadcastCount,
              likeCount: publicItem.stats.likeCount,
              saveCount: publicItem.stats.saveCount,
              source: publicItem.source,
              score: item.score,
            }
          }
        })
        .filter((item) => !!item)
    },
  },
  HomeItem: {
    async source(
      item: Merge<
        HomeItem,
        { subscription?: string; siteName: string; siteIcon?: string }
      >,
      _: unknown,
      ctx: ResolverContext
    ): Promise<HomeItemSource> {
      if (item.source) {
        return item.source
      }

      if (!item.subscription) {
        return {
          name: item.siteName,
          icon: item.siteIcon,
          type: HomeItemSourceType.Library,
        }
      }

      const subscription = await ctx.dataLoaders.subscriptions.load(
        item.subscription
      )
      if (!subscription) {
        return {
          name: item.siteName,
          icon: item.siteIcon,
          type: HomeItemSourceType.Library,
        }
      }

      return {
        id: subscription.id,
        url: subscription.url,
        name: subscription.name,
        icon: subscription.icon,
        type: subscription.type as unknown as HomeItemSourceType,
      }
    },
    thumbnail(item: HomeItem) {
      return item.thumbnail && createImageProxyUrl(item.thumbnail, 320, 320)
    },
  },
  ArticleSavingRequest: {
    status: (item: LibraryItem) => item.state,
    url: (item: LibraryItem) => item.originalUrl,
    async user(_item: LibraryItem, __: unknown, ctx: ResolverContext) {
      if (ctx.claims?.uid) {
        return ctx.dataLoaders.users.load(ctx.claims.uid)
      }
    },
  },
  Recommendation: {
    user: (recommendation: Recommendation) => {
      return {
        userId: recommendation.recommender.id,
        username: recommendation.recommender.profile.username,
        profileImageURL: recommendation.recommender.profile.pictureUrl,
        name: recommendation.recommender.name,
      }
    },
    name: (recommendation: Recommendation) => recommendation.group.name,
    recommendedAt: (recommendation: Recommendation) => recommendation.createdAt,
  },
  ...resultResolveTypeResolver('Login'),
  ...resultResolveTypeResolver('LogOut'),
  ...resultResolveTypeResolver('GoogleSignup'),
  ...resultResolveTypeResolver('UpdateUser'),
  ...resultResolveTypeResolver('UpdateUserProfile'),
  ...resultResolveTypeResolver('Article'),
  ...resultResolveTypeResolver('Articles'),
  ...resultResolveTypeResolver('User'),
  ...resultResolveTypeResolver('Users'),
  ...resultResolveTypeResolver('SaveArticleReadingProgress'),
  ...resultResolveTypeResolver('CreateArticle'),
  ...resultResolveTypeResolver('CreateHighlight'),
  ...resultResolveTypeResolver('MergeHighlight'),
  ...resultResolveTypeResolver('UpdateHighlight'),
  ...resultResolveTypeResolver('DeleteHighlight'),
  ...resultResolveTypeResolver('UploadFileRequest'),
  ...resultResolveTypeResolver('SetBookmarkArticle'),
  ...resultResolveTypeResolver('GetUserPersonalization'),
  ...resultResolveTypeResolver('SetUserPersonalization'),
  ...resultResolveTypeResolver('ArticleSavingRequest'),
  ...resultResolveTypeResolver('CreateArticleSavingRequest'),
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
  ...resultResolveTypeResolver('Home'),
  ...resultResolveTypeResolver('Subscription'),
  ...resultResolveTypeResolver('RefreshHome'),
  ...resultResolveTypeResolver('HiddenHomeSection'),
  ...resultResolveTypeResolver('Highlights'),
  ...resultResolveTypeResolver('FolderPolicies'),
  ...resultResolveTypeResolver('CreateFolderPolicy'),
  ...resultResolveTypeResolver('UpdateFolderPolicy'),
  ...resultResolveTypeResolver('DeleteFolderPolicy'),
}
