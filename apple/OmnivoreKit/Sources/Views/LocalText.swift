import Foundation

public enum LocalText {
  static func localText(key: String, comment: String? = nil) -> String {
    NSLocalizedString(key, bundle: .module, comment: comment ?? "no comment provided by developer")
  }

  static let signInScreenHeadline = localText(key: "signInScreenHeadline")
  static let googleAuthButton = localText(key: "googleAuthButton")
  static let registrationViewSignInHeadline = localText(key: "registrationViewSignInHeadline")
  static let registrationViewSignUpHeadline = localText(key: "registrationViewSignUpHeadline")
  public static let registrationViewHeadline = localText(key: "registrationViewHeadline")
  public static let networkError = localText(key: "error.network")
  public static let genericError = localText(key: "error.generic")
  static let invalidCredsLoginError = localText(key: "loginError.invalidCreds")
  public static let saveArticleSavedState = localText(key: "saveArticleSavedState")
  public static let saveArticleProcessingState = localText(key: "saveArticleProcessingState")
  public static let extensionAppUnauthorized = localText(key: "extensionAppUnauthorized")
  static let dismissButton = localText(key: "dismissButton")
  static let usernameValidationErrorInvalid = localText(key: "username.validation.error.invalidPattern")
  static let usernameValidationErrorTooShort = localText(key: "username.validation.error.tooshort")
  static let usernameValidationErrorTooLong = localText(key: "username.validation.error.toolong")
}
