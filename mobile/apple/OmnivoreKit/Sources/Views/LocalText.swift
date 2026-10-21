import Foundation

public enum LocalText {
  private static func localText(key: String, comment: String? = nil) -> String {
    NSLocalizedString(key, bundle: .module, comment: comment ?? "no comment provided by developer")
  }

  public static func pluralizedText(key: String, count: Int) -> String {
    let format = NSLocalizedString(key, bundle: .module, comment: "")
    return String.localizedStringWithFormat(format, count)
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
  public static let labelNamePlaceholder = localText(key: "labelNamePlaceholder")

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
  public static let enableJustifyText = localText(key: "enableJustifyText")
  public static let enableHighlightOnReleaseText = localText(key: "enableHighlightOnReleaseText")
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
  public static let exportGeneric = localText(key: "exportGeneric")
  public static let inboxGeneric = localText(key: "inboxGeneric")
  public static let readLaterGeneric = localText(key: "readLaterGeneric")
  public static let newslettersGeneric = localText(key: "newslettersGeneric")
  public static let allGeneric = localText(key: "allGeneric")
  public static let archivedGeneric = localText(key: "archivedGeneric")
  public static let highlightedGeneric = localText(key: "highlightedGeneric")
  public static let filesGeneric = localText(key: "filesGeneric")
  public static let newestGeneric = localText(key: "newestGeneric")
  public static let oldestGeneric = localText(key: "oldestGeneric")
  public static let longestGeneric = localText(key: "longestGeneric")
  public static let shortestGeneric = localText(key: "shortestGeneric")
  public static let recentlyReadGeneric = localText(key: "recentlyReadGeneric")
  public static let recentlyPublishedGeneric = localText(key: "recentlyPublishedGeneric")
  public static let clubsGeneric = localText(key: "clubsGeneric")
  public static let filtersGeneric = localText(key: "filterGeneric")
  public static let errorGeneric = localText(key: "errorGeneric")
  public static let pushNotificationsGeneric = localText(key: "pushNotificationsGeneric")
  public static let dismissButton = localText(key: "dismissButton")
  public static let errorNetwork = localText(key: "errorNetwork")
  public static let documentationGeneric = localText(key: "documentationGeneric")
  public static let readerSettingsGeneric = localText(key: "readerSettingsGeneric")  
}
