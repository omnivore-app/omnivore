import Foundation

public enum LocalText {
  public static func localText(key: String, comment: String? = nil) -> String {
    NSLocalizedString(key, bundle: .module, comment: comment ?? "no comment provided by developer")
  }

  // Share extension
  public static let saveArticleSavedState = localText(key: "saveArticleSavedState")
  public static let saveArticleProcessingState = localText(key: "saveArticleProcessingState")
  public static let extensionAppUnauthorized = localText(key: "extensionAppUnauthorized")

  // Audio player
  public static let audioPlayerReplay = localText(key: "audioPlayerReplay")

  // Highlights List Card
  public static let highlightCardHighlightByOther = localText(key: "highlightCardHighlightByOther")
  public static let highlightCardNoHighlightsOnPage = localText(key: "highlightCardNoHighlightsOnPage")

  // Labels View
  public static let labelsViewAssignNameColor = localText(key: "labelsViewAssignNameColor")
  public static let createLabelMessage = localText(key: "createLabelMessage")
  public static let labelsPurposeDescription = localText(key: "labelsPurposeDescription")

  // Manage Account View
  public static let manageAccountDelete = localText(key: "manageAccountDelete")
  public static let manageAccountResetCache = localText(key: "manageAccountResetCache")
  public static let manageAccountConfirmDeleteMessage = localText(key: "manageAccountConfirmDeleteMessage")

  // Newsletter Emails View
  public static let newsletterEmailsExisting = localText(key: "newsletterEmailsExisting")
  public static let createNewEmailMessage = localText(key: "createNewEmailMessage")
  public static let newslettersDescription = localText(key: "newslettersDescription")
  public static let noCurrentSubscriptionsMessage = localText(key: "noCurrentSubscriptionsMessage")

  // Profile View
  public static let profileConfirmLogoutMessage = localText(key: "profileConfirmLogoutMessage")

  // Devices View
  public static let devicesTokensTitle = localText(key: "devicesTokensTitle")
  public static let devicesCreated = localText(key: "devicesCreated")

  // Push Notification Settings
  public static let notificationsEnabled = localText(key: "notificationsEnabled")
  public static let notificationsExplainer = localText(key: "notificationsExplainer")
  public static let notificationsTriggerExplainer = localText(key: "notificationsTriggerExplainer")
  public static let notificationsEnable = localText(key: "notificationsEnable")
  public static let notificationsGeneralExplainer = localText(key: "notificationsGeneralExplainer")
  public static let notificationsOptionDeny = localText(key: "notificationsOptionDeny")
  public static let notificationsOptionEnable = localText(key: "notificationsOptionEnable")

  // Community Modal
  public static let communityHeadline = localText(key: "communityHeadline")
  public static let communityAppstoreReview = localText(key: "communityAppstoreReview")
  public static let communityTweet = localText(key: "communityTweet")
  public static let communityFollowTwitter = localText(key: "communityFollowTwitter")
  public static let communityJoinDiscord = localText(key: "communityJoinDiscord")
  public static let communityStarGithub = localText(key: "communityStarGithub")

  // Clubs View
  public static let clubsLearnTitle = localText(key: "clubsLearnTitle")
  public static let clubsName = localText(key: "clubsName")
  public static let clubsCreate = localText(key: "clubsCreate")
  public static let clubsYours = localText(key: "clubsYours")
  public static let clubsNotAMemberMessage = localText(key: "clubsNotAMemberMessage")
  public static let clubsErrorCopying = localText(key: "clubsErrorCopying")
  public static let clubsAdminDenyViewing = localText(key: "clubsAdminDenyViewing")
  public static let clubsNoMembers = localText(key: "clubsNoMembers")
  public static let clubsLeave = localText(key: "clubsLeave")
  public static let clubsLeaveConfirm = localText(key: "clubsLeaveConfirm")
  public static let clubsNoneJoined = localText(key: "clubsNoneJoined")

  // Subscriptions
  public static let subscriptionsErrorRetrieving = localText(key: "subscriptionsErrorRetrieving")
  public static let subscriptionsNone = localText(key: "subscriptionsNone")

  // Text to Speech
  public static let texttospeechLanguageDefault = localText(key: "texttospeechLanguageDefault")
  public static let texttospeechSettingsAudio = localText(key: "texttospeechSettingsAudio")
  public static let texttospeechSettingsEnablePrefetch = localText(key: "texttospeechSettingsEnablePrefetch")
  public static let texttospeechBetaSignupInProcess = localText(key: "texttospeechBetaSignupInProcess")
  public static let texttospeechBetaRealisticVoiceLimit = localText(key: "texttospeechBetaRealisticVoiceLimit")
  public static let texttospeechBetaRequestReceived = localText(key: "texttospeechBetaRequestReceived")
  public static let texttospeechBetaWaitlist = localText(key: "texttospeechBetaWaitlist")

  // Sign in/up
  public static let registrationNoAccount = localText(key: "registrationNoAccount")
  public static let registrationForgotPassword = localText(key: "registrationForgotPassword")
  public static let registrationStatusCheck = localText(key: "registrationStatusCheck")
  public static let registrationUseDifferentEmail = localText(key: "registrationUseDifferentEmail")
  public static let registrationFullName = localText(key: "registrationFullName")
  public static let registrationUsername = localText(key: "registrationUsername")
  public static let registrationAlreadyHaveAccount = localText(key: "registrationAlreadyHaveAccount")
  public static let registrationBio = localText(key: "registrationBio")
  public static let registrationWelcome = localText(key: "registrationWelcome")
  public static let registrationUsernameAssignedPrefix = localText(key: "registrationUsernameAssignedPrefix")
  public static let registrationChangeUsername = localText(key: "registrationChangeUsername")
  public static let registrationEdit = localText(key: "registrationEdit")
  public static let googleAuthButton = localText(key: "googleAuthButton")
  public static let registrationViewSignUpHeadline = localText(key: "registrationViewSignUpHeadline")
  public static let loginErrorInvalidCreds = localText(key: "loginErrorInvalidCreds")

  // Recommendation
  public static let recommendationToPrefix = localText(key: "recommendationToPrefix")
  public static let recommendationAddNote = localText(key: "recommendationAddNote")
  public static let recommendationError = localText(key: "recommendationError")

  // Web Reader
  public static let readerCopyLink = localText(key: "readerCopyLink")
  public static let readerSave = localText(key: "readerSave")
  public static let readerError = localText(key: "readerError")

  // Debug Menu
  public static let menuDebugTitle = localText(key: "menuDebugTitle")
  public static let menuDebugApiEnv = localText(key: "menuDebugApiEnv")

  // Navigation
  public static let navigationSelectLink = localText(key: "navigationSelectLink")
  public static let navigationSelectSidebarToggle = localText(key: "navigationSelectSidebarToggle")

  // Welcome View
  public static let welcomeTitle = localText(key: "welcomeTitle")
  public static let welcomeLearnMore = localText(key: "welcomeLearnMore")
  public static let welcomeSignupAgreement = localText(key: "welcomeSignupAgreement")
  public static let welcomeTitleTermsOfService = localText(key: "welcomeTitleTermsOfService")
  public static let welcomeTitleAndJoiner = localText(key: "welcomeTitleAndJoiner")
  public static let welcomeTitleEmailContinue = localText(key: "welcomeTitleEmailContinue")

  // Keyboard Commands
  public static let keyboardCommandDecreaseFont = localText(key: "keyboardCommandDecreaseFont")
  public static let keyboardCommandIncreaseFont = localText(key: "keyboardCommandIncreaseFont")
  public static let keyboardCommandDecreaseMargin = localText(key: "keyboardCommandDecreaseMargin")
  public static let keyboardCommandIncreaseMargin = localText(key: "keyboardCommandIncreaseMargin")
  public static let keyboardCommandDecreaseLineSpacing = localText(key: "keyboardCommandDecreaseLineSpacing")
  public static let keyboardCommandIncreaseLineSpacing = localText(key: "keyboardCommandIncreaseLineSpacing")

  // Generic
  public static let genericSnooze = localText(key: "genericSnooze")
  public static let genericClose = localText(key: "genericClose")
  public static let genericCreate = localText(key: "genericCreate")
  public static let genericConfirm = localText(key: "genericConfirm")
  public static let genericProfile = localText(key: "genericProfile")
  public static let genericNext = localText(key: "genericNext")
  public static let genericName = localText(key: "genericName")
  public static let genericOk = localText(key: "genericOk")
  public static let genericRetry = localText(key: "genericRetry")
  public static let genericEmail = localText(key: "genericEmail")
  public static let genericPassword = localText(key: "genericPassword")
  public static let genericSubmit = localText(key: "genericSubmit")
  public static let genericContinue = localText(key: "genericContinue")
  public static let genericSend = localText(key: "genericSend")
  public static let genericOptions = localText(key: "genericOptions")
  public static let genericOpen = localText(key: "genericOpen")
  public static let genericChangeApply = localText(key: "genericChangeApply")
  public static let genericTitle = localText(key: "genericTitle")
  public static let genericAuthor = localText(key: "genericAuthor")
  public static let genericDescription = localText(key: "genericDescription")
  public static let genericSave = localText(key: "genericSave")
  public static let genericLoading = localText(key: "genericLoading")
  public static let genericFontFamily = localText(key: "genericFontFamily")
  public static let genericHighContrastText = localText(key: "genericHighContrastText")
  public static let genericFont = localText(key: "genericFont")
  public static let genericHighlight = localText(key: "genericHighlight")
  public static let labelsGeneric = localText(key: "labelsGeneric")
  public static let emailsGeneric = localText(key: "emailsGeneric")
  public static let subscriptionsGeneric = localText(key: "subscriptionsGeneric")
  public static let textToSpeechGeneric = localText(key: "textToSpeechGeneric")
  public static let privacyPolicyGeneric = localText(key: "privacyPolicyGeneric")
  public static let termsAndConditionsGeneric = localText(key: "termsAndConditionsGeneric")
  public static let feedbackGeneric = localText(key: "feedbackGeneric")
  public static let manageAccountGeneric = localText(key: "manageAccountGeneric")
  public static let logoutGeneric = localText(key: "logoutGeneric")
  public static let doneGeneric = localText(key: "doneGeneric")
  public static let cancelGeneric = localText(key: "cancelGeneric")
  public static let inboxGeneric = localText(key: "inboxGeneric")
  public static let readLaterGeneric = localText(key: "readLaterGeneric")
  public static let newslettersGeneric = localText(key: "newslettersGeneric")
  public static let allGeneric = localText(key: "allGeneric")
  public static let archivedGeneric = localText(key: "archivedGeneric")
  public static let highlightedGeneric = localText(key: "highlightedGeneric")
  public static let filesGeneric = localText(key: "filesGeneric")
  public static let newestGeneric = localText(key: "newestGeneric")
  public static let oldestGeneric = localText(key: "oldestGeneric")
  public static let recentlyReadGeneric = localText(key: "recentlyReadGeneric")
  public static let recentlyPublishedGeneric = localText(key: "recentlyPublishedGeneric")
  public static let clubsGeneric = localText(key: "clubsGeneric")
  public static let errorGeneric = localText(key: "errorGeneric")
  public static let pushNotificationsGeneric = localText(key: "pushNotificationsGeneric")
  public static let dismissButton = localText(key: "dismissButton")
  public static let errorNetwork = localText(key: "errorNetwork")
}

//// Manage Account View
// "manageAccountDelete" = "Delete Account";
// "manageAccountResetCache" = "Reset Data Cache";
// "manageAccountConfirmDeleteMessage" = "Are you sure you want to delete your account? This action can't be undone.";
//
//// Newsletter Emails View
// "newsletterEmailsExisting" = "Existing Emails (Tap to copy)";
// "createNewEmailMessage" = "创建新的电子邮件地址";
// "newslettersDescription" = "将 PDF 添加到您的资料库，或使用 Omnivore 电子邮件地址订阅新闻稿件。";
// "noCurrentSubscriptionsMessage" = "您当前没有任何订阅。";
//
//// Profile View
// "profileConfirmLogoutMessage" = "Are you sure you want to logout?";
//
//// Devices View
// "devicesTokensTitle" = "Registered device tokens (swipe to remove)";
// "devicesCreated" = "Created: ";
//
//// Push Notification Settings
// "notificationsEnabled" = "Notifications Enabled";
// "notificationsExplainer" = "Enabling push notifications gives Omnivore device permission to send notifications,\nbut you are in charge of which notifications are sent.";
// "notificationsTriggerExplainer" = "Push notifications are triggered using your \n[account rules](https://omnivore.app/settings/rules) which you can edit online.";
// "notificationsEnable" = "Enable Push Notifications?";
// "notificationsGeneralExplainer" = "Get notified when newsletter links reach your inbox. Or receive reminders that you set from our share extension.";
// "notificationsOptionDeny" = "No Thanks";
// "notificationsOptionEnable" = "Yes Please";
//
//// Community Modal
// "communityHeadline" = "Help build the Omnivore Community";
// "communityAppstoreReview" = "Review on the AppStore";
// "communityTweet" = "Tweet about Omnivore";
// "communityFollowTwitter" = "Follow us on Twitter";
// "communityJoinDiscord" = "Join us on Discord";
// "communityStarGithub" = "Star on GitHub";
//
//// Clubs View
// "clubsLearnTitle" = "Learn more about clubs";
// "clubsName" = "Club Name";
// "clubsCreate" = "Create a new club";
// "clubsYours" = "Your clubs";
// "clubsNotAMemberMessage" = "You are not a member of any clubs.\nCreate
// a new club and send the invite link to your friends get started.\n\nDuring the beta you are limited to creating three clubs, and each club\ncan have a maximum of twelve users."
// "clubsErrorCopying" = "Error copying invite URL";
// "clubsAdminDenyViewing" = "The admin of this club does not allow viewing all members.";
// "clubsNoMembers" = "This club does not have any members. Add users to your club by sending\nthem the invite link.";
// "clubsLeave" = "Leave Club";
// "clubsLeaveConfirm" = "Are you sure you want to leave this club? No data will be deleted, but you will stop receiving recommendations from the club.";
// "clubsNoneJoined" = "You do not have any clubs you can post to.\nJoin a club or create your own to start recommending articles.";
//
//// Subscriptions
// "subscriptionsErrorRetrieving" = "Sorry, we were unable to retrieve your subscriptions.";
// "subscriptionsNone" = "You have no current subscriptions.";
////"subscriptions.error.retrieving" = "Last received: \(updatedDate.formatted())"; // unused for now
//
//// Text to Speech
// "texttospeechLanguageDefault" = "Default Language";
// "texttospeechSettingsAudio" = "Audio Settings";
// "texttospeechSettingsEnablePrefetch" = "Enable audio prefetch";
// "texttospeechBetaSignupInProcess" = "Signing up for beta";
// "texttospeechBetaRealisticVoiceLimit" = "You are in the ultra realistic voices beta. During the beta you can listen to 10,000 words of audio per day.";
// "texttospeechBetaRequestReceived" = "Your request to join the ultra realistic voices demo has been received. You will be informed by email when a spot is available.";
// "texttospeechBetaWaitlist" = "Ultra realistic voices are currently in limited beta. Enabling the feature will add you to the beta queue.";
//
//// Sign in/up
// "registrationNoAccount" = "Don't have an account?";
// "registrationForgotPassword" = "Forgot your password?";
// "registrationStatusCheck" = "Check Status";
// "registrationUseDifferentEmail" = "Use a different email?";
// "registrationFullName" = "Full Name";
// "registrationUsername" = "Username";
// "registrationAlreadyHaveAccount" = "Already have an account?";
// "registrationBio" = "Bio (optional)";
// "registrationWelcome" = "Welcome to Omnivore!";
// "registrationUsernameAssignedPrefix" = "Your username is:";
// "registrationChangeUsername" = "Change Username";
// "registrationEdit" = "Edit";
// "googleAuthButton" = "使用 Google 账号";
// "registrationViewSignUpHeadline" = "注册";
// "loginErrorInvalidCreds" = "提供的登录凭据无效.";
//
//// Recommendation
// "recommendationToPrefix" = "To:";
// "recommendationAddNote" = "Add a note (optional)";
////"recommendationToPrefix" = "Include your \(viewModel.highlightCount) highlight\(viewModel.highlightCount > 1 ? "s" : """; // unused for now
// "recommendationError" = "Error recommending this page";
//
//// Web Reader
// "readerCopyLink" = "Copy Link";
// "readerSave" = "Save to Omnivore";
// "readerError" = "An error occurred";
//
//// Debug Menu
// "menuDebugTitle" = "Debug Menu";
// "menuDebugApiEnv" = "API Environment:";
//
//// Navigation
// "navigationSelectLink" = "Select a link from the feed";
// "navigationSelectSidebarToggle" = "Toggle sidebar";
//
//// Welcome View
// "welcomeTitle" = "Read-it-later for serious readers.";
// "welcomeLearnMore" = "Learn more";
// "welcomeSignupAgreement" = "By signing up, you agree to Omnivore’s\n";
// "welcomeTitleTermsOfService" = "Terms of Service";
// "welcomeTitleAndJoiner" = " and ";
// "welcomeTitleEmailContinue" = "Continue with Email";
//
//// Keyboard Commands
// "keyboardCommandDecreaseFont" = "Decrease Font Size";
// "keyboardCommandIncreaseFont" = "Increase Font Size";
// "keyboardCommandDecreaseMargin" = "Decrease Margin";
// "keyboardCommandIncreaseMargin" = "Increase Margin";
// "keyboardCommandDecreaseLineSpacing" = "Decrease Line Spacing";
// "keyboardCommandIncreaseLineSpacing" = "Increase Line Spacing";
//
//// Library
////"library.by.author.suffix" = "by \(author)" // unused
////"Recommended by \(byStr) in \(inStr)" // unused
//
//
//// Generic
// "genericSnooze" = "Snooze";
// "genericClose" = "Close";
// "genericCreate" = "Create";
// "genericConfirm" = "Confirm";
// "genericProfile" = "Profile";
// "genericNext" = "Next";
// "genericName" = "Name";
// "genericOk" = "Ok";
// "genericRetry" = "Retry";
// "genericEmail" = "Email";
// "genericPassword" = "Password";
// "genericSubmit" = "Submit";
// "genericContinue" = "Continue";
// "genericSend" = "Send";
// "genericOptions" = "Options";
// "genericOpen" = "Open";
// "genericChangeApply" = "Apply Changes";
// "genericTitle" = "Title";
// "genericAuthor" = "Author";
// "genericDescription" = "Description";
// "genericSave" = "Save";
// "genericLoading" = "Loading...";
// "genericFontFamily" = "Font Family";
// "genericHighContrastText" = "High Contrast Text";
// "genericFont" = "Font";
// "genericHighlight" = "Highlight";
// "labelsGeneric" = "标签";
// "emailsGeneric" = "电子邮件";
// "subscriptionsGeneric" = "订阅";
// "textToSpeechGeneric" = "文章转语音";
// "privacyPolicyGeneric" = "隐私策略";
// "termsAndConditionsGeneric" = "条款与条件";
// "feedbackGeneric" = "反馈";
// "manageAccountGeneric" = "管理帐户";
// "logoutGeneric" = "退出登陆";
// "doneGeneric" = "完成";
// "cancelGeneric" = "取消";
// "inboxGeneric" = "收集箱";
// "readLaterGeneric" = "稍后阅读";
// "newslettersGeneric" = "新闻稿件";
// "allGeneric" = "全部";
// "archivedGeneric" = "存档";
// "highlightedGeneric" = "荧光笔";
// "filesGeneric" = "文件";
// "newestGeneric" = "最新";
// "oldestGeneric" = "最早";
// "recentlyReadGeneric" = "最近阅读";
// "recentlyPublishedGeneric" = "最近发布";
// "clubsGeneric" = "读书俱乐部";
// "errorGeneric" = "哦！出现了小问题，请您重试.";
// "pushNotificationsGeneric" = "推送通知";
// "dismissButton" = "撤回";
// "errorNetwork" = "我们在连接到互联网时遇到问题.";
