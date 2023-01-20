import Foundation

public enum LocalText {
  public static func localText(key: String, comment: String? = nil) -> String {
    NSLocalizedString(key, bundle: .module, comment: comment ?? "no comment provided by developer")
  }

  public static let signInScreenHeadline = localText(key: "signInScreenHeadline")
  public static let googleAuthButton = localText(key: "googleAuthButton")
  public static let registrationViewSignInHeadline = localText(key: "registrationViewSignInHeadline")
  public static let registrationViewSignUpHeadline = localText(key: "registrationViewSignUpHeadline")
  public static let registrationViewHeadline = localText(key: "registrationViewHeadline")
  public static let networkError = localText(key: "error.network")
  public static let genericError = localText(key: "error.generic")
  public static let invalidCredsLoginError = localText(key: "loginError.invalidCreds")
  public static let saveArticleSavedState = localText(key: "saveArticleSavedState")
  public static let saveArticleProcessingState = localText(key: "saveArticleProcessingState")
  public static let extensionAppUnauthorized = localText(key: "extensionAppUnauthorized")
  public static let dismissButton = localText(key: "dismissButton")
  public static let usernameValidationErrorInvalid = localText(key: "username.validation.error.invalidPattern")
  public static let usernameValidationErrorTooShort = localText(key: "username.validation.error.tooshort")
  public static let usernameValidationErrorTooLong = localText(key: "username.validation.error.toolong")

  public static let labelsGeneric = localText(key: "labels.generic")
  public static let emailsGeneric = localText(key: "emails.generic")
  public static let subscriptionsGeneric = localText(key: "subscriptions.generic")
  public static let textToSpeechGeneric = localText(key: "textToSpeech.generic")
  public static let privacyPolicyGeneric = localText(key: "privacy.policy.generic")
  public static let termsAndConditionsGeneric = localText(key: "termsAndConditions.generic")
  public static let feedbackGeneric = localText(key: "feedback.generic")
  public static let manageAccountGeneric = localText(key: "manageAccount.generic")
  public static let logoutGeneric = localText(key: "logout.generic")
  public static let doneGeneric = localText(key: "done.generic")
  public static let cancelGeneric = localText(key: "cancel.generic")
  public static let inboxGeneric = localText(key: "inbox.generic")
  public static let readLaterGeneric = localText(key: "readLater.generic")
  public static let newslettersGeneric = localText(key: "newsletters.generic")
  public static let allGeneric = localText(key: "all.generic")
  public static let archivedGeneric = localText(key: "archived.generic")
  public static let highlightedGeneric = localText(key: "highlighted.generic")
  public static let filesGeneric = localText(key: "files.generic")
  public static let newestGeneric = localText(key: "newest.generic")
  public static let oldestGeneric = localText(key: "oldest.generic")
  public static let recentlyReadGeneric = localText(key: "recentlyRead.generic")
  public static let recentlyPublishedGeneric = localText(key: "recentlyPublished.generic")
  public static let createLabelMessage = localText(key: "create.label.message")
  public static let createNewEmailMessage = localText(key: "create.new.email.message")
  public static let newslettersDescription = localText(key: "newsletters.description")
  public static let labelsPurposeDescription = localText(key: "labels.purpose.description")
  public static let noCurrentSubscriptionsMessage = localText(key: "no.current.subscriptions.message")
}

// "emails.generic" = "Emails";
// "subscriptions.generic" = "Subscriptions";
// "textToSpeech.generic" = "Subscriptions";
// "privacy.policy.generic" = "Privacy Policy";
// "termsAndConditions.generic" = "Terms and Conditions";
// "feedback.generic" = "Feedback";
// "manageAccount.generic" = "Manage Account";
// "logout.generic" = "Logout";
// "done.generic" = "Done";
// "cancel.generic" = "Cancel";
// "inbox.generic" = "Inbox";
// "readLater.generic" = "Read Later";
// "newsletters.generic" = "Newsletters";
// "all.generic" = "All";
// "archived.generic" = "Archived";
// "highlighted.generic" = "Highlighted";
// "files.generic" = "Files";
// "newest.generic" = "Newest";
// "oldest.generic" = "Oldest";
// "recentlyRead.generic" = "Recently Read";
// "recentlyPublished.generic" = "Recently Published";
// "create.label.message" = "Create a new Label";
// "create.new.email.message" = "Create a new email address";
// "newsletters.description" = "Add PDFs to your library, or subscribe to newsletters using an Omnivore email address.";
// "labels.purpose.description" = "Use labels to create curated collections of links.";
// "no.current.subscriptions.message" = "You have no current Subscriptions.";
