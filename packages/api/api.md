yarn run v1.22.18
$ /Users/jacksonh/src/omnivore/node_modules/.bin/graphql-markdown src/generated/schema.graphql
# Schema Types

<details>
  <summary><strong>Table of Contents</strong></summary>

  * [Query](#query)
  * [Mutation](#mutation)
  * [Objects](#objects)
    * [AddPopularReadError](#addpopularreaderror)
    * [AddPopularReadSuccess](#addpopularreadsuccess)
    * [ApiKey](#apikey)
    * [ApiKeysError](#apikeyserror)
    * [ApiKeysSuccess](#apikeyssuccess)
    * [ArchiveLinkError](#archivelinkerror)
    * [ArchiveLinkSuccess](#archivelinksuccess)
    * [Article](#article)
    * [ArticleEdge](#articleedge)
    * [ArticleError](#articleerror)
    * [ArticleSavingRequest](#articlesavingrequest)
    * [ArticleSavingRequestError](#articlesavingrequesterror)
    * [ArticleSavingRequestSuccess](#articlesavingrequestsuccess)
    * [ArticleSuccess](#articlesuccess)
    * [ArticlesError](#articleserror)
    * [ArticlesSuccess](#articlessuccess)
    * [CreateArticleError](#createarticleerror)
    * [CreateArticleSavingRequestError](#createarticlesavingrequesterror)
    * [CreateArticleSavingRequestSuccess](#createarticlesavingrequestsuccess)
    * [CreateArticleSuccess](#createarticlesuccess)
    * [CreateHighlightError](#createhighlighterror)
    * [CreateHighlightReplyError](#createhighlightreplyerror)
    * [CreateHighlightReplySuccess](#createhighlightreplysuccess)
    * [CreateHighlightSuccess](#createhighlightsuccess)
    * [CreateLabelError](#createlabelerror)
    * [CreateLabelSuccess](#createlabelsuccess)
    * [CreateNewsletterEmailError](#createnewsletteremailerror)
    * [CreateNewsletterEmailSuccess](#createnewsletteremailsuccess)
    * [CreateReactionError](#createreactionerror)
    * [CreateReactionSuccess](#createreactionsuccess)
    * [CreateReminderError](#createremindererror)
    * [CreateReminderSuccess](#createremindersuccess)
    * [DeleteHighlightError](#deletehighlighterror)
    * [DeleteHighlightReplyError](#deletehighlightreplyerror)
    * [DeleteHighlightReplySuccess](#deletehighlightreplysuccess)
    * [DeleteHighlightSuccess](#deletehighlightsuccess)
    * [DeleteLabelError](#deletelabelerror)
    * [DeleteLabelSuccess](#deletelabelsuccess)
    * [DeleteNewsletterEmailError](#deletenewsletteremailerror)
    * [DeleteNewsletterEmailSuccess](#deletenewsletteremailsuccess)
    * [DeleteReactionError](#deletereactionerror)
    * [DeleteReactionSuccess](#deletereactionsuccess)
    * [DeleteReminderError](#deleteremindererror)
    * [DeleteReminderSuccess](#deleteremindersuccess)
    * [DeleteWebhookError](#deletewebhookerror)
    * [DeleteWebhookSuccess](#deletewebhooksuccess)
    * [DeviceToken](#devicetoken)
    * [FeedArticle](#feedarticle)
    * [FeedArticleEdge](#feedarticleedge)
    * [FeedArticlesError](#feedarticleserror)
    * [FeedArticlesSuccess](#feedarticlessuccess)
    * [GenerateApiKeyError](#generateapikeyerror)
    * [GenerateApiKeySuccess](#generateapikeysuccess)
    * [GetFollowersError](#getfollowerserror)
    * [GetFollowersSuccess](#getfollowerssuccess)
    * [GetFollowingError](#getfollowingerror)
    * [GetFollowingSuccess](#getfollowingsuccess)
    * [GetUserPersonalizationError](#getuserpersonalizationerror)
    * [GetUserPersonalizationSuccess](#getuserpersonalizationsuccess)
    * [GoogleSignupError](#googlesignuperror)
    * [GoogleSignupSuccess](#googlesignupsuccess)
    * [Highlight](#highlight)
    * [HighlightReply](#highlightreply)
    * [HighlightStats](#highlightstats)
    * [Label](#label)
    * [LabelsError](#labelserror)
    * [LabelsSuccess](#labelssuccess)
    * [Link](#link)
    * [LinkShareInfo](#linkshareinfo)
    * [LogOutError](#logouterror)
    * [LogOutSuccess](#logoutsuccess)
    * [LoginError](#loginerror)
    * [LoginSuccess](#loginsuccess)
    * [MergeHighlightError](#mergehighlighterror)
    * [MergeHighlightSuccess](#mergehighlightsuccess)
    * [NewsletterEmail](#newsletteremail)
    * [NewsletterEmailsError](#newsletteremailserror)
    * [NewsletterEmailsSuccess](#newsletteremailssuccess)
    * [Page](#page)
    * [PageInfo](#pageinfo)
    * [Profile](#profile)
    * [Reaction](#reaction)
    * [ReadState](#readstate)
    * [Reminder](#reminder)
    * [ReminderError](#remindererror)
    * [ReminderSuccess](#remindersuccess)
    * [ReportItemResult](#reportitemresult)
    * [RevokeApiKeyError](#revokeapikeyerror)
    * [RevokeApiKeySuccess](#revokeapikeysuccess)
    * [SaveArticleReadingProgressError](#savearticlereadingprogresserror)
    * [SaveArticleReadingProgressSuccess](#savearticlereadingprogresssuccess)
    * [SaveError](#saveerror)
    * [SaveSuccess](#savesuccess)
    * [SearchError](#searcherror)
    * [SearchItem](#searchitem)
    * [SearchItemEdge](#searchitemedge)
    * [SearchSuccess](#searchsuccess)
    * [SendInstallInstructionsError](#sendinstallinstructionserror)
    * [SendInstallInstructionsSuccess](#sendinstallinstructionssuccess)
    * [SetBookmarkArticleError](#setbookmarkarticleerror)
    * [SetBookmarkArticleSuccess](#setbookmarkarticlesuccess)
    * [SetDeviceTokenError](#setdevicetokenerror)
    * [SetDeviceTokenSuccess](#setdevicetokensuccess)
    * [SetFollowError](#setfollowerror)
    * [SetFollowSuccess](#setfollowsuccess)
    * [SetLabelsError](#setlabelserror)
    * [SetLabelsSuccess](#setlabelssuccess)
    * [SetShareArticleError](#setsharearticleerror)
    * [SetShareArticleSuccess](#setsharearticlesuccess)
    * [SetShareHighlightError](#setsharehighlighterror)
    * [SetShareHighlightSuccess](#setsharehighlightsuccess)
    * [SetUserPersonalizationError](#setuserpersonalizationerror)
    * [SetUserPersonalizationSuccess](#setuserpersonalizationsuccess)
    * [SetWebhookError](#setwebhookerror)
    * [SetWebhookSuccess](#setwebhooksuccess)
    * [ShareStats](#sharestats)
    * [SharedArticleError](#sharedarticleerror)
    * [SharedArticleSuccess](#sharedarticlesuccess)
    * [SignupError](#signuperror)
    * [SignupSuccess](#signupsuccess)
    * [SubscribeError](#subscribeerror)
    * [SubscribeSuccess](#subscribesuccess)
    * [Subscription](#subscription)
    * [SubscriptionsError](#subscriptionserror)
    * [SubscriptionsSuccess](#subscriptionssuccess)
    * [UnsubscribeError](#unsubscribeerror)
    * [UnsubscribeSuccess](#unsubscribesuccess)
    * [UpdateHighlightError](#updatehighlighterror)
    * [UpdateHighlightReplyError](#updatehighlightreplyerror)
    * [UpdateHighlightReplySuccess](#updatehighlightreplysuccess)
    * [UpdateHighlightSuccess](#updatehighlightsuccess)
    * [UpdateLabelError](#updatelabelerror)
    * [UpdateLabelSuccess](#updatelabelsuccess)
    * [UpdateLinkShareInfoError](#updatelinkshareinfoerror)
    * [UpdateLinkShareInfoSuccess](#updatelinkshareinfosuccess)
    * [UpdatePageError](#updatepageerror)
    * [UpdatePageSuccess](#updatepagesuccess)
    * [UpdateReminderError](#updateremindererror)
    * [UpdateReminderSuccess](#updateremindersuccess)
    * [UpdateSharedCommentError](#updatesharedcommenterror)
    * [UpdateSharedCommentSuccess](#updatesharedcommentsuccess)
    * [UpdateUserError](#updateusererror)
    * [UpdateUserProfileError](#updateuserprofileerror)
    * [UpdateUserProfileSuccess](#updateuserprofilesuccess)
    * [UpdateUserSuccess](#updateusersuccess)
    * [UploadFileRequestError](#uploadfilerequesterror)
    * [UploadFileRequestSuccess](#uploadfilerequestsuccess)
    * [User](#user)
    * [UserError](#usererror)
    * [UserPersonalization](#userpersonalization)
    * [UserSuccess](#usersuccess)
    * [UsersError](#userserror)
    * [UsersSuccess](#userssuccess)
    * [Webhook](#webhook)
    * [WebhookError](#webhookerror)
    * [WebhookSuccess](#webhooksuccess)
    * [WebhooksError](#webhookserror)
    * [WebhooksSuccess](#webhookssuccess)
  * [Inputs](#inputs)
    * [ArchiveLinkInput](#archivelinkinput)
    * [ArticleHighlightsInput](#articlehighlightsinput)
    * [CreateArticleInput](#createarticleinput)
    * [CreateArticleSavingRequestInput](#createarticlesavingrequestinput)
    * [CreateHighlightInput](#createhighlightinput)
    * [CreateHighlightReplyInput](#createhighlightreplyinput)
    * [CreateLabelInput](#createlabelinput)
    * [CreateReactionInput](#createreactioninput)
    * [CreateReminderInput](#createreminderinput)
    * [GenerateApiKeyInput](#generateapikeyinput)
    * [GoogleLoginInput](#googlelogininput)
    * [GoogleSignupInput](#googlesignupinput)
    * [LoginInput](#logininput)
    * [MergeHighlightInput](#mergehighlightinput)
    * [PageInfoInput](#pageinfoinput)
    * [PreparedDocumentInput](#prepareddocumentinput)
    * [ReportItemInput](#reportiteminput)
    * [SaveArticleReadingProgressInput](#savearticlereadingprogressinput)
    * [SaveFileInput](#savefileinput)
    * [SavePageInput](#savepageinput)
    * [SaveUrlInput](#saveurlinput)
    * [SetBookmarkArticleInput](#setbookmarkarticleinput)
    * [SetDeviceTokenInput](#setdevicetokeninput)
    * [SetFollowInput](#setfollowinput)
    * [SetLabelsForHighlightInput](#setlabelsforhighlightinput)
    * [SetLabelsInput](#setlabelsinput)
    * [SetShareArticleInput](#setsharearticleinput)
    * [SetShareHighlightInput](#setsharehighlightinput)
    * [SetUserPersonalizationInput](#setuserpersonalizationinput)
    * [SetWebhookInput](#setwebhookinput)
    * [SignupInput](#signupinput)
    * [SortParams](#sortparams)
    * [UpdateHighlightInput](#updatehighlightinput)
    * [UpdateHighlightReplyInput](#updatehighlightreplyinput)
    * [UpdateLabelInput](#updatelabelinput)
    * [UpdateLinkShareInfoInput](#updatelinkshareinfoinput)
    * [UpdatePageInput](#updatepageinput)
    * [UpdateReminderInput](#updatereminderinput)
    * [UpdateSharedCommentInput](#updatesharedcommentinput)
    * [UpdateUserInput](#updateuserinput)
    * [UpdateUserProfileInput](#updateuserprofileinput)
    * [UploadFileRequestInput](#uploadfilerequestinput)
  * [Enums](#enums)
    * [AddPopularReadErrorCode](#addpopularreaderrorcode)
    * [ApiKeysErrorCode](#apikeyserrorcode)
    * [ArchiveLinkErrorCode](#archivelinkerrorcode)
    * [ArticleErrorCode](#articleerrorcode)
    * [ArticleSavingRequestErrorCode](#articlesavingrequesterrorcode)
    * [ArticleSavingRequestStatus](#articlesavingrequeststatus)
    * [ArticlesErrorCode](#articleserrorcode)
    * [ContentReader](#contentreader)
    * [CreateArticleErrorCode](#createarticleerrorcode)
    * [CreateArticleSavingRequestErrorCode](#createarticlesavingrequesterrorcode)
    * [CreateHighlightErrorCode](#createhighlighterrorcode)
    * [CreateHighlightReplyErrorCode](#createhighlightreplyerrorcode)
    * [CreateLabelErrorCode](#createlabelerrorcode)
    * [CreateNewsletterEmailErrorCode](#createnewsletteremailerrorcode)
    * [CreateReactionErrorCode](#createreactionerrorcode)
    * [CreateReminderErrorCode](#createremindererrorcode)
    * [DeleteHighlightErrorCode](#deletehighlighterrorcode)
    * [DeleteHighlightReplyErrorCode](#deletehighlightreplyerrorcode)
    * [DeleteLabelErrorCode](#deletelabelerrorcode)
    * [DeleteNewsletterEmailErrorCode](#deletenewsletteremailerrorcode)
    * [DeleteReactionErrorCode](#deletereactionerrorcode)
    * [DeleteReminderErrorCode](#deleteremindererrorcode)
    * [DeleteWebhookErrorCode](#deletewebhookerrorcode)
    * [FeedArticlesErrorCode](#feedarticleserrorcode)
    * [GenerateApiKeyErrorCode](#generateapikeyerrorcode)
    * [GetFollowersErrorCode](#getfollowerserrorcode)
    * [GetFollowingErrorCode](#getfollowingerrorcode)
    * [GetUserPersonalizationErrorCode](#getuserpersonalizationerrorcode)
    * [LabelsErrorCode](#labelserrorcode)
    * [LogOutErrorCode](#logouterrorcode)
    * [LoginErrorCode](#loginerrorcode)
    * [MergeHighlightErrorCode](#mergehighlighterrorcode)
    * [NewsletterEmailsErrorCode](#newsletteremailserrorcode)
    * [PageType](#pagetype)
    * [ReactionType](#reactiontype)
    * [ReminderErrorCode](#remindererrorcode)
    * [ReportType](#reporttype)
    * [RevokeApiKeyErrorCode](#revokeapikeyerrorcode)
    * [SaveArticleReadingProgressErrorCode](#savearticlereadingprogresserrorcode)
    * [SaveErrorCode](#saveerrorcode)
    * [SearchErrorCode](#searcherrorcode)
    * [SendInstallInstructionsErrorCode](#sendinstallinstructionserrorcode)
    * [SetBookmarkArticleErrorCode](#setbookmarkarticleerrorcode)
    * [SetDeviceTokenErrorCode](#setdevicetokenerrorcode)
    * [SetFollowErrorCode](#setfollowerrorcode)
    * [SetLabelsErrorCode](#setlabelserrorcode)
    * [SetShareArticleErrorCode](#setsharearticleerrorcode)
    * [SetShareHighlightErrorCode](#setsharehighlighterrorcode)
    * [SetUserPersonalizationErrorCode](#setuserpersonalizationerrorcode)
    * [SetWebhookErrorCode](#setwebhookerrorcode)
    * [SharedArticleErrorCode](#sharedarticleerrorcode)
    * [SignupErrorCode](#signuperrorcode)
    * [SortBy](#sortby)
    * [SortOrder](#sortorder)
    * [SubscribeErrorCode](#subscribeerrorcode)
    * [SubscriptionStatus](#subscriptionstatus)
    * [SubscriptionsErrorCode](#subscriptionserrorcode)
    * [UnsubscribeErrorCode](#unsubscribeerrorcode)
    * [UpdateHighlightErrorCode](#updatehighlighterrorcode)
    * [UpdateHighlightReplyErrorCode](#updatehighlightreplyerrorcode)
    * [UpdateLabelErrorCode](#updatelabelerrorcode)
    * [UpdateLinkShareInfoErrorCode](#updatelinkshareinfoerrorcode)
    * [UpdatePageErrorCode](#updatepageerrorcode)
    * [UpdateReminderErrorCode](#updateremindererrorcode)
    * [UpdateSharedCommentErrorCode](#updatesharedcommenterrorcode)
    * [UpdateUserErrorCode](#updateusererrorcode)
    * [UpdateUserProfileErrorCode](#updateuserprofileerrorcode)
    * [UploadFileRequestErrorCode](#uploadfilerequesterrorcode)
    * [UploadFileStatus](#uploadfilestatus)
    * [UserErrorCode](#usererrorcode)
    * [UsersErrorCode](#userserrorcode)
    * [WebhookErrorCode](#webhookerrorcode)
    * [WebhookEvent](#webhookevent)
    * [WebhooksErrorCode](#webhookserrorcode)
  * [Scalars](#scalars)
    * [Boolean](#boolean)
    * [Date](#date)
    * [Float](#float)
    * [ID](#id)
    * [Int](#int)
    * [String](#string)
  * [Unions](#unions)
    * [AddPopularReadResult](#addpopularreadresult)
    * [ApiKeysResult](#apikeysresult)
    * [ArchiveLinkResult](#archivelinkresult)
    * [ArticleResult](#articleresult)
    * [ArticleSavingRequestResult](#articlesavingrequestresult)
    * [ArticlesResult](#articlesresult)
    * [CreateArticleResult](#createarticleresult)
    * [CreateArticleSavingRequestResult](#createarticlesavingrequestresult)
    * [CreateHighlightReplyResult](#createhighlightreplyresult)
    * [CreateHighlightResult](#createhighlightresult)
    * [CreateLabelResult](#createlabelresult)
    * [CreateNewsletterEmailResult](#createnewsletteremailresult)
    * [CreateReactionResult](#createreactionresult)
    * [CreateReminderResult](#createreminderresult)
    * [DeleteHighlightReplyResult](#deletehighlightreplyresult)
    * [DeleteHighlightResult](#deletehighlightresult)
    * [DeleteLabelResult](#deletelabelresult)
    * [DeleteNewsletterEmailResult](#deletenewsletteremailresult)
    * [DeleteReactionResult](#deletereactionresult)
    * [DeleteReminderResult](#deletereminderresult)
    * [DeleteWebhookResult](#deletewebhookresult)
    * [FeedArticlesResult](#feedarticlesresult)
    * [GenerateApiKeyResult](#generateapikeyresult)
    * [GetFollowersResult](#getfollowersresult)
    * [GetFollowingResult](#getfollowingresult)
    * [GetUserPersonalizationResult](#getuserpersonalizationresult)
    * [GoogleSignupResult](#googlesignupresult)
    * [LabelsResult](#labelsresult)
    * [LogOutResult](#logoutresult)
    * [LoginResult](#loginresult)
    * [MergeHighlightResult](#mergehighlightresult)
    * [NewsletterEmailsResult](#newsletteremailsresult)
    * [ReminderResult](#reminderresult)
    * [RevokeApiKeyResult](#revokeapikeyresult)
    * [SaveArticleReadingProgressResult](#savearticlereadingprogressresult)
    * [SaveResult](#saveresult)
    * [SearchResult](#searchresult)
    * [SendInstallInstructionsResult](#sendinstallinstructionsresult)
    * [SetBookmarkArticleResult](#setbookmarkarticleresult)
    * [SetDeviceTokenResult](#setdevicetokenresult)
    * [SetFollowResult](#setfollowresult)
    * [SetLabelsResult](#setlabelsresult)
    * [SetShareArticleResult](#setsharearticleresult)
    * [SetShareHighlightResult](#setsharehighlightresult)
    * [SetUserPersonalizationResult](#setuserpersonalizationresult)
    * [SetWebhookResult](#setwebhookresult)
    * [SharedArticleResult](#sharedarticleresult)
    * [SignupResult](#signupresult)
    * [SubscribeResult](#subscriberesult)
    * [SubscriptionsResult](#subscriptionsresult)
    * [UnsubscribeResult](#unsubscriberesult)
    * [UpdateHighlightReplyResult](#updatehighlightreplyresult)
    * [UpdateHighlightResult](#updatehighlightresult)
    * [UpdateLabelResult](#updatelabelresult)
    * [UpdateLinkShareInfoResult](#updatelinkshareinforesult)
    * [UpdatePageResult](#updatepageresult)
    * [UpdateReminderResult](#updatereminderresult)
    * [UpdateSharedCommentResult](#updatesharedcommentresult)
    * [UpdateUserProfileResult](#updateuserprofileresult)
    * [UpdateUserResult](#updateuserresult)
    * [UploadFileRequestResult](#uploadfilerequestresult)
    * [UserResult](#userresult)
    * [UsersResult](#usersresult)
    * [WebhookResult](#webhookresult)
    * [WebhooksResult](#webhooksresult)

</details>

## Query
<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>apiKeys</strong></td>
<td valign="top"><a href="#apikeysresult">ApiKeysResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>article</strong></td>
<td valign="top"><a href="#articleresult">ArticleResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">slug</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">username</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>articleSavingRequest</strong></td>
<td valign="top"><a href="#articlesavingrequestresult">ArticleSavingRequestResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>articles</strong></td>
<td valign="top"><a href="#articlesresult">ArticlesResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">after</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">first</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">includePending</td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">query</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sharedOnly</td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sort</td>
<td valign="top"><a href="#sortparams">SortParams</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>feedArticles</strong></td>
<td valign="top"><a href="#feedarticlesresult">FeedArticlesResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">after</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">first</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sharedByUser</td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sort</td>
<td valign="top"><a href="#sortparams">SortParams</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getFollowers</strong></td>
<td valign="top"><a href="#getfollowersresult">GetFollowersResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">userId</td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getFollowing</strong></td>
<td valign="top"><a href="#getfollowingresult">GetFollowingResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">userId</td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>getUserPersonalization</strong></td>
<td valign="top"><a href="#getuserpersonalizationresult">GetUserPersonalizationResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hello</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>labels</strong></td>
<td valign="top"><a href="#labelsresult">LabelsResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>me</strong></td>
<td valign="top"><a href="#user">User</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>newsletterEmails</strong></td>
<td valign="top"><a href="#newsletteremailsresult">NewsletterEmailsResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reminder</strong></td>
<td valign="top"><a href="#reminderresult">ReminderResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">linkId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>search</strong></td>
<td valign="top"><a href="#searchresult">SearchResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">after</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">first</td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">query</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sendInstallInstructions</strong></td>
<td valign="top"><a href="#sendinstallinstructionsresult">SendInstallInstructionsResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedArticle</strong></td>
<td valign="top"><a href="#sharedarticleresult">SharedArticleResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">selectedHighlightId</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">slug</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">username</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>subscriptions</strong></td>
<td valign="top"><a href="#subscriptionsresult">SubscriptionsResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">sort</td>
<td valign="top"><a href="#sortparams">SortParams</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>user</strong></td>
<td valign="top"><a href="#userresult">UserResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">userId</td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">username</td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>users</strong></td>
<td valign="top"><a href="#usersresult">UsersResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>validateUsername</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">username</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>webhook</strong></td>
<td valign="top"><a href="#webhookresult">WebhookResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>webhooks</strong></td>
<td valign="top"><a href="#webhooksresult">WebhooksResult</a>!</td>
<td></td>
</tr>
</tbody>
</table>

## Mutation
<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>addPopularRead</strong></td>
<td valign="top"><a href="#addpopularreadresult">AddPopularReadResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">name</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createArticle</strong></td>
<td valign="top"><a href="#createarticleresult">CreateArticleResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#createarticleinput">CreateArticleInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createArticleSavingRequest</strong></td>
<td valign="top"><a href="#createarticlesavingrequestresult">CreateArticleSavingRequestResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#createarticlesavingrequestinput">CreateArticleSavingRequestInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createHighlight</strong></td>
<td valign="top"><a href="#createhighlightresult">CreateHighlightResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#createhighlightinput">CreateHighlightInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createHighlightReply</strong></td>
<td valign="top"><a href="#createhighlightreplyresult">CreateHighlightReplyResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#createhighlightreplyinput">CreateHighlightReplyInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createLabel</strong></td>
<td valign="top"><a href="#createlabelresult">CreateLabelResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#createlabelinput">CreateLabelInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createNewsletterEmail</strong></td>
<td valign="top"><a href="#createnewsletteremailresult">CreateNewsletterEmailResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createReaction</strong></td>
<td valign="top"><a href="#createreactionresult">CreateReactionResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#createreactioninput">CreateReactionInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createReminder</strong></td>
<td valign="top"><a href="#createreminderresult">CreateReminderResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#createreminderinput">CreateReminderInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteHighlight</strong></td>
<td valign="top"><a href="#deletehighlightresult">DeleteHighlightResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">highlightId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteHighlightReply</strong></td>
<td valign="top"><a href="#deletehighlightreplyresult">DeleteHighlightReplyResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">highlightReplyId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteLabel</strong></td>
<td valign="top"><a href="#deletelabelresult">DeleteLabelResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteNewsletterEmail</strong></td>
<td valign="top"><a href="#deletenewsletteremailresult">DeleteNewsletterEmailResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">newsletterEmailId</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteReaction</strong></td>
<td valign="top"><a href="#deletereactionresult">DeleteReactionResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteReminder</strong></td>
<td valign="top"><a href="#deletereminderresult">DeleteReminderResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>deleteWebhook</strong></td>
<td valign="top"><a href="#deletewebhookresult">DeleteWebhookResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>generateApiKey</strong></td>
<td valign="top"><a href="#generateapikeyresult">GenerateApiKeyResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#generateapikeyinput">GenerateApiKeyInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>googleLogin</strong></td>
<td valign="top"><a href="#loginresult">LoginResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#googlelogininput">GoogleLoginInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>googleSignup</strong></td>
<td valign="top"><a href="#googlesignupresult">GoogleSignupResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#googlesignupinput">GoogleSignupInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>logOut</strong></td>
<td valign="top"><a href="#logoutresult">LogOutResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>login</strong></td>
<td valign="top"><a href="#loginresult">LoginResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#logininput">LoginInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>mergeHighlight</strong></td>
<td valign="top"><a href="#mergehighlightresult">MergeHighlightResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#mergehighlightinput">MergeHighlightInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reportItem</strong></td>
<td valign="top"><a href="#reportitemresult">ReportItemResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#reportiteminput">ReportItemInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>revokeApiKey</strong></td>
<td valign="top"><a href="#revokeapikeyresult">RevokeApiKeyResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">id</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>saveArticleReadingProgress</strong></td>
<td valign="top"><a href="#savearticlereadingprogressresult">SaveArticleReadingProgressResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#savearticlereadingprogressinput">SaveArticleReadingProgressInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>saveFile</strong></td>
<td valign="top"><a href="#saveresult">SaveResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#savefileinput">SaveFileInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>savePage</strong></td>
<td valign="top"><a href="#saveresult">SaveResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#savepageinput">SavePageInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>saveUrl</strong></td>
<td valign="top"><a href="#saveresult">SaveResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#saveurlinput">SaveUrlInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>setBookmarkArticle</strong></td>
<td valign="top"><a href="#setbookmarkarticleresult">SetBookmarkArticleResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#setbookmarkarticleinput">SetBookmarkArticleInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>setDeviceToken</strong></td>
<td valign="top"><a href="#setdevicetokenresult">SetDeviceTokenResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#setdevicetokeninput">SetDeviceTokenInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>setFollow</strong></td>
<td valign="top"><a href="#setfollowresult">SetFollowResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#setfollowinput">SetFollowInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>setLabels</strong></td>
<td valign="top"><a href="#setlabelsresult">SetLabelsResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#setlabelsinput">SetLabelsInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>setLabelsForHighlight</strong></td>
<td valign="top"><a href="#setlabelsresult">SetLabelsResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#setlabelsforhighlightinput">SetLabelsForHighlightInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>setLinkArchived</strong></td>
<td valign="top"><a href="#archivelinkresult">ArchiveLinkResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#archivelinkinput">ArchiveLinkInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>setShareArticle</strong></td>
<td valign="top"><a href="#setsharearticleresult">SetShareArticleResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#setsharearticleinput">SetShareArticleInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>setShareHighlight</strong></td>
<td valign="top"><a href="#setsharehighlightresult">SetShareHighlightResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#setsharehighlightinput">SetShareHighlightInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>setUserPersonalization</strong></td>
<td valign="top"><a href="#setuserpersonalizationresult">SetUserPersonalizationResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#setuserpersonalizationinput">SetUserPersonalizationInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>setWebhook</strong></td>
<td valign="top"><a href="#setwebhookresult">SetWebhookResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#setwebhookinput">SetWebhookInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>signup</strong></td>
<td valign="top"><a href="#signupresult">SignupResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#signupinput">SignupInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>subscribe</strong></td>
<td valign="top"><a href="#subscriberesult">SubscribeResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">name</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>unsubscribe</strong></td>
<td valign="top"><a href="#unsubscriberesult">UnsubscribeResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">name</td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateHighlight</strong></td>
<td valign="top"><a href="#updatehighlightresult">UpdateHighlightResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#updatehighlightinput">UpdateHighlightInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateHighlightReply</strong></td>
<td valign="top"><a href="#updatehighlightreplyresult">UpdateHighlightReplyResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#updatehighlightreplyinput">UpdateHighlightReplyInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateLabel</strong></td>
<td valign="top"><a href="#updatelabelresult">UpdateLabelResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#updatelabelinput">UpdateLabelInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateLinkShareInfo</strong></td>
<td valign="top"><a href="#updatelinkshareinforesult">UpdateLinkShareInfoResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#updatelinkshareinfoinput">UpdateLinkShareInfoInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatePage</strong></td>
<td valign="top"><a href="#updatepageresult">UpdatePageResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#updatepageinput">UpdatePageInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateReminder</strong></td>
<td valign="top"><a href="#updatereminderresult">UpdateReminderResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#updatereminderinput">UpdateReminderInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateSharedComment</strong></td>
<td valign="top"><a href="#updatesharedcommentresult">UpdateSharedCommentResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#updatesharedcommentinput">UpdateSharedCommentInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateUser</strong></td>
<td valign="top"><a href="#updateuserresult">UpdateUserResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#updateuserinput">UpdateUserInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updateUserProfile</strong></td>
<td valign="top"><a href="#updateuserprofileresult">UpdateUserProfileResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#updateuserprofileinput">UpdateUserProfileInput</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>uploadFileRequest</strong></td>
<td valign="top"><a href="#uploadfilerequestresult">UploadFileRequestResult</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#uploadfilerequestinput">UploadFileRequestInput</a>!</td>
<td></td>
</tr>
</tbody>
</table>

## Objects

### AddPopularReadError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#addpopularreaderrorcode">AddPopularReadErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### AddPopularReadSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>pageId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### ApiKey

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>expiresAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>key</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>scopes</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>usedAt</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
</tbody>
</table>

### ApiKeysError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#apikeyserrorcode">ApiKeysErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### ApiKeysSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>apiKeys</strong></td>
<td valign="top">[<a href="#apikey">ApiKey</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### ArchiveLinkError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#archivelinkerrorcode">ArchiveLinkErrorCode</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>message</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### ArchiveLinkSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>linkId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>message</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### Article

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>author</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>content</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>contentReader</strong></td>
<td valign="top"><a href="#contentreader">ContentReader</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasContent</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hash</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>highlights</strong></td>
<td valign="top">[<a href="#highlight">Highlight</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" align="right" valign="top">input</td>
<td valign="top"><a href="#articlehighlightsinput">ArticleHighlightsInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>image</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isArchived</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>labels</strong></td>
<td valign="top">[<a href="#label">Label</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>language</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>linkId</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>originalArticleUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>originalHtml</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageType</strong></td>
<td valign="top"><a href="#pagetype">PageType</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>postedByViewer</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>publishedAt</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>readAt</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>readingProgressAnchorIndex</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>readingProgressPercent</strong></td>
<td valign="top"><a href="#float">Float</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>savedAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>savedByViewer</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>shareInfo</strong></td>
<td valign="top"><a href="#linkshareinfo">LinkShareInfo</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedComment</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>siteIcon</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>siteName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>slug</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>state</strong></td>
<td valign="top"><a href="#articlesavingrequeststatus">ArticleSavingRequestStatus</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>subscription</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>title</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>unsubHttpUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>unsubMailTo</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>uploadFileId</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### ArticleEdge

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>cursor</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>node</strong></td>
<td valign="top"><a href="#article">Article</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### ArticleError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#articleerrorcode">ArticleErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### ArticleSavingRequest

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>article</strong> ⚠️</td>
<td valign="top"><a href="#article">Article</a></td>
<td>
<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

article has been replaced with slug

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>errorCode</strong></td>
<td valign="top"><a href="#createarticleerrorcode">CreateArticleErrorCode</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>slug</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#articlesavingrequeststatus">ArticleSavingRequestStatus</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>user</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userId</strong> ⚠️</td>
<td valign="top"><a href="#id">ID</a>!</td>
<td>
<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

userId has been replaced with user

</blockquote>
</td>
</tr>
</tbody>
</table>

### ArticleSavingRequestError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#articlesavingrequesterrorcode">ArticleSavingRequestErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### ArticleSavingRequestSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>articleSavingRequest</strong></td>
<td valign="top"><a href="#articlesavingrequest">ArticleSavingRequest</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### ArticleSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>article</strong></td>
<td valign="top"><a href="#article">Article</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### ArticlesError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#articleserrorcode">ArticlesErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### ArticlesSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>edges</strong></td>
<td valign="top">[<a href="#articleedge">ArticleEdge</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageInfo</strong></td>
<td valign="top"><a href="#pageinfo">PageInfo</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateArticleError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#createarticleerrorcode">CreateArticleErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateArticleSavingRequestError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#createarticlesavingrequesterrorcode">CreateArticleSavingRequestErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateArticleSavingRequestSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>articleSavingRequest</strong></td>
<td valign="top"><a href="#articlesavingrequest">ArticleSavingRequest</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateArticleSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>created</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdArticle</strong></td>
<td valign="top"><a href="#article">Article</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>user</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateHighlightError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#createhighlighterrorcode">CreateHighlightErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateHighlightReplyError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#createhighlightreplyerrorcode">CreateHighlightReplyErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateHighlightReplySuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>highlightReply</strong></td>
<td valign="top"><a href="#highlightreply">HighlightReply</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateHighlightSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>highlight</strong></td>
<td valign="top"><a href="#highlight">Highlight</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateLabelError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#createlabelerrorcode">CreateLabelErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateLabelSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>label</strong></td>
<td valign="top"><a href="#label">Label</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateNewsletterEmailError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#createnewsletteremailerrorcode">CreateNewsletterEmailErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateNewsletterEmailSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>newsletterEmail</strong></td>
<td valign="top"><a href="#newsletteremail">NewsletterEmail</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateReactionError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#createreactionerrorcode">CreateReactionErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateReactionSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>reaction</strong></td>
<td valign="top"><a href="#reaction">Reaction</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateReminderError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#createremindererrorcode">CreateReminderErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateReminderSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>reminder</strong></td>
<td valign="top"><a href="#reminder">Reminder</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteHighlightError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#deletehighlighterrorcode">DeleteHighlightErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteHighlightReplyError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#deletehighlightreplyerrorcode">DeleteHighlightReplyErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteHighlightReplySuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>highlightReply</strong></td>
<td valign="top"><a href="#highlightreply">HighlightReply</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteHighlightSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>highlight</strong></td>
<td valign="top"><a href="#highlight">Highlight</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteLabelError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#deletelabelerrorcode">DeleteLabelErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteLabelSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>label</strong></td>
<td valign="top"><a href="#label">Label</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteNewsletterEmailError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#deletenewsletteremailerrorcode">DeleteNewsletterEmailErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteNewsletterEmailSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>newsletterEmail</strong></td>
<td valign="top"><a href="#newsletteremail">NewsletterEmail</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteReactionError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#deletereactionerrorcode">DeleteReactionErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteReactionSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>reaction</strong></td>
<td valign="top"><a href="#reaction">Reaction</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteReminderError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#deleteremindererrorcode">DeleteReminderErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteReminderSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>reminder</strong></td>
<td valign="top"><a href="#reminder">Reminder</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteWebhookError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#deletewebhookerrorcode">DeleteWebhookErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### DeleteWebhookSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>webhook</strong></td>
<td valign="top"><a href="#webhook">Webhook</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### DeviceToken

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>token</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### FeedArticle

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>annotationsCount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>article</strong></td>
<td valign="top"><a href="#article">Article</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>highlight</strong></td>
<td valign="top"><a href="#highlight">Highlight</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>highlightsCount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reactions</strong></td>
<td valign="top">[<a href="#reaction">Reaction</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedBy</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedComment</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedWithHighlights</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
</tbody>
</table>

### FeedArticleEdge

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>cursor</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>node</strong></td>
<td valign="top"><a href="#feedarticle">FeedArticle</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### FeedArticlesError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#feedarticleserrorcode">FeedArticlesErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### FeedArticlesSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>edges</strong></td>
<td valign="top">[<a href="#feedarticleedge">FeedArticleEdge</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageInfo</strong></td>
<td valign="top"><a href="#pageinfo">PageInfo</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### GenerateApiKeyError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#generateapikeyerrorcode">GenerateApiKeyErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### GenerateApiKeySuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>apiKey</strong></td>
<td valign="top"><a href="#apikey">ApiKey</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### GetFollowersError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#getfollowerserrorcode">GetFollowersErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### GetFollowersSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>followers</strong></td>
<td valign="top">[<a href="#user">User</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### GetFollowingError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#getfollowingerrorcode">GetFollowingErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### GetFollowingSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>following</strong></td>
<td valign="top">[<a href="#user">User</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### GetUserPersonalizationError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#getuserpersonalizationerrorcode">GetUserPersonalizationErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### GetUserPersonalizationSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>userPersonalization</strong></td>
<td valign="top"><a href="#userpersonalization">UserPersonalization</a></td>
<td></td>
</tr>
</tbody>
</table>

### GoogleSignupError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#signuperrorcode">SignupErrorCode</a>]!</td>
<td></td>
</tr>
</tbody>
</table>

### GoogleSignupSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>me</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### Highlight

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>annotation</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdByMe</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>patch</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>prefix</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>quote</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reactions</strong></td>
<td valign="top">[<a href="#reaction">Reaction</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>replies</strong></td>
<td valign="top">[<a href="#highlightreply">HighlightReply</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedAt</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>shortId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>suffix</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>user</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### HighlightReply

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>highlight</strong></td>
<td valign="top"><a href="#highlight">Highlight</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>text</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>user</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### HighlightStats

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>highlightCount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### Label

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>color</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### LabelsError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#labelserrorcode">LabelsErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### LabelsSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>labels</strong></td>
<td valign="top">[<a href="#label">Label</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### Link

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>highlightStats</strong></td>
<td valign="top"><a href="#highlightstats">HighlightStats</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>page</strong></td>
<td valign="top"><a href="#page">Page</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>postedByViewer</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>readState</strong></td>
<td valign="top"><a href="#readstate">ReadState</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>savedAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>savedBy</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>savedByViewer</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>shareInfo</strong></td>
<td valign="top"><a href="#linkshareinfo">LinkShareInfo</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>shareStats</strong></td>
<td valign="top"><a href="#sharestats">ShareStats</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>slug</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### LinkShareInfo

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>imageUrl</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>title</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### LogOutError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#logouterrorcode">LogOutErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### LogOutSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>message</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### LoginError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#loginerrorcode">LoginErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### LoginSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>me</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### MergeHighlightError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#mergehighlighterrorcode">MergeHighlightErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### MergeHighlightSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>highlight</strong></td>
<td valign="top"><a href="#highlight">Highlight</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>overlapHighlightIdList</strong></td>
<td valign="top">[<a href="#string">String</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### NewsletterEmail

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>address</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>confirmationCode</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### NewsletterEmailsError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#newsletteremailserrorcode">NewsletterEmailsErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### NewsletterEmailsSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>newsletterEmails</strong></td>
<td valign="top">[<a href="#newsletteremail">NewsletterEmail</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### Page

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>author</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hash</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>image</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>originalHtml</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>originalUrl</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>publishedAt</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>readableHtml</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>title</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>type</strong></td>
<td valign="top"><a href="#pagetype">PageType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### PageInfo

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>endCursor</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasNextPage</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>hasPreviousPage</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>startCursor</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>totalCount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
</tbody>
</table>

### Profile

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>bio</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pictureUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>private</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>username</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### Reaction

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>code</strong></td>
<td valign="top"><a href="#reactiontype">ReactionType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>user</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### ReadState

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>progressAnchorIndex</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>progressPercent</strong></td>
<td valign="top"><a href="#float">Float</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reading</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>readingTime</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
</tbody>
</table>

### Reminder

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>archiveUntil</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>remindAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sendNotification</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### ReminderError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#remindererrorcode">ReminderErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### ReminderSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>reminder</strong></td>
<td valign="top"><a href="#reminder">Reminder</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### ReportItemResult

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>message</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### RevokeApiKeyError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#revokeapikeyerrorcode">RevokeApiKeyErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### RevokeApiKeySuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>apiKey</strong></td>
<td valign="top"><a href="#apikey">ApiKey</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SaveArticleReadingProgressError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#savearticlereadingprogresserrorcode">SaveArticleReadingProgressErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SaveArticleReadingProgressSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>updatedArticle</strong></td>
<td valign="top"><a href="#article">Article</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SaveError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#saveerrorcode">SaveErrorCode</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>message</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### SaveSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>clientRequestId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SearchError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#searcherrorcode">SearchErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SearchItem

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>annotation</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>author</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>contentReader</strong></td>
<td valign="top"><a href="#contentreader">ContentReader</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>highlights</strong></td>
<td valign="top">[<a href="#highlight">Highlight</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>image</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isArchived</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>labels</strong></td>
<td valign="top">[<a href="#label">Label</a>!]</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>language</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>originalArticleUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>ownedByViewer</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageId</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageType</strong></td>
<td valign="top"><a href="#pagetype">PageType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>publishedAt</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>quote</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>readAt</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>readingProgressAnchorIndex</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>readingProgressPercent</strong></td>
<td valign="top"><a href="#float">Float</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>savedAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>shortId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>siteName</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>slug</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>state</strong></td>
<td valign="top"><a href="#articlesavingrequeststatus">ArticleSavingRequestStatus</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>subscription</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>title</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>unsubHttpUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>unsubMailTo</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>uploadFileId</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SearchItemEdge

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>cursor</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>node</strong></td>
<td valign="top"><a href="#searchitem">SearchItem</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SearchSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>edges</strong></td>
<td valign="top">[<a href="#searchitemedge">SearchItemEdge</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageInfo</strong></td>
<td valign="top"><a href="#pageinfo">PageInfo</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SendInstallInstructionsError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#sendinstallinstructionserrorcode">SendInstallInstructionsErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SendInstallInstructionsSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>sent</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SetBookmarkArticleError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#setbookmarkarticleerrorcode">SetBookmarkArticleErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SetBookmarkArticleSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>bookmarkedArticle</strong></td>
<td valign="top"><a href="#article">Article</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SetDeviceTokenError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#setdevicetokenerrorcode">SetDeviceTokenErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SetDeviceTokenSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>deviceToken</strong></td>
<td valign="top"><a href="#devicetoken">DeviceToken</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SetFollowError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#setfollowerrorcode">SetFollowErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SetFollowSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>updatedUser</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SetLabelsError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#setlabelserrorcode">SetLabelsErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SetLabelsSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>labels</strong></td>
<td valign="top">[<a href="#label">Label</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SetShareArticleError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#setsharearticleerrorcode">SetShareArticleErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SetShareArticleSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>updatedArticle</strong></td>
<td valign="top"><a href="#article">Article</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedFeedArticle</strong></td>
<td valign="top"><a href="#feedarticle">FeedArticle</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedFeedArticleId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### SetShareHighlightError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#setsharehighlighterrorcode">SetShareHighlightErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SetShareHighlightSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>highlight</strong></td>
<td valign="top"><a href="#highlight">Highlight</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SetUserPersonalizationError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#setuserpersonalizationerrorcode">SetUserPersonalizationErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SetUserPersonalizationSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>updatedUserPersonalization</strong></td>
<td valign="top"><a href="#userpersonalization">UserPersonalization</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SetWebhookError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#setwebhookerrorcode">SetWebhookErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SetWebhookSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>webhook</strong></td>
<td valign="top"><a href="#webhook">Webhook</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### ShareStats

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>readDuration</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>saveCount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>viewCount</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SharedArticleError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#sharedarticleerrorcode">SharedArticleErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SharedArticleSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>article</strong></td>
<td valign="top"><a href="#article">Article</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SignupError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#signuperrorcode">SignupErrorCode</a>]!</td>
<td></td>
</tr>
</tbody>
</table>

### SignupSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>me</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SubscribeError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#subscribeerrorcode">SubscribeErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SubscribeSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>subscriptions</strong></td>
<td valign="top">[<a href="#subscription">Subscription</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### Subscription

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>newsletterEmail</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>status</strong></td>
<td valign="top"><a href="#subscriptionstatus">SubscriptionStatus</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>unsubscribeHttpUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>unsubscribeMailTo</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### SubscriptionsError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#subscriptionserrorcode">SubscriptionsErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SubscriptionsSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>subscriptions</strong></td>
<td valign="top">[<a href="#subscription">Subscription</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UnsubscribeError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#unsubscribeerrorcode">UnsubscribeErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UnsubscribeSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>subscription</strong></td>
<td valign="top"><a href="#subscription">Subscription</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateHighlightError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#updatehighlighterrorcode">UpdateHighlightErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateHighlightReplyError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#updatehighlightreplyerrorcode">UpdateHighlightReplyErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateHighlightReplySuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>highlightReply</strong></td>
<td valign="top"><a href="#highlightreply">HighlightReply</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateHighlightSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>highlight</strong></td>
<td valign="top"><a href="#highlight">Highlight</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateLabelError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#updatelabelerrorcode">UpdateLabelErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateLabelSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>label</strong></td>
<td valign="top"><a href="#label">Label</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateLinkShareInfoError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#updatelinkshareinfoerrorcode">UpdateLinkShareInfoErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateLinkShareInfoSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>message</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdatePageError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#updatepageerrorcode">UpdatePageErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdatePageSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>updatedPage</strong></td>
<td valign="top"><a href="#article">Article</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateReminderError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#updateremindererrorcode">UpdateReminderErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateReminderSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>reminder</strong></td>
<td valign="top"><a href="#reminder">Reminder</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateSharedCommentError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#updatesharedcommenterrorcode">UpdateSharedCommentErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateSharedCommentSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>articleID</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedComment</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateUserError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#updateusererrorcode">UpdateUserErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateUserProfileError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#updateuserprofileerrorcode">UpdateUserProfileErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateUserProfileSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>user</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateUserSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>user</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UploadFileRequestError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#uploadfilerequesterrorcode">UploadFileRequestErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UploadFileRequestSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>createdPageId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>uploadFileId</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>uploadSignedUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### User

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>followersCount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>friendsCount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isFriend</strong> ⚠️</td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td>
<p>⚠️ <strong>DEPRECATED</strong></p>
<blockquote>

isFriend has been replaced with viewerIsFollowing

</blockquote>
</td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>isFullUser</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>picture</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>profile</strong></td>
<td valign="top"><a href="#profile">Profile</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedArticles</strong></td>
<td valign="top">[<a href="#feedarticle">FeedArticle</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedArticlesCount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedHighlightsCount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedNotesCount</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>viewerIsFollowing</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
</tbody>
</table>

### UserError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#usererrorcode">UserErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UserPersonalization

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>fontFamily</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>fontSize</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>libraryLayoutType</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>librarySortOrder</strong></td>
<td valign="top"><a href="#sortorder">SortOrder</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>margin</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>theme</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### UserSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>user</strong></td>
<td valign="top"><a href="#user">User</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UsersError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#userserrorcode">UsersErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### UsersSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>users</strong></td>
<td valign="top">[<a href="#user">User</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### Webhook

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>contentType</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createdAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>enabled</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>eventTypes</strong></td>
<td valign="top">[<a href="#webhookevent">WebhookEvent</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>method</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>updatedAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### WebhookError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#webhookerrorcode">WebhookErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### WebhookSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>webhook</strong></td>
<td valign="top"><a href="#webhook">Webhook</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### WebhooksError

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>errorCodes</strong></td>
<td valign="top">[<a href="#webhookserrorcode">WebhooksErrorCode</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### WebhooksSuccess

<table>
<thead>
<tr>
<th align="left">Field</th>
<th align="right">Argument</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>webhooks</strong></td>
<td valign="top">[<a href="#webhook">Webhook</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

## Inputs

### ArchiveLinkInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>archived</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>linkId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### ArticleHighlightsInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>includeFriends</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
</tbody>
</table>

### CreateArticleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>articleSavingRequestId</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>preparedDocument</strong></td>
<td valign="top"><a href="#prepareddocumentinput">PreparedDocumentInput</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>skipParsing</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>source</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>uploadFileId</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateArticleSavingRequestInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateHighlightInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>annotation</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>articleId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>patch</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>prefix</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>quote</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedAt</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>shortId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>suffix</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### CreateHighlightReplyInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>highlightId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>text</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateLabelInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>color</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### CreateReactionInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>code</strong></td>
<td valign="top"><a href="#reactiontype">ReactionType</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>highlightId</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userArticleId</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
</tbody>
</table>

### CreateReminderInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>archiveUntil</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>clientRequestId</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>linkId</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>remindAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sendNotification</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### GenerateApiKeyInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>expiresAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>scopes</strong></td>
<td valign="top">[<a href="#string">String</a>!]</td>
<td></td>
</tr>
</tbody>
</table>

### GoogleLoginInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>email</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>secret</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### GoogleSignupInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>bio</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>email</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pictureUrl</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>secret</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sourceUserId</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>username</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### LoginInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>email</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>password</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### MergeHighlightInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>annotation</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>articleId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>overlapHighlightIdList</strong></td>
<td valign="top">[<a href="#string">String</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>patch</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>prefix</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>quote</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>shortId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>suffix</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### PageInfoInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>author</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>canonicalUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>contentType</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>previewImage</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>publishedAt</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>title</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### PreparedDocumentInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>document</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageInfo</strong></td>
<td valign="top"><a href="#pageinfoinput">PageInfoInput</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### ReportItemInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>itemUrl</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reportComment</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>reportTypes</strong></td>
<td valign="top">[<a href="#reporttype">ReportType</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedBy</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
</tbody>
</table>

### SaveArticleReadingProgressInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>readingProgressAnchorIndex</strong></td>
<td valign="top"><a href="#int">Int</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>readingProgressPercent</strong></td>
<td valign="top"><a href="#float">Float</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SaveFileInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>clientRequestId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>source</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>uploadFileId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SavePageInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>clientRequestId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>originalContent</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>source</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>title</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SaveUrlInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>clientRequestId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>source</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SetBookmarkArticleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>articleID</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>bookmark</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SetDeviceTokenInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>token</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### SetFollowInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>follow</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SetLabelsForHighlightInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>highlightId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>labelIds</strong></td>
<td valign="top">[<a href="#id">ID</a>!]!</td>
<td></td>
</tr>
</tbody>
</table>

### SetLabelsInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>labelIds</strong></td>
<td valign="top">[<a href="#id">ID</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SetShareArticleInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>articleID</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>share</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedComment</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedWithHighlights</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
</tbody>
</table>

### SetShareHighlightInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>share</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SetUserPersonalizationInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>fontFamily</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>fontSize</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>libraryLayoutType</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>librarySortOrder</strong></td>
<td valign="top"><a href="#sortorder">SortOrder</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>margin</strong></td>
<td valign="top"><a href="#int">Int</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>theme</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### SetWebhookInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>contentType</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>enabled</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>eventTypes</strong></td>
<td valign="top">[<a href="#webhookevent">WebhookEvent</a>!]!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>method</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SignupInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>bio</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>email</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>password</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pictureUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>username</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### SortParams

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>by</strong></td>
<td valign="top"><a href="#sortby">SortBy</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>order</strong></td>
<td valign="top"><a href="#sortorder">SortOrder</a></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateHighlightInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>annotation</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>highlightId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedAt</strong></td>
<td valign="top"><a href="#date">Date</a></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateHighlightReplyInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>highlightReplyId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>text</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateLabelInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>color</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>labelId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateLinkShareInfoInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>linkId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>title</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdatePageInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>description</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pageId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>title</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateReminderInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>archiveUntil</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>id</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>remindAt</strong></td>
<td valign="top"><a href="#date">Date</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sendNotification</strong></td>
<td valign="top"><a href="#boolean">Boolean</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateSharedCommentInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>articleID</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>sharedComment</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateUserInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>bio</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>name</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

### UpdateUserProfileInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>bio</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>pictureUrl</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>userId</strong></td>
<td valign="top"><a href="#id">ID</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>username</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
</tbody>
</table>

### UploadFileRequestInput

<table>
<thead>
<tr>
<th colspan="2" align="left">Field</th>
<th align="left">Type</th>
<th align="left">Description</th>
</tr>
</thead>
<tbody>
<tr>
<td colspan="2" valign="top"><strong>clientRequestId</strong></td>
<td valign="top"><a href="#string">String</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>contentType</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>createPageEntry</strong></td>
<td valign="top"><a href="#boolean">Boolean</a></td>
<td></td>
</tr>
<tr>
<td colspan="2" valign="top"><strong>url</strong></td>
<td valign="top"><a href="#string">String</a>!</td>
<td></td>
</tr>
</tbody>
</table>

## Enums

### AddPopularReadErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### ApiKeysErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### ArchiveLinkErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### ArticleErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_DATA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### ArticleSavingRequestErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### ArticleSavingRequestStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>FAILED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PROCESSING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SUCCEEDED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### ArticlesErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### ContentReader

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>PDF</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WEB</strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateArticleErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ELASTIC_ERROR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_ALLOWED_TO_PARSE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PAYLOAD_TOO_LARGE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNABLE_TO_FETCH</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNABLE_TO_PARSE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UPLOAD_FILE_MISSING</strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateArticleSavingRequestErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_DATA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateHighlightErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ALREADY_EXISTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BAD_DATA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateHighlightReplyErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>EMPTY_ANNOTATION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateLabelErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LABEL_ALREADY_EXISTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateNewsletterEmailErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateReactionErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_CODE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BAD_TARGET</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateReminderErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteHighlightErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteHighlightReplyErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteLabelErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteNewsletterEmailErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteReactionErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteReminderErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteWebhookErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### FeedArticlesErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### GenerateApiKeyErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ALREADY_EXISTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### GetFollowersErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### GetFollowingErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### GetUserPersonalizationErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### LabelsErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### LogOutErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>LOG_OUT_FAILED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### LoginErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ACCESS_DENIED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>AUTH_FAILED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INVALID_CREDENTIALS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>USER_ALREADY_EXISTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>USER_NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WRONG_SOURCE</strong></td>
<td></td>
</tr>
</tbody>
</table>

### MergeHighlightErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ALREADY_EXISTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BAD_DATA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### NewsletterEmailsErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### PageType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ARTICLE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BOOK</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FILE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>HIGHLIGHTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PROFILE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNKNOWN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>WEBSITE</strong></td>
<td></td>
</tr>
</tbody>
</table>

### ReactionType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>CRYING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>HEART</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>HUSHED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LIKE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>POUT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SMILE</strong></td>
<td></td>
</tr>
</tbody>
</table>

### ReminderErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### ReportType

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ABUSIVE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CONTENT_DISPLAY</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>CONTENT_VIOLATION</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SPAM</strong></td>
<td></td>
</tr>
</tbody>
</table>

### RevokeApiKeyErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SaveArticleReadingProgressErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_DATA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SaveErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNKNOWN</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SearchErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SendInstallInstructionsErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetBookmarkArticleErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BOOKMARK_EXISTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetDeviceTokenErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetFollowErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetLabelsErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetShareArticleErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetShareHighlightErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetUserPersonalizationErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetWebhookErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ALREADY_EXISTS</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SharedArticleErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SignupErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ACCESS_DENIED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EXPIRED_TOKEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>GOOGLE_AUTH_ERROR</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INVALID_PASSWORD</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INVALID_USERNAME</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNKNOWN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>USER_EXISTS</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SortBy

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>PUBLISHED_AT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SAVED_AT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>SCORE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UPDATED_TIME</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SortOrder

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ASCENDING</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DESCENDING</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SubscribeErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ALREADY_SUBSCRIBED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SubscriptionStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ACTIVE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>DELETED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNSUBSCRIBED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### SubscriptionsErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UnsubscribeErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>ALREADY_UNSUBSCRIBED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNSUBSCRIBE_METHOD_NOT_FOUND</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateHighlightErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_DATA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateHighlightReplyErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateLabelErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateLinkShareInfoErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdatePageErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UPDATE_FAILED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateReminderErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateSharedCommentErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateUserErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BIO_TOO_LONG</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>EMPTY_NAME</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>USER_NOT_FOUND</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateUserProfileErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_DATA</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>BAD_USERNAME</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FORBIDDEN</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>USERNAME_EXISTS</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UploadFileRequestErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_INPUT</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>FAILED_CREATE</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UploadFileStatus

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>COMPLETED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>INITIALIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UserErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>USER_NOT_FOUND</strong></td>
<td></td>
</tr>
</tbody>
</table>

### UsersErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### WebhookErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>NOT_FOUND</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### WebhookEvent

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>HIGHLIGHT_CREATED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>HIGHLIGHT_DELETED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>HIGHLIGHT_UPDATED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LABEL_CREATED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LABEL_DELETED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>LABEL_UPDATED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PAGE_CREATED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PAGE_DELETED</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>PAGE_UPDATED</strong></td>
<td></td>
</tr>
</tbody>
</table>

### WebhooksErrorCode

<table>
<thead>
<th align="left">Value</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong>BAD_REQUEST</strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong>UNAUTHORIZED</strong></td>
<td></td>
</tr>
</tbody>
</table>

## Scalars

### Boolean

The `Boolean` scalar type represents `true` or `false`.

### Date

### Float

The `Float` scalar type represents signed double-precision fractional values as specified by [IEEE 754](https://en.wikipedia.org/wiki/IEEE_floating_point).

### ID

The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.

### Int

The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1.

### String

The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.


## Unions

### AddPopularReadResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#addpopularreaderror">AddPopularReadError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#addpopularreadsuccess">AddPopularReadSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### ApiKeysResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#apikeyserror">ApiKeysError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#apikeyssuccess">ApiKeysSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### ArchiveLinkResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#archivelinkerror">ArchiveLinkError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#archivelinksuccess">ArchiveLinkSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### ArticleResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#articleerror">ArticleError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#articlesuccess">ArticleSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### ArticleSavingRequestResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#articlesavingrequesterror">ArticleSavingRequestError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#articlesavingrequestsuccess">ArticleSavingRequestSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### ArticlesResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#articleserror">ArticlesError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#articlessuccess">ArticlesSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateArticleResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#createarticleerror">CreateArticleError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#createarticlesuccess">CreateArticleSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateArticleSavingRequestResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#createarticlesavingrequesterror">CreateArticleSavingRequestError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#createarticlesavingrequestsuccess">CreateArticleSavingRequestSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateHighlightReplyResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#createhighlightreplyerror">CreateHighlightReplyError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#createhighlightreplysuccess">CreateHighlightReplySuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateHighlightResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#createhighlighterror">CreateHighlightError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#createhighlightsuccess">CreateHighlightSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateLabelResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#createlabelerror">CreateLabelError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#createlabelsuccess">CreateLabelSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateNewsletterEmailResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#createnewsletteremailerror">CreateNewsletterEmailError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#createnewsletteremailsuccess">CreateNewsletterEmailSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateReactionResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#createreactionerror">CreateReactionError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#createreactionsuccess">CreateReactionSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### CreateReminderResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#createremindererror">CreateReminderError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#createremindersuccess">CreateReminderSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteHighlightReplyResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#deletehighlightreplyerror">DeleteHighlightReplyError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#deletehighlightreplysuccess">DeleteHighlightReplySuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteHighlightResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#deletehighlighterror">DeleteHighlightError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#deletehighlightsuccess">DeleteHighlightSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteLabelResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#deletelabelerror">DeleteLabelError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#deletelabelsuccess">DeleteLabelSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteNewsletterEmailResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#deletenewsletteremailerror">DeleteNewsletterEmailError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#deletenewsletteremailsuccess">DeleteNewsletterEmailSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteReactionResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#deletereactionerror">DeleteReactionError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#deletereactionsuccess">DeleteReactionSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteReminderResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#deleteremindererror">DeleteReminderError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#deleteremindersuccess">DeleteReminderSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### DeleteWebhookResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#deletewebhookerror">DeleteWebhookError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#deletewebhooksuccess">DeleteWebhookSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### FeedArticlesResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#feedarticleserror">FeedArticlesError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#feedarticlessuccess">FeedArticlesSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### GenerateApiKeyResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#generateapikeyerror">GenerateApiKeyError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#generateapikeysuccess">GenerateApiKeySuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### GetFollowersResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#getfollowerserror">GetFollowersError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#getfollowerssuccess">GetFollowersSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### GetFollowingResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#getfollowingerror">GetFollowingError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#getfollowingsuccess">GetFollowingSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### GetUserPersonalizationResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#getuserpersonalizationerror">GetUserPersonalizationError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#getuserpersonalizationsuccess">GetUserPersonalizationSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### GoogleSignupResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#googlesignuperror">GoogleSignupError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#googlesignupsuccess">GoogleSignupSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### LabelsResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#labelserror">LabelsError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#labelssuccess">LabelsSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### LogOutResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#logouterror">LogOutError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#logoutsuccess">LogOutSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### LoginResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#loginerror">LoginError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#loginsuccess">LoginSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### MergeHighlightResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#mergehighlighterror">MergeHighlightError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#mergehighlightsuccess">MergeHighlightSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### NewsletterEmailsResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#newsletteremailserror">NewsletterEmailsError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#newsletteremailssuccess">NewsletterEmailsSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### ReminderResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#remindererror">ReminderError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#remindersuccess">ReminderSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### RevokeApiKeyResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#revokeapikeyerror">RevokeApiKeyError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#revokeapikeysuccess">RevokeApiKeySuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SaveArticleReadingProgressResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#savearticlereadingprogresserror">SaveArticleReadingProgressError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#savearticlereadingprogresssuccess">SaveArticleReadingProgressSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SaveResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#saveerror">SaveError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#savesuccess">SaveSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SearchResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#searcherror">SearchError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#searchsuccess">SearchSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SendInstallInstructionsResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#sendinstallinstructionserror">SendInstallInstructionsError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#sendinstallinstructionssuccess">SendInstallInstructionsSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetBookmarkArticleResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#setbookmarkarticleerror">SetBookmarkArticleError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#setbookmarkarticlesuccess">SetBookmarkArticleSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetDeviceTokenResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#setdevicetokenerror">SetDeviceTokenError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#setdevicetokensuccess">SetDeviceTokenSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetFollowResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#setfollowerror">SetFollowError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#setfollowsuccess">SetFollowSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetLabelsResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#setlabelserror">SetLabelsError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#setlabelssuccess">SetLabelsSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetShareArticleResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#setsharearticleerror">SetShareArticleError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#setsharearticlesuccess">SetShareArticleSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetShareHighlightResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#setsharehighlighterror">SetShareHighlightError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#setsharehighlightsuccess">SetShareHighlightSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetUserPersonalizationResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#setuserpersonalizationerror">SetUserPersonalizationError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#setuserpersonalizationsuccess">SetUserPersonalizationSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SetWebhookResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#setwebhookerror">SetWebhookError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#setwebhooksuccess">SetWebhookSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SharedArticleResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#sharedarticleerror">SharedArticleError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#sharedarticlesuccess">SharedArticleSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SignupResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#signuperror">SignupError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#signupsuccess">SignupSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SubscribeResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#subscribeerror">SubscribeError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#subscribesuccess">SubscribeSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### SubscriptionsResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#subscriptionserror">SubscriptionsError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#subscriptionssuccess">SubscriptionsSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### UnsubscribeResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#unsubscribeerror">UnsubscribeError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#unsubscribesuccess">UnsubscribeSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateHighlightReplyResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#updatehighlightreplyerror">UpdateHighlightReplyError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#updatehighlightreplysuccess">UpdateHighlightReplySuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateHighlightResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#updatehighlighterror">UpdateHighlightError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#updatehighlightsuccess">UpdateHighlightSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateLabelResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#updatelabelerror">UpdateLabelError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#updatelabelsuccess">UpdateLabelSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateLinkShareInfoResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#updatelinkshareinfoerror">UpdateLinkShareInfoError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#updatelinkshareinfosuccess">UpdateLinkShareInfoSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdatePageResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#updatepageerror">UpdatePageError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#updatepagesuccess">UpdatePageSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateReminderResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#updateremindererror">UpdateReminderError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#updateremindersuccess">UpdateReminderSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateSharedCommentResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#updatesharedcommenterror">UpdateSharedCommentError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#updatesharedcommentsuccess">UpdateSharedCommentSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateUserProfileResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#updateuserprofileerror">UpdateUserProfileError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#updateuserprofilesuccess">UpdateUserProfileSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### UpdateUserResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#updateusererror">UpdateUserError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#updateusersuccess">UpdateUserSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### UploadFileRequestResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#uploadfilerequesterror">UploadFileRequestError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#uploadfilerequestsuccess">UploadFileRequestSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### UserResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#usererror">UserError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#usersuccess">UserSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### UsersResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#userserror">UsersError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#userssuccess">UsersSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### WebhookResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#webhookerror">WebhookError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#webhooksuccess">WebhookSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>

### WebhooksResult

<table>
<thead>
<th align="left">Type</th>
<th align="left">Description</th>
</thead>
<tbody>
<tr>
<td valign="top"><strong><a href="#webhookserror">WebhooksError</a></strong></td>
<td></td>
</tr>
<tr>
<td valign="top"><strong><a href="#webhookssuccess">WebhooksSuccess</a></strong></td>
<td></td>
</tr>
</tbody>
</table>
Done in 0.36s.
